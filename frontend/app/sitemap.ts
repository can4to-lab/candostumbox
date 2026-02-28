import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Varsayılan ana sayfa haritamız (www eklenmiş haliyle)
  const defaultRoutes: MetadataRoute.Sitemap = [
    {
      url: 'https://www.candostumbox.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  try {
    // Tüm ürünleri çekmeye çalışalım
    const res = await fetch('https://api.candostumbox.com/products');
    const products = await res.json();

    // GÜVENLİK AĞI: Eğer gelen veri bir liste değilse sistemi çökertme!
    if (!Array.isArray(products)) {
      return defaultRoutes;
    }

    // Eğer ürünler başarıyla geldiyse listele (www ile)
    const productUrls: MetadataRoute.Sitemap = products.map((product: any) => ({
      url: `https://www.candostumbox.com/product/${product.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...defaultRoutes, ...productUrls];
    
  } catch (error) {
    // API kapalıysa sistemi çökertme, sadece ana sayfayı döndür
    return defaultRoutes;
  }
}