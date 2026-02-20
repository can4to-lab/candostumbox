import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { parseStringPromise } from 'xml2js';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/entities/order.entity';
import { MailService } from '../mail/mail.service';
import { PaymentSession } from './entities/payment-session.entity'; // YENİ GEÇİCİ TABLOMUZ

@Injectable()
export class PaymentService {
  
  constructor(
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
    private mailService: MailService,
    @InjectRepository(PaymentSession)
    private sessionRepo: Repository<PaymentSession>, // SİSTEME EKLENDİ
  ) {}

  async startPayment(data: any) {
    console.log("--- ÖDEME SERVİSİ BAŞLADI (SESSION MANTIĞI) ---");
    const { price, basketId, ip, card, items, user, address } = data;

    // 👇 ID KONTROLÜ
    let userIdToSave = user?.id || null;
   
    console.log(`👤 İşlem Yapan: ${userIdToSave ? 'Kayıtlı Kullanıcı: ' + userIdToSave : 'Misafir'}`);

    // 1. .env AYARLARI
    const CLIENT_CODE = process.env.PARAM_CLIENT_CODE;
    const GUID = process.env.PARAM_GUID;
    
    if(!CLIENT_CODE || !GUID || !card) {
        return { status: 'error', message: 'Eksik bilgi: API anahtarları veya Kart bilgisi yok.' };
    }

    // --- 2. GERÇEK SİPARİŞ YERİNE GEÇİCİ OTURUM (SESSION) OLUŞTURUYORUZ ---
    const createOrderDto = {
        addressId: address?.id || null, 
        items: items, 
        paymentType: 'credit_card',
        isGuest: !userIdToSave,
        guestInfo: !userIdToSave ? { ...user, ...address } : undefined 
    };

    // Verileri beklemeye alıyoruz. (Henüz Orders tablosuna gitmiyor!)
    const session = this.sessionRepo.create({
        payload: { userIdToSave, createOrderDto }
    });
    await this.sessionRepo.save(session);

    console.log(`✅ Geçici Ödeme Oturumu Açıldı: ${session.id}`);

    // 3. VERİ HAZIRLIĞI
    const totalAmount = Number(price).toFixed(2).replace('.', ','); 
    const orderId = session.id; // 👈 DİKKAT: ParamPOS'a geçici session ID'mizi yolluyoruz!
    const installment = "1"; 
    const SANAL_POS_ID = CLIENT_CODE; 
    
    // Dönüş URL'leri
    const backendUrl = process.env.BACKEND_URL || 'https://candostumbox-api.onrender.com';
    const successUrl = `${backendUrl}/payment/callback`;
    const failUrl = `${backendUrl}/payment/callback`;

    // 4. HASH HESAPLAMA (SHA-1)
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

    const B64_HASH = crypto.createHash('sha1').update(hashString, 'utf-8').digest('base64');

    const isTest = process.env.PARAM_MODE === 'TEST';
    const apiUrl = isTest 
        ? 'https://test-dmz.param.com.tr/turkpos.ws/service_turkpos_test.asmx' 
        : 'https://posws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx';

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
        const response = await axios.post(apiUrl, xmlRequest, {
            headers: { 
                'Content-Type': 'text/xml; charset=utf-8', 
                'SOAPAction': 'https://turkpos.com.tr/TP_Islem_Odeme' 
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
    const sessionId = body.TURKPOS_RETVAL_Siparis_ID; // Bu artık bizim session ID'miz
    
    // Geçici oturumu bul
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    
    if (!session) {
        console.error("❌ Hata: İlgili geçici ödeme oturumu bulunamadı.");
        return { status: 'fail', message: 'Geçersiz veya süresi dolmuş ödeme işlemi.' };
    }

    if (Number(status) > 0) {
        console.log(`✅ ÖDEME BAŞARILI! Gerçek Sipariş Oluşturuluyor...`);
        let finalOrderId: string = "";

        try {
            // 1. ÖDEME ALINDI, ŞİMDİ GERÇEK SİPARİŞİ YARAT (Verileri session'dan çekiyoruz)
            const { userIdToSave, createOrderDto } = session.payload;
            const newOrderResult = await this.ordersService.create(userIdToSave, createOrderDto as any);
            finalOrderId = newOrderResult.orderId;

            console.log(`✅ Gerçek Sipariş DB'ye yazıldı: ${finalOrderId}`);

            // 2. Siparişin durumunu ÖDENDİ yap
            await this.ordersService.updateStatus(finalOrderId, OrderStatus.PAID); 

            // 3. MAİL GÖNDERİMİ
            const order = await this.ordersService.findOne(finalOrderId); 
            
            if (order) {
                await this.mailService.sendAdminOrderNotification(order.id, order.totalPrice);
                
                if (order.user && order.user.email) {
                    await this.mailService.sendOrderConfirmation(order.user.email, order.id, order.totalPrice);
                } else if (order.shippingAddressSnapshot && order.shippingAddressSnapshot.email) {
                    await this.mailService.sendOrderConfirmation(order.shippingAddressSnapshot.email, order.id, order.totalPrice);
                }
            }
        } catch (e) {
            console.error("Sipariş güncellenirken veya mail atılırken hata oluştu:", e);
        }

        // ÇÖPLÜK OLMAMASI İÇİN GEÇİCİ OTURUMU SİL
        await this.sessionRepo.remove(session);

        return { status: 'success', orderId: finalOrderId || sessionId };

    } else {
        console.error(`❌ ÖDEME BAŞARISIZ! Hata: ${body.TURKPOS_RETVAL_Sonuc_Str}`);
        
        // ÖDEME OLMADIĞI İÇİN GEÇİCİ OTURUMU DİREKT SİLİYORUZ (SİSTEM TERTEMİZ KALIYOR)
        await this.sessionRepo.remove(session);
        
        return { status: 'fail', message: body.TURKPOS_RETVAL_Sonuc_Str };
    }
  }
}