import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';

// Ürün Tipleri İçin Enum (Sistem ürünü nasıl satacağını buradan anlayacak)
export enum ProductType {
  SUBSCRIPTION = 'SUBSCRIPTION', // Aylık Kutu
  RETAIL = 'RETAIL',             // Tek Seferlik Perakende
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 👇 YENİ: Ürün Tipi. 
  // DİKKAT: default olarak SUBSCRIPTION verdik. 
  // Böylece canlıdaki eski kutularının hepsi anında abonelik kutusu sayılacak, sistem çökmeyecek!
  @Column({ type: 'enum', enum: ProductType, default: ProductType.SUBSCRIPTION })
  type: ProductType;

  @Column()
  name: string;

  @Column({ unique: true }) 
  slug: string;

  // 👇 YENİ: Kategori İlişkisi. 
  // nullable: true verdik, yani eski kutularının kategorisi boş kalsa da sistem hata vermez.
  @ManyToOne(() => Category, (category) => category.products, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  // Genel Stok (Eğer varyasyon kullanmıyorsa buna bakılır)
  @Column({ default: 0 })
  stock: number;

  // 👇 YENİ: Varyasyon İlişkisi (Beden, Renk vb.)
  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true })
  variants: ProductVariant[];

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