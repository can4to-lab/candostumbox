import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // 1. MÜŞTERİ KAYDI (Güncellendi: Adres ve Pet zorunluluğu kaldırıldı)
  async signup(data: any) {
    const { 
        email, password, name, 
        firstName: incomingFirstName, 
        lastName: incomingLastName,
        phone, gender, userBirthDate, tcKimlikNo
    } = data;

    // Email kontrolü
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) throw new BadRequestException('Bu email kullanımda.');

    // Şifre hashleme
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

    // YENİ YAPI: Sadece kullanıcının temel bilgilerini kaydediyoruz.
    // Adres ve Pet bilgileri sipariş aşamasında (checkout) eklenecek.
    const newUser = this.userRepository.create({
        email,
        password: hashedPassword,
        firstName: firstName || "İsimsiz", 
        lastName: lastName || "",
        phone: phone || "",
        gender,
        userBirthDate: userBirthDate ? new Date(userBirthDate) : undefined,
        tcKimlikNo: tcKimlikNo,
        // pets ve addresses dizilerini (array) tamamen kaldırdık. TypeORM bunları otomatik boş liste olarak tanımlar.
    });

   try {
    const savedUser = await this.userRepository.save(newUser);
    
    // 👇 KRİTİK DEĞİŞİKLİK BURADA: 'await' kullanmıyoruz!
    // Bu sayede NestJS maili göndermeye başlar ama bitmesini beklemeden alt satıra geçer.
    this.mailService.sendWelcomeEmail(savedUser.email, savedUser.firstName)
        .then(() => {
            console.log("Hoş geldin maili arka planda başarıyla gönderildi: ", savedUser.email);
        })
        .catch((mailError) => {
            // Mail gitmese bile kullanıcı kayıt olduğu için sadece log alıyoruz
            console.error("Mail gönderim hatası (Kullanıcı kaydı etkilenmedi):", mailError);
        });
    
    // Kullanıcıya anında cevap dönüyoruz
    const payload = { sub: savedUser.id, email: savedUser.email, type: 'customer' };
    
    return {
        message: 'Kayıt başarılı',
        access_token: this.jwtService.sign(payload),
        user: {
            id: savedUser.id,
            name: `${savedUser.firstName} ${savedUser.lastName}`.trim(),
            email: savedUser.email
        }
    };
} catch (error) {
        console.error("Kayıt Hatası:", error);
        throw new BadRequestException('Kayıt oluşturulurken bir hata oluştu.');
    }
  }

  // 2. MÜŞTERİ GİRİŞİ
  async login(data: { email: string; password: string }) {
    const { email, password } = data;
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email veya şifre hatalı.');
    }

    const payload = { sub: user.id, email: user.email, type: 'customer' };
    return {
      message: 'Giriş başarılı',
      access_token: this.jwtService.sign(payload),
    };
  }

 // 3. ADMİN GİRİŞİ
  async adminLogin(data: { email: string; password: string }) {
    const { email, password } = data;
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
       throw new UnauthorizedException('Giriş bilgileri hatalı.');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Bu panele giriş yetkiniz bulunmamaktadır.');
    }

    const payload = { sub: user.id, email: user.email, type: 'admin' };
    
    return {
      message: 'Admin girişi başarılı',
      access_token: this.jwtService.sign(payload),
    };
  }

  // 4. PROFİL BİLGİLERİNİ GETİR
  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
          'pets', 
          'addresses', 
          'orders', 
          'orders.items', 
          'orders.items.product',
          'orders.items.pet'
      ]
    });

    if (!user) throw new UnauthorizedException('Kullanıcı bulunamadı.');

    const { password, ...result } = user;
    
    return {
        ...result,
        name: `${user.firstName} ${user.lastName}`.trim()
    };
  }

  // 5. ADMIN PROFİLİ
  async getAdminProfile(adminId: string) {
    return this.getProfile(adminId);
  }
}