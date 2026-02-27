import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly adminEmail: string;
  private readonly senderName = 'Can Dostum Box';

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService, // FIX: Inject ConfigService, no more process.env
  ) {
    // Resolve once at construction time — fails fast if misconfigured
    this.adminEmail =
      this.configService.get<string>('ADMIN_EMAIL') ??
      this.configService.get<string>('SMTP_USER') ??
      'destek@candostumbox.com';
  }

  // 1. Welcome Email
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    this.logger.log(`⏳ Sending welcome email to: ${userEmail}`);

    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: 'Can Dostum Ailesine Hoş Geldin! 🐾',
        html: `
          <h1>Merhaba ${userName}!</h1>
          <p>Dostun için en iyisini seçtiğin için teşekkürler.</p>
        `,
      });

      this.logger.log(`✅ Welcome email sent successfully -> ${userEmail}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`🚨 Failed to send welcome email to ${userEmail}: ${message}`);
      throw error; // Rethrow so auth service can react (correct pattern)
    }
  }

  // 2. Order Confirmation (to Customer)
  async sendOrderConfirmation(
    userEmail: string,
    orderId: string,
    total: number,
  ): Promise<void> {
    this.logger.log(`⏳ Sending order confirmation to: ${userEmail}`);

    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: `Siparişin Alındı! ✅ (No: #${orderId.slice(0, 8)})`,
        html: `
          <p>Mutluluk paketi yola çıkmak için hazırlanıyor.</p>
          <p><strong>Toplam: ₺${total.toFixed(2)}</strong></p>
        `,
      });

      this.logger.log(`✅ Order confirmation sent -> ${userEmail}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `🚨 Failed to send order confirmation to ${userEmail} (Order: ${orderId}): ${message}`,
      );
      // FIX: Rethrow here too — silent failures hide broken email infra
      throw error;
    }
  }

  // 3. New Order Notification (to Admin)
  async sendAdminOrderNotification(orderId: string, total: number): Promise<void> {
    this.logger.log(`⏳ Sending admin order notification for order: ${orderId}`);

    try {
      await this.mailerService.sendMail({
        to: this.adminEmail, // FIX: Uses ConfigService-resolved value, not process.env
        subject: '🔥 YENİ SİPARİŞ GELDİ!',
        html: `
          <p>Az önce <strong>#${orderId}</strong> nolu,</p>
          <p><strong>₺${total.toFixed(2)}</strong> tutarında yeni bir sipariş aldınız.</p>
        `,
      });

      this.logger.log(`✅ Admin notification sent for order: ${orderId}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `🚨 Failed to send admin notification for order ${orderId}: ${message}`,
      );
      // Admin notifications: log but don't rethrow — don't fail the user's order flow
      // over an internal notification. Consider a retry queue for production.
    }
  }
}