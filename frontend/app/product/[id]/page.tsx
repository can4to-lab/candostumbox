// "use client" YOK - Bu bir Server Component

import ProductClient from "./ProductClient"; // Az önce oluşturduğumuz dosyayı import ediyoruz

// Statik parametreleri üretme fonksiyonu (Sunucuda çalışır)
export async function generateStaticParams() {
  try {
    const res = await fetch("https://candostumbox-api.onrender.com/products");
    
    if (!res.ok) return [];

    const products = await res.json();

    return products.map((product: { id: number }) => ({
      id: product.id.toString(),
    }));

  } catch (error) {
    console.error("Build sırasında ürünler çekilemedi:", error);
    return [];
  }
}

// Ana Sayfa Bileşeni - Client Component'i render eder
export default function ProductPage() {
  return <ProductClient />;
}