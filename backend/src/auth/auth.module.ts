import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 👈 1. EKLENDİ
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity'; // 👈 2. EKLENDİ
import { JwtStrategy } from './jwt.strategy'; 
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; 
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    // 👇 İŞTE BU SATIR EKSİKTİ:
    TypeOrmModule.forFeature([User]), 

    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'varsayilan_gizli_anahtar', // .env dosyanızdaki şifreyi alır
        signOptions: { expiresIn: '1d' }, // Token süresi (1 gün)
      }),
      inject: [ConfigService],
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard], // PrismaService kaldırıldı
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}