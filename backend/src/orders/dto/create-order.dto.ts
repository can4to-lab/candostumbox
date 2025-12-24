import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

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

  // 👇 BU İKİ ALANI EKLİYORUZ (Senin dosanda yoktu)
  @IsString()
  @IsOptional()
  deliveryPeriod?: string; 

  @IsString()
  @IsOptional()
  subscriptionId?: string; // Uzatılacak Abonelik ID'si
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  addressId: string;

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
}