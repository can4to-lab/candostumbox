import { SetMetadata } from '@nestjs/common';

// 👇 BU SATIR ÇOK ÖNEMLİ (Guard bunu import ediyor)
export const ROLES_KEY = 'roles';

// Decorator'ı da bu anahtarı kullanacak şekilde güncelliyoruz
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);