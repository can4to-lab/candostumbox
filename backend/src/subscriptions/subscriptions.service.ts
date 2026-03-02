import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Order, OrderStatus } from '../orders/entities/order.entity'; 
import { OrderItem } from '../orders/entities/order-item.entity';
import { MailService } from '../mail/mail.service'; // Dosya yolunu kendi projene göre ayarla

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private subRepository: Repository<Subscription>,
    
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,

    private mailService: MailService,
  ) {}

async findAll() {
    return await this.subRepository.find({
      relations: ['user', 'pet', 'product', 'order'], 
      order: { createdAt: 'DESC' }
    });
  }
async calculateRefund(id: string) {
      const sub = await this.subRepository.findOne({
          where: { id },
          relations: ['product']
      });

      if (!sub) throw new NotFoundException('Abonelik bulunamadı.');

      // 🔒 KRİTİK DÜZELTME: İadeyi ürünün baz fiyatından değil, müşterinin GERÇEKTEN ödediği fiyattan hesapla!
      const totalPaid = Number(sub.pricePaid) || 0;
      const totalMonths = sub.totalMonths || 1;
      const pricePerMonth = totalPaid / totalMonths;
      const refundAmount = pricePerMonth * sub.remainingMonths;

      return {
          refundAmount: Number(refundAmount.toFixed(2)),
          remainingMonths: sub.remainingMonths,
          currency: 'TRY'
      };
  }

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

  async cancel(id: string, userId: string, reason: string) {
      const sub = await this.subRepository.findOne({ 
          where: { id },
          relations: ['user', 'product'] 
      });

      if (!sub) throw new NotFoundException('Abonelik bulunamadı.');
      
      if (String(sub.user.id) !== String(userId)) {
          throw new ForbiddenException('Bu işlem için yetkiniz yok.');
      }

      if (sub.status !== SubscriptionStatus.ACTIVE) {
          throw new ForbiddenException('Bu abonelik zaten aktif değil.');
      }

      // 🔒 KRİTİK DÜZELTME: Gerçek ödenen tutar üzerinden iade!
      const totalPaid = Number(sub.pricePaid) || 0;
      const pricePerMonth = totalPaid / (sub.totalMonths || 1);
      const refundAmount = sub.remainingMonths * pricePerMonth;

      sub.status = SubscriptionStatus.CANCELLED;
      sub.cancellationReason = reason || 'Kullanıcı isteğiyle iptal';
      
      await this.subRepository.save(sub);

      return {
          success: true,
          message: 'Abonelik başarıyla iptal edildi.',
          refundAmount: Number(refundAmount.toFixed(2)),
          remainingMonths: sub.remainingMonths,
          info: `İptal işlemi onaylandı. Kullanılmayan ${sub.remainingMonths} ay için ₺${refundAmount.toFixed(2)} tutarında iade süreci başlatılmıştır.`
      };
  }

 @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug('⏳ Cron Job Başladı: Sevkiyat ve Yenileme Kontrolü...');

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    const activeSubs = await this.subRepository.find({
        where: {
            status: SubscriptionStatus.ACTIVE,
            nextDeliveryDate: LessThanOrEqual(targetDate),
        },
        relations: ['user', 'user.addresses', 'product', 'pet']
    });

    if (activeSubs.length === 0) {
        this.logger.debug('✅ Bugün işlem yapılacak abonelik yok.');
        return;
    }

    for (const sub of activeSubs) {
        if (sub.remainingMonths <= 0) {
            sub.status = SubscriptionStatus.COMPLETED;
            await this.subRepository.save(sub);
            continue;
        }

        // 🔒 KRİTİK DÜZELTME: Tüm kredi kartı ve havale işlemleri peşin kabul edilir!
        const isUpfront = ['upfront', 'credit_card', 'bank_transfer', 'cash_on_delivery'].includes(sub.paymentType);
        
        // Peşin ödendiyse bu ayki sipariş 0 TL olarak oluşturulur.
        const orderPrice = isUpfront ? 0 : Number(sub.product.price);
        const orderStatus = isUpfront ? OrderStatus.PREPARING : OrderStatus.PENDING; 
        const userAddress = sub.user?.addresses?.[0];
        const realAddressSnapshot = userAddress ? {
            title: userAddress.title,
            fullAddress: userAddress.fullAddress,
            city: userAddress.city,
            district: userAddress.district,
            phone: sub.user?.phone || '',
            email: sub.user?.email || '' // 👈 BU SATIR EKLENDİ (TypeScript Hatasını Çözer)
        } : {
            title: "Kayıtlı Adres",
            fullAddress: "DİKKAT: Sistemde adres bulunamadı, müşteriyle iletişime geçin!",
            email: sub.user?.email || '' // 👈 BU SATIR EKLENDİ
        };

        const newOrder = this.orderRepository.create({
            user: sub.user,
            totalPrice: orderPrice,
            status: orderStatus,
            paymentType: sub.paymentType,
            shippingAddressSnapshot: realAddressSnapshot // 👈 Gerçek adres buraya eklendi
        });
        
        const savedOrder = await this.orderRepository.save(newOrder);

        const newItem = this.orderItemRepository.create({
            order: savedOrder,
            product: sub.product,
            pet: sub.pet,
            quantity: 1,
            priceAtPurchase: orderPrice,
            productNameSnapshot: sub.product.name
        });
        await this.orderItemRepository.save(newItem);
        // 👇 EKSİK OLAN İLETİŞİM KÖPRÜSÜ KURULDU
        try {
            await this.mailService.sendAdminOrderNotification(savedOrder.id, savedOrder.totalPrice);
            const customerEmail = sub.user?.email || realAddressSnapshot?.email;
            if (customerEmail) {
                // Fiyat 0 TL olsa bile (peşin ödendiği için) müşteriye bilgi maili GİTMELİ!
                await this.mailService.sendOrderConfirmation(customerEmail, savedOrder.id, savedOrder.totalPrice);
            }
        } catch (mailErr) {
            this.logger.error(`Otomatik sipariş maili atılamadı (Sipariş ID: ${savedOrder.id}):`, mailErr);
        }

        const nextDate = new Date(sub.nextDeliveryDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        sub.nextDeliveryDate = nextDate;

        sub.remainingMonths -= 1;

        if (sub.remainingMonths <= 0) {
            sub.status = SubscriptionStatus.COMPLETED;
            this.logger.log(`🏁 Abonelik Tamamlandı: ${sub.id}`);
        } else {
            this.logger.log(`📦 Otomatik Sipariş (${sub.paymentType}): ${sub.id} - Tutar: ${orderPrice} TL`);
        }

        await this.subRepository.save(sub);
    }
  }
}