import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 👈 EKLENDİ
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity'; // 👈 EKLENDİ

@Module({
  imports: [
    // 👇 BU SATIR EKSİKTİ, O YÜZDEN HATA VERİYORDU
    TypeOrmModule.forFeature([Product]), 
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule {}