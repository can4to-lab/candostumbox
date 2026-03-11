import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { parseStringPromise } from 'xml2js';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/entities/order.entity';
import { MailService } from '../mail/mail.service';
import { PaymentSession } from './entities/payment-session.entity'; 

@Injectable()
export class PaymentService {
  
  constructor(
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
    private mailService: MailService,
    @InjectRepository(PaymentSession)
    private sessionRepo: Repository<PaymentSession>, 
  ) {}

  async startPayment(data: any) {
    console.log("--- ÖDEME SERVİSİ BAŞLADI (SESSION MANTIĞI) ---");
    const { price, basketId, ip, card, items, user, address, installment } = data;

    let userIdToSave = user?.id || null;
    console.log(`👤 İşlem Yapan: ${userIdToSave ? 'Kayıtlı Kullanıcı: ' + userIdToSave : 'Misafir'}`);

    const CLIENT_CODE = process.env.PARAM_CLIENT_CODE;
    const GUID = process.env.PARAM_GUID;
    
    if(!CLIENT_CODE || !GUID || !card) {
        return { status: 'error', message: 'Eksik bilgi: API anahtarları veya Kart bilgisi yok.' };
    }

    const createOrderDto = {
        addressId: address?.id || null, 
        items: items, 
        paymentType: 'credit_card',
        isGuest: !userIdToSave,
        guestInfo: !userIdToSave ? { ...user, ...address } : undefined, 
        promoCode: data.promoCode
    };

    const session = this.sessionRepo.create({
        payload: { userIdToSave, createOrderDto }
    });
    await this.sessionRepo.save(session);

    console.log(`✅ Geçici Ödeme Oturumu Açıldı: ${session.id}`);
const securePrice = await this.ordersService.calculateSecureTotal(items, data.promoCode, userIdToSave, 'credit_card');
    
    if (securePrice <= 0) {
        return { status: 'error', message: 'Geçersiz sipariş tutarı tespit edildi. Lütfen sayfayı yenileyip tekrar deneyin.' };
    }

    let finalAmountForParam = securePrice;

    // Eğer müşteri taksit seçtiyse, gerçek vade farkını ParamPOS'tan biz çekip fiyata ekliyoruz
    if (installment && installment !== "1") {
        const bin = card.cardNumber.substring(0, 6);
        const installmentData = await this.getInstallments(bin, securePrice);
        
        if (installmentData.status === 'success' && installmentData.data) {
            // opt: any diyerek TypeScript'i bir kez daha rahatlatıyoruz
            const selectedOpt = installmentData.data.find((opt: any) => String(opt.month) === String(installment));
            if (selectedOpt) {
                finalAmountForParam = selectedOpt.totalAmount; // Vade farkı eklenmiş nihai tutar
                console.log(`💳 Taksitli İşlem: ${installment} Ay - Vade Farklı Tutar: ${finalAmountForParam} TL`);
            }
        }
    }

    // ParamPOS'a gidecek KESİN ve GÜVENLİ tutar
    const totalAmount = finalAmountForParam.toFixed(2).replace('.', ',');

    const orderId = session.id; 
    const paramInstallment = installment || "1"; 
    const SANAL_POS_ID = CLIENT_CODE; 
    
    const backendUrl = process.env.BACKEND_URL || 'https://api.candostumbox.com';
    const successUrl = `${backendUrl}/payment/callback`;
    const failUrl = `${backendUrl}/payment/callback`;

    const hashString = 
        CLIENT_CODE + 
        GUID + 
        SANAL_POS_ID + 
        paramInstallment + 
        totalAmount + 
        totalAmount + 
        orderId + 
        failUrl + 
        successUrl;

    const B64_HASH = crypto.createHash('sha1').update(hashString, 'utf-8').digest('base64');

    const isTest = process.env.PARAM_MODE === 'TEST';
    const apiUrl = isTest 
        ? 'https://test-dmz.param.com.tr/turkpos.ws/service_turkpos_test.asmx' 
        : 'https://posws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx';

    // DİKKAT: xsi, xsd ve soap linkleri evrensel HTTP standartlarıdır, asla değiştirilmemeli.
    const xmlRequest = `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <TP_Islem_Odeme xmlns="https://turkpos.com.tr/">
          <G>
            <CLIENT_CODE>${CLIENT_CODE}</CLIENT_CODE>
            <CLIENT_USERNAME>${process.env.PARAM_CLIENT_USERNAME}</CLIENT_USERNAME>
            <CLIENT_PASSWORD>${process.env.PARAM_CLIENT_PASSWORD}</CLIENT_PASSWORD>
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
          <Siparis_Aciklama>Can Dostum Box</Siparis_Aciklama>
          <Taksit>${paramInstallment}</Taksit>
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
        const response = await axios.post(apiUrl, xmlRequest, {
            headers: { 
                'Content-Type': 'text/xml; charset=utf-8', 
                'SOAPAction': '"https://turkpos.com.tr/TP_Islem_Odeme"' 
            }
        });

        const parsed = await parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });
        const soapBody = parsed['soap:Envelope']?.['soap:Body'] || parsed['soap:Envelope']?.['Body'];
        const result = soapBody?.['TP_Islem_OdemeResponse']?.['TP_Islem_OdemeResult'];

        if (result && Number(result.Sonuc) > 0 && result.UCD_URL) {
            return { status: 'success', token: result.UCD_URL, merchant_oid: orderId };
        } else {
            return { status: 'error', message: result?.Sonuc_Str || 'ParamPOS Hatası' };
        }
    } catch (error: any) {
        return { status: 'error', message: 'Bağlantı hatası' };
    }
  }

  async handleCallback(body: any) {
    console.log("--- PARAM POS CALLBACK GELDİ ---", body);
    const status = body.TURKPOS_RETVAL_Sonuc;
    const sessionId = body.TURKPOS_RETVAL_Siparis_ID;
    
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    
    if (!session) {
        console.error("❌ Hata: İlgili geçici ödeme oturumu bulunamadı.");
        return { status: 'fail', message: 'Geçersiz veya süresi dolmuş ödeme işlemi.' };
    }

if (Number(status) > 0) {
        console.log(`✅ ÖDEME BAŞARILI! Gerçek Sipariş Oluşturuluyor...`);
        let finalOrderId: string = "";

        try {
            const { userIdToSave, createOrderDto } = session.payload;
            const newOrderResult = await this.ordersService.create(userIdToSave, createOrderDto as any);
            finalOrderId = newOrderResult.orderId;

            console.log(`✅ Gerçek Sipariş DB'ye yazıldı: ${finalOrderId}`);
            await this.ordersService.updateStatus(finalOrderId, OrderStatus.PAID); 

            // 👇 SADECE SİPARİŞ KUSURSUZ OLUŞURSA SESSION'I SİL (GEÇMİŞİ TEMİZLE)
            await this.sessionRepo.remove(session);
            return { status: 'success', orderId: finalOrderId };

        } catch (e) {
            console.error("🚨 KRİTİK HATA: Para bankadan çekildi ama Sipariş veritabanına YAZILAMADI!", e);
            
            // 👇 KRİTİK DÜZELTME: Oturumu SİLME! Hatayı içine kaydedip beklemeye al ki admin paneline düşsün
            session.payload = { 
                ...session.payload, 
                paymentStatus: 'CHARGED_BUT_FAILED_DB', 
                errorMsg: e instanceof Error ? e.message : String(e) 
            };
            await this.sessionRepo.save(session);
            
            // ParamPOS'a success dönüyoruz ki işlemi iade etmesin (Para bizde kalsın, sorunu biz manuel çözeceğiz)
            return { status: 'success', orderId: sessionId };
        }

    } else {
        console.error(`❌ ÖDEME BAŞARISIZ! Hata: ${body.TURKPOS_RETVAL_Sonuc_Str}`);
        await this.sessionRepo.remove(session);
        return { status: 'fail', message: body.TURKPOS_RETVAL_Sonuc_Str };
    }
  }

