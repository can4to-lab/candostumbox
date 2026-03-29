import { IsString, IsNumber, IsOptional, Min, IsUrl, isArray, IsArray, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Ürün adı metin olmalıdır.' })
  name: string;

  @IsOptional()
  @IsString()
  type?: string; // RETAIL veya SUBSCRIPTION geçebilsin

  @IsOptional()
  @IsString()
  categoryId?: string; // Kategori ID'si geçebilsin

  @IsOptional()
  @IsNumber()
  discountedPrice?: number; // İndirimli fiyat geçebilsin
  
  @IsNumber({}, { message: 'Fiyat sayı olmalıdır.' })
  @Min(0, { message: 'Fiyat 0 dan küçük olamaz.' })
  price: number;

  @IsOptional() // Zorunlu değil
  @IsString()
  description?: string;

  @IsOptional()
  @IsString() // Şimdilik string, ilerde URL kontrolü de ekleyebiliriz
  image?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
  
  // 👇 YENİ EKLENENLER
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}