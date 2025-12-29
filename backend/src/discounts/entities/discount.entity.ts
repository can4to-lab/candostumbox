import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  durationMonths: number; // Örn: 3, 6, 9, 12

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  discountPercentage: number; // Örn: 5.00, 7.00, 20.00

  @Column({ default: true })
  isActive: boolean;
}