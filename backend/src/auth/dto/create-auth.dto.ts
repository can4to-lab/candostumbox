import { IsEmail, IsString, MinLength, IsNotEmpty, Matches } from 'class-validator';

export class CreateAuthDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Şifre alanı boş bırakılamaz.' })
  @MinLength(8, { message: 'Şifreniz en az 8 karakter olmalı.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { 
    message: 'Şifreniz çok zayıf. En az 1 büyük harf, 1 küçük harf ve 1 özel karakter/sayı içermelidir.' 
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'İsim alanı boş bırakılamaz.' })
  name: string;
}