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

@Injectable()
export class OrdersService {
  constructor(private dataSource: DataSource) {}

  // 1. GÜVENLİ SİPARİŞ OLUŞTURMA
  async create(userId: string, createOrderDto: CreateOrderDto) {
    const { addressId, items, paymentType } = createOrderDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // A. Adres Kontrolü
      const address = await queryRunner.manager.findOne(Address, {
        where: { id: addressId, userId },
      });

      if (!address) throw new NotFoundException('Teslimat adresi bulunamadı.');

      // B. Değişkenler
      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      // C. DÖNGÜ: Her ürünü tek tek hesapla
      for (const item of items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id: item.productId } });
        
        if (!product) throw new NotFoundException(`Ürün bulunamadı (ID: ${item.productId})`);
        
        // Stok Kontrolü
        if (product.stock < item.quantity) {
           throw new BadRequestException(`${product.name} için stok yetersiz.`);
        }

        // --- 💰 FİYAT HESAPLAMA ---
        let itemTotal = Number(product.price) * item.quantity;
        const itemDuration = item.duration || 1;

        if (paymentType === 'upfront') {
            itemTotal = itemTotal * itemDuration;
        } else {
            itemTotal = itemTotal * 1; 
        }

        totalPrice += itemTotal;

        // Sipariş Kalemi Oluştur
        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.productId = Number(product.id); 
        orderItem.quantity = item.quantity;
        orderItem.priceAtPurchase = product.price; 
        orderItem.productNameSnapshot = product.name; 
        orderItems.push(orderItem);

        // Stok Düş
        product.stock -= item.quantity;
        await queryRunner.manager.save(product);

        // ... (Fiyat hesaplamalarının bittiği yer) ...

        // --- 📅 ABONELİK İŞLEMLERİ (DÜZELTİLMİŞ HALİ) ---
        
        // SENARYO 1: SÜRE UZATMA (Eğer Frontend ID gönderdiyse)
        if (item.subscriptionId) {
            // Mevcut aboneliği bul
            const existingSub = await queryRunner.manager.findOne(Subscription, { 
                where: { id: item.subscriptionId } 
            });

            if (existingSub) {
                // Mevcut sürelerin üzerine satın alınan süreyi ekle
                existingSub.totalMonths += itemDuration;
                existingSub.remainingMonths += itemDuration;
                
                // Eğer statüsü bitmiş veya iptal edilmişse tekrar Aktif yap
                if (existingSub.status === SubscriptionStatus.COMPLETED || existingSub.status === SubscriptionStatus.CANCELLED) {
                    existingSub.status = SubscriptionStatus.ACTIVE;
                }

                // Güncelle ve Kaydet
                await queryRunner.manager.save(Subscription, existingSub);
            }
        } 
        
        // SENARYO 2: YENİ ABONELİK (ID yoksa sıfırdan oluştur)
        else {
            const subscription = new Subscription();
            subscription.user = { id: userId } as User;
            subscription.product = product;
            
            if (createOrderDto.petId) {
                 const pet = await queryRunner.manager.findOne(Pet, { where: { id: createOrderDto.petId } });
                 if (pet) subscription.pet = pet;
            }

            // Kargo Dönemi
            subscription.deliveryPeriod = item.deliveryPeriod || "Her Ayın 1-5'i";

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

      // D. Siparişi Kaydet
      const order = new Order();
      order.user = { id: userId } as User;
      order.shippingAddressSnapshot = address; 
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

  // --- Diğer Metodlar ---
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
    if (!order) throw new NotFoundException('Sipariş bulunamadı');
    
    order.status = status;
    return await this.dataSource.getRepository(Order).save(order);
  }
}