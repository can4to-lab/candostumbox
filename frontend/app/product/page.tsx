"use client";
import { useState, useEffect, Suspense } from "react"; // 👈 Suspense eklendi
import { useRouter, useSearchParams } from "next/navigation"; // 👈 useSearchParams eklendi
import { Toaster } from "react-hot-toast";

// --- NAVBAR & LOGIN İÇİN GEREKLİ ---
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  features: string[]; 
  isVisible: boolean;
  order: number;
}

function ProductContent() { // 👈 İçerik ayrı bir fonksiyona alındı (Suspense için)
  const router = useRouter();
  const searchParams = useSearchParams(); // 👈 URL parametrelerini okuyoruz

  // --- UPGRADE MODU DEĞİŞKENLERİ ---
  const isUpgradeMode = searchParams.get('mode') === 'upgrade';
  const oldPrice = Number(searchParams.get('oldPrice')) || 0;
  const oldSubId = searchParams.get('oldSubId');
  const petName = searchParams.get('petName') || "Dostun";

  // --- STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth State
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // --- VERİ ÇEKME ---
  useEffect(() => {
    // 1. Kullanıcı Kontrolü
    const token = localStorage.getItem("token");
    if (token) {
        setIsLoggedIn(true);
        fetch("https://candostumbox-api.onrender.com/auth/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setUserName(data.name || "Dostum"))
        .catch(() => {});
    }

    // 2. Ürünleri Çekme
    const fetchProducts = async () => {
      try {
        const res = await fetch("https://candostumbox-api.onrender.com/products");
        const data = await res.json();
        const sortedProducts = Array.isArray(data) 
            ? data.sort((a:any, b:any) => (a.order || 0) - (b.order || 0)) 
            : [];
        setProducts(sortedProducts);
      } catch (error) {
        console.error("Paketler yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- FİLTRELEME MANTIĞI (ÖNEMLİ) 🧠 ---
  // Eğer upgrade modundaysak, sadece eski paketten daha pahalı olanları göster
  const displayedProducts = isUpgradeMode 
      ? products.filter(p => Number(p.price) > oldPrice)
      : products;

  const handleSelectPackage = (id: number) => {
      const isUpgradeMode = searchParams.get('mode') === 'upgrade';
      
      if (isUpgradeMode) {
          // Mevcut tüm parametreleri kopyala ve yeni sayfaya taşı
          const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
          router.push(`/product/${id}?${currentParams.toString()}`);
      } else {
          router.push(`/product/${id}`);
      }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans pb-20">
      <Toaster position="top-right" />

      {/* --- MODALLAR --- */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} onSwitchToRegister={() => {setLoginOpen(false); setRegisterOpen(true);}} onLoginSuccess={() => window.location.reload()} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} onSwitchToLogin={() => {setRegisterOpen(false); setLoginOpen(true);}} initialData={null} onRegisterSuccess={() => window.location.reload()} />

      {/* ================================================================== */}
      {/* 📦 HEADER BÖLÜMÜ 📦 */}
      {/* ================================================================== */}
      <div className="pt-20 pb-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 text-center">
            
            {/* 🚀 UPGRADE MODU UYARISI */}
            {isUpgradeMode ? (
                 <div className="mb-6 inline-block animate-fade-in-up">
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-2xl mx-auto shadow-sm">
                        <div className="text-4xl mb-2">🚀</div>
                        <h2 className="text-2xl font-black text-blue-900 mb-2">Paket Yükseltme Zamanı!</h2>
                        <p className="text-blue-700 font-medium">
                            <span className="font-bold">{petName}</span> için daha kapsamlı bir paket seçiyorsun. 
                            Merak etme, eski paketinden kalan tutar yeni paketinden otomatik olarak düşülecek! 💰
                        </p>
                    </div>
                 </div>
            ) : (
                <span className="inline-block py-1 px-3 rounded-full bg-green-50 text-green-600 font-bold text-xs tracking-wider uppercase mb-4 animate-fade-in-up">
                    MUTLULUK KUTULARI
                </span>
            )}

            {!isUpgradeMode && (
                <>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight animate-fade-in-up delay-100 leading-tight">
                    Dostun İçin <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">En İyisini</span> Seç
                </h1>
                <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                    Her bütçeye uygun paketlerimizle düzenli mutluluk kapında.
                </p>
                </>
            )}

            {/* GÜVEN BARI (ICONS) */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 animate-fade-in-up delay-300">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <span>🚚</span> Ücretsiz Kargo
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <span>💳</span> 12 Taksit İmkanı
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <span>🔄</span> İstediğin Zaman İptal
                </div>
            </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 📦 PAKETLER LİSTESİ 📦 */}
      {/* ================================================================== */}
      <div className="py-16 container mx-auto px-4 md:px-6">
            
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                        <span className="text-gray-500 font-bold">Paketler hazırlanıyor...</span>
                    </div>
                </div>
            )}

            {/* UPGRADE İÇİN BOŞ DURUM (DAHA PAHALI PAKET YOKSA) */}
            {!loading && isUpgradeMode && displayedProducts.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border border-gray-200">
                    <div className="text-5xl mb-4">🏆</div>
                    <h3 className="text-xl font-bold text-gray-900">Zaten Zirvedesin!</h3>
                    <p className="text-gray-500 mt-2">
                        Şu an en kapsamlı paketimizi kullanıyorsun. Daha üst bir paket bulunmuyor.
                    </p>
                    <button onClick={() => router.push('/profile')} className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold">
                        Profilime Dön
                    </button>
                </div>
            )}

            {/* PAKETLER GRID */}
            {!loading && displayedProducts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {displayedProducts.map((product) => {
                        const isPopular = product.name.toLowerCase().includes('premium') || product.name.toLowerCase().includes('süper') || product.order === 2;
                        const hasStock = product.stock > 0;

                        return (
                            <div 
                                key={product.id} 
                                className={`relative flex flex-col transition-all duration-500 group rounded-[2rem] overflow-hidden
                                    ${!hasStock ? 'grayscale opacity-70' : ''}
                                    ${isPopular 
                                        ? 'bg-white border-2 border-green-500 shadow-2xl scale-100 lg:scale-105 z-10' 
                                        : 'bg-white border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-2' 
                                    }
                                `}
                            >
                                {isPopular && hasStock && (
                                    <div className="absolute top-0 w-full bg-green-500 text-white text-xs font-bold py-1.5 text-center uppercase tracking-widest z-20">
                                        En Çok Tercih Edilen
                                    </div>
                                )}

                                <div className={`p-8 flex flex-col h-full ${isPopular ? 'pt-10' : ''}`}>
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-black text-gray-900 mb-3 leading-tight">{product.name}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 min-h-[60px]">
                                            {product.description || "Can dostun için harika sürprizler içeren dolu dolu bir kutu."}
                                        </p>
                                    </div>

                                    <div className="flex justify-center gap-2 mb-6 flex-wrap">
                                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-blue-100 flex items-center gap-1">
                                            💳 Taksit İmkanı
                                        </span>
                                        <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-orange-100 flex items-center gap-1">
                                            🔥 Yıllık İndirim
                                        </span>
                                    </div>

                                    <div className="text-center mb-8 pb-8 border-b border-gray-100">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="text-2xl font-bold text-gray-400 self-start mt-2">₺</span>
                                            <span className="text-6xl font-black text-gray-900 tracking-tighter">{Number(product.price).toFixed(0)}</span>
                                        </div>
                                        {isUpgradeMode && (
                                             <div className="mt-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded inline-block">
                                                 Sana Özel Fiyat Hesaplanacak
                                             </div>
                                        )}
                                        {!isUpgradeMode && (
                                            <span className="text-gray-400 font-bold text-sm block mt-1">/ ay (Başlayan fiyatlarla)</span>
                                        )}
                                    </div>

                                    <ul className="space-y-3 mb-8 px-2 flex-grow">
                                        {product.features && product.features.length > 0 ? (
                                            product.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                                                    <span className="font-medium">{feature}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <>
                                                <li className="flex items-center gap-3 text-sm text-gray-600"><span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span><span>Orijinal Lisanslı Ürünler</span></li>
                                                <li className="flex items-center gap-3 text-sm text-gray-600"><span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span><span>Veteriner Hekim Seçimi</span></li>
                                                <li className="flex items-center gap-3 text-sm text-gray-600"><span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span><span>Sürpriz Hediyeler</span></li>
                                            </>
                                        )}
                                    </ul>

                                    <button 
                                        onClick={() => handleSelectPackage(product.id)}
                                        disabled={!hasStock}
                                        className={`w-full py-4 rounded-xl font-bold text-base transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group-hover:shadow-xl
                                            ${!hasStock 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                                                : isPopular 
                                                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200' 
                                                    : 'bg-gray-900 text-white hover:bg-black shadow-gray-200'
                                            }
                                        `}
                                    >
                                        {!hasStock 
                                            ? "Stoklar Tükendi" 
                                            : isUpgradeMode 
                                                ? "Bu Pakete Yükselt ⚡" 
                                                : "İncele & Satın Al 👉"
                                        }
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
      </div>

      {/* ================================================================== */}
      {/* ℹ️ NASIL ÇALIŞIR? (EK BİLGİ ALANI) ℹ️ */}
      {/* ================================================================== */}
      {!isUpgradeMode && (
        <div className="container mx-auto px-4 py-12 border-t border-gray-200 mt-12">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-black text-gray-900">Nasıl Çalışır?</h2>
                <p className="text-gray-500">Mutluluk sadece 3 adım uzakta.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-4">📦</div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Paketini Seç</h3>
                    <p className="text-sm text-gray-500">Bütçene uygun paketi seç, ister aylık ister yıllık avantajlı öde.</p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-4">🐶</div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Dostunu Tanıt</h3>
                    <p className="text-sm text-gray-500">Köpeğini, kedini veya kuşunu sisteme kaydet, ona özel ürünler hazırlayalım.</p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-3xl mb-4">🎉</div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Mutluluk Kapında</h3>
                    <p className="text-sm text-gray-500">Her ay düzenli olarak sürpriz kutun kapına gelsin, pati şenliği başlasın!</p>
                </div>
            </div>
        </div>
      )}

    </main>
  );
}

// ⚠️ Next.js 13+ App Router'da useSearchParams kullanan bileşenler
// Suspense içine alınmalıdır, yoksa build hatası verebilir.
export default function PaketlerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]"><div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div></div>}>
            <ProductContent />
        </Suspense>
    );
}