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

  // 1. MÜŞTERİ KAYDI
  async signup(data: any) {
    const { 
        email, password, name, 
        firstName: incomingFirstName, 
        lastName: incomingLastName,
        phone, gender, userBirthDate, tcKimlikNo,
        petName, petType, petBirthDate, petWeight, petBreed, petNeutered, petAllergies,
        addrTitle, addrCity, addrDistrict, addrNeighborhood, addrStreet, addrBuilding, addrFloor, addrApartment
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

    const newUser = this.userRepository.create({
        email,
        password: hashedPassword,
        firstName: firstName || "İsimsiz", 
        lastName: lastName || "",
        phone,
        gender,
        userBirthDate: userBirthDate ? new Date(userBirthDate) : undefined,
        tcKimlikNo: tcKimlikNo,
        
        pets: [{
            name: petName,
            type: petType,
            birthDate: petBirthDate ? new Date(petBirthDate) : new Date(),
            weight: petWeight ? String(petWeight) : "0",
            breed: petBreed,
            isNeutered: petNeutered === 'true' || petNeutered === true,
            allergies: petAllergies ? (typeof petAllergies === 'string' ? petAllergies.split(',') : petAllergies) : [],
        }],
        addresses: [{
            title: addrTitle || "Ev",
            city: addrCity,
            district: addrDistrict,
            neighborhood: addrNeighborhood,
            street: addrStreet,
            buildingNo: addrBuilding,
            floor: addrFloor,
            apartmentNo: addrApartment,
            fullAddress: `${addrNeighborhood} Mah. ${addrStreet} Sok. No:${addrBuilding} D:${addrApartment} ${addrDistrict}/${addrCity}`
        }]
    });

    try {
        const savedUser = await this.userRepository.save(newUser);
        try {
             await this.mailService.sendWelcomeEmail(savedUser.email, savedUser.firstName);
             console.log("Hoş geldin maili gönderildi: ", savedUser.email);
        } catch (mailError) {
             console.error("Mail gönderim hatası:", mailError);
        }
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

    // 👇 DÜZELTİLEN KISIM: Düz string yerine Enum (UserRole.ADMIN) kullanıyoruz
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
      // 👇 BURAYA 'orders.items.pet' İLİŞKİSİ EKLENDİ
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