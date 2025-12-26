"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  features: string[]; // Veritabanına eklediğimiz özellikler
  isVisible: boolean; 
}

export default function PaketlerPage() {
  const router = useRouter();

  // --- STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  // Auth State
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsSideMenuOpen(false); 
    }
  };

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
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Paketler yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- FONKSİYONLAR ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.reload();
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsSideMenuOpen(false);
  };

  const handleSelectPackage = (id: number) => {
      router.push(`/product/${id}`);
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans">
      <Toaster position="top-right" />

      {/* --- MODALLAR --- */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} onSwitchToRegister={() => {setLoginOpen(false); setRegisterOpen(true);}} onLoginSuccess={() => window.location.reload()} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} onSwitchToLogin={() => {setRegisterOpen(false); setLoginOpen(true);}} initialData={null} onRegisterSuccess={() => window.location.reload()} />

    

      {/* ================================================================== */}
      {/* 📦 PAKETLER İÇERİĞİ 📦 */}
      {/* ================================================================== */}
      <div className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
            
            {/* BAŞLIK */}
            <div className="text-center max-w-3xl mx-auto mb-20">
                <span className="text-green-600 font-bold tracking-wider text-sm uppercase mb-2 block animate-fade-in-up">MUTLULUK KUTULARI</span>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight animate-fade-in-up delay-100">
                    Dostun İçin En İyisini Seç
                </h1>
                <p className="text-xl text-gray-500 font-medium leading-relaxed animate-fade-in-up delay-200">
                    Her bütçeye ve ihtiyaca uygun paketlerimizle her ay düzenli mutluluk kapında. Taahhüt yok, istediğin zaman iptal et.
                </p>
            </div>

            {/* YÜKLENİYOR... */}
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="text-green-500 text-xl font-bold animate-pulse flex items-center gap-2">
                        <span className="text-3xl">🎁</span> Paketler yükleniyor...
                    </div>
                </div>
            )}

            {/* PAKET LİSTESİ */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {products.map((product, index) => {
                        const isPopular = product.name.toLowerCase().includes('premium'); // Örn: PremiumBox popüler olsun
                        const hasStock = product.stock > 0;

                        return (
                            <div 
                                key={product.id} 
                                className={`relative bg-white rounded-[2.5rem] p-8 flex flex-col transition-all duration-500 group
                                    ${isPopular 
                                        ? 'border-2 border-green-500 shadow-2xl scale-105 z-10 ring-4 ring-green-50/50' 
                                        : 'border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-2' 
                                    }
                                `}
                            >
                                {/* Popüler Etiketi */}
                                {isPopular && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold px-6 py-2 rounded-full shadow-lg tracking-widest uppercase">
                                        En Çok Tercih Edilen
                                    </div>
                                )}

                                {/* Başlık & Açıklama */}
                                <div className="text-center mb-8 pt-4">
                                    <h3 className="text-3xl font-black text-gray-900 mb-3">{product.name}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed min-h-[40px]">
                                        {product.description || "Can dostun için harika sürprizler."}
                                    </p>
                                </div>

                                {/* Fiyat */}
                                <div className="flex justify-center items-end gap-1 mb-10 pb-8 border-b border-dashed border-gray-200">
                                    <span className="text-3xl font-bold text-gray-400 -mb-1">₺</span>
                                    <span className="text-7xl font-black text-gray-900 tracking-tighter">{product.price}</span>
                                    <span className="text-gray-400 font-bold text-lg mb-2">/ay</span>
                                </div>

                                {/* Özellikler */}
                                <ul className="space-y-4 mb-10 text-gray-600 text-left px-2 flex-grow">
                                    {product.features && product.features.length > 0 ? (
                                        product.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                                                <span className="font-medium text-sm">{feature}</span>
                                            </li>
                                        ))
                                    ) : (
                                        // Varsayılan özellikler (Eğer DB'de yoksa)
                                        <>
                                            <li className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span><span>Orijinal Lisanslı Ürünler</span></li>
                                            <li className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span><span>Veteriner Kontrolünde</span></li>
                                            <li className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span><span>Ücretsiz Kargo 🚚</span></li>
                                        </>
                                    )}
                                </ul>

                                {/* Buton */}
                                <button 
                                    onClick={() => handleSelectPackage(product.id)}
                                    disabled={!hasStock}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-2
                                        ${!hasStock 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : isPopular 
                                                ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200 hover:shadow-green-300' 
                                                : 'bg-gray-900 text-white hover:bg-gray-800'
                                        }
                                    `}
                                >
                                    {!hasStock ? "Stokta Yok 😔" : "Paketi Seç 👉"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </main>
  );
}