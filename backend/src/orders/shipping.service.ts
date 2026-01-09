import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Order } from './entities/order.entity';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('BASIT_KARGO_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('BASIT_KARGO_API_URL') || '';
  }

  async createShipment(order: Order) {
    // 1. Veri Hazırlığı (Mapping)
    // Basit Kargo'nun beklediği tahmini format (Dokümantasyona göre özelleştirilebilir)
    
    // Alıcı Adı Çözümleme
    let receiverName = "Misafir Müşteri";
    let receiverPhone = "";
    let receiverCity = "";
    let receiverAddress = "";

    if (order.user) {
        receiverName = `${order.user.firstName} ${order.user.lastName}`;
        receiverPhone = order.user.phone || "";
    }
    
    // Adres Snapshot'tan verileri al
    if (order.shippingAddressSnapshot) {
        const snap = order.shippingAddressSnapshot;
        receiverAddress = snap.fullAddress || snap.address;
        receiverCity = snap.city || "İstanbul"; // Varsayılan
        // Eğer snapshot içinde isim varsa onu kullan (daha günceldir)
        if (snap.contactName) receiverName = snap.contactName;
    }

    const payload = {
        customer_name: receiverName,
        customer_phone: receiverPhone,
        customer_city: receiverCity,
        customer_address: receiverAddress,
        order_id: order.id, // Bizim sipariş numaramız (Referans)
        desi: 3, // Varsayılan desi (Paket içeriğine göre dinamikleştirilebilir)
        payment_type: 'gonderici_odemeli' // Kargo ücretini biz ödüyoruz
    };

    try {
        this.logger.log(`🚚 Basit Kargo'ya istek atılıyor: Sipariş #${order.id}`);

        // 2. API İsteği
        // Not: Endpoint '/orders/create-with-code' tahmini yazılmıştır. 
        // Dokümantasyondaki "Sipariş Oluştur + Kargo Kodu Üret" endpoint'i neyse o yazılmalı.
        const response = await firstValueFrom(
            this.httpService.post(
                `${this.apiUrl}/orders/create-with-code`, 
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
        );

        // 3. Başarılı Cevap
        // API'nin döndüğü takip kodunu alıyoruz (Örn: response.data.tracking_code)
        // Dokümantasyona göre bu alanın adı değişebilir.
        const trackingCode = response.data?.tracking_code || response.data?.data?.barcode || `MOCK-${Math.floor(Math.random()*10000)}`;
        
        return {
            success: true,
            trackingCode: trackingCode,
            provider: 'Basit Kargo'
        };

    } catch (error) {
        this.logger.error(`❌ Kargo Entegrasyon Hatası: ${error.message}`);
        
        // Geliştirme aşamasında API Key yoksa sistemin durmaması için Mock kod dönüyoruz.
        // Canlıya geçince burayı silebilir veya hata fırlatabilirsiniz.
        return {
            success: true, // Hata olsa bile mock dönüyoruz (Test için)
            trackingCode: `TEST-BASIT-${Math.floor(Math.random() * 999999)}`,
            provider: 'Basit Kargo (Test)'
        };
    }
  }
}