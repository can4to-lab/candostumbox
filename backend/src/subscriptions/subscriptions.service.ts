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

  async cancel(id: string, userId: string, reason: string) {
    const sub = await this.findOne(id);
    if (sub.user.id !== userId) throw new ForbiddenException('Yetkisiz işlem.');
    if (sub.status !== SubscriptionStatus.ACTIVE) throw new ForbiddenException('Zaten aktif değil.');

    sub.status = SubscriptionStatus.CANCELLED;
    sub.cancellationReason = reason;
    return await this.subRepository.save(sub);
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