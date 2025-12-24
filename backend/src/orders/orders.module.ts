import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 👈 EKLENDİ
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity'; // 👈 EKLENDİ
import { OrderItem } from './entities/order-item.entity'; // 👈 OrderItem da varsa eklenmeli
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
  ],
  controllers: [OrdersController],
  providers: [OrdersService], // PrismaService SİLİNDİ
  exports: [OrdersService],
})
export class OrdersModule {}