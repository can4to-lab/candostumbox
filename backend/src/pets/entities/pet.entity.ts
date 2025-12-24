import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string; // kopek, kedi

  @Column({ nullable: true })
  breed: string; 

  @Column({ nullable: true })
  weight: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ default: false })
  isNeutered: boolean;

  // Alerjileri dizi olarak tutuyoruz
  @Column("text", { array: true, nullable: true })
  allergies: string[]; 

  @ManyToOne(() => User, (user) => user.pets, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}