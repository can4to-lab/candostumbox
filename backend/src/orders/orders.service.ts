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
      // ... (Adres işlemleri aynı) ...
      let addressSnapshot: any = {};
      if (userId) {
          const address = await queryRunner.manager.findOne(Address, { where: { id: addressId, userId } });
          if (!address) throw new NotFoundException('Teslimat adresi bulunamadı.');
          addressSnapshot = address;
      } else {
          addressSnapshot = { ...guestInfo, title: 'Guest Address' };
      }

      let totalPrice = 0;
      const orderItems: OrderItem[] = [];
      
      // 👇 KRİTİK: Siparişin kargo durumunu belirleyecek bayrak
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

        const unitPricePaid = itemTotal / itemDto.quantity

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
                // Süreleri güncelle
                existingSub.totalMonths += itemDuration;
                existingSub.remainingMonths += itemDuration;
                existingSub.status = SubscriptionStatus.ACTIVE;
                
                await queryRunner.manager.save(Subscription, existingSub);
                
                // 🛑 BU BİR HİZMET İŞLEMİDİR, KARGO ÇIKMAZ
                isPhysicalShipmentRequired = false; 
            }
        } 
        // ============================================================
        // 🛠️ SENARYO 2: PAKET YÜKSELTME (UPGRADE)
        // ============================================================
        if (itemDto.upgradeFromSubId) {
            const oldSub = await queryRunner.manager.findOne(Subscription, { 
                where: { id: itemDto.upgradeFromSubId },
                relations: ['product', 'user']
            });

           if (oldSub) {
                // 👇 DÜZELTME: İadeyi GERÇEK ÖDENEN TUTAR üzerinden hesapla
                // Eğer veritabanında pricePaid varsa onu kullan, yoksa (eski kayıtlar için) ürün fiyatını kullan.
                const historicalPrice = Number(oldSub.pricePaid) || Number(oldSub.product.price);
                const oldTotalMonths = oldSub.totalMonths || 1;
                
                // Aylık birim maliyet (Müşterinin ödediği rakam üzerinden)
                const costPerMonth = historicalPrice / oldTotalMonths;
                
                // İade edilecek tutar
                const refundValue = costPerMonth * oldSub.remainingMonths;
                
                console.log(`💰 İade Hesabı: Ödenen=${historicalPrice}, Aylık=${costPerMonth}, İade=${refundValue}`);

                // Yeni fiyattan düş
                itemTotal = Math.max(0, itemTotal - refundValue);

                // Eski aboneliği "YÜKSELTİLDİ" olarak işaretle
                oldSub.status = SubscriptionStatus.UPGRADED; 
                await queryRunner.manager.save(Subscription, oldSub);

                // YENİ ABONELİK OLUŞTUR (Eskisinin devamı niteliğinde)
                const newSubscription = new Subscription();
                newSubscription.user = { id: userId } as User;
                newSubscription.product = product;

                // 👇 YENİ: Yeni aboneliğin ödenen tutarını kaydet
                newSubscription.pricePaid = unitPricePaid;

                if (foundPet) newSubscription.pet = foundPet;
                
                // ⚠️ Yeni paketin süresi: Satın alınan süre (Örn: 6 ay seçildiyse 6 ay)
                newSubscription.totalMonths = itemDuration; 
                newSubscription.remainingMonths = itemDuration;
                
                // ⚠️ TARİH AYARI: 
                // Yükseltme işlemi hemen kargo çıkarmaz, bir sonraki döngüyü bekler.
                // VEYA, hemen yeni paketi istiyorsa kargo çıkarılır. 
                // Genelde: Mevcut ayın kutusu gittiyse, yeni paket gelecek ay gelir.
                // Biz burada "Gelecek Ay" mantığını kuralım:
                
                newSubscription.startDate = oldSub.startDate; // Başlangıç eskiyle aynı kalsın (History için)
                newSubscription.nextDeliveryDate = oldSub.nextDeliveryDate; // Sıradaki kargo tarihi değişmesin
                newSubscription.paymentType = paymentType || 'upfront';
                newSubscription.status = SubscriptionStatus.ACTIVE;

                await queryRunner.manager.save(Subscription, newSubscription);

                // 🛑 YÜKSELTME SADECE PLAN DEĞİŞİKLİĞİDİR, ANLIK KARGO ÇIKMAZ
                // (Kargo, nextDeliveryDate geldiğinde Cron Job ile çıkacak)
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
            
            // İlk kutu hemen çıkacağı için, bir sonraki tarih 1 ay sonra
            const nextDate = new Date();
            nextDate.setMonth(nextDate.getMonth() + 1);
            subscription.nextDeliveryDate = nextDate;
            
            subscription.status = SubscriptionStatus.ACTIVE;
            await queryRunner.manager.save(Subscription, subscription);
            
            // ✅ YENİ ABONELİKTE İLK KUTU HEMEN ÇIKAR
            isPhysicalShipmentRequired = true;
        }

        totalPrice += itemTotal;

        // Sipariş Kalemi (Order Item)
        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.quantity = itemDto.quantity;
        orderItem.priceAtPurchase = product.price; 
        if (foundPet) {
            orderItem.pet = foundPet;
        }
        orderItems.push(orderItem);

        // Stok Düş (Sadece fiziksel gönderim varsa mı düşmeli? Genelde rezerve edilir, düşelim)
        product.stock -= itemDto.quantity;
        await queryRunner.manager.save(product);
      }

      // --- SİPARİŞİ KAYDET (FİNANSAL KAYIT) ---
      const order = new Order();
      if (userId) order.user = { id: userId } as User;
      order.shippingAddressSnapshot = addressSnapshot; 
      order.totalPrice = totalPrice;
      order.items = orderItems;
      order.paymentId = 'MOCK_' + Date.now(); 

      // 🧠 STATÜ BELİRLEME
      // Eğer fiziksel gönderim gerekiyorsa (Yeni Abonelik): PREPARING (Depoya düşsün)
      // Eğer sadece süre uzatma/yükseltme ise: COMPLETED (Sadece fatura kesilsin, kargo yok)
      order.status = isPhysicalShipmentRequired ? OrderStatus.PREPARING : OrderStatus.PAID; 
      // Not: PAID yaptık ki "Tamamlandı" veya "İşlemde" gibi görünsün ama "Kargoya Verildi" sürecine girmesin.
      // Dilerseniz OrderStatus.COMPLETED diye bir statü ekleyip onu kullanabilirsiniz.

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