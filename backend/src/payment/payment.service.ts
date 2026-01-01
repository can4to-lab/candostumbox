import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  
  async startPayment(data: any) {
    console.log("--- PAYTR START PAYMENT BAŞLADI ---");
    const { user, price, basketId, ip } = data; // items'ı buradan çıkardık, aşağıda manuel oluşturacağız.

    // .env Kontrolü
    const merchant_id = process.env.PAYTR_MERCHANT_ID || '';
    const merchant_key = process.env.PAYTR_MERCHANT_KEY || '';
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT || '';

    if(!merchant_id || !merchant_key || !merchant_salt) {
        console.error("HATA: .env dosyasında PayTR anahtarları eksik!");
        return { status: 'error', message: 'Sunucu PayTR ayarları eksik.' };
    }

    // 1. Veri Hazırlığı
    const email = user.email || 'musteri@candostum.com';
    const payment_amount = Math.round(price * 100); // Kuruş çevrimi (Örn: 297.50 -> 29750)
    const merchant_oid = basketId || `SIP_${new Date().getTime()}`; 
    const user_name = `${user.firstName || 'Misafir'} ${user.lastName || 'Kullanici'}`;
    const user_address = data.address?.fullAddress || 'Teslimat Adresi Girilmedi';
    const user_phone = user.phone ? user.phone.replace(/[^0-9]/g, '') : '05555555555'; // Sadece rakamlar
    const user_ip = ip || '85.85.85.85'; 

    // URL'ler
    const merchant_ok_url = 'https://candostumbox-l2dy.onrender.com/profile?tab=siparisler&status=success';
    const merchant_fail_url = 'https://candostumbox-l2dy.onrender.com/checkout?status=fail';

    // 2. SEPET MANTIĞI (GARANTİ YÖNTEM) 🛡️
    // Hata almamak için PayTR'ye "Sipariş Toplamı" adında tek bir kalem ürün gönderiyoruz.
    // Böylece (Toplam Tutar === Sepet Tutarı) kesinleşiyor.
    const user_basket = [
        ["Can Dostum Box Sipariş Toplamı", String(price), 1] // [Ad, Fiyat(TL), Adet]
    ];

    const user_basket_json = JSON.stringify(user_basket);
    const user_basket_b64 = Buffer.from(user_basket_json).toString('base64');

    const currency = 'TL';
    const no_installment = 0; 
    const max_installment = 0;
    const debug_on = 1; // Hataları görmek için her zaman 1
    const test_mode = 1; // Test modu
    const timeout_limit = 300;

    // 3. Token Hesaplama
    const hash_str =
      merchant_id +
      user_ip +
      merchant_oid +
      email +
      payment_amount +
      user_basket_b64 +
      no_installment +
      max_installment +
      currency +
      test_mode;

    const paytr_token = crypto
      .createHmac('sha256', merchant_key)
      .update(hash_str + merchant_salt)
      .digest('base64');

    // 4. İstek Gönderme
    const formData = new URLSearchParams();
    formData.append('merchant_id', merchant_id);
    formData.append('user_ip', user_ip);
    formData.append('merchant_oid', merchant_oid);
    formData.append('email', email);
    formData.append('payment_amount', String(payment_amount));
    formData.append('paytr_token', paytr_token);
    formData.append('user_basket', user_basket_json);
    formData.append('debug_on', String(debug_on));
    formData.append('no_installment', String(no_installment));
    formData.append('max_installment', String(max_installment));
    formData.append('user_name', user_name);
    formData.append('user_address', user_address);
    formData.append('user_phone', user_phone);
    formData.append('merchant_ok_url', merchant_ok_url);
    formData.append('merchant_fail_url', merchant_fail_url);
    formData.append('timeout_limit', String(timeout_limit));
    formData.append('currency', currency);
    formData.append('test_mode', String(test_mode));

    console.log("PAYTR ISTEK GÖNDERİLİYOR...", { merchant_oid, payment_amount, user_ip });

    try {
      const response = await axios.post('https://www.paytr.com/odeme/api/get-token', formData);
      
      console.log("PAYTR CEVABI:", response.data); // <--- BURASI ÇOK ÖNEMLİ

      if (response.data.status === 'success') {
        return { status: 'success', token: response.data.token, merchant_oid };
      } else {
        return { status: 'error', message: response.data.reason }; // PayTR'nin verdiği gerçek hatayı döndür
      }
    } catch (error) {
      console.error('Bağlantı Hatası:', error);
      throw new Error('PayTR sunucusuna bağlanılamadı.');
    }
  }

  // Callback
  async handleCallback(body: any) {
    // ... (Callback kodu aynı kalabilir, yukarıdakiyle aynı)
    return 'OK';
  }
}