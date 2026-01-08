import { Controller, Get, Patch, Param, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // 1. Kullanıcının Tüm Aboneliklerini Getir
  @UseGuards(JwtAuthGuard)
  @Get()
  getMySubscriptions(@Request() req) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    if (!userId) {
        throw new UnauthorizedException("Kullanıcı kimliği (ID) bulunamadı!");
    }
    return this.subscriptionsService.findAllByUser(userId);
  }

  // 👇 EKSİK OLAN PARÇA BU: Tek Bir Abonelik Getir (ID ile)
  // Bu olmazsa frontend 404 hatası alır ve fiyat hesaplayamaz!
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
      // Önce aboneliği servis üzerinden buluyoruz
      const sub = await this.subscriptionsService.findOne(id);
      
      // Güvenlik: Kullanıcı sadece kendi aboneliğini görebilmeli
      const userId = req.user?.id || req.user?.userId || req.user?.sub;
      if (userId && String(sub.user.id) !== String(userId)) {
          throw new UnauthorizedException("Bu aboneliği görüntüleme yetkiniz yok.");
      }
      
      return sub;
  }

  // 3. İade Önizlemesi
  @UseGuards(JwtAuthGuard)
  @Get(':id/refund-preview')
  async getRefundPreview(@Param('id') id: string) {
    return this.subscriptionsService.calculateRefund(id);
  }

  // 4. İptal Et
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancelSubscription(
      @Param('id') id: string, 
      @Body('reason') reason: string,
      @Request() req
  ) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    if (!userId) {
        throw new UnauthorizedException("Kullanıcı kimliği doğrulanamadı.");
    }
    return this.subscriptionsService.cancel(id, userId, reason);
  }
}