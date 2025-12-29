import { Controller, Post, Body, UseGuards, Request, Delete, Param, Patch, Get } from '@nestjs/common';
import { UsersService } from './users.service';

// 👇 DÜZELTME 1: Guard'ı artık doğru dosyadan çağırıyoruz
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. PET EKLE
  @Post('pets')
  addPet(@Request() req, @Body() body: any) {
    // req.user.userId zaten string (UUID)
    return this.usersService.addPet(req.user.userId, body);
  }

  // 2. PET SİL
  @Delete('pets/:id')
  removePet(@Request() req, @Param('id') id: string) {
    // 👇 DÜZELTME 2: +id yerine id (UUID string olduğu için sayıya çevirmiyoruz)
    return this.usersService.removePet(req.user.userId, id);
  }

  // 3. PET GÜNCELLE
  @Patch('pets/:id')
  updatePet(@Request() req, @Param('id') id: string, @Body() body: any) {
    // 👇 DÜZELTME 3: +id yerine id
    return this.usersService.updatePet(req.user.userId, id, body);
  }

  // 4. ADRES EKLE
  @Post('addresses')
  addAddress(@Request() req, @Body() body: any) {
    return this.usersService.addAddress(req.user.userId, body);
  }

  // 5. ADRES SİL
  @Delete('addresses/:id')
  removeAddress(@Request() req, @Param('id') id: string) {
    // 👇 DÜZELTME 4: +id yerine id
    return this.usersService.removeAddress(req.user.userId, id);
  }

  // 6. PROFİL GÜNCELLE
  @Patch('profile')
  updateProfile(@Request() req, @Body() body: any) {
    return this.usersService.updateProfile(req.user.userId, body);
  }

  // 7. ŞİFRE DEĞİŞTİR
  @Patch('change-password')
  changePassword(@Request() req, @Body() body: any) {
    return this.usersService.changePassword(req.user.userId, body);
  }

  // 8. ADRES GÜNCELLE
  @Patch('addresses/:id')
  updateAddress(@Request() req, @Param('id') id: string, @Body() body: any) {
    // 👇 DÜZELTME 5: +id yerine id
    return this.usersService.updateAddress(req.user.userId, id, body);
  }

  // LİSTELEME
  @Get('pets')
  findMyPets(@Request() req) {
      return this.usersService.findMyPets(req.user.userId);
  }

  @Get('addresses')
  findMyAddresses(@Request() req) {
      return this.usersService.findMyAddresses(req.user.userId);
  }
  // ... diğer kodların altına ...

  // 👇 EKSİK OLAN KISIM BURASIYDI
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
