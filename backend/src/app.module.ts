import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule'; // 👈 EKLE

// Modüller
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { PetsModule } from './pets/pets.module'; 
import { OrdersModule } from './orders/orders.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module'; 
import { AddressesModule } from './addresses/addresses.module'; 
import { AuthModule } from './auth/auth.module';
import { PaymentModule } from './payment/payment.module';
import { ReviewsModule } from './reviews/reviews.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // 👇 ZAMANLAYICI MODÜLÜNÜ BAŞLAT
    ScheduleModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true, 
        synchronize: true,
      }),
    }),

    UsersModule,
    ProductsModule,
    PetsModule,
    OrdersModule,
    SubscriptionsModule,
    AddressesModule,
    AuthModule,
    PaymentModule,
    ReviewsModule,
    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}