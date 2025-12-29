import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/products/entities/product.entity'; // Product yolunu kontrol edin

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { nullable: true }) // Ürün silinse bile sipariş raporu bozulmasın
  product: Product;

  @Column()
  productId: string;

  @Column()
  quantity: number; 

  // ✅ KRİTİK: Ürünün o anki fiyatını donduruyoruz.
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtPurchase: number; 

  // ✅ KRİTİK: Ürün adı değişse bile faturadaki isim değişmez.
  @Column()
  productNameSnapshot: string; 
}