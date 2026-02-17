import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { AuthGuard } from '@nestjs/passport'; // EKLENDİ
import { RolesGuard } from '../auth/roles.guard'; // EKLENDİ
import { Roles } from '../auth/roles.decorator'; // EKLENDİ

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  findAll() {
    return this.discountsService.findAll();
  }

  // 👇 EKLENDİ: Sadece giriş yapmış Adminler erişebilir
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Put()
  update(@Body() body: { duration: number; percentage: number }) {
    return this.discountsService.update(body.duration, body.percentage);
  }
}