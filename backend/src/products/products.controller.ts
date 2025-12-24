import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
// Eğer bu dosyalar henüz yoksa hata verebilir, şimdilik yorum satırı yapabilir veya oluşturduysanız açabilirsiniz:
// import { RolesGuard } from '../auth/guards/roles.guard'; 
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // 1. TÜM LİSTEYİ GETİR
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // 2. TEK ÜRÜN GETİR
  @Get(':id')
  findOne(@Param('id') id: string) {
    // 👇 DÜZELTME: +id yerine id (UUID String)
    return this.productsService.findOne(id);
  }

  // 3. YENİ ÜRÜN EKLE (Admin)
  @UseGuards(AuthGuard('jwt')) // Şimdilik sadece giriş yapılmış mı diye bakalım
  @Post()
  create(@Body() body: any) { 
    return this.productsService.create(body);
  }

  // 4. ÜRÜN GÜNCELLE (Admin)
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    // 👇 DÜZELTME: +id yerine id
    return this.productsService.update(id, body);
  }

  // 5. ÜRÜN SİL (Admin)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    // 👇 DÜZELTME: +id yerine id
    return this.productsService.remove(id);
  }
}