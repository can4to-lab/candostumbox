import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import axios from 'axios';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('🔍 KONTROL EDİLİYOR -> DATABASE_URL:', process.env.DATABASE_URL);
  console.log("🚀🚀🚀 DİKKAT: YENİ KODLAR NİHAYET RENDER'A ULAŞTI! 🚀🚀🚀");

  // 👇 1. İLETİŞİM İZNİ (CORS) - ÖNCE BUNU YAZIYORUZ
  app.enableCors({
    origin: [
      'https://www.candostumbox.com',
      'https://candostumbox.com',
      'http://localhost:3000'
    ],
    // DİKKAT: OPTIONS metodu eklendi! (Preflight hatasını çözer)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', 
    credentials: true, 
  });

  // 👇 2. GÜVENLİK DUVARI (Helmet) - CORS'U EZMEMESİ İÇİN YUMUŞATILDI
  app.use(helmet({
    crossOriginResourcePolicy: false, // Tarayıcının CORS'u engellemesini önler
  }));

  // SUNUCU IP ADRESİNİ ÖĞRENME
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    console.log("========================================");
    console.log(`🔥 SUNUCU ÇIKIŞ IP ADRESİ: ${response.data.ip}`);
    console.log("========================================");
  } catch (error) {
    console.error("IP Adresi alınamadı:", error.message);
  }

  // VERİ KONTROLÜ
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true, 
    }),
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();