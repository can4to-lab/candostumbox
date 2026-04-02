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
      // 1. KULLANICIYI BUL
      let userEntity: User | null = null;
      if (userId) {
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
                phone: userEntity?.phone || '', 
                firstName: userEntity?.firstName || '',
                lastName: userEntity?.lastName || '',
                email: userEntity?.email || ''
             };
          }
      } else {
          if (!guestInfo) addressSnapshot = { fullAddress: 'Adres bilgisi eksik' };
          else addressSnapshot = { ...guestInfo, title: 'Guest Address' };
      }

      let totalPrice = 0;
      let retailTotal = 0; // 🛡️ GÜVENLİK: Sadece Perakende Toplamı
      let hasSubscription = false; // 🛡️ GÜVENLİK: Sepette Abonelik Var mı?
      let upgradeDiscountTotal = 0;
      const orderItems: OrderItem[] = [];
      let isPhysicalShipmentRequired = true; 

      // 🚀 3. SEPETTEKİ ÜRÜNLERİ DÖN (FRONTEND FİYATLARINI ÇÖPE AT VE DB'DEN HESAPLA)
      for (const itemDto of items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id: itemDto.productId } });
        if (!product) throw new NotFoundException('Ürün bulunamadı');

        const quantity = Number(itemDto.quantity) || 1;
        const itemType = itemDto.type || 'SUBSCRIPTION';

        if (itemType === 'SUBSCRIPTION') hasSubscription = true;

        // Stok Kontrolü
        if (product.stock < quantity) {
            throw new BadRequestException(`${product.name} için yeterli stok yok! (Kalan: ${product.stock})`);
        }

        // Gerçek ve Güvenli Fiyatı Belirle
        const activePrice = product.discountedPrice ? Number(product.discountedPrice) : Number(product.price);

        if (itemType === 'RETAIL') {
            // 🛍️ PERAKENDE ÜRÜN İŞLEMLERİ
            const itemTotal = activePrice * quantity;
            retailTotal += itemTotal; 
            totalPrice += itemTotal;

            const orderItem = new OrderItem();
            orderItem.product = product;
            orderItem.quantity = quantity;
            orderItem.priceAtPurchase = activePrice; 
            orderItem.productNameSnapshot = product.name;
            orderItems.push(orderItem);

            product.stock -= quantity;
            await queryRunner.manager.save(Product, product);

        } else {
            // 📦 ABONELİK KUTUSU İŞLEMLERİ
            const itemDuration = Number(itemDto.duration) || 1;
            
            const { finalPrice } = await this.discountsService.calculatePrice(activePrice, itemDuration);
            
            const itemTotal = finalPrice * quantity;
            const unitPricePaid = finalPrice;

            let foundPet: Pet | null = null;
            if (itemDto.petId) {
                foundPet = await queryRunner.manager.findOne(Pet, { where: { id: itemDto.petId as any } });
            } 
            else if (itemDto.petName) {
                const newPet = new Pet();
                newPet.name = itemDto.petName;
                newPet.type = itemDto.petType || 'kopek';
                newPet.breed = itemDto.petBreed || '';
                newPet.birthDate = itemDto.petBirthDate ? new Date(itemDto.petBirthDate) : new Date();
                newPet.weight = itemDto.petWeight ? String(itemDto.petWeight) : '0';
                newPet.isNeutered = itemDto.petIsNeutered || false;
                newPet.allergies = itemDto.petAllergies ? itemDto.petAllergies.split(',').map(a => a.trim()) : [];
                
                foundPet = await queryRunner.manager.save(Pet, newPet);
            }

            // --- ABONELİK İŞLEMLERİ ---
            if (itemDto.subscriptionId) {
                const existingSub = await queryRunner.manager.findOne(Subscription, { where: { id: itemDto.subscriptionId }, relations: ['product'] });
                if (existingSub) {
                    existingSub.totalMonths += itemDuration;
                    existingSub.remainingMonths += itemDuration;
                    existingSub.status = SubscriptionStatus.ACTIVE;
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
                    
                    upgradeDiscountTotal += upgradeDiscount; 
                    
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
                    newSubscription.paymentType = paymentType || 'upfront';
                    
                    const nextDate = new Date();
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    newSubscription.nextDeliveryDate = nextDate;
                    newSubscription.shippingAddressSnapshot = addressSnapshot; 
                    await queryRunner.manager.save(Subscription, newSubscription);
                    isPhysicalShipmentRequired = false;
                }
            }
            else {
                if (itemDuration > 1 || itemDuration === 1) {
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
                    subscription.shippingAddressSnapshot = addressSnapshot; 
                    await queryRunner.manager.save(Subscription, subscription);
                }
            }

            totalPrice += itemTotal;

            const orderItem = new OrderItem();
            orderItem.product = product;
            orderItem.quantity = quantity;
            orderItem.priceAtPurchase = activePrice; 
            orderItem.productNameSnapshot = product.name;
            orderItem.duration = itemDuration;
            if (foundPet) orderItem.pet = foundPet;
            orderItems.push(orderItem);

            product.stock -= quantity;
            await queryRunner.manager.save(Product, product);
        }
      }

      // --- SİPARİŞİ KAYDET ---
      const order = new Order();
      if (userEntity) order.user = userEntity; 
      order.shippingAddressSnapshot = addressSnapshot; 
      
      // PROMO KOD İŞLEMİ (Güvenli Şekilde DB'den Onaylanır)
      if (createOrderDto.promoCode) {
          const promo = await this.promoCodesService.validateCode(createOrderDto.promoCode, totalPrice, userId || undefined);
          
          if (promo.discountType === 'percentage') {
             totalPrice -= (totalPrice * Number(promo.discountValue)) / 100;
          } else {
             totalPrice -= Number(promo.discountValue);
          }
          
          await this.promoCodesService.incrementUsage(promo.id); 
          order.promoCode = promo.code; 
      }

      totalPrice -= upgradeDiscountTotal;

      // 🛡️ GÜVENLİK: Kargo Ücreti (Frontend bunu sıfır yollasa bile backend burada affetmez!)
      const SHIPPING_THRESHOLD = 500;
      const SHIPPING_FEE = 125;
      
      if (!hasSubscription && retailTotal > 0 && retailTotal < SHIPPING_THRESHOLD) {
          totalPrice += SHIPPING_FEE;
          this.logger.log(`📦 Kargo Ücreti Eklendi (500 TL Altı): ${SHIPPING_FEE} TL`);
      }

      if (paymentType === 'cash_on_delivery') {
         totalPrice += 159.9; 
      }

      order.totalPrice = Math.max(0, totalPrice); 
      
      // Ödeme Tipi Kaydı
      if (paymentType === 'bank_transfer') order.paymentId = 'HAVALE_EFT';
      else if (paymentType === 'cash_on_delivery') order.paymentId = 'KAPIDA_ODEME';
      else order.paymentId = 'KREDI_KARTI'; 
      
      order.status = OrderStatus.PENDING; 

      const savedOrder = await queryRunner.manager.save(Order, order);

      for (const item of orderItems) {
          item.order = savedOrder;
          await queryRunner.manager.save(OrderItem, item);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`✅ Sipariş Başarıyla Oluşturuldu -> ID: ${savedOrder.id}, Tutar: ${savedOrder.totalPrice} TL`);

      // Mailler Arka Planda Gider
      const customerEmail = userEntity?.email || addressSnapshot?.email;
      
      this.mailService.sendAdminOrderNotification(savedOrder.id, savedOrder.totalPrice)
        .catch(err => this.logger.error(`Admin maili gönderilemedi (ID: ${savedOrder.id})`, err));
        
      if (customerEmail) {
          this.mailService.sendOrderConfirmation(customerEmail, savedOrder.id, savedOrder.totalPrice)
            .catch(err => this.logger.error(`Müşteri maili gönderilemedi (ID: ${savedOrder.id})`, err));
      }

      return { success: true, orderId: savedOrder.id, message: 'İşlem başarılı!' };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error("🚨 Sipariş oluşturma hatası:", err);
      throw err; 
    } finally {
      await queryRunner.release();
    }
  }

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
      relations: ['user'] 
    });
  }

  // 🚀 PARAMPOS İÇİN GÜVENLİ FİYAT HESAPLAMA (FRONTEND MANİPÜLASYONUNU ENGELLER)
  async calculateSecureTotal(items: any[], promoCodeStr?: string, userId?: string, paymentType?: string): Promise<number> {
    let subtotal = 0;
    let retailTotal = 0; // 🛡️ GÜVENLİK
    let upgradeDiscount = 0;
    let hasSubscription = false; // 🛡️ GÜVENLİK

    for (const item of items) {

      if (item.upgradeFromSubId) {
          const oldSub = await this.dataSource.getRepository(Subscription).findOne({ where: { id: item.upgradeFromSubId } });
          if (oldSub && oldSub.status === SubscriptionStatus.ACTIVE) {
              const oldPricePerMonth = Number(oldSub.pricePaid) / (oldSub.totalMonths || 1);
              upgradeDiscount += (oldPricePerMonth * oldSub.remainingMonths);
          }
      }
      
      const itemType = item.type || 'SUBSCRIPTION';
      if (itemType === 'SUBSCRIPTION') hasSubscription = true;

      const product = await this.dataSource.getRepository(Product).findOne({ where: { id: item.productId } });
      if (!product) throw new BadRequestException('Ürün bulunamadı');

      const duration = Number(item.duration) || 1;
      const quantity = Number(item.quantity) || 1;

      // İndirimli fiyatı veritabanından bul
      const activePrice = product.discountedPrice ? Number(product.discountedPrice) : Number(product.price);

      if (itemType === 'RETAIL') {
          const itemTotal = activePrice * quantity;
          retailTotal += itemTotal;
          subtotal += itemTotal;
      } else {
          // Abonelik için indirimli fiyatı baza al, üstüne ay indirimi uygula
          const { finalPrice } = await this.discountsService.calculatePrice(activePrice, duration);
          subtotal += (finalPrice * quantity);
      }
    }

    let finalTotal = subtotal; // 👈 Sadece sepet toplamını al

    // 1. ÖNCE KUPONU UYGULA
    if (promoCodeStr) {
      try {
        const promo = await this.promoCodesService.validateCode(promoCodeStr, finalTotal, userId); 

        if (promo.discountType === 'percentage') {
          finalTotal -= (finalTotal * Number(promo.discountValue)) / 100; 
        } else {
          finalTotal -= Number(promo.discountValue);
        }
      } catch (error) {
        throw new BadRequestException('Geçersiz veya süresi dolmuş promosyon kodu kullanıldı.');
      }
    }
        
    // 2. SONRA YÜKSELTME (UPGRADE) İADESİNİ DÜŞ
    finalTotal = Math.max(0, finalTotal - upgradeDiscount);

    if (promoCodeStr) {
      try {
        const promo = await this.promoCodesService.validateCode(promoCodeStr, finalTotal, userId); 

        if (promo.discountType === 'percentage') {
          finalTotal -= (finalTotal * Number(promo.discountValue)) / 100; 
        } else {
          finalTotal -= Number(promo.discountValue);
        }
      } catch (error) {
        throw new BadRequestException('Geçersiz promosyon kodu.');
      }
    }
        
    // 🛡️ GÜVENLİK: Kargo Ücreti ParamPOS çekimi öncesi de kesin olarak ekleniyor
    const SHIPPING_THRESHOLD = 500;
    const SHIPPING_FEE = 125;
    
    if (!hasSubscription && retailTotal > 0 && retailTotal < SHIPPING_THRESHOLD) {
        finalTotal += SHIPPING_FEE;
    }

    if (paymentType === 'cash_on_delivery') {
      finalTotal += 159.9; 
    }

    this.logger.log(`🔒 Güvenli Fiyat Doğrulandı: ${finalTotal} TL (Müşteri beyanına güvenilmedi)`);
    return Math.max(0, finalTotal);
  }
}