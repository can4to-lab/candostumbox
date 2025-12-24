import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

// Entity'leri import ediyoruz
import { User } from './entities/user.entity';
import { Address } from '../addresses/entities/address.entity';
import { Pet } from '../pets/entities/pet.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';

@Module({
  imports: [
    // 👇 TypeORM'a bu modülde hangi tabloları kullanacağımızı söylüyoruz
    TypeOrmModule.forFeature([User, Address, Pet, Subscription])
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Başka modüller UsersService'i kullanabilsin diye
})
export class UsersModule {}