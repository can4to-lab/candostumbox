import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductType } from './entities/product.entity'; // 👈 ProductType eklendi

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

  async findAll() {
    return this.productRepository.find({
      order: { createdAt: 'ASC' } as any,
      relations: ['category'], 
    });
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Ürün bulunamadı (ID: ${id})`);
    return product;
  }

  // 🚀 GÜNCELLENDİ: Artık ürün tipini de (Abonelik/Perakende) kaydediyor
  async create(data: any) {
    let slug = this.generateSlug(data.name);
    
    // Slug çakışması önleme
    const existing = await this.productRepository.findOne({ where: { slug } });
    if (existing) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const newProduct = this.productRepository.create({
        type: data.type || 'SUBSCRIPTION',
        category: data.categoryId ? { id: data.categoryId } : null,
        name: data.name,
        slug: slug,
        description: data.description ,
        image: data.image,
        price: parseFloat(data.price),
        // 👇 YENİ: İndirimli fiyat varsa kaydet, yoksa null bırak
        discountedPrice: data.discountedPrice ? parseFloat(data.discountedPrice) : null,
        stock: parseInt(data.stock) || 100,
        features: data.features || [],
        isVisible: data.isVisible !== undefined ? data.isVisible : true,
    });

    return this.productRepository.save(newProduct);
  }

  // 🚀 GÜNCELLENDİ: Ürün tipini güncelleyebilme eklendi
  async update(id: string, data: any) {

    //Silinecek
    console.log(`📥 GÜNCELLEME İÇİN GELEN VERİ (ID: ${id}):`, data);

    const product = await this.findOne(id); 

    const updatedProduct = this.productRepository.merge(product, {
        type: data.type,
        category: data.categoryId ? { id: data.categoryId } : null,
        name: data.name,
        description: data.description,
        image: data.image,
        price: data.price !== undefined ? parseFloat(data.price) : undefined,
        // 👇 YENİ: İndirimli fiyatı güncelle
        discountedPrice: data.discountedPrice !== undefined ? (data.discountedPrice ? parseFloat(data.discountedPrice) : null) : undefined,
        stock: data.stock !== undefined ? parseInt(data.stock) : undefined,
        features: data.features,
        isVisible: data.isVisible
    });
    
    // Silinecek
    console.log("💾 SQL'E YAZILACAK SON HALİ:", updatedProduct);

    return this.productRepository.save(updatedProduct);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    return this.productRepository.remove(product);
  }
}