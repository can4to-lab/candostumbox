import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Subscription, SubscriptionStatus } from 'src/subscriptions/entities/subscription.entity';
import { Product } from 'src/products/entities/product.entity';
import { Address } from 'src/addresses/entities/address.entity';
import { Pet } from 'src/pets/entities/pet.entity';
import { User } from 'src/users/entities/user.entity';
import { DiscountsService } from 'src/discounts/discounts.service';
import { ShippingService } from './shipping.service';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    private discountsService: DiscountsService, // 👈 VİRGÜL EKLENDİ (Hata 1 Çözümü)
    private shippingService: ShippingService,
    
    // 👇 BU EKLENDİ (Hata 2 Çözümü: shipOrder için gerekli)
    @InjectRepository(Order)
    private orderRepository: Repository<Order>
  ) {}

  async create(userId: string | null, createOrderDto: CreateOrderDto) {
    const { addressId, items, paymentType, isGuest, guestInfo } = createOrderDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // --- ADRES İŞLEMLERİ ---
      let addressSnapshot: any = {};
      if (userId) {
          const address = await queryRunner.manager.findOne(Address, { where: { id: addressId, userId } });
          if (!address) throw new NotFoundException('Teslimat adresi bulunamadı.');
          addressSnapshot = address;
      } else {
          if (!guestInfo) throw new BadRequestException('Misafir bilgileri eksik.');
          addressSnapshot = { ...guestInfo, title: 'Guest Address' };
      }

      let totalPrice = 0;
      const orderItems: OrderItem[] = [];
      let isPhysicalShipmentRequired = true; 

      for (const itemDto of items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id: itemDto.productId } });
        if (!product) throw new NotFoundException('Ürün bulunamadı');

        let itemTotal = 0;
        const itemDuration = itemDto.duration || 1;
        const basePrice = Number(product.price);

        // Fiyat Hesaplama
        if (paymentType === 'upfront') {
            const calculation = await this.discountsService.calculatePrice(basePrice, itemDuration);
            itemTotal = calculation.finalPrice * itemDto.quantity;
        } else {
            itemTotal = basePrice * itemDto.quantity; 
        }

        const unitPricePaid = itemTotal / itemDto.quantity;

        let foundPet: Pet | null = null;
        if (itemDto.petId) {
            foundPet = await queryRunner.manager.findOne(Pet, { where: { id: itemDto.petId as any } });
        }

        // ============================================================
        // 🛠️ SENARYO 1: SÜRE UZATMA (EXTEND)
        // ============================================================
        if (itemDto.subscriptionId) {
            const existingSub = await queryRunner.manager.findOne(Subscription, { 
                where: { id: itemDto.subscriptionId },
                relations: ['product']
            });

            if (existingSub) {
                existingSub.totalMonths += itemDuration;
                existingSub.remainingMonths += itemDuration;
                existingSub.status = SubscriptionStatus.ACTIVE;
                
                await queryRunner.manager.save(Subscription, existingSub);
                
                isPhysicalShipmentRequired = false; 
            }
        } 
        // ============================================================
        // 🛠️ SENARYO 2: PAKET YÜKSELTME (UPGRADE)
        // ============================================================
        // 👇 DİKKAT: Burası 'else if' yapıldı. Yoksa hem uzatma hem yeni sipariş çalışır!
        else if (itemDto.upgradeFromSubId) {
            const oldSub = await queryRunner.manager.findOne(Subscription, { 
                where: { id: itemDto.upgradeFromSubId },
                relations: ['product', 'user']
            });

            if (oldSub) {
                const historicalPrice = Number(oldSub.pricePaid) || Number(oldSub.product.price);
                const oldTotalMonths = oldSub.totalMonths || 1;
                const costPerMonth = historicalPrice / oldTotalMonths;
                const refundValue = costPerMonth * oldSub.remainingMonths;
                
                console.log(`💰 İade Hesabı: Ödenen=${historicalPrice}, İade=${refundValue}`);

                itemTotal = Math.max(0, itemTotal - refundValue);

                oldSub.status = SubscriptionStatus.UPGRADED; 
                await queryRunner.manager.save(Subscription, oldSub);

                const newSubscription = new Subscription();
                newSubscription.user = { id: userId } as User;
                newSubscription.product = product;
                newSubscription.pricePaid = unitPricePaid;
                if (foundPet) newSubscription.pet = foundPet;
                
                newSubscription.totalMonths = itemDuration; 
                newSubscription.remainingMonths = itemDuration;
                
                newSubscription.startDate = oldSub.startDate;
                newSubscription.nextDeliveryDate = oldSub.nextDeliveryDate;
                newSubscription.paymentType = paymentType || 'upfront';
                newSubscription.status = SubscriptionStatus.ACTIVE;

                await queryRunner.manager.save(Subscription, newSubscription);
                isPhysicalShipmentRequired = false;
            }
        }
        // ============================================================
        // 🛠️ SENARYO 3: YENİ SATIN ALMA (NEW)
        // ============================================================
        else {
            const subscription = new Subscription();
            if (userId) subscription.user = { id: userId } as User;
            subscription.product = product;
            if (foundPet) subscription.pet = foundPet;

            subscription.deliveryPeriod = "1-5 of Month";
            subscription.totalMonths = itemDuration;
            subscription.remainingMonths = itemDuration;
            subscription.paymentType = paymentType || 'upfront';
            subscription.startDate = new Date();
            subscription.pricePaid = unitPricePaid;
            
            const nextDate = new Date();
            nextDate.setMonth(nextDate.getMonth() + 1);
            subscription.nextDeliveryDate = nextDate;
            
            subscription.status = SubscriptionStatus.ACTIVE;
            await queryRunner.manager.save(Subscription, subscription);
            
            isPhysicalShipmentRequired = true;
        }

        totalPrice += itemTotal;

        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.quantity = itemDto.quantity;
        orderItem.priceAtPurchase = product.price; 
        orderItem.productNameSnapshot = product.name;
        if (foundPet) {
            orderItem.pet = foundPet;
        }
        orderItems.push(orderItem);

        product.stock -= itemDto.quantity;
        await queryRunner.manager.save(product);
      }

      // --- SİPARİŞİ KAYDET ---
      const order = new Order();
      if (userId) order.user = { id: userId } as User;
      order.shippingAddressSnapshot = addressSnapshot; 
      order.totalPrice = totalPrice;
      order.items = orderItems;
      order.paymentId = 'MOCK_' + Date.now(); 
      order.status = isPhysicalShipmentRequired ? OrderStatus.PREPARING : OrderStatus.PAID; 

      const savedOrder = await queryRunner.manager.save(Order, order);
      await queryRunner.commitTransaction();

      return { success: true, orderId: savedOrder.id, message: 'İşlem başarılı!' };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // --- KARGO ENTEGRASYONU ---
  async shipOrder(id: string, provider: string) {
    const order = await this.orderRepository.findOne({ 
        where: { id }, 
        relations: ['user'] 
    });
    
    if (!order) throw new NotFoundException('Sipariş bulunamadı');

    // 1. Kargo Servisini Çağır
    const shipmentResult = await this.shippingService.createShipment(order);

    // 2. Güncelle
    order.status = OrderStatus.SHIPPED;
    order.cargoProvider = shipmentResult.provider; 
    order.cargoTrackingCode = shipmentResult.trackingCode; 
    order.shippedAt = new Date();

    await this.orderRepository.save(order);

    return { 
        success: true, 
        message: 'Sipariş başarıyla kargolandı!', 
        trackingCode: order.cargoTrackingCode,
        provider: order.cargoProvider
    };
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