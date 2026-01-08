import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Subscription, SubscriptionStatus } from 'src/subscriptions/entities/subscription.entity';
import { Product } from 'src/products/entities/product.entity';
import { Address } from 'src/addresses/entities/address.entity';
import { Pet } from 'src/pets/entities/pet.entity';
import { User } from 'src/users/entities/user.entity';
import { DiscountsService } from 'src/discounts/discounts.service';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    private discountsService: DiscountsService 
  ) {}

  async create(userId: string | null, createOrderDto: CreateOrderDto) {
    const { addressId, items, paymentType, isGuest, guestInfo } = createOrderDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let addressSnapshot: any = {};

      // A. ADRES İŞLEMLERİ
      if (userId) {
          const address = await queryRunner.manager.findOne(Address, {
            where: { id: addressId, userId },
          });
          if (!address) throw new NotFoundException('Teslimat adresi bulunamadı.');
          addressSnapshot = address;
      } else {
          if (!guestInfo) throw new BadRequestException('Misafir bilgileri eksik.');
          addressSnapshot = { ...guestInfo, title: 'Guest Address' };
      }

      // B. DEĞİŞKENLER
      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      // C. ÜRÜNLERİ DÖNGÜYE AL
      for (const itemDto of items) {
        const product = await queryRunner.manager.findOne(Product, { 
            where: { id: itemDto.productId }
           });
        
        if (!product) throw new NotFoundException(`Ürün bulunamadı (ID: ${itemDto.productId})`);
        if (product.stock < itemDto.quantity) throw new BadRequestException(`${product.name} için stok yetersiz.`);

        // --- 💰 1. FİYAT HESAPLAMA ---
        let itemTotal = 0;
        const itemDuration = itemDto.duration || 1;
        const basePrice = Number(product.price);

        if (paymentType === 'upfront') {
            const calculation = await this.discountsService.calculatePrice(basePrice, itemDuration);
            itemTotal = calculation.finalPrice * itemDto.quantity;
        } else {
            itemTotal = basePrice * itemDto.quantity; 
        }

// --- 🚀 2. UPGRADE İNDİRİMİ ---
        if (itemDto.upgradeFromSubId) {
            const oldSub = await queryRunner.manager.findOne(Subscription, { 
                where: { id: itemDto.upgradeFromSubId },
                relations: ['product']
            });

            if (oldSub && oldSub.status === SubscriptionStatus.ACTIVE && oldSub.remainingMonths > 0) {
                // ... (İade hesaplama kodları aynı kalsın) ...
                const monthlyValue = Number(oldSub.product.price) / (oldSub.totalMonths || 1);
                const refundValue = monthlyValue * oldSub.remainingMonths;
                itemTotal = Math.max(0, itemTotal - refundValue);
                
                // 👇 DEĞİŞİKLİK BURADA: Durumu UPGRADED yapıyoruz
                oldSub.status = SubscriptionStatus.UPGRADED; 
                oldSub.cancellationReason = `Paket Yükseltildi (Yeni Sipariş ID oluşturuluyor)`;
                
                await queryRunner.manager.save(Subscription, oldSub);
            }
        }

        totalPrice += itemTotal;

        // --- 📝 SİPARİŞ KALEMİ OLUŞTURMA ---
        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.quantity = itemDto.quantity;
        orderItem.priceAtPurchase = product.price; 
        orderItem.productNameSnapshot = product.name;
        
        // 👇 TİP HATASI ÇÖZÜMÜ: Değişken tipini açıkça belirtiyoruz
        let foundPet: Pet | null = null;
        
        if (itemDto.petId) {
            // UUID String olduğu için Number() kullanmıyoruz. 'as any' ile TypeORM tip kontrolünü aşıyoruz.
            foundPet = await queryRunner.manager.findOne(Pet, { 
                where: { id: itemDto.petId as any } 
            });
            
            if (foundPet) {
                orderItem.pet = foundPet;
            }
        }

        orderItems.push(orderItem);

        // Stok Düş
        product.stock -= itemDto.quantity;
        await queryRunner.manager.save(product);

        // --- 📅 ABONELİK (SUBSCRIPTION) OLUŞTURMA ---
        if (itemDto.subscriptionId) {
            // Mevcut aboneliği uzatma
            const existingSub = await queryRunner.manager.findOne(Subscription, { 
                where: { id: itemDto.subscriptionId } 
            });

            if (existingSub) {
                existingSub.totalMonths += itemDuration;
                existingSub.remainingMonths += itemDuration;
                if ([SubscriptionStatus.COMPLETED, SubscriptionStatus.CANCELLED].includes(existingSub.status)) {
                    existingSub.status = SubscriptionStatus.ACTIVE;
                }
                await queryRunner.manager.save(Subscription, existingSub);
            }
        } 
        else {
            // Yeni Abonelik
            const subscription = new Subscription();
            if (userId) subscription.user = { id: userId } as User;
            subscription.product = product;
            
            // 👇 PET İLİŞKİSİNİ ABONELİĞE EKLİYORUZ
            if (foundPet) {
                subscription.pet = foundPet;
            }

            subscription.deliveryPeriod = itemDto.deliveryPeriod || "1-5 of Month";
            subscription.totalMonths = itemDuration;
            subscription.remainingMonths = itemDuration;
            subscription.startDate = new Date();
            
            const nextDate = new Date();
            nextDate.setMonth(nextDate.getMonth() + 1);
            subscription.nextDeliveryDate = nextDate;
            
            subscription.status = SubscriptionStatus.ACTIVE;
            
            await queryRunner.manager.save(Subscription, subscription);
        }
      }

      // D. SİPARİŞİ KAYDET
      const order = new Order();
      if (userId) order.user = { id: userId } as User;
      
      order.shippingAddressSnapshot = addressSnapshot; 
      order.totalPrice = totalPrice;
      order.status = OrderStatus.PAID; 
      order.items = orderItems;
      order.paymentId = 'MOCK_' + Date.now(); 

      const savedOrder = await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();

      return { success: true, orderId: savedOrder.id, message: 'Sipariş alındı!' };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findMyOrders(userId: string) {
    return await this.dataSource.getRepository(Order).find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['items', 'items.product', 'items.pet'],
    });
  }

  async findAll() {
    return await this.dataSource.getRepository(Order).find({
      order: { createdAt: 'DESC' },
      relations: ['user', 'items'],
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.dataSource.getRepository(Order).findOne({ where: { id } });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');
    
    order.status = status;
    return await this.dataSource.getRepository(Order).save(order);
  }
}