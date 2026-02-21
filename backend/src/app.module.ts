import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';

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
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    // ✅ AYARLI MAILER MODÜLÜ (Doğru Yapılandırma)
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          port: Number(config.get('MAIL_PORT')), 
          secure: true, 
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASS'),
          },
          tls: {
            rejectUnauthorized: false
          }
        },
        defaults: {
          from: `"Can Dostum Box" <${config.get('MAIL_FROM')}>`,
        },
      }),
      inject: [ConfigService],
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
    PromoCodesModule,
    // ❌ Buradaki mükerrer MailerModule silindi, yukarıdaki asenkron yapı yeterlidir
    MailModule, 
  ],
})
export class AppModule {}