import { Controller, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('start')
  async startPayment(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    // Gerçek IP adresini al
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const clientIp = Array.isArray(ip) ? ip[0] : ip;

    const result = await this.paymentService.startPayment({ ...body, ip: clientIp });

    if (result.status === 'success') {
      return res.status(HttpStatus.OK).json(result);
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
  }

  @Post('callback')
  async callback(@Body() body: any, @Res() res: Response) {
    const result = await this.paymentService.handleCallback(body);

    // .env'den Frontend adresini al veya manuel yaz
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://candostumbox.com';

    if (result.status === 'success') {
      return res.redirect(`${FRONTEND_URL}/payment/success`);
    } else {
      const errorMsg = encodeURIComponent(result.message || 'Ödeme başarısız');
      return res.redirect(`${FRONTEND_URL}/checkout?status=fail&msg=${errorMsg}`);
    }
  }
}