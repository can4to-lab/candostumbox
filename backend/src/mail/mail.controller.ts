import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('contact')
  async handleContactForm(@Body() body: { name: string; email: string; subject: string; message: string }) {
    // 1. Gelen verilerin boş olup olmadığını kontrol et (Güvenlik)
    if (!body.name || !body.email || !body.subject || !body.message) {
      throw new HttpException('Lütfen tüm alanları doldurun.', HttpStatus.BAD_REQUEST);
    }

    try {
      // 2. Mail servisini çağır ve admin'e mesajı ilet
      await this.mailService.sendContactMessage(body.name, body.email, body.subject, body.message);
      
      // 3. Frontend'e başarılı cevabı dön
      return { status: 'success', message: 'Mesajınız başarıyla iletildi.' };
    } catch (error) {
      throw new HttpException('Mesaj gönderilirken bir hata oluştu.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}