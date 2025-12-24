import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
// Guard yolunuzu kontrol edin, aşağıdakilerden biri olmalı:
import { JwtAuthGuard } from './jwt-auth.guard'; 

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 1. Kayıt Ol
  @Post('signup')
  signup(@Body() body: any) {
    return this.authService.signup(body);
  }

  // 2. Müşteri Girişi
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  // 3. Admin Girişi
  @Post('admin/login')
  adminLogin(@Body() body: { email: string; password: string }) {
    return this.authService.adminLogin(body);
  }

  // 4. Profil Bilgisi
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    const { userId, type } = req.user;

    // 👇 DÜZELTME: Number() kaldırıldı, userId olduğu gibi (string) gönderiliyor
    if (type === 'admin') {
        return this.authService.getAdminProfile(userId);
    }

    return this.authService.getProfile(userId);
  }
}