import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ShippingService } from './shipping.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscountsModule } from '../discounts/discounts.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { MailModule } from '../mail/mail.module'; // 👈 EKSİK OLAN MAIL MODÜLÜ EKLENDİ

@Module({
  imports: [
    ConfigModule, // Sadece bir kere yazmamız yeterli
    TypeOrmModule.forFeature([Order, OrderItem]), 
    PromoCodesModule, // 👈 DÜZELTME: Virgül eklendi!
    MailModule,       // 👈 KRİTİK: OrdersService içinde MailService kullanıldığı için eklendi!
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'varsayilan_gizli_anahtar', 
        signOptions: { expiresIn: '1d' },
      }),
    }),
    DiscountsModule,
    HttpModule, 
  ],
  controllers: [OrdersController],
  providers: [OrdersService, ShippingService],
  exports: [OrdersService],
})
export class OrdersModule {}