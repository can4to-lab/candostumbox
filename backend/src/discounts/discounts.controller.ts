import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
// import { AdminGuard } from '...'; // İleride Admin koruması eklenecek

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  findAll() {
    return this.discountsService.findAll();
  }

  // Örn: { "duration": 12, "percentage": 25 } gönderince günceller
  @Put()
  update(@Body() body: { duration: number; percentage: number }) {
    return this.discountsService.update(body.duration, body.percentage);
  }
}