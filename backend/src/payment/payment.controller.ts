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

    // 👇 DEBUG: Backend'e ne geldiğini net görelim
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
    let redirectUrl = `${FRONTEND_URL}/profil`; // Varsayılan
    
    if (result.status === 'success') {
        redirectUrl = `${FRONTEND_URL}/profil?payment=success`;
    } else {
        redirectUrl = `${FRONTEND_URL}/checkout?payment=fail&message=${encodeURIComponent(result.message || 'Ödeme başarısız')}`;
    }

    // 4. Iframe'i kırıp ana pencereyi yönlendiren temiz HTML
    const htmlTemplate = `
<!DOCTYPE html>
<html>
  <head>
     <meta charset="utf-8">
     <title>Ödeme Sonucu</title>
     <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f9fafb; margin: 0; }
        .loader-text { color: #4f46e5; font-weight: bold; font-size: 18px; text-align: center; }
     </style>
  </head>
  <body>
    <div class="loader-text">Ödeme sonucu işleniyor, ana sayfaya yönlendiriliyorsunuz...</div>
    <script>
      // Iframe'i kır ve ana pencereyi yönlendir
      if (window.top) {
        window.top.location.href = "${redirectUrl}";
      } else {
        window.location.href = "${redirectUrl}";
      }
    </script>
  </body>
</html>
`;

    // 5. HTML'i gönder
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(htmlTemplate);
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