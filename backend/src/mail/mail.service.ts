import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly adminEmail: string;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    // Railway'den API şifreni çekiyoruz
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);

    // Bildirimlerin gideceği admin maili
    this.adminEmail = this.configService.get<string>('ADMIN_EMAIL') ?? 'destek@candostumbox.com';
    
    // Müşterilere hangi adresten mail gidecek?
    this.fromEmail = 'Can Dostum Box <destek@candostumbox.com>'; 
  }

  // 1. Hoşgeldin Maili
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    this.logger.log(`⏳ Sending welcome email to: ${userEmail}`);

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: userEmail,
        subject: 'Can Dostum Ailesine Hoş Geldin! 🐾',
        html: `<h1>Merhaba ${userName}!</h1><p>Dostun için en iyisini seçtiğin için teşekkürler.</p>`,
      });

      if (error) throw new Error(error.message);
      this.logger.log(`✅ Welcome email sent successfully -> ${userEmail} (Resend ID: ${data?.id})`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`🚨 Failed to send welcome email to ${userEmail}: ${message}`);
      throw error;
    }
  }

  // 2. Sipariş Onay Maili (Müşteriye)
  async sendOrderConfirmation(userEmail: string, orderId: string, total: number): Promise<void> {
    this.logger.log(`⏳ Sending order confirmation to: ${userEmail}`);

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: userEmail,
        subject: `Siparişin Alındı! ✅ (No: #${String(orderId).slice(0, 8)})`,
        html: `<p>Mutluluk paketi yola çıkmak için hazırlanıyor.</p><p><strong>Toplam: ₺${total.toFixed(2)}</strong></p>`,
      });

      if (error) throw new Error(error.message);
      this.logger.log(`✅ Order confirmation sent -> ${userEmail} (Resend ID: ${data?.id})`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`🚨 Failed to send order confirmation to ${userEmail} (Order: ${orderId}): ${message}`);
      throw error;
    }
  }

  // 3. Yeni Sipariş Bildirimi (Patrona/Admine)
  async sendAdminOrderNotification(orderId: string, total: number): Promise<void> {
    this.logger.log(`⏳ Sending admin order notification for order: ${orderId}`);

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: this.adminEmail,
        subject: '🔥 YENİ SİPARİŞ GELDİ!',
        html: `<p>Az önce <strong>#${orderId}</strong> nolu,</p><p><strong>₺${total.toFixed(2)}</strong> tutarında yeni bir sipariş aldınız.</p>`,
      });

      if (error) throw new Error(error.message);
      this.logger.log(`✅ Admin notification sent for order: ${orderId} (Resend ID: ${data?.id})`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`🚨 Failed to send admin notification for order ${orderId}: ${message}`);
    }
  }

  // 4. Siteden Gelen İletişim Formu
  async sendContactMessage(name: string, email: string, subject: string, message: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail, // Senin destek adresin
        to: this.adminEmail,  // Mesaj sana gelecek
        replyTo: email,      // 'Yanıtla' dediğinde direkt müşteriye gitsin
        subject: `📩 Yeni İletişim Mesajı: ${subject}`,
        html: `
          <h3>Siteden Yeni Bir Mesaj Var!</h3>
          <p><strong>Gönderen:</strong> ${name} (${email})</p>
          <p><strong>Konu:</strong> ${subject}</p>
          <hr/>
          <p><strong>Mesaj:</strong></p>
          <p>${message}</p>
        `,
      });
      this.logger.log(`✅ İletişim mesajı admin'e iletildi.`);
    } catch (error) {
      this.logger.error(`🚨 İletişim mesajı iletilemedi: ${error}`);
      throw error;
    }
  }
}