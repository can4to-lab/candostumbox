import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
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

      const pricePerMonth = Number(sub.product.price) / (sub.totalMonths || 1);
      const refundAmount = sub.remainingMonths * pricePerMonth;

      sub.status = SubscriptionStatus.CANCELLED;
      sub.cancellationReason = reason || 'Kullanıcı isteğiyle iptal';
      
      await this.subRepository.save(sub);

      return {
          success: true,
          message: 'Abonelik başarıyla iptal edildi.',
          refundAmount: refundAmount,
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
        relations: ['user', 'product', 'pet'] 
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

        const isUpfront = sub.paymentType === 'upfront';
        const orderPrice = isUpfront ? 0 : Number(sub.product.price);
        const orderStatus = isUpfront ? OrderStatus.PREPARING : OrderStatus.PENDING; 

        const newOrder = this.orderRepository.create({
            user: sub.user,
            totalPrice: orderPrice,
            status: orderStatus,
            paymentType: isUpfront ? 'upfront' : 'monthly',
            shippingAddressSnapshot: { 
                title: "Kayıtlı Adres", 
                fullAddress: "Otomatik Sevkiyat - Abonelik Kapsamında" 
            }
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