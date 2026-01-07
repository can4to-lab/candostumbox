import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
// 👇 OrderStatus IMPORT EDİLDİĞİNDEN EMİN OL
import { Order, OrderStatus } from '../orders/entities/order.entity'; 
import { OrderItem } from '../orders/entities/order-item.entity';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
async calculateRefund(id: string) {
    const sub = await this.subRepository.findOne({
        where: { id },
        relations: ['product']
    });

    if (!sub) throw new NotFoundException('Abonelik bulunamadı.');

    // PRORATION (ORANSAL İADE) MANTIĞI
    // Formül: (Ürün Fiyatı / Toplam Ay) * Kalan Ay
    const price = Number(sub.product.price);
    const totalMonths = sub.totalMonths || 1;
    const pricePerMonth = price / totalMonths;
    const refundAmount = pricePerMonth * sub.remainingMonths;

    return {
        refundAmount: Number(refundAmount.toFixed(2)),
        remainingMonths: sub.remainingMonths,
        currency: 'TRY'
    };
}
  constructor(
    @InjectRepository(Subscription)
    private subRepository: Repository<Subscription>,
    
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,

    
  ) {}

  async findAllByUser(userId: string) {
    if (!userId) return [];
    return await this.subRepository.find({
      where: { user: { id: userId } },
      relations: ['pet', 'product'], 
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string) {
    const sub = await this.subRepository.findOne({ 
        where: { id },
        relations: ['user', 'pet', 'product']
    });
    if (!sub) throw new NotFoundException('Abonelik bulunamadı.');
    return sub;
  }

  // backend/src/subscriptions/subscriptions.service.ts

async cancel(id: string, userId: string, reason: string) {
    // 1. Aboneliği ve Fiyat Hesabı için Ürünü getir
    const sub = await this.subRepository.findOne({ 
        where: { id },
        relations: ['user', 'product'] // Ürün fiyatına erişmek için relations şart
    });

    if (!sub) throw new NotFoundException('Abonelik bulunamadı.');
    
    // Güvenlik: Başkasının aboneliğini iptal edemez
    // (Not: ID tipleri number/string karışıklığına dikkat, string ise doğrudan kıyasla)
    if (String(sub.user.id) !== String(userId)) {
        throw new ForbiddenException('Bu işlem için yetkiniz yok.');
    }

    if (sub.status !== SubscriptionStatus.ACTIVE) {
        throw new ForbiddenException('Bu abonelik zaten aktif değil.');
    }

    // 2. İADE MATEMATİĞİ (REFUND LOGIC) 💰
    // Formül: (Toplam Tutar / Toplam Ay) * Kalan Ay
    // Not: Gerçekte 'Order' tablosundan ödenen net tutarı çekmek daha iyidir ama ürün fiyatı da iş görür.
    const pricePerMonth = Number(sub.product.price) / (sub.totalMonths || 1);
    const refundAmount = sub.remainingMonths * pricePerMonth;

    // 3. Durumu Güncelle
    sub.status = SubscriptionStatus.CANCELLED;
    sub.cancellationReason = reason || 'Kullanıcı isteğiyle iptal';
    
    // Veritabanına kaydet
    await this.subRepository.save(sub);

    // 4. Frontend'e Bilgi Dön
    return {
        success: true,
        message: 'Abonelik başarıyla iptal edildi.',
        refundAmount: refundAmount,
        remainingMonths: sub.remainingMonths,
        info: `İptal işlemi onaylandı. Kullanılmayan ${sub.remainingMonths} ay için ₺${refundAmount.toFixed(2)} tutarında iade süreci başlatılmıştır.`
    };
}

  // 👇 OTOMATİK GÖREV (CRON JOB)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug('⏳ Cron Job Başladı: Ödemeler ve Siparişler kontrol ediliyor...');

    const today = new Date();
    
    const activeSubs = await this.subRepository.find({
        where: {
            status: SubscriptionStatus.ACTIVE,
            nextDeliveryDate: LessThanOrEqual(today)
        },
        relations: ['user', 'product', 'pet'] 
    });

    if (activeSubs.length === 0) {
        this.logger.debug('✅ Bugün yenilenecek abonelik yok.');
        return;
    }

    for (const sub of activeSubs) {
        const paymentSuccessful = true; // Simülasyon

        if (paymentSuccessful) {
            // 1. YENİ SİPARİŞ OLUŞTUR
            // Artık Order entity'sinde 'paymentType' olduğu için hata vermeyecek.
            const newOrder = this.orderRepository.create({
                user: sub.user,
                totalPrice: sub.product.price,
                status: OrderStatus.PAID, // Enum kullandık
                paymentType: 'monthly',   // Artık Entity'de var
                shippingAddressSnapshot: { 
                    title: "Kayıtlı Adres", 
                    name: sub.user.firstName + ' ' + sub.user.lastName,
                    fullAddress: "Otomatik Yenileme (Abonelik)" 
                }
            });
            
            const savedOrder = await this.orderRepository.save(newOrder);

            // 2. SİPARİŞ İÇERİĞİNİ EKLE
            const newItem = this.orderItemRepository.create({
                order: savedOrder,
                product: sub.product,
                pet: sub.pet,
                quantity: 1,
                priceAtPurchase: sub.product.price,
                productNameSnapshot: sub.product.name
            });
            await this.orderItemRepository.save(newItem);

            // 3. ABONELİK TARİHİNİ GÜNCELLE
            const nextDate = new Date(sub.nextDeliveryDate);
            nextDate.setMonth(nextDate.getMonth() + 1);
            sub.nextDeliveryDate = nextDate;

            sub.remainingMonths -= 1;

            if (sub.remainingMonths <= 0) {
                sub.status = SubscriptionStatus.COMPLETED;
                sub.remainingMonths = 0;
                this.logger.log(`🏁 Abonelik Tamamlandı: ${sub.id}`);
            } else {
                this.logger.log(`✅ Abonelik Yenilendi ve Sipariş Oluştu: ${sub.id}`);
            }

            await this.subRepository.save(sub);
        }
    }
  }
}