import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Veritabanı tohumlama (Seed) işlemi başlıyor...');

  // ==========================================
  // 1. ADMIN KULLANCISI OLUŞTUR (User Tablosuna)
  // ==========================================
  
  // Şifreyi hashliyoruz (Şifreniz: admin123)
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // upsert: Kullanıcı varsa güncelle, yoksa oluştur.
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@candostum.com' },
    update: {
        role: 'ADMIN' // Eğer kullanıcı zaten varsa, yetkisini ADMIN'e yükselt
    },
    create: {
      email: 'admin@candostum.com',
      password: hashedPassword,
      firstName: 'Süper',
      lastName: 'Yönetici',
      role: 'ADMIN', // 🔑 KRİTİK NOKTA: Rolü ADMIN olarak belirlendi
      phone: '5551112233',
    },
  });

  console.log(`✅ Admin kullanıcısı hazır: ${adminUser.email} (Şifre: admin123)`);
  // ==========================================
  // 2. BÖLÜM: ÜRÜN (PAKET) SEEDING (YENİ)
  // ==========================================
  console.log('🌱 Ürün paketleri tohumlanıyor...');

  const products = [
    {
      name: 'MiniBox',
      slug: 'mini-box',
      description: 'Küçük dostlar veya tanışmak isteyenler için ideal başlangıç paketi.',
      price: 199.90,
      image: '/images/minibox.png',
      stock: 50,
      features: ['3 Parça Ürün', '1 Adet Oyuncak', '2 Adet Ödül Maması', 'Ücretsiz Kargo']
    },
    {
      name: 'EkonomikBox',
      slug: 'ekonomik-box',
      description: 'Bütçe dostu, mutluluk dolu. Temel ihtiyaçlar ve eğlence bir arada.',
      price: 299.90,
      image: '/images/ekonomikbox.png',
      stock: 100,
      features: ['5 Parça Ürün', '2 Adet Oyuncak', '2 Adet Ödül Maması', '1 Adet Bakım Ürünü', 'Ücretsiz Kargo']
    },
    {
      name: 'PremiumBox',
      slug: 'premium-box',
      description: 'En çok tercih edilen, dopdolu macera paketi. Dostun buna bayılacak!',
      price: 449.90,
      image: '/images/premiumbox.png',
      stock: 100,
      features: ['7 Parça Ürün', '3 Adet Premium Oyuncak', '3 Adet Doğal Ödül', '1 Adet Aksesuar', 'Sürpriz Hediye']
    },
    {
      name: 'LüksBox',
      slug: 'luks-box',
      description: 'Sınırları zorlayan, sadece en iyisini isteyenler için VIP deneyim.',
      price: 799.90,
      image: '/images/luksbox.png',
      stock: 20,
      features: ['10+ Parça Ürün', 'İthal Oyuncaklar', 'Organik Mamalar', 'Kişiye Özel Tasarım', 'VIP Müşteri Hizmetleri']
    },
    {
      name: 'SokakBox',
      slug: 'sokak-box',
      description: 'Sokaktaki dostlarımız aç kalmasın. Bol miktarda besleyici mama içerir.',
      price: 150.00,
      image: '/images/sokakbox.png',
      stock: 500,
      features: ['3 KG Kuru Mama', '2 Adet Yaş Mama', 'Su Kabı', 'Sevgi Dolu']
    },
    {
      name: 'BarınakBox',
      slug: 'barinak-box',
      description: 'Seçtiğiniz bir barınağa sizin adınıza bağış olarak gönderilir.',
      price: 250.00,
      image: '/images/barinakbox.png',
      stock: 500,
      features: ['5 KG Kuru Mama', 'Toplu Gönderim', 'Bağış Sertifikası', 'İyilik Hareketi']
    }
  ];

  for (const product of products) {
    // Slug üzerinden kontrol ediyoruz, varsa tekrar eklemesin
    const exists = await prisma.product.findUnique({
      where: { slug: product.slug }
    });

    if (!exists) {
      await prisma.product.create({
        data: product
      });
      console.log(`✅ Paket Oluşturuldu: ${product.name}`);
    } else {
      console.log(`ℹ️  Zaten mevcut: ${product.name}`);
    }
  }

  console.log('🏁 Tüm tohumlama işlemleri tamamlandı!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });