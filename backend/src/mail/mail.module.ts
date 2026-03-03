import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Global()
@Module({
  imports: [ConfigModule], // Sadece ConfigModule yeterli, karmaşık ayarlara veda ettik!
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}