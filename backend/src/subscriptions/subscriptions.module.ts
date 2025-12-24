import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 👈 BU LAZIM
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscription } from './entities/subscription.entity'; // 👈 ENTITY LAZIM

@Module({
  imports: [
    // 👇 İŞTE HATAYI ÇÖZEN SATIR:
    // Bu satır sayesinde Service içinde @InjectRepository(Subscription) kullanabiliyoruz.
    TypeOrmModule.forFeature([Subscription]), 
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}