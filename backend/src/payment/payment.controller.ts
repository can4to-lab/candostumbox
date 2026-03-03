import { Controller, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('start')
  async startPayment(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const clientIp = Array.isArray(ip) ? ip[0] : ip;

    console.log("📥 BACKEND ALDI (Controller):", JSON.stringify(body));

    const result = await this.paymentService.startPayment({ 
        ...body, 
        ip: clientIp 
    });

    if (result.status === 'success') {
      return res.status(HttpStatus.OK).json(result);
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json(result);
    }
  }

  @Post('callback')
  async callback(@Body() body: any, @Res() res: Response) {
    // 1. İşlemi service katmanında işle
    const result = await this.paymentService.handleCallback(body);

    // 2. URL adresini env'den al veya varsayılanı kullan
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.candostumbox.com';

    // 3. Yönlendirilecek URL'i belirle
    let redirectUrl = `${FRONTEND_URL}/profil`; // Fallback (Varsayılan)
    
    if (result.status === 'success') {
        redirectUrl = `${FRONTEND_URL}/payment/success?orderId=${result.orderId}`;
    } else {
        // Hata durumunda checkout'a geri at
        redirectUrl = `${FRONTEND_URL}/checkout?payment=fail&message=${encodeURIComponent(result.message || 'Ödeme başarısız')}`;
    }

    // 4. 👇 SİHİRLİ DOKUNUŞ: Iframe olmadığı için HTML ile uğraşmıyoruz. 
    // Express'in yerleşik redirect fonksiyonu ile anında Frontend'e fırlatıyoruz!
    return res.redirect(redirectUrl);
  }

  // Taksit Sorgulama Ucu
  @Post('installments')
  async getInstallments(@Body() body: { bin: string; amount: number }) {
    if (!body.bin || body.bin.length < 6) {
      return { status: 'error', message: 'Geçersiz BIN kodu' };
    }
    return this.paymentService.getInstallments(body.bin, body.amount);
  }
}