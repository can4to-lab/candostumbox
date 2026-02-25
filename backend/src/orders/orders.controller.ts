import { Controller, Get, Post, Body, UseGuards, Req, Patch, Param, UnauthorizedException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    let userId = null;
    
    // 1. Header'ı GARANTİ şekilde al (Küçük/büyük harf duyarlılığını tamamen aşıyoruz)
    const authHeader = req.headers.authorization || req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // 2. KÜTÜPHANELERE GÜVENMİYORUZ: Token'ı Node.js ile MANUEL çözüyoruz!
        const payloadStr = Buffer.from(token.split('.')[1], 'base64').toString('utf-8');
        const decoded = JSON.parse(payloadStr);
        userId = decoded.userId || decoded.id || decoded.sub;
        console.log(`✅ [OrdersController] Token Başarıyla Çözüldü! Gerçek Müşteri ID: ${userId}`);
      } catch (e) {
        console.log(`❌ [OrdersController] Token Çözülemedi! Hata:`, e.message);
      }
    }

    // 3. İNATLA DÜZELTME: Eğer userId bulduysak, frontend 'Misafir' dese bile İPTAL ET ve Üye yap!
    if (userId) {
        createOrderDto.isGuest = false;
    }

    // Eğer userId hala null ise ve cidden misafir değilse engelle
    if (!userId && !createOrderDto.isGuest) {
        throw new UnauthorizedException('Lütfen giriş yapın veya misafir olarak devam edin.');
    }
    
    return this.ordersService.create(userId, createOrderDto);
  }

  @UseGuards(AuthGuard('jwt')) 
  @Get('my-orders')
  findMyOrders(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.ordersService.findMyOrders(userId);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.ordersService.updateStatus(id, status);
  }

  @Patch(':id/ship')
  async shipOrder(@Param('id') id: string) {
    return this.ordersService.shipOrder(id, 'Basit Kargo');
  }
}