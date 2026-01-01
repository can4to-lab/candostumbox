import { Controller, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Frontend bu adrese istek atıp Token alacak
  @Post('start')
  async startPayment(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    // Gerçek IP adresini al (Render/Proxy arkasında x-forwarded-for kullanılır)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Servise IP'yi de gönderiyoruz
    const result = await this.paymentService.startPayment({ ...body, ip });

    if (result.status === 'success') {
      return res.status(HttpStatus.OK).json(result);
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
  }

  // PayTR buraya sonuç bildirir (Webhook)
  @Post('callback')
  async callback(@Body() body: any) {
    return this.paymentService.handleCallback(body);
  }
}