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
import { MailService } from '../mail/mail.service';
import { PromoCodesService } from '../promo-codes/promo-codes.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private dataSource: DataSource,
    private discountsService: DiscountsService,
    private shippingService: ShippingService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private mailService: MailService,
    private promoCodesService: PromoCodesService
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
                phone: userEntity?.phone || '', // Adres entity'sinde phone yoksa User'dan al
                firstName: userEntity?.firstName || '',
                lastName: userEntity?.lastName || '',
                email: userEntity?.email || ''
             };
          }
      } else {
          // Misafir
          if (!guestInfo) addressSnapshot = { fullAddress: 'Adres bilgisi eksik' };
          else addressSnapshot = { ...guestInfo, title: 'Guest Address' };
      }

      let totalPrice = 0;
      let upgradeDiscountTotal = 0;
      const orderItems: OrderItem[] = [];
      let isPhysicalShipmentRequired = true; 

      for (const itemDto of items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id: itemDto.productId } });
        if (!product) throw new NotFoundException('Ürün bulunamadı');

        const quantity = Number(itemDto.quantity) || 1;
        const itemDuration = Number(itemDto.duration) || 1;
        let itemTotal = 0;
        const basePrice = Number(product.price);

       const { finalPrice } = await this.discountsService.calculatePrice(Number(product.price), itemDuration);
        itemTotal = finalPrice * quantity;
        const unitPricePaid = finalPrice;

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
                
                // 👇 EKSİK 1 ÇÖZÜLDÜ: Uzatılan paketin yeni ödemesini içeriye ekliyoruz (İade hesaplaması bozulmasın diye)
                existingSub.pricePaid = Number(existingSub.pricePaid || 0) + Number(unitPricePaid);

                await queryRunner.manager.save(Subscription, existingSub);
                isPhysicalShipmentRequired = false;
            }
        } 
        else if (itemDto.upgradeFromSubId) {
            const oldSub = await queryRunner.manager.findOne(Subscription, { where: { id: itemDto.upgradeFromSubId }, relations: ['product'] });
            if (oldSub) {
                const oldPricePerMonth = Number(oldSub.pricePaid) / (oldSub.totalMonths || 1);
                const upgradeDiscount = oldPricePerMonth * oldSub.remainingMonths;
                
                // 👇 DÜZELTME: Fiyattan hemen düşme, hafızada tut! En son düşeceğiz.
                upgradeDiscountTotal += upgradeDiscount; 
                this.logger.log(`🔄 Sipariş Kaydı: Yükseltme indirimi (${upgradeDiscount} TL) hafızaya alındı.`);
                
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

                // 👇 EKSİK 2 ÇÖZÜLDÜ: Yükseltilen pakete ödeme tipi ve BİR SONRAKİ SEVKİYAT TARİHİ atandı!
                newSubscription.paymentType = paymentType || 'upfront';
                const nextDate = new Date();
                nextDate.setMonth(nextDate.getMonth() + 1);
                newSubscription.nextDeliveryDate = nextDate;
                newSubscription.shippingAddressSnapshot = addressSnapshot; // Abonelik boyunca adresi hatırla
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
                subscription.shippingAddressSnapshot = addressSnapshot; // Abonelik boyunca adresi hatırla
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
      // --- PROMO KODU VE HİZMET BEDELİNİ SİPARİŞE YANSIT ---
      if (createOrderDto.promoCode) {
          try {
            const promo = await this.promoCodesService.validateCode(createOrderDto.promoCode, totalPrice, userId || undefined);
            
            if (promo.discountType === 'percentage') {
               totalPrice -= (totalPrice * Number(promo.discountValue)) / 100;
            } else {
               totalPrice -= Number(promo.discountValue);
            }
            
            // Sipariş başarıyla oluşturulurken kodun kullanım sayısını artır
            await this.promoCodesService.incrementUsage(promo.id); 
            
            // SİPARİŞ VERİTABANINA YAZILIRKEN KUPON KODUNU DA KAYDET
            order.promoCode = promo.code; 

         } catch (e) {
           this.logger.warn(`Sipariş kaydedilirken geçersiz promo kod atlandı: ${createOrderDto.promoCode}`);
         }
      }
      totalPrice -= upgradeDiscountTotal;
      if (paymentType === 'cash_on_delivery') {
         totalPrice += 159.9; // Kapıda ödeme bedelini ekle
      }

      order.totalPrice = Math.max(0, totalPrice); // Eksiye düşmesini engelle
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
      try {
          // 1. Patrona mail at
          await this.mailService.sendAdminOrderNotification(savedOrder.id, savedOrder.totalPrice);
          
          // 2. Müşteriye mail at (Eğer mail adresi varsa)
          const customerEmail = userEntity?.email || addressSnapshot?.email;
          if (customerEmail) {
              await this.mailService.sendOrderConfirmation(customerEmail, savedOrder.id, savedOrder.totalPrice);
          }
      } catch (mailError) {
          // Mail gitmese bile sipariş işlemi iptal olmasın diye hatayı sadece logluyoruz
          this.logger.error(`Sipariş oluştu ama mail atılamadı (ID: ${savedOrder.id}):`, mailError);
      }
      
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
  // --- GÜVENLİ FİYAT HESAPLAMA (FRONTEND MANİPÜLASYONUNU ENGELLER) ---
  async calculateSecureTotal(items: any[], promoCodeStr?: string, userId?: string, paymentType?: string): Promise<number> {
    let subtotal = 0;
    let upgradeDiscount = 0

    for (const item of items) {

      if (item.upgradeFromSubId) {
          const oldSub = await this.dataSource.getRepository(Subscription).findOne({ where: { id: item.upgradeFromSubId } });
          if (oldSub && oldSub.status === SubscriptionStatus.ACTIVE) {
              const oldPricePerMonth = Number(oldSub.pricePaid) / (oldSub.totalMonths || 1);
              upgradeDiscount += (oldPricePerMonth * oldSub.remainingMonths);
              this.logger.log(`🔄 Paket Yükseltme: Eski abonelikten içeride kalan ${upgradeDiscount} TL yeni fiyattan düşülecek.`);
          }
      }
      
      const product = await this.dataSource.getRepository(Product).findOne({ where: { id: item.productId } });
      if (!product) throw new BadRequestException('Ürün bulunamadı');

      const duration = Number(item.duration) || 1;
      const quantity = Number(item.quantity) || 1;

      // 1. İndirimli ham fiyatı DiscountsService üzerinden hesapla
      const { finalPrice } = await this.discountsService.calculatePrice(Number(product.price), duration);
      subtotal += (finalPrice * quantity);
    }

    let finalTotal = subtotal;

    // 2. Promosyon kodu varsa backend'de düş
    if (promoCodeStr) {
      try {
        const promo = await this.promoCodesService.validateCode(promoCodeStr, subtotal, userId);
        if (promo.discountType === 'percentage') {
          finalTotal -= (subtotal * Number(promo.discountValue)) / 100;
        } else {
          finalTotal -= Number(promo.discountValue);
        }
        // Sipariş onaylanınca promo kod kullanım sayısını artırmak istersen buraya ekleyebilirsin
      } catch (error) {
        throw new BadRequestException('Geçersiz veya süresi dolmuş promosyon kodu kullanıldı.');
      }
    }
    finalTotal -= upgradeDiscount;
    // 3. Kapıda ödeme seçildiyse hizmet bedelini ekle
    if (paymentType === 'cash_on_delivery') {
      finalTotal += 159.9; // Kapıda ödeme hizmet bedeli
    }

    this.logger.log(`🔒 Güvenli Fiyat Hesaplandı: ${finalTotal} TL (Müşterinin gönderdiği fiyata güvenilmedi)`);
    return Math.max(0, finalTotal);
  }
}