import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Auth guard yolunu kontrol et

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Yorum Yap (Sadece giriş yapmış kullanıcılar)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.userId, createReviewDto);
  }

  // Ürünün Yorumlarını Getir (Herkes görebilir)
  @Get('product/:id')
  findByProduct(@Param('id') id: string) {
    return this.reviewsService.findAllByProduct(+id);
  }

  // Son Yorumları Getir (Ana sayfa için)
  @Get('latest')
  findLatest() {
    return this.reviewsService.findLatest(6);
  }
}