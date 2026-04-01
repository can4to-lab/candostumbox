import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
// 🚫 Category ve ProductVariant importları DÖNGÜSEL HATA yaratmaması için kasıtlı olarak silinmiştir!

export enum ProductType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  RETAIL = 'RETAIL',
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ProductType, default: ProductType.SUBSCRIPTION })
  type: ProductType;

  @Column()
  name: string;

  @Column({ unique: true }) 
  slug: string;

  // 👇 SİHİRLİ DOKUNUŞ: 'Category' tırnak içinde metin olarak verildi!
  @ManyToOne('Category', 'products', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: any;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountedPrice: number | null;
  
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column("simple-array", { nullable: true })
  gallery: string[];

  @Column({ default: 0 })
  stock: number;

  // 👇 SİHİRLİ DOKUNUŞ: 'ProductVariant' tırnak içinde metin olarak verildi!
  @OneToMany('ProductVariant', 'product', { cascade: true })
  variants: any[];

  @Column({ default: 0 })
  order: number; 

  @Column("text", { array: true, nullable: true })
  features: string[]; 

  @Column({ default: true })
  isVisible: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];
}