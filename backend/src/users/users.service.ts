import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from './entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { Address } from '../addresses/entities/address.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Pet) private petRepository: Repository<Pet>,
    @InjectRepository(Address) private addressRepository: Repository<Address>,
    @InjectRepository(Subscription) private subscriptionRepository: Repository<Subscription>,
  ) {}

  // 1. YENİ PET EKLE
  async addPet(userId: string, data: any) {
    const newPet = this.petRepository.create({
        user: { id: userId } as User, // İlişkiyi ID üzerinden kuruyoruz
        name: data.name,
        type: data.type,
        birthDate: new Date(data.birthDate),
        weight: data.weight ? String(data.weight) : "0",
        breed: data.breed,
        isNeutered: data.isNeutered === 'true' || data.isNeutered === true,
        allergies: typeof data.allergies === 'string' ? data.allergies.split(',') : (data.allergies || []),
    });
    return this.petRepository.save(newPet);
  }

  // 2. PET SİL
  async removePet(userId: string, petId: string) {
    const pet = await this.petRepository.findOne({ where: { id: petId, user: { id: userId } } });
    if (!pet) throw new NotFoundException("Pet bulunamadı veya size ait değil");
    return this.petRepository.remove(pet);
  }

  // 3. YENİ ADRES EKLE
  async addAddress(userId: string, data: any) {
    const newAddress = this.addressRepository.create({
        user: { id: userId } as User,
        title: data.title,
        city: data.city,
        district: data.district,
        neighborhood: data.neighborhood,
        street: data.street,
        buildingNo: data.buildingNo,
        floor: data.floor,
        apartmentNo: data.apartmentNo,
        fullAddress: `${data.neighborhood} Mah. ${data.street} Sok. No:${data.buildingNo} D:${data.apartmentNo} ${data.district}/${data.city}`
    });
    return this.addressRepository.save(newAddress);
  }

  // 4. ADRES SİL
  async removeAddress(userId: string, addressId: string) {
    const address = await this.addressRepository.findOne({ where: { id: addressId, user: { id: userId } } });
    if (!address) throw new NotFoundException("Adres bulunamadı veya size ait değil");
    return this.addressRepository.remove(address);
  }

  // 5. TÜM KULLANICILARI GETİR (Admin)
  async findAll() {
    return this.userRepository.find({
      relations: ['pets', 'orders', 'addresses'],
      order: { createdAt: 'DESC' }
    });
  }

  // 6. ABONELİKLERİ GETİR
  async findSubscriptions(userId: string) {
    return this.subscriptionRepository.find({
      where: { user: { id: userId } },
      relations: ['pet'], // Product ilişkisi varsa 'product' da eklenmeli
      order: { createdAt: 'DESC' }
    });
  }

  // 7. PROFİL GÜNCELLE
  async updateProfile(userId: string, data: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    const updatedUser = this.userRepository.merge(user, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        tcKimlikNo: data.tcKimlikNo,
        userBirthDate: data.userBirthDate ? new Date(data.userBirthDate) : undefined,
    });

    return this.userRepository.save(updatedUser);
  }

  // 8. ŞİFRE DEĞİŞTİRME
  async changePassword(userId: string, data: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Mevcut şifreniz hatalı!');

    user.password = await bcrypt.hash(data.newPassword, 10);
    return this.userRepository.save(user);
  }

  // 9. PET GÜNCELLEME
  async updatePet(userId: string, petId: string, data: any) {
    const pet = await this.petRepository.findOne({ where: { id: petId, user: { id: userId } } });
    if (!pet) throw new NotFoundException('Evcil hayvan bulunamadı veya size ait değil.');

    const updatedPet = this.petRepository.merge(pet, {
        name: data.name,
        type: data.type,
        breed: data.breed,
        weight: data.weight ? String(data.weight) : undefined,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        isNeutered: data.isNeutered,
        allergies: data.allergies,
    });

    return this.petRepository.save(updatedPet);
  }

  // 10. ADRES GÜNCELLEME
  async updateAddress(userId: string, addressId: string, data: any) {
    const address = await this.addressRepository.findOne({ where: { id: addressId, user: { id: userId } } });
    if (!address) throw new NotFoundException('Adres bulunamadı veya size ait değil.');

    const updatedAddress = this.addressRepository.merge(address, {
        title: data.title,
        city: data.city,
        district: data.district,
        neighborhood: data.neighborhood,
        street: data.street,
        buildingNo: data.buildingNo,
        floor: data.floor,
        apartmentNo: data.apartmentNo,
        fullAddress: `${data.neighborhood} Mah. ${data.street} Sok. No:${data.buildingNo} D:${data.apartmentNo} ${data.district}/${data.city}`
    });

    return this.addressRepository.save(updatedAddress);
  }

  async findMyPets(userId: string) {
    return this.petRepository.find({ where: { user: { id: userId } } });
  }

  async findMyAddresses(userId: string) {
    return this.addressRepository.find({ where: { user: { id: userId } } });
  }

  // 👇 BU METODU EKLEYİN: Profil sayfası için detaylı kullanıcı verisi
  async findOneWithOrders(userId: string) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'pets', 
        'addresses', 
        'orders', 
        'orders.items', 
        'orders.items.product', 
        'orders.items.pet' // 👈 İŞTE BU EKSİKTİ! Artık siparişin peti de gelecek.
      ], 
      order: { 
        createdAt: 'DESC',
        orders: { createdAt: 'DESC' } 
      }
    });
  }
}