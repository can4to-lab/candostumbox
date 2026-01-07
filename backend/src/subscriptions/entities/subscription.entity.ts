import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Pet } from 'src/pets/entities/pet.entity';
import { Product } from 'src/products/entities/product.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  PAUSED = 'paused'
}

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.subscriptions, { onDelete: 'CASCADE' })
  user: User;

  // 👇 GÜNCELLEME: @JoinColumn EKLENDİ
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

  @Column({ nullable: true })
  deliveryPeriod: string; 

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ nullable: true })
  cancellationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}