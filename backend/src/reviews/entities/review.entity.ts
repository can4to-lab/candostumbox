import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';     // User entity yolunu kontrol et
import { Product } from '../../products/entities/product.entity'; // Product entity yolunu kontrol et

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; // 1 ile 5 arası puan

  @Column({ type: 'text' })
  comment: string; // Yorum metni

  @Column({ default: false })
  isApproved: boolean; // Admin onayı gereksin mi? (Şimdilik false yapıp admin panelinden onaylayabilirsin)

  @CreateDateColumn()
  createdAt: Date;

// İkinci parametreleri silerek çift yönlü zorunluluğu kaldırıyoruz:
@ManyToOne(() => User, { onDelete: 'CASCADE' })
user: User;

@ManyToOne(() => Product, { onDelete: 'CASCADE' })
product: Product;
}