import { Controller, Get, Post, Body, UseGuards, Request, Patch, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt'; // 👈 BU IMPORT ÖNEMLİ

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly jwtService: JwtService // 👈 Token'ı manuel kontrol etmek için servisi ekledik
  ) {}

  // 1. SİPARİŞ VER (HİBRİT KORUMA)
  // 🔓 @UseGuards(AuthGuard('jwt')) satırını kaldırdık! Artık kapı herkese açık ama içeride kontrol var.
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Headers('authorization') authHeader: string) {
    
    let userId = null;

    // A) Gelen kişide Token var mı? (Üye mi?)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // Token'ı manuel olarak doğrula ve içindeki ID'yi al
        const decoded = this.jwtService.verify(token);
        userId = decoded.userId || decoded.id || decoded.sub;
      } catch (e) {
        // Token var ama süresi dolmuş veya hatalıysa, akışı bozma; misafir gibi devam etsin mi bakarız.
        console.log("Token doğrulaması başarısız:", e.message);
      }
    }

    // B) Eğer kullanıcı Üye değilse (userId yok) VE Misafir olduğunu da belirtmemişse -> HATA VER
    // (Yani hem kimliği yok hem de misafir formunu doldurmamış)
    if (!userId && !createOrderDto.isGuest) {
        throw new UnauthorizedException('Lütfen giriş yapın veya misafir olarak devam edin.');
    }

    // C) Servise gönder (userId varsa üye siparişi, yoksa misafir siparişi olarak işlenecek)
    // Not: orders.service.ts dosyanın create metodunun (userId, createOrderDto) kabul ettiğinden emin ol.
    return this.ordersService.create(userId, createOrderDto);
  }

  // 2. SİPARİŞLERİMİ GÖR (Burası sadece üyelere özel kalmalı, dokunmuyoruz)
  @UseGuards(AuthGuard('jwt')) 
  @Get('my-orders')
  findMyOrders(@Request() req) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.ordersService.findMyOrders(userId);
  }

  // 3. ADMIN: TÜM SİPARİŞLER
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // 4. ADMIN: DURUM GÜNCELLE
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.ordersService.updateStatus(id, status);
  }
}