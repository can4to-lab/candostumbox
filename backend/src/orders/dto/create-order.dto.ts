import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// Misafir Bilgileri İçin DTO
export class GuestInfoDto {
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsString() @IsNotEmpty() email: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() district: string;
  @IsString() @IsNotEmpty() fullAddress: string;

  @IsString() 
  @IsOptional() 
  title?: string;
}

export class OrderItemDto {
  @IsString() 
  @IsNotEmpty()
  productId: string;

  // 👇 1. EKLEME: Frontend'den gelen fiyatı alabilmek için eklendi
  @IsNumber()
  @IsOptional()
  price?: number; 

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  deliveryPeriod?: string; 
  
  @IsString()
  @IsOptional()
  subscriptionId?: string;

  // 👇 GÜNCELLEME 1: Pet ID ve Upgrade ID Eklendi
  @IsOptional()
  @IsString() // <--- UUID string olduğu için burası String olmalı
  petId?: string; 

  // 👇 MİSAFİR PET BİLGİLERİ İÇİN EKLENDİ
  @IsOptional() @IsString() petName?: string;
  @IsOptional() @IsString() petType?: string;
  @IsOptional() @IsString() petBreed?: string;
  @IsOptional() @IsString() petBirthDate?: string;
  @IsOptional() @IsString() petWeight?: string;
  @IsOptional() @IsBoolean() petIsNeutered?: boolean;
  @IsOptional() @IsString() petAllergies?: string;

  @IsString()
  @IsOptional()
  upgradeFromSubId?: string;
}

export class CreateOrderDto {
  @IsOptional() 
  @IsString()
  addressId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  // 👇 2. DÜZELTME: 'monthly' | 'upfront' kısıtlaması kaldırılıp sadece esnek string yapıldı
  @IsString()
  @IsOptional()
  paymentType?: string; 

  // Eğer sipariş genelinde tek bir pet varsa diye opsiyonel bırakıyoruz (ama genelde items içinden gelir)
  @IsOptional()
  petId?: any; 

  @IsOptional()
  @IsBoolean()
  isGuest?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => GuestInfoDto)
  guestInfo?: GuestInfoDto;
}