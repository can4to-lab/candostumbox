import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 👈 EKLENDİ
import { HttpModule } from '@nestjs/axios'; // 👈 EKLENDİ
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ShippingService } from './shipping.service'; // 👈 EKLENDİ
import { Order } from './entities/order.entity'; // 👈 EKLENDİ
import { OrderItem } from './entities/order-item.entity'; // 👈 OrderItem da varsa eklenmeli
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscountsModule } from '../discounts/discounts.module'; // 👈 İMPORT ET

@Module({
  imports: [
    ConfigModule,
    // 👇 KRİTİK: Order ve (varsa) OrderItem tablolarını buraya tanıtıyoruz
    TypeOrmModule.forFeature([Order, OrderItem]), 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'varsayilan_gizli_anahtar', 
        signOptions: { expiresIn: '1d' },
      }),
    }),
    DiscountsModule,
    HttpModule, // 👈 EKLENDİ
    ConfigModule, // 👈 EKLENDİ
  ],
  controllers: [OrdersController],
  providers: [OrdersService, ShippingService], // 👈 ShippingService EKLENDİ
  exports: [OrdersService],
})
export class OrdersModule {}