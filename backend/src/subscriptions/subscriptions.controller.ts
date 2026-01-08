import { Controller, Get, Patch, Param, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

@UseGuards(JwtAuthGuard)
  @Get()
  getMySubscriptions(@Request() req) {
    // 👇 CASUS LOG: Terminalde user objesinin gerçekte neye benzediğini görelim
    console.log("🔍 Gelen User Objesi:", req.user);

    // 👇 AKILLI ID SEÇİCİ: ID 'id' mi, 'userId' mi, yoksa 'sub' mı? Hepsine bak.
    const userId = req.user?.id || req.user?.userId || req.user?.sub;

    if (!userId) {
        throw new UnauthorizedException("Kullanıcı kimliği (ID) bulunamadı!");
    }

    return this.subscriptionsService.findAllByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/refund-preview')
  async getRefundPreview(@Param('id') id: string) {
  return this.subscriptionsService.calculateRefund(id);

}

@UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
      // Güvenlik: Kullanıcı sadece kendi aboneliğini görebilmeli
      const sub = await this.subscriptionsService.findOne(id);
      
      const userId = req.user?.id || req.user?.userId || req.user?.sub;
      if (userId && String(sub.user.id) !== String(userId)) {
          throw new UnauthorizedException("Bu aboneliği görüntüleme yetkiniz yok.");
      }
      
      return sub;
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancelSubscription(
      @Param('id') id: string, 
      @Body('reason') reason: string,
      @Request() req
  ) {
    // ID kontrolü (Casus logdan gördüğün yapıya göre)
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    
    if (!userId) {
        throw new UnauthorizedException("Kullanıcı kimliği doğrulanamadı.");
    }

    return this.subscriptionsService.cancel(id, userId, reason);
  }
}