import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'varsayilan_gizli_anahtar',
    });
  }

  // Bu fonksiyon Token doğrulandığı an çalışır.
  async validate(payload: any) {
    console.log("🔓 Token Stratejisi (Payload):", payload); 

    return { 
        userId: payload.sub, 
        email: payload.email, 
        type: payload.type,
        role: payload.type // 👇 EKLENDİ: RolesGuard'ın aradığı 'role' bilgisi artık burada!
    };
  }
}
