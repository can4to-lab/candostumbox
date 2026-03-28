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
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    this.adminEmail = this.configService.get<string>('ADMIN_EMAIL') ?? 'destek@candostumbox.com';
    this.fromEmail = 'Can Dostum Box <destek@candostumbox.com>'; 
  }

  // 1. Hoşgeldin Maili (Kayıt olan müşteriye)
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    this.logger.log(`⏳ Sending welcome email to: ${userEmail}`);

    const currentYear = new Date().getFullYear();
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7f6;">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff6b6b; margin: 0; font-size: 28px;">Can Dostum Box 🐾</h1>
          </div>
          <h2 style="color: #333333; font-size: 22px;">Aramıza Hoş Geldin, ${userName}! 🎉</h2>
          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            Dostun için en iyisini seçtiğin ve <strong>Can Dostum</strong> ailesine katıldığın için çok mutluyuz! Artık patili dostunun mutluluğu bize emanet.
          </p>
          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            Her ay özenle hazırladığımız sürpriz kutularımızla onun kuyruğunu daha hızlı sallamasını (veya daha yüksek sesle mırlamasını) sağlamak için sabırsızlanıyoruz.
          </p>
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://www.candostumbox.com" style="background-color: #ff6b6b; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Hemen Kutuları Keşfet</a>
          </div>
        </div>
        <p style="text-align: center; color: #999999; font-size: 12px; margin-top: 20px;">
          © ${currentYear} Can Dostum Box. Tüm hakları saklıdır.
        </p>
      </div>
    `;

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: userEmail,
        subject: 'Can Dostum Ailesine Hoş Geldin! 🐾',
        html: htmlContent,
      });

      if (error) throw new Error(error.message);
      this.logger.log(`✅ Welcome email sent successfully -> ${userEmail}`);
    } catch (error: unknown) {
      this.logger.error(`🚨 Failed to send welcome email to ${userEmail}: ${error}`);
    }
  }

  // 2. Sipariş Onay Maili (Müşteriye)
  async sendOrderConfirmation(userEmail: string, orderId: string, total: number): Promise<void> {
    this.logger.log(`⏳ Sending order confirmation to: ${userEmail}`);

    const shortOrderId = String(orderId).slice(0, 8).toUpperCase();
    const currentYear = new Date().getFullYear();
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7f6;">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">Can Dostum Box 🐾</h1>
          </div>
          <h2 style="color: #333333; font-size: 22px; text-align: center;">Siparişin Başarıyla Alındı! ✅</h2>
          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            Merhaba,<br><br>
            Harika haber! Siparişin bize ulaştı ve patili dostunun mutluluk paketini hazırlamak için hemen depoya inip çalışmalara başladık.
          </p>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #4f46e5;">
            <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Sipariş Numarası:</strong> #${shortOrderId}</p>
            <p style="margin: 0; font-size: 16px;"><strong>Toplam Tutar:</strong> ${total.toFixed(2)} TL</p>
          </div>
          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            Kutun kargoya verildiğinde sana bir e-posta daha göndereceğiz. O zamana kadar siparişinin durumunu web sitemizden takip edebilirsin.
          </p>
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://www.candostumbox.com/profil" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Siparişimi Takip Et</a>
          </div>
        </div>
        <p style="text-align: center; color: #999999; font-size: 12px; margin-top: 20px;">
          © ${currentYear} Can Dostum Box. Bizi tercih ettiğin için teşekkürler!
        </p>
      </div>
    `;

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: userEmail,
        subject: `Siparişin Alındı! ✅ (No: #${shortOrderId})`,
        html: htmlContent,
      });

      if (error) throw new Error(error.message);
      this.logger.log(`✅ Order confirmation sent -> ${userEmail}`);
    } catch (error: unknown) {
      this.logger.error(`🚨 Failed to send order confirmation to ${userEmail}`);
    }
  }

  // 3. Yeni Sipariş Bildirimi (Sana/Admine gelecek mail)
  async sendAdminOrderNotification(orderId: string, total: number): Promise<void> {
    this.logger.log(`⏳ Sending admin order notification for order: ${orderId}`);

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff4e6;">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; border-top: 6px solid #ff9800; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #ff9800; font-size: 24px; margin-top: 0;">🚀 Patron, Yeni Sipariş Var!</h2>
          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            Kasaya para girdi! Web sitesinden yeni bir sipariş başarıyla oluşturuldu ve ParamPOS üzerinden ödemesi alındı.
          </p>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #eee;"><strong>Sipariş ID:</strong></td>
                <td style="padding: 8px 0; text-align: right; color: #333; border-bottom: 1px solid #eee;">#${orderId}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0 0 0; color: #666;"><strong>Kazanılan Tutar:</strong></td>
                <td style="padding: 12px 0 0 0; text-align: right; color: #10b981; font-size: 20px; font-weight: bold;">+${total.toFixed(2)} TL</td>
              </tr>
            </table>
          </div>
          <p style="color: #777; font-size: 14px;">Müşterinin kargosunu hazırlamak için lütfen admin paneline giriş yap.</p>
        </div>
      </div>
    `;

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: this.adminEmail,
        subject: `🔥 YENİ SİPARİŞ GELDİ! (+${total.toFixed(2)} TL)`,
        html: htmlContent,
      });

      if (error) throw new Error(error.message);
      this.logger.log(`✅ Admin notification sent for order: ${orderId}`);
    } catch (error: unknown) {
      this.logger.error(`🚨 Failed to send admin notification for order ${orderId}`);
    }
  }

  // 4. Siteden Gelen İletişim Formu (Müşteri sana soru sorarsa)
  async sendContactMessage(name: string, email: string, subject: string, message: string): Promise<void> {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f7ff;">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; border-top: 6px solid #0284c7; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #0284c7; font-size: 22px; margin-top: 0;">📩 Web Sitesinden Yeni Mesaj</h2>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Gönderen:</strong> ${name}</p>
            <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>E-Posta:</strong> <a href="mailto:${email}" style="color: #0284c7;">${email}</a></p>
            <p style="margin: 0; font-size: 15px;"><strong>Konu:</strong> ${subject}</p>
          </div>
          <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">Mesaj İçeriği:</h3>
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #475569; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 20px; text-align: center;">
            Bu mesaja yanıt vermek için doğrudan bu e-postayı <strong>"Yanıtla (Reply)"</strong> tuşuna basarak cevaplayabilirsiniz. Cevabınız doğrudan müşteriye gidecektir.
          </p>
        </div>
      </div>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: this.adminEmail,  
        replyTo: email,      
        subject: `📩 Yeni İletişim Mesajı: ${subject}`,
        html: htmlContent,
      });
      this.logger.log(`✅ İletişim mesajı admin'e iletildi.`);
    } catch (error) {
      this.logger.error(`🚨 İletişim mesajı iletilemedi: ${error}`);
      throw error;
    }
  }
  // 5. Şifre Sıfırlama Maili
  async sendPasswordResetEmail(userEmail: string, userName: string, resetLink: string): Promise<void> {
    this.logger.log(`⏳ Sending password reset email to: ${userEmail}`);
    const currentYear = new Date().getFullYear();

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7f6;">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; border-top: 6px solid #4f46e5; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">Can Dostum Box 🐾</h1>
          </div>
          <h2 style="color: #333333; font-size: 22px;">Merhaba ${userName},</h2>
          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            Hesabının şifresini sıfırlamak için bir talep aldık. Eğer bu talebi sen oluşturduysan, aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetLink}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Şifremi Yenile</a>
          </div>
          <p style="color: #777777; font-size: 14px; line-height: 1.6; background-color: #f9fafb; padding: 15px; border-radius: 8px;">
            <strong>Not:</strong> Bu bağlantı güvenlik amacıyla <strong>15 dakika</strong> içinde geçerliliğini yitirecektir. Bu talebi siz yapmadıysanız, bu e-postayı güvenle görmezden gelebilirsiniz; şifreniz değişmeyecektir.
          </p>
        </div>
        <p style="text-align: center; color: #999999; font-size: 12px; margin-top: 20px;">
          © ${currentYear} Can Dostum Box. Güvenlik Ekibi
        </p>
      </div>
    `;

    try {
      const { error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: userEmail,
        subject: '🔐 Şifre Sıfırlama Talebiniz - Can Dostum Box',
        html: htmlContent,
      });

      if (error) throw new Error(error.message);
      this.logger.log(`✅ Password reset email sent -> ${userEmail}`);
    } catch (error: unknown) {
      this.logger.error(`🚨 Failed to send password reset email to ${userEmail}: ${error}`);
    }
  }
  // 6. Teslimat Onay Maili (Müşteriye)
  async sendDeliveryConfirmation(email: string, orderId: string, trackingCode: string): Promise<void> {
    this.logger.log(`⏳ Sending delivery confirmation to: ${email}`);

    const shortOrderId = String(orderId).slice(0, 8).toUpperCase();
    const currentYear = new Date().getFullYear();
    
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7f6;">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0; font-size: 28px;">Can Dostum Box 🐾</h1>
          </div>
          <h2 style="color: #333333; font-size: 22px; text-align: center;">Müjde! Paketin Teslim Edildi 📦</h2>
          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            Merhaba,<br><br>
            <strong>#${shortOrderId}</strong> numaralı siparişin an itibarıyla adresine teslim edilmiştir! 🎉
          </p>
          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            Can dostunun sürpriz kutusunu keyifle açmasını dileriz! Kutuyu açarken çektiğiniz fotoğrafları Instagram'da <strong>@candostumbox</strong> etiketiyle paylaşmayı unutmayın. Eğer paketle ilgili bir sorun yaşarsan, bizimle iletişime geçmekten çekinme.
          </p>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0; font-size: 16px;"><strong>Kargo Takip Numaran:</strong> ${trackingCode}</p>
          </div>
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://www.candostumbox.com/profil" style="background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Siparişlerime Git</a>
          </div>
        </div>
        <p style="text-align: center; color: #999999; font-size: 12px; margin-top: 20px;">
          © ${currentYear} Can Dostum Box. Bizi tercih ettiğin için teşekkürler!
        </p>
      </div>
    `;

    try {
      const { error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `Müjde! Siparişin Teslim Edildi 📦 (No: #${shortOrderId})`,
        html: htmlContent,
      });

      if (error) throw new Error(error.message);
      this.logger.log(`✅ Delivery confirmation sent -> ${email}`);
    } catch (error: unknown) {
      this.logger.error(`🚨 Failed to send delivery confirmation to ${email}: ${error}`);
    }
  }
}