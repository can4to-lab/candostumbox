import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';

@Global() // @Global() yaparak her modülde tekrar import etmeden kullanabiliriz.
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}