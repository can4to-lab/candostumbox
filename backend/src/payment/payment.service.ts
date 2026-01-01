import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  
  // 1. Ödemeyi Başlatma ve Token Alma
  async startPayment(data: any) {
    const { user, items, price, address, basketId, ip } = data;

    // --- TYPE-SAFE ENV VARIABLES ---
    // HATA ÇÖZÜMÜ: || '' ekleyerek undefined olma riskini kaldırdık
    const merchant_id = process.env.PAYTR_MERCHANT_ID || '';
    const merchant_key = process.env.PAYTR_MERCHANT_KEY || '';
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT || '';
    
    // Temel Ayarlar
    const email = user.email;
    const payment_amount = price * 100; // 100 TL -> 10000
    const merchant_oid = basketId || `SIP_${new Date().getTime()}`; 
    const user_name = `${user.firstName || 'Misafir'} ${user.lastName || 'Kullanici'}`;
    const user_address = address.fullAddress || 'Teslimat Adresi Yok';
    const user_phone = user.phone || '05555555555';
    const user_ip = ip || '85.85.85.85';

    // --- URL DÜZELTMESİ (CANLI ORTAM) ---
    // Artık localhost değil, Render adresine dönecek
    const merchant_ok_url = 'https://candostumbox-l2dy.onrender.com/profile?tab=siparisler&status=success';
    const merchant_fail_url = 'https://candostumbox-l2dy.onrender.com/product?status=fail';

    // Sepet İçeriği
    const user_basket = items.map((item: any) => [
      item.productName || 'Abonelik Kutusu',
      String(item.price),
      1, 
    ]);

    const user_basket_json = JSON.stringify(user_basket);
    const user_basket_b64 = Buffer.from(user_basket_json).toString('base64');

    const currency = 'TL';
    const no_installment = 0; 
    const max_installment = 0;
    const debug_on = process.env.PAYTR_DEBUG || '1';
    const test_mode = process.env.PAYTR_TEST_MODE || '1';
    const timeout_limit = 300;

    // TOKEN HESAPLAMA
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

    // İstek Hazırlama
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

    try {
      const response = await axios.post('https://www.paytr.com/odeme/api/get-token', formData);
      
      if (response.data.status === 'success') {
        return { status: 'success', token: response.data.token, merchant_oid };
      } else {
        console.error('PayTR Hatası:', response.data.reason);
        return { status: 'error', message: response.data.reason };
      }
    } catch (error) {
      console.error('Bağlantı Hatası:', error);
      throw new Error('PayTR sunucusuna bağlanılamadı.');
    }
  }

  // 2. Callback
  async handleCallback(body: any) {
    const { merchant_oid, status, total_amount, hash } = body;
    const merchant_key = process.env.PAYTR_MERCHANT_KEY || ''; // HATA ÇÖZÜMÜ
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT || ''; // HATA ÇÖZÜMÜ

    const params = merchant_oid + merchant_salt + status + total_amount;
    const calculated_hash = crypto
      .createHmac('sha256', merchant_key)
      .update(params)
      .digest('base64');

    if (calculated_hash !== hash) {
      return 'PAYTR notification failed: bad hash';
    }

    if (status === 'success') {
      console.log(`Sipariş Ödendi: ${merchant_oid}`);
      // BURAYA SİPARİŞ GÜNCELLEME KODU GELECEK
    } else {
      console.log(`Ödeme Başarısız: ${merchant_oid}`);
    }

    return 'OK';
  }
}