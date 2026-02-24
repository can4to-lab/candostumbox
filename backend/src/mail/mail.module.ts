import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Değeri okumaya çalış, okuyamazsan KESİNLİKLE Turkticaret'i kullan
        const hostAddress = configService.get<string>('SMTP_HOST') || 'smtp.turkticaret.net';
        
        console.log("🚀 MAIL HOST AYARI:", hostAddress); // Render loglarında bunu göreceğiz

        return {
          transport: {
            host: hostAddress, // ARTIK ASLA UNDEFINED OLAMAZ!
            port: Number(configService.get<number>('SMTP_PORT')) || 465, // Asla 587'ye düşmez
            secure: true, // 465 portu için her zaman true
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
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}