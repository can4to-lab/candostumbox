import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, IsOptional, IsBoolean, IsObject } from 'class-validator';
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
}

export class CreateOrderDto {
  // 👇 Misafir siparişinde adres ID'si gelmeyeceği için OPSİYONEL yaptık
  @IsOptional() 
  @IsString()
  addressId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsOptional()
  paymentType?: 'monthly' | 'upfront';

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  petId?: string;

  // 👇 MİSAFİR ALANLARI
  @IsOptional()
  @IsBoolean()
  isGuest?: boolean;

  @IsOptional()
  @ValidateNested() // İçindeki alanları da kontrol et
  @Type(() => GuestInfoDto) // Gelen objeyi GuestInfoDto sınıfına çevir
  guestInfo?: GuestInfoDto;
}