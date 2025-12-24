import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  private generateSlug(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  // 1. Tüm Ürünleri Getir
  async findAll() {
    return this.productRepository.find({
      order: { createdAt: 'ASC' } as any, // TypeORM'da id yerine createdAt sıralaması daha güvenlidir (UUID string olduğu için)
    });
  }

  // 2. TEK ÜRÜN GETİR
  async findOne(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Ürün bulunamadı (ID: ${id})`);
    }
    return product;
  }

  // 3. GÜVENLİ CREATE
  async create(data: any) {
    let slug = this.generateSlug(data.name);

    const existingProduct = await this.productRepository.findOne({ where: { slug } });
    if (existingProduct) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const newProduct = this.productRepository.create({
        name: data.name,
        slug: slug,
        description: data.description,
        image: data.image,
        price: parseFloat(data.price),
        stock: parseInt(data.stock) || 100,
        // order: parseInt(data.order) || 0, // Entity'de order sütunu varsa açın
        features: data.features || [], // Entity'de json veya array tipinde olmalı
        isVisible: data.isVisible !== undefined ? data.isVisible : true,
    });

    return this.productRepository.save(newProduct);
  }

  // 4. GÜVENLİ UPDATE
  async update(id: string, data: any) {
    const product = await this.findOne(id); // Varlığını kontrol et

    // TypeORM'da merge veya object spread ile güncelleme
    const updatedProduct = this.productRepository.merge(product, {
        name: data.name,
        description: data.description,
        image: data.image,
        price: data.price !== undefined ? parseFloat(data.price) : undefined,
        stock: data.stock !== undefined ? parseInt(data.stock) : undefined,
        // order: data.order !== undefined ? parseInt(data.order) : undefined,
        features: data.features,
        isVisible: data.isVisible
    });

    return this.productRepository.save(updatedProduct);
  }

  // 5. SİL
  async remove(id: string) {
    const product = await this.findOne(id);
    return this.productRepository.remove(product);
  }
}