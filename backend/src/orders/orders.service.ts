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
import { DiscountsService } from 'src/discounts/discounts.service'; // 👈 YENİ IMPORT

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    private discountsService: DiscountsService // 👈 SERVİS ENJEKTE EDİLDİ
  ) {}

  // 1. CREATE ORDER (Supports Guest)
  async create(userId: string | null, createOrderDto: CreateOrderDto) {
    const { addressId, items, paymentType, isGuest, guestInfo } = createOrderDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let addressSnapshot: any = {};

      // A. ADDRESS LOGIC
      if (userId) {
          const address = await queryRunner.manager.findOne(Address, {
            where: { id: addressId, userId },
          });
          if (!address) throw new NotFoundException('Delivery address not found.');
          addressSnapshot = address;
      } else {
          if (!guestInfo) throw new BadRequestException('Guest information is missing.');
          addressSnapshot = { ...guestInfo, title: 'Guest Address' };
      }

      // B. Variables
      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      // C. LOOP ITEMS
      for (const item of items) {
        const product = await queryRunner.manager.findOne(Product, { 
            where: { id: item.productId }
           });
        
        if (!product) throw new NotFoundException(`Product not found (ID: ${item.productId})`);
        
        if (product.stock < item.quantity) {
           throw new BadRequestException(`Insufficient stock for ${product.name}.`);
        }

// --- 💰 PRICE CALCULATION (FİYAT HESAPLAMA) ---
        let itemTotal = 0;
        const itemDuration = item.duration || 1;
        const basePrice = Number(product.price);

        // 1. ADIM: Önce Yeni Paketin Normal Fiyatını Hesapla
        if (paymentType === 'upfront') {
            // Peşin Ödeme: İndirim servisini kullan
            const calculation = await this.discountsService.calculatePrice(basePrice, itemDuration);
            itemTotal = calculation.finalPrice * item.quantity;
        } else {
            // Aylık Ödeme: Standart fiyat
            itemTotal = basePrice * item.quantity; 
        }

        // 2. ADIM: Upgrade (Paket Yükseltme) Varsa Eskiyi Düş
        if (item.upgradeFromSubId) {
            const oldSub = await queryRunner.manager.findOne(Subscription, { 
                where: { id: item.upgradeFromSubId },
                relations: ['product']
            });

            if (oldSub && oldSub.status === SubscriptionStatus.ACTIVE) {
                // A. Kalan Tutar Hesabı (Proration)
                const oldPrice = Number(oldSub.product.price); 
                const pricePerMonth = oldPrice / (oldSub.totalMonths || 1);
                const remainingValue = pricePerMonth * oldSub.remainingMonths;

                console.log(`Eski Paketten Kalan Bakiye: ${remainingValue} TL`);

                // B. Yeni Tutar'dan Düş
                itemTotal -= remainingValue;

                // Tutar eksiye düşerse 0 yap (Üste para vermeyelim)
                if (itemTotal < 0) itemTotal = 0;

                // C. Eski Aboneliği İPTAL ET
                oldSub.status = SubscriptionStatus.CANCELLED;
                oldSub.cancellationReason = "Paket yükseltme nedeniyle otomatik iptal.";
                await queryRunner.manager.save(Subscription, oldSub);
            }
        }

        totalPrice += itemTotal;

        // Create Order Item
        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.product = { id: item.productId } as any; // ✅ DOĞRU: İlişki objesi içine ID veriyoruz
        orderItem.quantity = item.quantity;
        orderItem.priceAtPurchase = product.price; 
        orderItem.productNameSnapshot = product.name; 
        orderItems.push(orderItem);

        // Deduct Stock
        product.stock -= item.quantity;
        await queryRunner.manager.save(product);

        // --- 📅 SUBSCRIPTION LOGIC ---
        if (item.subscriptionId) {
            const existingSub = await queryRunner.manager.findOne(Subscription, { 
                where: { id: item.subscriptionId } 
            });

            if (existingSub) {
                existingSub.totalMonths += itemDuration;
                existingSub.remainingMonths += itemDuration;
                
                if (existingSub.status === SubscriptionStatus.COMPLETED || existingSub.status === SubscriptionStatus.CANCELLED) {
                    existingSub.status = SubscriptionStatus.ACTIVE;
                }
                await queryRunner.manager.save(Subscription, existingSub);
            }
        } 
        else {
            const subscription = new Subscription();
            if (userId) subscription.user = { id: userId } as User;
            subscription.product = product;
            
            if (createOrderDto.petId) {
                 const pet = await queryRunner.manager.findOne(Pet, { where: { id: createOrderDto.petId } });
                 if (pet) subscription.pet = pet;
            }

            subscription.deliveryPeriod = item.deliveryPeriod || "1-5 of Month";
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

      // D. SAVE ORDER
      const order = new Order();
      if (userId) order.user = { id: userId } as User;
      
      order.shippingAddressSnapshot = addressSnapshot; 
      order.totalPrice = totalPrice;
      order.status = OrderStatus.PAID; 
      order.items = orderItems;
      order.paymentId = 'MOCK_' + Date.now(); 

      const savedOrder = await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();

      return { success: true, orderId: savedOrder.id, message: 'Order received!' };

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
      relations: ['items', 'items.product'], 
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
    if (!order) throw new NotFoundException('Order not found');
    
    order.status = status;
    return await this.dataSource.getRepository(Order).save(order);
  }
}