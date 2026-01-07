import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
// 👇 Pet Entity'sini buraya import et
import { Pet } from '../../pets/entities/pet.entity'; 

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { eager: true })
  product: Product;

  // 👇 İŞTE BURAYA EKLİYORUZ (Doğru yer burası)
  @ManyToOne(() => Pet, { nullable: true, eager: true })
  pet: Pet;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  priceAtPurchase: number;

  @Column({ nullable: true })
  productNameSnapshot: string;

}