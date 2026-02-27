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
        const smtpUser = configService.get<string>('SMTP_USER');
        const smtpPass = configService.get<string>('SMTP_PASS');
        const smtpHost = configService.get<string>('SMTP_HOST', 'smtp.turkticaret.net');

        // KEY FIX: Port 587 + secure:false = STARTTLS (correct for Render/cloud)
        // Port 465 + secure:true = Implicit SSL (avoid on Render — often blocked)
        const smtpPort = configService.get<number>('SMTP_PORT', 587);
        const smtpSecure = configService.get<string>('SMTP_SECURE', 'false') === 'true';

        return {
          transport: {
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure, // false for 587/STARTTLS, true for 465/SSL
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
            tls: {
              // Only set to false if your provider uses self-signed certs.
              // For production, prefer removing this entirely or setting to true.
              rejectUnauthorized: configService.get<string>('SMTP_REJECT_UNAUTHORIZED', 'true') === 'true',
            },
          },
          defaults: {
            from: `"Can Dostum Box" <${smtpUser}>`,
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