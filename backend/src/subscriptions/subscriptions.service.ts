import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm'; // 👈 LessThanOrEqual EKLENDİ
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { Cron, CronExpression } from '@nestjs/schedule'; // 👈 CRON EKLENDİ

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private subRepository: Repository<Subscription>,
  ) {}

  async findAllByUser(userId: string) {
    // 👇 GÜVENLİK KONTROLÜ: Eğer userId yoksa, boş dizi dön veya hata ver.
    // Asla sorguyu çalıştırma!
    if (!userId) {
        console.error("GÜVENLİK HATASI: findAllByUser fonksiyonuna userId gelmedi!");
        return []; 
    }

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

  // 👇 GÜNCELLENDİ: İptal Sebebi (reason) alıyor
  async cancel(id: string, userId: string, reason: string) {
    const sub = await this.findOne(id);

    if (sub.user.id !== userId) {
        throw new ForbiddenException('Bu işlem için yetkiniz yok.');
    }

    if (sub.status !== SubscriptionStatus.ACTIVE) {
        throw new ForbiddenException('Bu abonelik zaten aktif değil.');
    }

    sub.status = SubscriptionStatus.CANCELLED;
    sub.cancellationReason = reason; // Sebebi kaydet
    
    return await this.subRepository.save(sub);
  }

  // 👇 YENİ: OTOMATİK GÖREV (Her gece 00:00'da çalışır)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug('⏳ Cron Job Başladı: Abonelik süreleri kontrol ediliyor...');

    const today = new Date();
    
    // Teslim tarihi bugün veya geçmişte olan AKTİF abonelikleri bul
    const activeSubs = await this.subRepository.find({
        where: {
            status: SubscriptionStatus.ACTIVE,
            nextDeliveryDate: LessThanOrEqual(today)
        }
    });

    for (const sub of activeSubs) {
        // 1. Kalan süreyi azalt
        sub.remainingMonths -= 1;

        // 2. Bir sonraki teslim tarihini 1 ay ileri at
        const nextDate = new Date(sub.nextDeliveryDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        sub.nextDeliveryDate = nextDate;

        // 3. Süre bitti mi kontrol et
        if (sub.remainingMonths <= 0) {
            sub.status = SubscriptionStatus.COMPLETED;
            sub.remainingMonths = 0;
            this.logger.log(`✅ Abonelik Tamamlandı: ${sub.id}`);
        } else {
            this.logger.log(`📦 Yeni Kutu Hazırlanmalı: ${sub.id}. Kalan: ${sub.remainingMonths} ay.`);
        }

        await this.subRepository.save(sub);
    }
  }
}