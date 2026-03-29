import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Hangi ürüne ait olduğu (Örn: Süper Kedi Tasması)
  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  size: string; // Örn: S, M, L, XL, 100ml, 500gr

  @Column({ nullable: true })
  color: string; // Örn: Kırmızı, Mavi

  @Column({ default: 0 })
  stock: number; // Sadece bu bedene/renge ait stok

  // Varyasyonun kendine ait özel bir fiyat farkı varsa (Örn: XL beden +50 TL ise)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  additionalPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}