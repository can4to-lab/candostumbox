import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Tüm ürünleri çekip haritaya ekleyelim
  const products = await fetch('https://api.candostumbox.com/products').then((res) => res.json());

  const productUrls = products.map((product: any) => ({
    url: `https://candostumbox.com/product/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: 'https://candostumbox.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...productUrls,
  ];
}