import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { parseStringPromise } from 'xml2js'; // npm install xml2js

@Injectable()
export class PaymentService {
  
  async startPayment(data: any) {
    console.log("--- PARAM POS ÖDEME BAŞLATILIYOR ---");
    const { user, price, basketId, ip, items } = data;

    // 1. .env Ayarları
    const CLIENT_CODE = process.env.PARAM_CLIENT_CODE;
    const CLIENT_USERNAME = process.env.PARAM_CLIENT_USERNAME;
    const CLIENT_PASSWORD = process.env.PARAM_CLIENT_PASSWORD;
    const GUID = process.env.PARAM_GUID;
    const MODE = process.env.PARAM_MODE || "TEST"; // "PROD" veya "TEST"

    if(!CLIENT_CODE || !GUID) {
        return { status: 'error', message: 'ParamPOS API anahtarları eksik.' };
    }

    // 2. Veri Hazırlığı
    // ParamPOS Kuruş değil, 1000,00 şeklinde string ister. (Örn: 100.50)
    // Ancak JavaScript number formatını Param'ın istediği "100,50" formatına çevirmeliyiz (Nokta yerine virgül olabilir, dokümana göre değişir ama genelde number gönderilir).
    const totalAmount = Number(price).toFixed(2); 
    
    const orderId = basketId || `SIP_${new Date().getTime()}`;
    const installment = "1"; // Tek Çekim varsayılan

    // URL'ler (Frontend'de oluşturduğun başarılı/başarısız sayfaları)
    const successUrl = 'https://candostumbox-l2dy.onrender.com/payment/success';
    const failUrl = 'https://candostumbox-l2dy.onrender.com/checkout?status=fail';

    // 3. Hash Hesaplama (SHA-2S56)
    // Kural: CLIENT_CODE + GUID + Taksit + Islem_Tutar + Toplam_Tutar + Siparis_ID + Hata_URL + Basarili_URL
    // Dikkat: ParamPOS dokümantasyonuna göre sıralama çok önemlidir.
    const hashString = 
        CLIENT_CODE + 
        GUID + 
        installment + 
        totalAmount + 
        totalAmount + 
        orderId + 
        failUrl + 
        successUrl;

    const B64_HASH = crypto
        .createHash('sha256')
        .update(hashString, 'utf8') // Param genelde ISO-8859-9 ister ama Node'da utf8 genelde çalışır
        .digest('base64');

    // 4. XML Oluşturma
    const xmlRequest = `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <TP_Islem_Odeme xmlns="https://turkpos.com.tr/">
          <G>
            <CLIENT_CODE>${CLIENT_CODE}</CLIENT_CODE>
            <CLIENT_USERNAME>${CLIENT_USERNAME}</CLIENT_USERNAME>
            <CLIENT_PASSWORD>${CLIENT_PASSWORD}</CLIENT_PASSWORD>
          </G>
          <SanalPOS_ID>${MODE === 'TEST' ? '10066' : ''}</SanalPOS_ID> 
          <GUID>${GUID}</GUID>
          <KK_Sahibi></KK_Sahibi>
          <KK_No></KK_No>
          <KK_SK_Ay></KK_SK_Ay>
          <KK_SK_Yil></KK_SK_Yil>
          <KK_CVC></KK_CVC>
          <KK_Sahibi_GSM></KK_Sahibi_GSM>
          <Hata_URL>${failUrl}</Hata_URL>
          <Basarili_URL>${successUrl}</Basarili_URL>
          <Siparis_ID>${orderId}</Siparis_ID>
          <Siparis_Aciklama>Can Dostum Box Abonelik - ${items?.[0]?.productName || 'Paket'}</Siparis_Aciklama>
          <Taksit>${installment}</Taksit>
          <Islem_Tutar>${totalAmount}</Islem_Tutar>
          <Toplam_Tutar>${totalAmount}</Toplam_Tutar>
          <Islem_Hash>${B64_HASH}</Islem_Hash>
          <Islem_Guvenlik_Tip>3D</Islem_Guvenlik_Tip>
          <Islem_ID></Islem_ID>
          <IPAdr>${ip || '85.85.85.85'}</IPAdr>
          <Ref_URL></Ref_URL>
          <Data1></Data1>
          <Data2></Data2>
          <Data3></Data3>
          <Data4></Data4>
          <Data5></Data5>
        </TP_Islem_Odeme>
      </soap:Body>
    </soap:Envelope>
    `;

    // 5. Param API'ye İstek Atma
    const apiUrl = MODE === 'TEST' 
        ? 'https://test-api.param.com.tr/turkpos.ws/service_turkpos_test.asmx' 
        : 'https://api.param.com.tr/turkpos.ws/service_turkpos_prod.asmx'; // Prod URL'si değişebilir, dokümana bakılmalı.

    try {
        const response = await axios.post(apiUrl, xmlRequest, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'https://turkpos.com.tr/TP_Islem_Odeme'
            }
        });

        // 6. XML Yanıtını Çözümleme
        const parsed = await parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });
        const result = parsed['soap:Envelope']['soap:Body']['TP_Islem_OdemeResponse']['TP_Islem_OdemeResult'];

        console.log("PARAM YANIT:", result);

        if (result.Sonuc === '1' && result.UCD_URL) {
            // Başarılı! Param bize bir yönlendirme linki (UCD_URL) verdi.
            // Frontend'de bu linki iframe içine koyacağız.
            return { 
                status: 'success', 
                token: result.UCD_URL, // Frontend "token" bekliyor, biz URL gönderiyoruz.
                merchant_oid: orderId 
            };
        } else {
            return { status: 'error', message: result.Sonuc_Str || 'ParamPOS hatası' };
        }

    } catch (error) {
        console.error('ParamPOS Bağlantı Hatası:', error);
        return { status: 'error', message: 'Ödeme servisine bağlanılamadı.' };
    }
  }
}