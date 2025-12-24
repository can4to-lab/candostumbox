import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('🔍 KONTROL EDİLİYOR -> DATABASE_URL:', process.env.DATABASE_URL);
  
  // 1. GÜVENLİK DUVARI (Helmet)
  // HTTP başlıklarını düzenleyerek bilinen web açıklarını kapatır.
  app.use(helmet());

  // 2. İLETİŞİM İZNİ (CORS)
  // Sadece senin Frontend sitenin (localhost:3000 veya ilerdeki domainin) erişmesine izin verir.
  app.enableCors({
    origin: '*', // Şimdilik geliştirme aşamasında herkese açalım, canlıya geçerken buraya site adını yazacağız.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // 3. VERİ KONTROLÜ (Validation Pipe)
  // Gelen verileri DTO kurallarına göre otomatik kontrol eder.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO'da tanımlanmamış fazladan veri gelirse otomatik siler (Temizlik).
      forbidNonWhitelisted: true, // Fazladan veri gelirse hata fırlatır (Güvenlik).
    }),
  );

  await app.listen(3000);
}
bootstrap();