import { Controller, Get, Post, Body, UseGuards, Request, Patch, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly jwtService: JwtService 
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Headers('authorization') authHeader: string) {
    let userId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = this.jwtService.verify(token);
        userId = decoded.userId || decoded.id || decoded.sub;
      } catch (e) {
        console.log("Token doğrulaması başarısız:", e.message);
      }
    }
    if (!userId && !createOrderDto.isGuest) {
        throw new UnauthorizedException('Lütfen giriş yapın veya misafir olarak devam edin.');
    }
    return this.ordersService.create(userId, createOrderDto);
  }

  @UseGuards(AuthGuard('jwt')) 
  @Get('my-orders')
  findMyOrders(@Request() req) {
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

  // ✅ KARGO ROTASI EKLENDİ (Frontend hatasını çözer)
  @Patch(':id/ship')
  async shipOrder(@Param('id') id: string) {
    return this.ordersService.shipOrder(id, 'Basit Kargo');
  }
}