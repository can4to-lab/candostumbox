import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn, 
  OneToMany 
} from 'typeorm';

import { Pet } from '../../pets/entities/pet.entity';
import { Order } from '../../orders/entities/order.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { Address } from '../../addresses/entities/address.entity'; 
import { Review } from '../../reviews/entities/review.entity'; // Import ekle

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  userBirthDate: Date; 

  @Column({ nullable: true })
  tcKimlikNo: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER
  })
  role: UserRole;

  // 👇 DÜZELTME: cascade: true eklendi (Petler artık kaydedilecek)
  @OneToMany(() => Pet, (pet) => pet.user, { cascade: true })
  pets: Pet[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Subscription, (sub) => sub.user)
  subscriptions: Subscription[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  // 👇 DÜZELTME: cascade: true eklendi (Adresler artık kaydedilecek)
  @OneToMany(() => Address, (addr) => addr.user, { cascade: true })
  addresses: Address[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date; 
}