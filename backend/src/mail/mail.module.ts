import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Global() // @Global() yaparak her modülde tekrar import etmeden kullanabiliriz.
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST || 'smtp.turkticaret.net',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true, // 465 portu için true olmalı (Turkticaret SSL istiyor)
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          // SSL/TLS sertifika reddi hatalarını (self-signed cert) önlemek için:
          rejectUnauthorized: false, 
        },
      },
      defaults: {
        from: `"Can Dostum Box" <${process.env.SMTP_USER}>`,
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}