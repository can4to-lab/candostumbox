import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private dataSource: DataSource,
    private discountsService: DiscountsService,
    private shippingService: ShippingService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>
  ) {}

  async create(userId: string | null, createOrderDto: CreateOrderDto) {
    const { addressId, items, paymentType, isGuest, guestInfo } = createOrderDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. KULLANICIYI BUL (Kritik Düzeltme)
      let userEntity: User | null = null;
      if (userId) {
          // İlişkiyi ID stringiyle değil, Entity nesnesiyle kuracağız
          userEntity = await queryRunner.manager.findOne(User, { where: { id: userId } });
          if (userEntity) {
              this.logger.log(`✅ Sipariş kullanıcısı bulundu: ${userEntity.firstName} ${userEntity.lastName} (${userId})`);
          } else {
              this.logger.warn(`⚠️ User ID (${userId}) geldi ama DB'de yok!`);
          }
      }

      // 2. ADRES İŞLEMLERİ
      let addressSnapshot: any = {};
      
      if (userId && addressId) {
          const address = await queryRunner.manager.findOne(Address, { where: { id: addressId } });
          if (!address) {
             this.logger.warn(`Adres ID ${addressId} bulunamadı.`);
             if (guestInfo) addressSnapshot = { ...guestInfo, title: 'Guest Address' };
          } else {
             addressSnapshot = {
                title: address.title,
                fullAddress: address.fullAddress,
                city: address.city,
                district: address.district,
                phone: userEntity?.phone || '' // Adres entity'sinde phone yoksa User'dan al
             };
          }
      } else {
          // Misafir
          if (!guestInfo) addressSnapshot = { fullAddress: 'Adres bilgisi eksik' };
          else addressSnapshot = { ...guestInfo, title: 'Guest Address' };
      }

      let totalPrice = 0;
      const orderItems: OrderItem[] = [];
      let isPhysicalShipmentRequired = true; 

      for (const itemDto of items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id: itemDto.productId } });
        if (!product) throw new NotFoundException('Ürün bulunamadı');

        const quantity = Number(itemDto.quantity) || 1;
        const itemDuration = Number(itemDto.duration) || 1;
        let itemTotal = 0;
        const basePrice = Number(product.price);

        if (itemDto.price) {
            itemTotal = Number(itemDto.price);
        } else {
            itemTotal = basePrice * quantity;
        }

        const unitPricePaid = itemTotal / quantity;

       // 👇 GÜNCELLENEN PET BULMA VEYA YARATMA MANTIĞI
        let foundPet: Pet | null = null;
        if (itemDto.petId) {
            // Kayıtlı kullanıcının kayıtlı pet'i
            foundPet = await queryRunner.manager.findOne(Pet, { where: { id: itemDto.petId as any } });
        } 
        else if (itemDto.petName) {
            // MİSAFİR MÜŞTERİ: Veritabanına yeni bir pet olarak kaydet
            const newPet = new Pet();
            newPet.name = itemDto.petName;
            newPet.type = itemDto.petType || 'kopek';
            newPet.breed = itemDto.petBreed || '';
            newPet.birthDate = itemDto.petBirthDate ? new Date(itemDto.petBirthDate) : new Date();
            newPet.weight = itemDto.petWeight ? String(itemDto.petWeight) : '0';
            newPet.isNeutered = itemDto.petIsNeutered || false;
            // Alerjileri diziye (array) çevir
            newPet.allergies = itemDto.petAllergies ? itemDto.petAllergies.split(',').map(a => a.trim()) : [];
            
            // Veritabanına yaz ve oluşan ID ile foundPet'e eşitle
            foundPet = await queryRunner.manager.save(Pet, newPet);
            this.logger.log(`🐾 Misafir için yeni pet oluşturuldu: ${newPet.name} (ID: ${foundPet.id})`);
        }

        // --- ABONELİK İŞLEMLERİ ---
        if (itemDto.subscriptionId) {
            const existingSub = await queryRunner.manager.findOne(Subscription, { where: { id: itemDto.subscriptionId }, relations: ['product'] });
            if (existingSub) {
                existingSub.totalMonths += itemDuration;
                existingSub.remainingMonths += itemDuration;
                existingSub.status = SubscriptionStatus.ACTIVE;
                await queryRunner.manager.save(Subscription, existingSub);
                isPhysicalShipmentRequired = false;
            }
        } 
        else if (itemDto.upgradeFromSubId) {
            const oldSub = await queryRunner.manager.findOne(Subscription, { where: { id: itemDto.upgradeFromSubId }, relations: ['product'] });
            if (oldSub) {
                oldSub.status = SubscriptionStatus.UPGRADED;
                await queryRunner.manager.save(Subscription, oldSub);
                
                const newSubscription = new Subscription();
                if (userEntity) newSubscription.user = userEntity;
                newSubscription.product = product;
                if (foundPet) newSubscription.pet = foundPet;
                newSubscription.totalMonths = itemDuration;
                newSubscription.remainingMonths = itemDuration;
                newSubscription.startDate = new Date();
                newSubscription.status = SubscriptionStatus.ACTIVE;
                newSubscription.pricePaid = unitPricePaid;
                await queryRunner.manager.save(Subscription, newSubscription);
                isPhysicalShipmentRequired = false;
            }
        }
        else {
            if (itemDuration > 1) {
                const subscription = new Subscription();
                if (userEntity) subscription.user = userEntity; 
                subscription.product = product;
                if (foundPet) subscription.pet = foundPet;
                subscription.totalMonths = itemDuration;
                subscription.remainingMonths = itemDuration;
                subscription.startDate = new Date();
                subscription.paymentType = paymentType || 'upfront';
                subscription.pricePaid = unitPricePaid;
                subscription.status = SubscriptionStatus.ACTIVE;
                
                const nextDate = new Date();
                nextDate.setMonth(nextDate.getMonth() + 1);
                subscription.nextDeliveryDate = nextDate;

                await queryRunner.manager.save(Subscription, subscription);
            }
        }

        totalPrice += itemTotal;

        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.quantity = quantity;
        orderItem.priceAtPurchase = Number(product.price); 
        orderItem.productNameSnapshot = product.name;
        orderItem.duration = itemDuration;
        if (foundPet) orderItem.pet = foundPet;
        orderItems.push(orderItem);

        product.stock -= quantity;
        await queryRunner.manager.save(Product, product);
      }

      // --- SİPARİŞİ KAYDET ---

      const order = new Order();
      
      if (userEntity) {
          order.user = userEntity; // ✅ User Entity Nesnesini bağlıyoruz (Sadece ID değil)
      }
      
      order.shippingAddressSnapshot = addressSnapshot; 
      order.totalPrice = totalPrice;
      order.items = orderItems;
      
      // 👇 Ödeme Tipi Kaydı
      if (paymentType === 'bank_transfer') {
          order.paymentId = 'HAVALE_EFT';
      } else if (paymentType === 'cash_on_delivery') {
          order.paymentId = 'KAPIDA_ODEME';
      } else {
          order.paymentId = 'MOCK_' + Date.now(); 
      }
      
      order.status = OrderStatus.PENDING; 

      const savedOrder = await queryRunner.manager.save(Order, order);
      await queryRunner.commitTransaction();

      this.logger.log(`Sipariş Oluşturuldu -> ID: ${savedOrder.id}, User: ${userEntity ? userEntity.firstName : 'GUEST'}`);

      return { success: true, orderId: savedOrder.id, message: 'İşlem başarılı!' };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error("Sipariş oluşturma hatası:", err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // --- DİĞER METOTLAR ---
  async shipOrder(id: string, provider: string) {
    const order = await this.orderRepository.findOne({ where: { id }, relations: ['user'] });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');
    const shipmentResult = await this.shippingService.createShipment(order);
    order.status = OrderStatus.SHIPPED;
    order.cargoProvider = shipmentResult.provider; 
    order.cargoTrackingCode = shipmentResult.trackingCode; 
    order.shippedAt = new Date();
    await this.orderRepository.save(order);
    return { success: true, trackingCode: order.cargoTrackingCode };
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
      relations: ['user', 'items', 'items.product'], 
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.dataSource.getRepository(Order).findOne({ where: { id } });
    if (!order) return;
    order.status = status;
    return await this.dataSource.getRepository(Order).save(order);
  }

  async findOne(id: string) {
    return await this.orderRepository.findOne({ 
      where: { id }, 
      relations: ['user'] // Mail atarken user bilgisi lazım olduğu için relations ekliyoruz
    });
  }
}