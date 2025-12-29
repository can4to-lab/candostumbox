import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discount } from './entities/discount.entity';

@Injectable()
export class DiscountsService implements OnModuleInit {
  constructor(
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
  ) {}

  // Proje başlayınca varsayılan indirimleri kontrol et ve oluştur
  async onModuleInit() {
    const count = await this.discountRepository.count();
    if (count === 0) {
      console.log("📢 Varsayılan indirim oranları oluşturuluyor...");
      const defaults = [
        { durationMonths: 1, discountPercentage: 0 },   // Deneme Paketi (İndirimsiz)
        { durationMonths: 3, discountPercentage: 5 },   // %5
        { durationMonths: 6, discountPercentage: 7 },   // %7
        { durationMonths: 9, discountPercentage: 13 },  // %13
        { durationMonths: 12, discountPercentage: 20 }, // %20
      ];
      await this.discountRepository.save(defaults);
    }
  }

  findAll() {
    return this.discountRepository.find({ order: { durationMonths: 'ASC' } });
  }

  async update(durationMonths: number, percentage: number) {
    let discount = await this.discountRepository.findOne({ where: { durationMonths } });
    if (!discount) {
      // Eğer yoksa yeni oluştur
      discount = this.discountRepository.create({ durationMonths, discountPercentage: percentage });
    } else {
      discount.discountPercentage = percentage;
    }
    return this.discountRepository.save(discount);
  }

  // Fiyat hesaplamasında kullanılacak yardımcı fonksiyon
  async calculatePrice(basePrice: number, duration: number): Promise<{ finalPrice: number, discountAmount: number, percentage: number }> {
    const rule = await this.discountRepository.findOne({ where: { durationMonths: duration } });
    const percent = rule ? Number(rule.discountPercentage) : 0;
    
    // Formül: (Aylık Fiyat * Ay) * (1 - İndirim Oranı)
    const totalBase = basePrice * duration;
    const discountAmount = totalBase * (percent / 100);
    const finalPrice = totalBase - discountAmount;

    return { finalPrice, discountAmount, percentage: percent };
  }
}