import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard'; // Yorumdan çıkarıldı
import { Roles } from '../auth/roles.decorator'; // Yorumdan çıkarıldı

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // 👇 DÜZELTİLDİ: RolesGuard ve @Roles('admin') eklendi
  @UseGuards(AuthGuard('jwt'), RolesGuard) 
  @Roles('admin')
  @Post()
  create(@Body() body: any) { 
    return this.productsService.create(body);
  }

  // 👇 DÜZELTİLDİ
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.update(id, body);
  }

  // 👇 DÜZELTİLDİ
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}