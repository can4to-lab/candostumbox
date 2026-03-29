import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 👇 'Product' tırnak içinde metin olarak verildi
  @ManyToOne('Product', 'variants', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: any;

  @Column({ nullable: true })
  size: string;

  @Column({ nullable: true })
  color: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  additionalPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}