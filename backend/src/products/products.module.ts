import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 👈 EKLENDİ
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity'; // 👈 EKLENDİ
import { Category } from './entities/category.entity';
import { ProductVariant } from './entities/product-variant.entity';
@Module({
  imports: [
    // 👇 BU SATIR EKSİKTİ, O YÜZDEN HATA VERİYORDU
    TypeOrmModule.forFeature([Product, Category, ProductVariant]), 
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule {}