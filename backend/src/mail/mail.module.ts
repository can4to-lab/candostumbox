import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config'; // 👈 EKLENDİ

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule], // 👈 ConfigModule'ü içeri alıyoruz
      useFactory: async (configService: ConfigService) => ({
        transport: {
          // process.env yerine configService kullanıyoruz + Güvenlik Ağı (Fallback) ekliyoruz
          host: configService.get<string>('SMTP_HOST') || 'smtp.turkticaret.net',
          port: Number(configService.get<number>('SMTP_PORT')) || 465,
          secure: true, // 465 portu için her zaman true olmalı
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: `"Can Dostum Box" <${configService.get<string>('SMTP_USER')}>`,
        },
      }),
      inject: [ConfigService], // 👈 Servisi enjekte ediyoruz
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}