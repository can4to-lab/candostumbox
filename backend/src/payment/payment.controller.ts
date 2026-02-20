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
    const result = await this.paymentService.handleCallback(body);

    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://candostumbox.com';

    // JSON veya Redirect yerine, ana siteye mesaj fırlatan bir HTML döndürüyoruz
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body>
          <script>
            // Üst pencereye (senin React sitene) sonucu fısıldıyoruz
            window.parent.postMessage({
              type: 'PARAM_PAYMENT_RESULT',
              status: '${result.status}',
              orderId: '${result.orderId || ''}',
              message: '${result.message || ''}'
            }, '*');
          </script>
        </body>
      </html>
    `;

    return res.status(200).send(htmlTemplate);
  }
}