import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode } from './entities/promo-code.entity';

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectRepository(PromoCode)
    private promoRepo: Repository<PromoCode>,
  ) {}

  // Müşteri için kodu doğrular
  async validateCode(code: string, currentBasketAmount: number, userId?: string) {
    const promo = await this.promoRepo.findOne({ 
      where: { code: code.toUpperCase(), isActive: true } 
    });

    if (!promo) throw new NotFoundException('Geçersiz veya aktif olmayan indirim kodu.');

   // 1. TARİH KONTROLÜ (Eğer tarih girilmişse ve günümüzü geçmişse iptal et)
    if (promo.expiryDate && new Date() > new Date(promo.expiryDate)) {
        throw new BadRequestException('Bu kampanya kodunun süresi dolmuştur.');
    }

    // 2. SAYISAL LİMİT KONTROLÜ (0'dan büyük bir limit girilmişse ve kullanım bu limite ulaştıysa iptal et)
    if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
        throw new BadRequestException('Bu kampanya kodunun kullanım limiti dolmuştur.');
    }

    // 3. Minimum Sepet Tutarı Kontrolü
    if (currentBasketAmount < Number(promo.minBasketAmount)) {
      throw new BadRequestException(`Bu kod en az ₺${promo.minBasketAmount} tutarındaki sepetlerde geçerlidir.`);
    }

    // Not: "İlk Alışveriş" ve "Kullanıcı Başı Limit" kontrolleri 
    // Sipariş oluşturma (OrdersService) aşamasında yapılacaktır.

    return promo;
  }

  // Admin işlemleri
  async findAll() { return this.promoRepo.find({ order: { createdAt: 'DESC' } }); }
  async create(data: any) { return this.promoRepo.save(this.promoRepo.create(data)); }
  async remove(id: string) { return this.promoRepo.delete(id); }
  
  // Kod kullanıldığında sayacı artırır
  async incrementUsage(codeId: string) {
    await this.promoRepo.increment({ id: codeId }, 'usedCount', 1);
  }
}