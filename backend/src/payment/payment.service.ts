import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class PaymentService {
  
  // --- 1. ÖDEME BAŞLATMA ---
  async startPayment(data: any) {
    console.log("--- PARAM POS (CANLI) BAŞLATILIYOR ---");
    const { user, price, basketId, ip, items } = data;

    const CLIENT_CODE = process.env.PARAM_CLIENT_CODE;
    const CLIENT_USERNAME = process.env.PARAM_CLIENT_USERNAME;
    const CLIENT_PASSWORD = process.env.PARAM_CLIENT_PASSWORD;
    const GUID = process.env.PARAM_GUID;
    
    // Güvenlik Önlemi: Eksik bilgi varsa durdur
    if(!CLIENT_CODE || !GUID || !CLIENT_USERNAME || !CLIENT_PASSWORD) {
        return { status: 'error', message: 'ParamPOS API anahtarları sunucuda eksik.' };
    }

    // Tutar Formatı: Param "100,50" veya "100.50" ister.
    const totalAmount = Number(price).toFixed(2); 
    
    const orderId = basketId || `SIP_${new Date().getTime()}`;
    const installment = "1"; // Tek Çekim

    // 🔴 DİKKAT: Burası senin Render Backend adresin olmalı!
    const backendUrl = 'https://candostumbox-api.onrender.com'; 
    
    // ParamPOS işlem bitince sonucu bu adreslere POST eder
    const successUrl = `${backendUrl}/payment/callback`;
    const failUrl = `${backendUrl}/payment/callback`;

    // Hash Hesaplama (Sıralama ParamPOS için sabittir, değiştirilemez)
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
        .update(hashString, 'utf8')
        .digest('base64');

    // CANLI SUNUCU URL'Sİ
    const apiUrl = 'https://posservice.param.com.tr/turkpos.ws/service_turkpos_prod.asmx';

    const xmlRequest = `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <TP_Islem_Odeme xmlns="https://turkpos.com.tr/">
          <G>
            <CLIENT_CODE>${CLIENT_CODE}</CLIENT_CODE>
            <CLIENT_USERNAME>${CLIENT_USERNAME}</CLIENT_USERNAME>
            <CLIENT_PASSWORD>${CLIENT_PASSWORD}</CLIENT_PASSWORD>
          </G>
          <SanalPOS_ID>${CLIENT_CODE}</SanalPOS_ID> 
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
          <Siparis_Aciklama>Can Dostum Box - ${items?.[0]?.productName || 'Abonelik'}</Siparis_Aciklama>
          <Taksit>${installment}</Taksit>
          <Islem_Tutar>${totalAmount}</Islem_Tutar>
          <Toplam_Tutar>${totalAmount}</Toplam_Tutar>
          <Islem_Hash>${B64_HASH}</Islem_Hash>
          <Islem_Guvenlik_Tip>3D</Islem_Guvenlik_Tip>
          <Islem_ID></Islem_ID>
          <IPAdr>${ip || '85.85.85.85'}</IPAdr>
          <Ref_URL></Ref_URL>
          <Data1>WEB</Data1>
          <Data2></Data2>
          <Data3></Data3>
          <Data4></Data4>
          <Data5></Data5>
        </TP_Islem_Odeme>
      </soap:Body>
    </soap:Envelope>
    `;

    try {
        console.log(`PARAM POS ISTEK ATILIYOR... URL: ${apiUrl}`);
        
        const response = await axios.post(apiUrl, xmlRequest, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'https://turkpos.com.tr/TP_Islem_Odeme'
            }
        });

        const parsed = await parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });
        
        // XML Yanıtını güvenli şekilde çözümle
        const soapBody = parsed['soap:Envelope']?.['soap:Body'] || parsed['soap:Envelope']?.['Body'];
        const result = soapBody?.['TP_Islem_OdemeResponse']?.['TP_Islem_OdemeResult'];

        console.log("PARAM YANIT:", result);

        if (result && result.Sonuc === '1' && result.UCD_URL) {
            return { 
                status: 'success', 
                token: result.UCD_URL, // Frontend bu linki iframe içinde açacak
                merchant_oid: orderId 
            };
        } else {
            const errorMsg = result?.Sonuc_Str || 'ParamPOS Bilinmeyen Hata';
            console.error("PARAM POS HATASI:", errorMsg);
            return { status: 'error', message: errorMsg };
        }

    } catch (error) {
        console.error('ParamPOS Bağlantı Hatası:', error);
        return { status: 'error', message: 'Ödeme sunucusuna bağlanılamadı.' };
    }
  }

  // --- 2. CALLBACK İŞLEME (SONUÇ) ---
  async handleCallback(body: any) {
    console.log("--- PARAM POS CALLBACK GELDİ ---", body);

    // ParamPOS'tan gelen kritik veriler
    const status = body.TURKPOS_RETVAL_Sonuc; // "1" = Başarılı
    const orderId = body.TURKPOS_RETVAL_Siparis_ID;
    const bankReceipt = body.TURKPOS_RETVAL_Dekont_ID;

    if (status === "1") {
        console.log(`✅ ÖDEME ONAYLANDI! Sipariş: ${orderId}, Dekont: ${bankReceipt}`);
        
        // BURADA SİPARİŞ DURUMUNU GÜNCELLE
        // Örn: await this.ordersService.markAsPaid(orderId);

        return { status: 'success', orderId };
    } else {
        console.error(`❌ ÖDEME BAŞARISIZ! Hata: ${body.TURKPOS_RETVAL_Sonuc_Str}`);
        return { status: 'fail', message: body.TURKPOS_RETVAL_Sonuc_Str };
    }
  }
}