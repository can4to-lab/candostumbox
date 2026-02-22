import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  // 1. Yeni Üye Karşılama
  async sendWelcomeEmail(userEmail: string, userName: string) {
    this.logger.log(`⏳ [ADIM 1] Hoş geldin maili gönderimi başlatılıyor... Hedef: ${userEmail}`);
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: 'Can Dostum Ailesine Hoş Geldin! 🐾',
        html: `<h1>Merhaba ${userName}!</h1><p>Dostun için en iyisini seçtiğin için teşekkürler...</p>`,
      });
      this.logger.log(`✅ [ADIM 2] Hoş geldin maili BAŞARIYLA gönderildi -> ${userEmail}`);
    } catch (error: any) {
      this.logger.error(`🚨 [HATA] Hoş geldin maili GÖNDERİLEMEDİ! 🚨`);
      this.logger.error(`   - Hedef Email: ${userEmail}`);
      this.logger.error(`   - Hata Mesajı: ${error.message}`);
      
      // Hatayı fırlatıyoruz ki Auth servisi 'başarıyla gönderildi' logu basmasın
      throw error; 
    }
  }

  // 2. Sipariş Onayı (Müşteriye)
  async sendOrderConfirmation(userEmail: string, orderId: string, total: number) {
    this.logger.log(`⏳ Sipariş onay maili gönderiliyor... Hedef: ${userEmail}`);
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: `Siparişin Alındı! ✅ (No: #${orderId.slice(0,8)})`,
        html: `<p>Mutluluk paketi yola çıkmak için hazırlanıyor. Toplam: ₺${total}</p>`,
      });
      this.logger.log(`✅ Sipariş onay maili başarıyla gönderildi -> ${userEmail}`);
    } catch (error: any) {
      this.logger.error(`🚨 [HATA] Sipariş maili GÖNDERİLEMEDİ! Hata: ${error.message}`);
    }
  }

  // 3. Yeni Sipariş Bildirimi (Admine)
  async sendAdminOrderNotification(orderId: string, total: number) {
    const adminEmail = process.env.SMTP_USER || 'destek@candostumbox.com';
    try {
      await this.mailerService.sendMail({
        to: adminEmail, 
        subject: '🔥 YENİ SİPARİŞ GELDİ!',
        html: `<p>Az önce #${orderId} nolu, ₺${total} tutarında yeni bir sipariş aldınız.</p>`,
      });
      this.logger.log('✅ Admin bildirim maili başarıyla gönderildi.');
    } catch (error: any) {
      this.logger.error(`🚨 [HATA] Admin bildirim maili GÖNDERİLEMEDİ! Hata: ${error.message}`);
    }
  }
}