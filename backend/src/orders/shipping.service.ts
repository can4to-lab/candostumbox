import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
// Mail servisini kullanacağımız için import ediyoruz
import { MailService } from '../mail/mail.service'; 

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    // 👇 EKSİK OLAN BAĞLANTILAR EKLENDİ (Order db ve Mail)
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private mailService: MailService 
  ) {
    this.apiKey = this.configService.get<string>('BASIT_KARGO_API_KEY') || process.env.BASIT_KARGO_API_KEY || '';
    this.apiUrl = this.configService.get<string>('BASIT_KARGO_URL') || process.env.BASIT_KARGO_URL || 'https://basitkargo.com/api';
  }

  async createShipment(order: any) {
    const url = `${this.apiUrl}/v2/order/barcode`;
    
    // Müşteri kayıtlıysa user'dan, misafirse adres bilgilerinden (snapshot) adını alıyoruz
    const firstName = order.user?.firstName || order.shippingAddressSnapshot?.firstName || 'Değerli';
    const lastName = order.user?.lastName || order.shippingAddressSnapshot?.lastName || 'Müşterimiz';
    const phone = order.user?.phone || order.shippingAddressSnapshot?.phone || "5555555555";

    const payload = {
      handlerCode: "HEPSIJET",
      content: {
        name: `Sipariş #${String(order.id).slice(0, 8)}`,
        code: order.id,
        packages: [{ height: 10, width: 15, depth: 5, weight: 1 }]
      },
      client: {
        name: `${firstName} ${lastName}`.trim(), 
        phone: phone,
        city: order.shippingAddressSnapshot?.city,
        town: order.shippingAddressSnapshot?.district,
        address: order.shippingAddressSnapshot?.fullAddress
      }
    };

    try {
      const res = await axios.post(url, payload, {
        headers: { 
          Authorization: `Bearer ${this.apiKey}`, 
          "Content-Type": "application/json" 
        }
      });
      
      return {
        status: 'success',
        trackingCode: res.data.id, 
        barcode: res.data.barcode,
        provider: 'Basit Kargo'
      };
    } catch (error: any) { 
      this.logger.error("Basit Kargo Hatası:", error.response?.data || error.message);
      throw new Error("Kargo oluşturulamadı.");
    }
  }

  // --- 1. MÜŞTERİ / ADMİN İÇİN CANLI KARGO SORGULAMA ---
  async getLiveTrackingStatus(trackingCode: string) {
    try {
      const res = await axios.get(`${this.apiUrl}/v2/order/status/${trackingCode}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });
      return res.data; 
    } catch (error: any) {
      // Sadece hata fırlatmıyoruz, sistemin devam edebilmesi için UNKNOWN dönüyoruz ama hatayı LOGLUYORUZ!
      this.logger.error(`🚨 Kargo durumu çekilemedi (Kod: ${trackingCode}): ${error.message}`);
      return { status: 'UNKNOWN', location: 'Bilgi Alınamadı' };
    }
  }

  // --- 2. OTOMATİK SİSTEM GÜNCELLEYİCİ (CRON JOB) ---
  @Cron(CronExpression.EVERY_3_HOURS)
  async checkAndSyncShipments() {
    this.logger.log('🔄 Otomatik kargo statü kontrolü başlatıldı...');

    const shippedOrders = await this.orderRepository.find({
      where: { status: OrderStatus.SHIPPED },
      relations: ['user'] // Mail atacağımız için user tablosunu da çekiyoruz
    });

    if (shippedOrders.length === 0) {
        this.logger.log('Kontrol edilecek kargodaki sipariş bulunamadı.');
        return;
    }

    for (const order of shippedOrders) {
      if (!order.cargoTrackingCode) continue;

      try {
        const cargoInfo = await this.getLiveTrackingStatus(order.cargoTrackingCode);
        
        if (cargoInfo.status === 'DELIVERED') {
          order.status = OrderStatus.DELIVERED;
          await this.orderRepository.save(order);
          
          this.logger.log(`📦 Sipariş #${order.id} başarıyla teslim edildi olarak güncellendi.`);
          
          // Müşteriye Teslim Maili Atılıyor (Fire and Forget)
          const customerEmail = order.user?.email || order.shippingAddressSnapshot?.email;
          if (customerEmail) {
              // Not: MailService içinde sendDeliveryConfirmation adında bir metodunuz olduğunu varsayıyorum.
              // Eğer yoksa bunu sendOrderConfirmation vb. ile değiştirebilirsiniz.
              this.mailService.sendDeliveryConfirmation?.(customerEmail, order.id, order.cargoTrackingCode)
                .catch(err => this.logger.error(`Teslimat maili gönderilemedi: ${order.id}`, err));
          }
        }
      } catch (error: any) {
         // Hata yutuluyor ama loglarda kabak gibi parlayacak!
         this.logger.error(`❌ Cron Job Hatası - Sipariş #${order.id} güncellenemedi: ${error.message}`);
         continue; 
      }
    }
  }
}