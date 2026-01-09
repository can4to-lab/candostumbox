import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { Pet } from 'src/pets/entities/pet.entity'; 

export enum OrderStatus {
  PENDING = 'PENDING',        // Ödeme Bekleniyor
  PAID = 'PAID',              // Ödendi (Süre uzatma vb. kargo gerektirmeyen işlemler için)
  PREPARING = 'PREPARING',    // Hazırlanıyor (Fiziksel gönderim yapılacaksa)
  SHIPPED = 'SHIPPED',        // Kargolandı
  DELIVERED = 'DELIVERED',    // Teslim Edildi
  CANCELLED = 'CANCELLED',    // İptal
  REFUNDED = 'REFUNDED',      // İade
  COMPLETED = 'COMPLETED'     // Tamamlandı (Servis kodunda kullanılıyor)
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

  @Column({ nullable: true })
  paymentType: string;

  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @ManyToOne(() => Pet, { nullable: true, eager: true })
  pet: Pet;

  @Column({ nullable: true })
  paymentId: string;

  // 👇 EKLENEN KARGO ALANLARI (Hataları Çözen Kısım)
  @Column({ nullable: true })
  cargoTrackingCode: string;

  @Column({ nullable: true })
  cargoProvider: string;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;
  // ----------------------------------------------

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}