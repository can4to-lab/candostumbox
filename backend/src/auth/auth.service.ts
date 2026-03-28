import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  // 1. MÜŞTERİ KAYDI
  async signup(data: any) {
    const { 
        email, password, name, 
        firstName: incomingFirstName, 
        lastName: incomingLastName,
        phone, gender, userBirthDate, tcKimlikNo
    } = data;
    const normalizedEmail = email.toLowerCase().trim();
    
    const existingUser = await this.userRepository.findOne({ where: { email: normalizedEmail } });
    if (existingUser) throw new BadRequestException('Bu e-posta adresi zaten kullanımda.');
    
    // Şifre boş gönderilmişse hata fırlat (Güvenlik)
    if (!password) throw new BadRequestException('Şifre alanı zorunludur.');
    const hashedPassword = await bcrypt.hash(password, 10);

    let firstName = incomingFirstName || "";
    let lastName = incomingLastName || "";

    if (!firstName && name) {
      const parts = name.trim().split(' ');
      if (parts.length > 1) {
        lastName = parts.pop();         
        firstName = parts.join(' ');    
      } else {
        firstName = parts[0];
      }
    }

    const newUser = this.userRepository.create({
        email: normalizedEmail,
        password: hashedPassword,
        firstName: firstName || "İsimsiz", 
        lastName: lastName || "",
        phone: phone || "",
        gender,
        userBirthDate: userBirthDate ? new Date(userBirthDate) : undefined,
        tcKimlikNo: tcKimlikNo,
        role: UserRole.CUSTOMER // Varsayılan rolü açıkça belirtiyoruz
    });

    try {
        const savedUser = await this.userRepository.save(newUser);
        
        this.mailService.sendWelcomeEmail(savedUser.email, savedUser.firstName)
            .then(() => console.log("✅ Hoş geldin maili başarıyla gönderildi: ", savedUser.email))
            .catch((err) => console.error("⚠️ Mail gönderim hatası:", err.message));
        
        // 👇 DÜZELTME: Token içine kullanıcının veritabanındaki GERÇEK rolünü koyuyoruz
        const payload = { sub: savedUser.id, email: savedUser.email, type: savedUser.role };
        
        return {
            message: 'Kayıt başarılı',
            access_token: this.jwtService.sign(payload),
            user: {
                id: savedUser.id,
                name: `${savedUser.firstName} ${savedUser.lastName}`.trim(),
                email: savedUser.email,
                role: savedUser.role
            }
        };
    } catch (error) {
        console.error("Kayıt Hatası:", error);
        throw new InternalServerErrorException('Kayıt oluşturulurken sistemsel bir hata oluştu.');
    }
  }

  // 2. MÜŞTERİ GİRİŞİ
  async login(data: { email: string; password: string }) {
    const { email, password } = data;
    const user = await this.userRepository.findOne({ where: { email: email.toLowerCase().trim() } });
    
    // 👇 DÜZELTME: Sadece user yoksa değil, user'ın şifresi db'de yoksa da engelle (Login Bypass Önlemi)
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    // 👇 DÜZELTME: Statik 'customer' yazısı kaldırıldı, DB rolü kullanılıyor.
    const payload = { sub: user.id, email: user.email, type: user.role };
    return {
      message: 'Giriş başarılı',
      access_token: this.jwtService.sign(payload),
    };
  }

 // 3. ADMİN GİRİŞİ
  async adminLogin(data: { email: string; password: string }) {
    const { email, password } = data;
    const user = await this.userRepository.findOne({ where: { email: email.toLowerCase().trim() } });
    
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
       throw new UnauthorizedException('Giriş bilgileri hatalı.');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Bu panele giriş yetkiniz bulunmamaktadır.');
    }

    const payload = { sub: user.id, email: user.email, type: user.role };
    
    return {
      message: 'Admin girişi başarılı',
      access_token: this.jwtService.sign(payload),
    };
  }

  // 4. PROFİL BİLGİLERİNİ GETİR
  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      // 👇 DÜZELTME: Aşırı veri çekme (Over-fetching) engellendi. Sadece temel ilişkiler çekiliyor.
      relations: ['pets', 'addresses'] 
    });

    if (!user) throw new UnauthorizedException('Kullanıcı bulunamadı.');

    const { password, ...result } = user;
    
    return {
        ...result,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Değerli Müşterimiz'
    };
  }

  // 5. ADMIN PROFİLİ
  async getAdminProfile(adminId: string) {
    return this.getProfile(adminId);
  }

  // 6. ŞİFRE SIFIRLAMA TALEBİ
  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userRepository.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return { message: 'Eğer bu e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderilmiştir.' };
    }

    const secret = this.configService.get<string>('JWT_SECRET') + user.password;
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, purpose: 'reset-password' },
      { secret: secret, expiresIn: '15m' } 
    );

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://www.candostumbox.com';
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}&id=${user.id}`;

    this.mailService.sendPasswordResetEmail(user.email, user.firstName, resetLink).catch(err => {
      console.error("Şifre sıfırlama maili gönderilemedi:", err);
    });

    return { message: 'Eğer bu e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderilmiştir.' };
  }

  // 7. YENİ ŞİFREYİ BELİRLEME
  async resetPassword(userId: string, token: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new BadRequestException('Geçersiz veya süresi dolmuş bağlantı.');
    }

    const secret = this.configService.get<string>('JWT_SECRET') + user.password;

    try {
      const payload = this.jwtService.verify(token, { secret });
      
      if (payload.purpose !== 'reset-password') {
        throw new Error('Geçersiz token amacı');
      }
    } catch (error) {
      throw new BadRequestException('Geçersiz veya süresi dolmuş bağlantı. Lütfen tekrar sıfırlama talebinde bulunun.');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.' };
  }
}