import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [ConfigModule], // Sadece ConfigModule yeterli, karmaşık ayarlara veda ettik!
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}