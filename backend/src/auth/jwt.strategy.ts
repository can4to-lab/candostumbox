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
  // Return ettiği obje, Controller'larda "req.user" olarak kullanılır.
  async validate(payload: any) {
    console.log("🔓 Token Stratejisi (Payload):", payload); 

    // Veritabanı sorgusu YOK. Token ne diyorsa doğru kabul edip içeri alıyoruz.
    return { 
        userId: payload.sub, 
        email: payload.email, 
        type: payload.type // RolesGuard'ın kontrol edeceği 'admin' veya 'customer' bilgisi
    };
  }
}