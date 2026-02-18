import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  // 1. Yeni Üye Karşılama
  async sendWelcomeEmail(userEmail: string, userName: string) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Can Dostum Ailesine Hoş Geldin! 🐾',
      html: `<h1>Merhaba ${userName}!</h1><p>Dostun için en iyisini seçtiğin için teşekkürler...</p>`,
    });
  }

  // 2. Sipariş Onayı (Müşteriye)
  async sendOrderConfirmation(userEmail: string, orderId: string, total: number) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: `Siparişin Alındı! ✅ (No: #${orderId.slice(0,8)})`,
      html: `<p>Mutluluk paketi yola çıkmak için hazırlanıyor. Toplam: ₺${total}</p>`,
    });
  }

  // 3. Yeni Sipariş Bildirimi (Admine)
  async sendAdminOrderNotification(orderId: string, total: number) {
    await this.mailerService.sendMail({
      to: 'candostumbox@gmail.com', // Sizin kişisel mailiniz de olabilir
      subject: '🔥 YENİ SİPARİŞ GELDİ!',
      html: `<p>Az önce #${orderId} nolu, ₺${total} tutarında yeni bir sipariş aldınız.</p>`,
    });
  }
}