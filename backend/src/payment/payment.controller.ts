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
    // 1. İşlemi service katmanında işle (Kritik: result değişkeni burada tanımlı!)
    const result = await this.paymentService.handleCallback(body);

    // 2. URL adresini www ile garantiye alıyoruz
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.candostumbox.com';

    // 3. Başarılı ve Başarısız durumlarına göre gidilecek sayfalar
    let redirectUrl = `${FRONTEND_URL}/profil`; // Varsayılan
    
    if (result.status === 'success') {
        // Ödeme başarılıysa doğrudan profil sayfasına (Siparişlerim kısmını görür)
        redirectUrl = `${FRONTEND_URL}/profil?payment=success`;
    } else {
        // Ödeme başarısızsa sepetiniz olmadığı için checkout sayfasına at
        redirectUrl = `${FRONTEND_URL}/checkout?payment=fail`;
    }

    // 4. JSON veya postMessage yerine, iframe'i kırıp ana pencereyi yönlendiren HTML döndürüyoruz
    // 👇👇👇 Backtick (`) işaretlerine ve scope yapısına dikkat! 👇👇👇
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
          <div class="loader-text">Ödeme işleniyor, lütfen bekleyin... 🚀</div>
          <script>
            // İşte Sihirli Kod: iframe'i kırıp ana tarayıcı penceresini yönlendirir!
            window.top.location.href = "${redirectUrl}";
          </script>
        </body>
      </html>
    `; 
    // 👆👆👆 Bu backtick'lerin kapandığından emin ol 👆👆👆

    // 5. HTML'i gönder
    return res.status(200).send(htmlTemplate);
  }

  // Taksit Sorgulama Ucu (Frontend buradan istek atacak)
  @Post('installments')
  async getInstallments(@Body() body: { bin: string; amount: number }) {
    if (!body.bin || body.bin.length < 6) {
      return { status: 'error', message: 'Geçersiz BIN kodu' };
    }
    return this.paymentService.getInstallments(body.bin, body.amount);
  }
}    let redirectUrl = `${FRONTEND_URL}/profil`; // Varsayılan
    
    if (result.status === 'success') {
        // Ödeme başarılıysa doğrudan profil sayfasına (Siparişlerim kısmını görür)
        redirectUrl = `${FRONTEND_URL}/profil?payment=success`;
    } else {
        // Ödeme başarısızsa müşteriyi checkout sayfasına at
        redirectUrl = `${FRONTEND_URL}/checkout?payment=fail`;
    }

    // JSON veya postMessage yerine, iframe'i kırıp ana pencereyi yönlendiren HTML döndürüyoruz
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
          <div class="loader-text">Ödeme işleniyor, lütfen bekleyin... 🚀</div>
          <script>
            // İşte Sihirli Kod: iframe'i kırıp ana tarayıcı penceresini yönlendirir!
            window.top.location.href = "${redirectUrl}";
          </script>
        </body>
      </html>
    `;

    return res.status(200).send(htmlTemplate);
  }

  // Taksit Sorgulama Ucu (Frontend buradan istek atacak)
  @Post('installments')
  async getInstallments(@Body() body: { bin: string; amount: number }) {
    if (!body.bin || body.bin.length < 6) {
      return { status: 'error', message: 'Geçersiz BIN kodu' };
    }
    return this.paymentService.getInstallments(body.bin, body.amount);
  }
  }      `<!DOCTYPE html>
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
  // Taksit Sorgulama Ucu (Frontend buradan istek atacak)
  @Post('installments')
  async getInstallments(@Body() body: { bin: string; amount: number }) {
    if (!body.bin || body.bin.length < 6) {
      return { status: 'error', message: 'Geçersiz BIN kodu' };
    }
    return this.paymentService.getInstallments(body.bin, body.amount);
  }
}
