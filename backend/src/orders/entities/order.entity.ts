import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
// Pet importunu buradan kaldırabilirsin, burada işimiz yok.

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'jsonb', nullable: true }) 
  shippingAddressSnapshot: any;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // ✅ BU DOĞRU: paymentType burada kalmalı
  @Column({ nullable: true }) 
  paymentType: string; 

  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
  
  // ❌ HATALI OLAN KISIM BURASIYDI: Pet ilişkisini buradan SİLİYORUZ.
  // Çünkü pet siparişin geneline değil, içindeki ürüne (Item) bağlıdır.
  
  @Column({ nullable: true })
  paymentId: string;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}