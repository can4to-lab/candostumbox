import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import axios from 'axios';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('🔍 KONTROL EDİLİYOR -> DATABASE_URL:', process.env.DATABASE_URL);
  console.log("🚀🚀🚀 DİKKAT: YENİ KODLAR NİHAYET RENDER'A ULAŞTI! 🚀🚀🚀");
  // 1. GÜVENLİK DUVARI (Helmet)
  app.use(helmet());

  // 2. İLETİŞİM İZNİ (CORS) - GÜNCELLENDİ 🛠️
  // Sadece senin yeni domainine ve localhost'a izin veriyoruz.
  app.enableCors({
    origin: [
      'https://www.candostumbox.com',            // Yeni Domainin (Ana)
      'https://candostumbox.com',                // www olmadan
      'https://candostumbox-l2dy.onrender.com',  // Eski Render adresi (Yedek)
      'http://localhost:3000'                    // Geliştirme ortamı
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Çerezler vb. için gerekli olabilir
  });
// 👇 BU KISMI EKLE: SUNUCU IP ADRESİNİ ÖĞRENME
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    console.log("========================================");
    console.log(`🔥 SUNUCU ÇIKIŞ IP ADRESİ: ${response.data.ip}`);
    console.log("========================================");
  } catch (error) {
    console.error("IP Adresi alınamadı:", error.message);
  }
  // 👆 BURAYA KADAR
  // 3. VERİ KONTROLÜ
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true, 
    }),
  );

  await app.listen(3000);
}
bootstrap();