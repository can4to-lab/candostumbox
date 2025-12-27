"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// --- TİP TANIMI (PostgreSQL Uyumlu) ---
interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  stock: number;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams(); // URL'deki [id] parametresini alır
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // --- ID KONTROLÜ VE VERİ ÇEKME ---
  useEffect(() => {
    // ID'nin varlığını ve sayısal olup olmadığını kontrol et
    const productId = params?.id;
    
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        // API isteği
        const res = await fetch(`https://candostumbox-api.onrender.com/products/${productId}`, {
            cache: "no-store" 
        });

        if (!res.ok) {
            if (res.status === 404) throw new Error("Ürün bulunamadı.");
            throw new Error("Sunucu hatası oluştu.");
        }

        const data = await res.json();
        
        // Gelen veriyi güvenli hale getir (Type Safety)
        const safeData: Product = {
            ...data,
            price: Number(data.price), // PostgreSQL decimal gelebilir, number'a zorla
            stock: Number(data.stock)  // PostgreSQL int gelebilir
        };

        setProduct(safeData);
      } catch (err: any) {
        setError(err.message || "Bir hata oluştu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params]);

  // --- SEPETE EKLEME (Örnek Fonksiyon) ---
  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock <= 0) {
        alert("Üzgünüz, bu ürün stokta yok.");
        return;
    }
    // Buraya Context veya Redux işlemi gelecek
    alert(`"${product.name}" sepete eklendi! (Demo)`);
  };

  // --- YÜKLENİYOR ---
  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <div className="text-green-600 font-bold animate-pulse">Ürün bilgileri yükleniyor...</div>
    </div>
  );

  // --- HATA DURUMU ---
  if (error || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ops! Bir sorun var.</h1>
        <p className="text-gray-500 mb-6">{error || "Aradığınız ürün mevcut değil veya silinmiş."}</p>
        <button onClick={() => router.back()} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg">
            ← Geri Dön
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-20">
      
      {/* --- HEADER (Basitleştirilmiş) --- */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-green-700 font-bold transition">
                <span>←</span>
                <span>Listeye Dön</span>
            </button>
            <span className="font-mono text-xs text-gray-400">ID: #{product.id}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2">
                
                {/* --- SOL: GÖRSEL ALANI --- */}
                <div className="bg-gray-50 p-8 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100 relative group">
                   <div className="relative w-full aspect-square max-w-md rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-100">
                        {product.image ? (
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" 
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                <span className="text-4xl mb-2">🖼️</span>
                                <span className="text-sm font-bold">Görsel Yok</span>
                            </div>
                        )}
                        
                        {/* Stok Badge'i Resim Üzerinde */}
                        <div className="absolute top-4 left-4">
                            <StockBadge stock={product.stock} />
                        </div>
                   </div>
                </div>

                {/* --- SAĞ: DETAY ALANI --- */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                            {product.name}
                        </h1>
                        
                        {/* Fiyat Alanı */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="text-4xl font-bold text-green-700">
                                ₺{product.price.toFixed(2)}
                            </div>
                            {product.stock > 0 && (
                                <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-100">
                                    ÜCRETSİZ KARGO
                                </span>
                            )}
                        </div>

                        {/* Açıklama */}
                        <div className="prose prose-sm text-gray-600 mb-8">
                            <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wide mb-2">Paket İçeriği & Detaylar</h3>
                            <p className="leading-relaxed">
                                {product.description || "Bu ürün için henüz bir açıklama girilmemiş."}
                            </p>
                        </div>
                    </div>

                    {/* Aksiyon Butonları */}
                    <div className="mt-auto pt-8 border-t border-gray-100">
                        <div className="flex gap-4">
                             <button 
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                                className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition transform active:scale-95 flex items-center justify-center gap-3
                                    ${product.stock > 0 
                                        ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-green-200" 
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                    }`}
                             >
                                {product.stock > 0 ? (
                                    <>
                                        <span>Sepete Ekle</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </>
                                ) : (
                                    "Stokta Yok"
                                )}
                             </button>
                             
                             {/* Favori Butonu (Opsiyonel) */}
                             <button className="w-16 h-auto rounded-xl border-2 border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                             </button>
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Güvenli ödeme ve %100 müşteri memnuniyeti garantisi.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

// --- YARDIMCI KOMPONENT (Admin sayfasıyla aynı) ---
function StockBadge({ stock }: { stock: number }) {
    if (stock <= 0) return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-md">
            Tükendi
        </span>
    );
    if (stock < 5) return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-md">
            Son {stock} Ürün!
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white shadow-md">
            Stokta Var
        </span>
    );
}