import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Kapıdaki tabelayı oku (Controller'daki @Roles)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Tabela yoksa geç (Herkese açık)
    if (!requiredRoles) {
      return true;
    }

    // 2. Kullanıcıyı al
    const { user } = context.switchToHttp().getRequest();

    // Kullanıcı yoksa veya rolü yoksa REDDET
    if (!user || !user.role) {
        throw new UnauthorizedException("Rol bilgisi bulunamadı.");
    }

    console.log(`🛡️ GUARD: Gerekli: ${requiredRoles} | Kullanıcı Rolü: ${user.role}`);

    // 3. DOĞRU KONTROL (user.type yerine user.role)
    // "admin", "Admin", "ADMIN" fark etmeksizin kabul etmesi için uppercase yapıyoruz.
    return requiredRoles.some((role) => user.role?.toUpperCase() === role.toUpperCase());
  }
}