import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { OrdersModule } from '../orders/orders.module'; 
import { MailModule } from '../mail/mail.module'; // 👈 EKLENDİ
import { PaymentSession } from './entities/payment-session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentSession]),
    OrdersModule,
     MailModule
    ], 

  providers: [PaymentService],
  controllers: [PaymentController]
})
export class PaymentModule {}