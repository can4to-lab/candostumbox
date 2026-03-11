import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePetDto {
  @IsString() name: string;
  @IsString() type: string;
  @IsOptional() @IsString() breed?: string;
  @IsOptional() @IsString() weight?: string;
  @IsOptional() @IsString() birthDate?: string;
  
  // 👇 İŞTE KRİTİK EKLENMESİ GEREKEN ALAN
  @IsOptional()
  @IsString()
  gender?: string; 

  @IsOptional() @IsBoolean() isNeutered?: boolean;
  @IsOptional() @IsString({ each: true }) allergies?: string[];
}