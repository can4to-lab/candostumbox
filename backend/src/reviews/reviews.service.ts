import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(userId: any, createReviewDto: CreateReviewDto) { // userId tipini 'any' veya 'string' yap
    const { productId, rating, comment } = createReviewDto;

    // HATA ÇÖZÜMÜ 1: ID Tipi
    // Eğer productId number geliyorsa ama DB string bekliyorsa, TypeORM'un "where" koşulunu düzeltelim.
    // 'Any' kullanarak TypeScript kontrolünü aşıyoruz (veya String(productId) kullanabilirsin).
    const product = await this.productRepository.findOne({ 
        where: { id: productId as any } 
    });
    
    if (!product) throw new NotFoundException('Ürün bulunamadı.');

    // HATA ÇÖZÜMÜ 2: User Casting
    // TypeScript "bu obje tam User değil" diyor. "as unknown as User" diyerek zorluyoruz.
    const review = this.reviewRepository.create({
      rating,
      comment,
      product,
      user: { id: userId } as unknown as User, 
      isApproved: true, 
    });

    return await this.reviewRepository.save(review);
  }

  async findAllByProduct(productId: number) {
    return await this.reviewRepository.find({
      // HATA ÇÖZÜMÜ 3: İlişki sorgusunda ID tipi
      where: { 
          product: { id: productId as any }, 
          isApproved: true 
      },
      relations: ['user'], 
      order: { createdAt: 'DESC' },
    });
  }

  async findLatest(limit: number = 5) {
    return await this.reviewRepository.find({
      where: { isApproved: true },
      relations: ['user', 'product'], 
      order: { createdAt: 'DESC' },
      take: limit
    });
  }
}