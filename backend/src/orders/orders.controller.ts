import { Controller, Get, Post, Body, UseGuards, Request, Patch, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport'; // 👈 Bunu ekledik

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 1. SİPARİŞ VER (Artık Token zorunlu ve gerçek ID'yi okuyacak)
  @UseGuards(AuthGuard('jwt')) // 👈 KİLİDİ AÇTIK!
  @Post()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    // Token'dan gelen gerçek ID'yi alıyoruz:
    // (Passport stratejine göre id, userId veya sub olabilir, hepsini garantiye alalım)
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    
    return this.ordersService.create(userId, createOrderDto);
  }

  // 2. SİPARİŞLERİMİ GÖR
  @UseGuards(AuthGuard('jwt')) // 👈 Burayı da korumaya aldık
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