import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Pet } from '../../pets/entities/pet.entity';
import { Product } from '../../products/entities/product.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  UPGRADED = 'upgraded'
}

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Garanti olsun diye string alanlara type: 'text' ekliyoruz
  @Column({ type: 'text', nullable: true })
  paymentType: string; 
  
  @ManyToOne(() => User, user => user.subscriptions, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Pet, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'petId' }) 
  pet: Pet;

  @ManyToOne(() => Product, { nullable: true })
  product: Product;

  @Column()
  totalMonths: number;

  @Column()
  remainingMonths: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextDeliveryDate: Date;

  @Column({ type: 'text', nullable: true })
  deliveryPeriod: string; 

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  // 🛠️ HATA BURADAYDI -> { type: 'text' } eklenerek düzeltildi.
  @Column({ type: 'text', nullable: true })
  cancellationReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}