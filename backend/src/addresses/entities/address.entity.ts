import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  neighborhood: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  buildingNo: string;

  @Column({ nullable: true })
  floor: string;

  @Column({ nullable: true })
  apartmentNo: string;

  @Column({ type: 'text', nullable: true })
  fullAddress: string;

  // 👇 BURASI ÖNEMLİ: 'user.addresses' kısmının User entity'sindeki isimle aynı olması lazım
  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}