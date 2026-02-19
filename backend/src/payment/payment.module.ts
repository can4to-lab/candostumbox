import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { OrdersModule } from '../orders/orders.module'; 
import { MailModule } from '../mail/mail.module'; // 👈 EKLENDİ

@Module({
  imports: [OrdersModule, MailModule], // 👈 EKLENDİ
  providers: [PaymentService],
  controllers: [PaymentController]
})
export class PaymentModule {}