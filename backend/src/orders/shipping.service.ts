import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    // ConfigService (Önerilen) veya process.env'den güvenli çekim
    this.apiKey = this.configService.get<string>('BASIT_KARGO_API_KEY') || process.env.BASIT_KARGO_API_KEY || '';
    this.apiUrl = this.configService.get<string>('BASIT_KARGO_URL') || process.env.BASIT_KARGO_URL || 'https://basitkargo.com/api';
  }

  async createShipment(order: any) {
    // Constructor'dan gelen veriyi kullanıyoruz
    const url = `${this.apiUrl}/v2/order/barcode`;
    
    const payload = {
      handlerCode: "ECONOMIC",
      content: {
        name: `Sipariş #${order.id.slice(0, 8)}`,
        code: order.id,
        packages: [{ height: 10, width: 15, depth: 5, weight: 1 }]
      },
      client: {
        name: `${order.user?.firstName || 'Misafir'} ${order.user?.lastName || ''}`,
        phone: order.user?.phone || order.shippingAddressSnapshot?.phone || "5555555555",
        city: order.shippingAddressSnapshot?.city,
        town: order.shippingAddressSnapshot?.district,
        address: order.shippingAddressSnapshot?.fullAddress
      }
    };

    try {
      const res = await axios.post(url, payload, {
        headers: { 
          Authorization: `Bearer ${this.apiKey}`, // Constructor'dan gelen token
          "Content-Type": "application/json" 
        }
      });
      
      return {
        status: 'success',
        trackingCode: res.data.id, 
        barcode: res.data.barcode,
        provider: 'Basit Kargo'
      };
    } catch (error: any) { // 👈 Typescript hatasını önlemek için error: any yapıldı
      this.logger.error("Basit Kargo Hatası:", error.response?.data || error.message);
      throw new Error("Kargo oluşturulamadı.");
    }
  }
}