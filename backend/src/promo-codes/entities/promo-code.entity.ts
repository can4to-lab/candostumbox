import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('promo_codes')
export class PromoCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // Örn: 'EYLUL20', 'DOSTUM10'

  @Column({ type: 'enum', enum: ['percentage', 'fixed'], default: 'percentage' })
  discountType: 'percentage' | 'fixed';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  @Column({ 
    type: 'enum', 
    enum: ['INFLUENCER', 'SOCIAL', 'SPECIAL_DAY', 'PERSONAL', 'GENERAL'], 
    default: 'GENERAL' 
  })
  sourceType: 'INFLUENCER' | 'SOCIAL' | 'SPECIAL_DAY' | 'PERSONAL' | 'GENERAL';

  @Column({ nullable: true })
  sourceName: string; // Influencer adı veya kampanya adı (Örn: 'Gökçe Özdemir' veya 'Yılbaşı')

  @Column({ type: 'timestamp', nullable: true })
  expiryDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minBasketAmount: number; // Bu tutarın altındaki sepetlerde kod geçersiz sayılır

  @Column({ default: 0 })
  usageLimit: number; // 0 = Sınırsız

  @Column({ default: 0 })
  usedCount: number; // Toplam kaç kez kullanıldı

  @Column({ default: 1 })
  limitPerUser: number; // Bir kullanıcı bu kodu kaç kez kullanabilir?

  @Column({ default: false })
  firstOrderOnly: boolean; // Sadece yeni müşteriler mi kullanabilir?

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}