import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('payment_sessions')
export class PaymentSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Tüm sepet, adres ve kullanıcı bilgilerini burada JSON olarak bekleteceğiz
  @Column('json') 
  payload: any;

  @CreateDateColumn()
  createdAt: Date;
}