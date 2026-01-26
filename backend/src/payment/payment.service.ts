import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class PaymentService {
  
  // --- ÖDEME BAŞLATMA (TP_Islem_Odeme) ---
  async startPayment(data: any) {
    console.log("--- PARAM POS ÖDEME BAŞLATILIYOR (TP_Islem_Odeme) ---");
    // data.card nesnesi frontend'den gelmeli (Kart No, CVV, SKT)
    const { price, basketId, ip, card, items } = data;

    // .env Ayarları
    const CLIENT_CODE = process.env.PARAM_CLIENT_CODE;
    const CLIENT_USERNAME = process.env.PARAM_CLIENT_USERNAME;
    const CLIENT_PASSWORD = process.env.PARAM_CLIENT_PASSWORD;
    const GUID = process.env.PARAM_GUID;
    const MODE = process.env.PARAM_MODE || "PROD"; 
    
    // Canlıda SanalPOS_ID genellikle CLIENT_CODE ile aynıdır.
    // Dökümanda SanalPOS_ID zorunlu.
    const SANAL_POS_ID = CLIENT_CODE; 

    if(!CLIENT_CODE || !GUID || !card) {
        return { status: 'error', message: 'Eksik bilgi: API anahtarları veya Kart bilgisi yok.' };
    }

    // Tutar Formatı: ParamPOS 1000,50 veya 1000.50 ister. String olmalı.
    const totalAmount = Number(price).toFixed(2); 
    const orderId = basketId || `SIP_${new Date().getTime()}`;
    const installment = "1"; // Tek çekim

    // Dönüş URL'leri
    const baseUrl = 'https://candostumbox-api.onrender.com'; // Backend URL'in
    const successUrl = `${baseUrl}/payment/callback`;
    const failUrl = `${baseUrl}/payment/callback`;

    // --- HASH HESAPLAMA (Döküman Sayfa 50) ---
    // Sıralama: CLIENT_CODE + GUID + SanalPOS_ID + Taksit + Islem_Tutar + Toplam_Tutar + Siparis_ID + Hata_URL + Basarili_URL
    const hashString = 
        CLIENT_CODE + 
        GUID + 
        SANAL_POS_ID + 
        installment + 
        totalAmount + 
        totalAmount + 
        orderId + 
        failUrl + 
        successUrl;

    const B64_HASH = crypto
        .createHash('sha256')
        .update(hashString, 'utf-8')
        .digest('base64');

    // API URL
    const isTest = MODE === 'TEST';
    const apiUrl = isTest 
        ? 'https://test-api.param.com.tr/turkpos.ws/service_turkpos_test.asmx' 
        : 'https://posservice.param.com.tr/turkpos.ws/service_turkpos_prod.asmx';

    // --- XML OLUŞTURMA ---
    // Döküman Sayfa 51'deki tabloya göre
    const xmlRequest = `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <TP_Islem_Odeme xmlns="https://turkpos.com.tr/">
          <G>
            <CLIENT_CODE>${CLIENT_CODE}</CLIENT_CODE>
            <CLIENT_USERNAME>${CLIENT_USERNAME}</CLIENT_USERNAME>
            <CLIENT_PASSWORD>${CLIENT_PASSWORD}</CLIENT_PASSWORD>
          </G>
          <SanalPOS_ID>${SANAL_POS_ID}</SanalPOS_ID>
          <GUID>${GUID}</GUID>
          <KK_Sahibi>${card.cardHolder}</KK_Sahibi>
          <KK_No>${card.cardNumber}</KK_No>
          <KK_SK_Ay>${card.expireMonth}</KK_SK_Ay>
          <KK_SK_Yil>${card.expireYear}</KK_SK_Yil>
          <KK_CVC>${card.cvc}</KK_CVC>
          <KK_Sahibi_GSM>5555555555</KK_Sahibi_GSM> 
          <Hata_URL>${failUrl}</Hata_URL>
          <Basarili_URL>${successUrl}</Basarili_URL>
          <Siparis_ID>${orderId}</Siparis_ID>
          <Siparis_Aciklama>Can Dostum Box - ${items?.[0]?.productName || 'Abonelik'}</Siparis_Aciklama>
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

    try {
        console.log(`PARAM POS ISTEK URL: ${apiUrl}`);
        const response = await axios.post(apiUrl, xmlRequest, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'https://turkpos.com.tr/TP_Islem_Odeme'
            }
        });

        const parsed = await parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });
        
        // Yanıtı güvenli şekilde al
        const soapBody = parsed['soap:Envelope']?.['soap:Body'] || parsed['soap:Envelope']?.['Body'];
        const result = soapBody?.['TP_Islem_OdemeResponse']?.['TP_Islem_OdemeResult'];

        console.log("PARAM POS YANIT:", result);

        // Sonuc '1' dönerse 3D Secure linki (UCD_URL) gelmiştir.
        if (result && Number(result.Sonuc) > 0 && result.UCD_URL) {
            return { 
                status: 'success', 
                token: result.UCD_URL, 
                merchant_oid: orderId 
            };
        } else {
            const errorMsg = result?.Sonuc_Str || 'ParamPOS Bilinmeyen Hata';
            return { status: 'error', message: errorMsg };
        }

    } catch (error) {
        console.error('ParamPOS Bağlantı Hatası:', error);
        return { status: 'error', message: 'Ödeme sunucusuna bağlanılamadı.' };
    }
  }

  // --- CALLBACK İŞLEME ---
  async handleCallback(body: any) {
    console.log("--- PARAM POS CALLBACK ---", body);

    const status = body.TURKPOS_RETVAL_Sonuc; // "1" Başarılı
    const orderId = body.TURKPOS_RETVAL_Siparis_ID;
    const bankReceipt = body.TURKPOS_RETVAL_Dekont_ID;

    if (Number(status) > 0) {
        console.log(`✅ ÖDEME BAŞARILI! Sipariş: ${orderId}`);
        return { status: 'success', orderId };
    } else {
        console.error(`❌ ÖDEME BAŞARISIZ! Hata: ${body.TURKPOS_RETVAL_Sonuc_Str}`);
        return { status: 'fail', message: body.TURKPOS_RETVAL_Sonuc_Str };
    }
  }
}