// PARAM POS GERÇEK ZAMANLI TAKSİT VE KOMİSYON SORGULAMA
 async getInstallments(bin: string, amount: number) {
    const amountNum = Number(amount);
    const cleanBin = bin ? bin.replace(/\s/g, '').substring(0, 6) : "";
    const singleInstallmentFallback = { 
        status: 'success', 
        data: [{ month: 1, commissionRate: 0, commissionAmount: 0, totalAmount: amountNum, monthlyPayment: amountNum }] 
    };
    
    // 1. ADIM: BIN Kodundan Kartın Bankasını Bul
    const binXml = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <BIN_SanalPos xmlns="https://turkpos.com.tr/"> 
            <G>
              <CLIENT_CODE>${process.env.PARAM_CLIENT_CODE}</CLIENT_CODE>
              <CLIENT_USERNAME>${process.env.PARAM_CLIENT_USERNAME}</CLIENT_USERNAME>
              <CLIENT_PASSWORD>${process.env.PARAM_CLIENT_PASSWORD}</CLIENT_PASSWORD>
            </G>
            <BIN>${cleanBin}</BIN>
          </BIN_SanalPos>
        </soap:Body>
      </soap:Envelope>`;

    try {
      const binRes = await axios.post('https://posws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx', binXml, {
        headers: { 
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '"https://turkpos.com.tr/BIN_SanalPos"' 
        }
      });
      
      const binResultRaw = await parseStringPromise(binRes.data, { explicitArray: false });
      const binResult = binResultRaw['soap:Envelope']?.['soap:Body']?.['BIN_SanalPosResponse']?.['BIN_SanalPosResult'];
      
      if (!binResult || Number(binResult.Sonuc) < 0) {
        return { status: 'error', message: 'Geçersiz kart numarası veya desteklenmeyen kart.' };
      }

      const tempObj = binResult?.DT_Bilgi?.['diffgr:diffgram']?.NewDataSet?.Temp;
      let rawPosId = tempObj?.SanalPOS_ID || binResult?.SanalPOS_ID;

      if (Array.isArray(rawPosId)) {
          rawPosId = rawPosId[0];
      } else if (typeof rawPosId === 'object' && rawPosId !== null) {
          rawPosId = rawPosId['_'] || rawPosId['$'] || Object.values(rawPosId)[0];
      }
      
      const sanalPosId = String(rawPosId).trim();

      // 2. ADIM: GERÇEK FİRMA ORANLARINI ÇEK
      const ratesXml = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <TP_Ozel_Oran_Liste xmlns="https://turkpos.com.tr/"> 
              <G>
                <CLIENT_CODE>${process.env.PARAM_CLIENT_CODE}</CLIENT_CODE>
                <CLIENT_USERNAME>${process.env.PARAM_CLIENT_USERNAME}</CLIENT_USERNAME>
                <CLIENT_PASSWORD>${process.env.PARAM_CLIENT_PASSWORD}</CLIENT_PASSWORD>
              </G>
              <GUID>${process.env.PARAM_GUID}</GUID>
            </TP_Ozel_Oran_Liste>
          </soap:Body>
        </soap:Envelope>`;

      const ratesRes = await axios.post('https://posws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx', ratesXml, {
        headers: { 
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '"https://turkpos.com.tr/TP_Ozel_Oran_Liste"' 
        }
      });

      const ratesResultRaw = await parseStringPromise(ratesRes.data, { explicitArray: false });
      
      // 👇 İŞTE BÜYÜK KURTARICI BURADA! DT_Bilgi EKLENDİ!
      const resultObj = ratesResultRaw['soap:Envelope']?.['soap:Body']?.['TP_Ozel_Oran_ListeResponse']?.['TP_Ozel_Oran_ListeResult'];
      const diffgram = resultObj?.DT_Bilgi?.['diffgr:diffgram'];
      
      if (!diffgram || !diffgram.NewDataSet || !diffgram.NewDataSet.DT_Ozel_Oranlar) {
         console.warn("⚠️ ParamPOS'tan taksit listesi boş döndü. Sadece Tek Çekim aktif ediliyor.");
         return singleInstallmentFallback;
      }

      let oransList = diffgram.NewDataSet.DT_Ozel_Oranlar;
      if (!Array.isArray(oransList)) oransList = [oransList];

      // İki tarafı da ne olursa olsun String'e çeviriyoruz
      const filteredRates = oransList.filter((item: any) => String(item.SanalPOS_ID).trim() === sanalPosId);

      if (filteredRates.length === 0) {
         return singleInstallmentFallback;
      }

      const bankRateRow = filteredRates[0]; 
      const installments: any[] = [];

      for (let i = 1; i <= 12; i++) {
        const monthKey = `MO_${i.toString().padStart(2, '0')}`; 
        const rateStr = bankRateRow[monthKey];

        if (rateStr !== undefined && rateStr !== null) {
          const commissionRate = Number(rateStr);

          if (commissionRate >= 0) {
            const commissionAmount = amountNum * (commissionRate / 100);
            const finalTotal = amountNum + commissionAmount;
            const monthlyPayment = finalTotal / i;

            installments.push({
              month: i,
              commissionRate: commissionRate,
              commissionAmount: commissionAmount,
              totalAmount: finalTotal,
              monthlyPayment: monthlyPayment
            });
          }
        }
      }

      installments.sort((a, b) => a.month - b.month);
      return { status: 'success', data: installments };

    } catch (error: any) {
      console.error("🚨 ParamPOS API Hatası Yakalandı!");
      
      if (error.response) {
        console.log("STATUS:", error.response.status);
        console.log("DATA:", error.response.data); 
      } else {
        console.log("Sistemsel Hata:", error.message);
      }
      
      return singleInstallmentFallback;
    }
  }
}