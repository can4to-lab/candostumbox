import { Controller, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // 1. Ödeme Başlatma
  @Post('start')
  async startPayment(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    // Gerçek kullanıcı IP'sini al (Render/Proxy için önemlidir)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    const result = await this.paymentService.startPayment({ ...body, ip });

    if (result.status === 'success') {
      return res.status(HttpStatus.OK).json(result);
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
  }

  // 2. ParamPOS Sonuç Dönüşü (Callback)
  @Post('callback')
  async callback(@Body() body: any, @Res() res: Response) {
    const result = await this.paymentService.handleCallback(body);

    // 🔴 DİKKAT: Buraya CANLI FRONTEND (Site) adresini yaz!
    // Sonu '/' ile bitmesin.
    const frontendUrl = 'https://candostumbox.com'; 

    if (result.status === 'success') {
      // Başarılı ise Teşekkür Sayfasına git
      return res.redirect(`${frontendUrl}/payment/success`);
    } else {
      // Hata ise Checkout'a geri dön ve hata göster
      return res.redirect(`${frontendUrl}/checkout?status=fail`);
    }
  }
}