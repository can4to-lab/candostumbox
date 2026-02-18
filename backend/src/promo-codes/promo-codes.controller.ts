import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly promoService: PromoCodesService) {}

  // HERKESE AÇIK: Kod Doğrulama
  @Post('validate')
  validate(@Body() body: { code: string; basketAmount: number }) {
    return this.promoService.validateCode(body.code, body.basketAmount);
  }

  // SADECE ADMIN: Kod Yönetimi
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() { return this.promoService.findAll(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() data: any) { return this.promoService.create(data); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) { return this.promoService.remove(id); }
}