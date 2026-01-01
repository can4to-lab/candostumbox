"use client";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast"; 
import { useRouter } from "next/navigation"; 
import Image from 'next/image'; 

import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  isVisible: boolean; 
}

export default function Home() {
  const router = useRouter(); 

  // --- STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  
  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Modal State
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);

  // Data State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  // 👇 YENİ: Kullanıcının aktif siparişi var mı kontrolü
  const [hasOrders, setHasOrders] = useState(false); 

  // --- SLIDER VERİLERİ ---
  const slides = [
    {
        id: 1,
        badge: "🚀 En Popüler Başlangıç",
        title: "Dostun İçin Mutluluk Kutusu",
        description: "İçinde ne olduğunu sadece biz biliyoruz, ama ne kadar seveceğini garanti ediyoruz! Her ay kapına gelen sürpriz lezzet ve oyun şöleni.",
        image: "/slider-1.jpeg", 
        btnColor: "bg-green-600 hover:bg-green-700 border-green-600",
        // Linkler artık dinamik hesaplanacak
    },
    {
        id: 2,
        badge: "✨ Premium Deneyim",
        title: "Sıkıcı Oyuncaklara Veda Et",
        description: "Sıradan bir top yerine, zeka geliştirici ve dayanıklı oyuncaklar gönderiyoruz. Dostunun enerjisini doğru yöne kanalize et.",
        image: "/slider-3.jpg", 
        btnColor: "bg-orange-500 hover:bg-orange-600 border-orange-500",
    },
    {
        id: 3,
        badge: "🛡️ %100 Güvenli",
        title: "Veteriner Hekim Onaylı",
        description: "Dostunun sağlığı şakaya gelmez. Kutularımızdaki her ödül maması ve oyuncak, uzman veterinerlerimiz tarafından kontrol edilir.",
        image: "/veteriner-onayli.jpg", 
        btnColor: "bg-blue-600 hover:bg-blue-700 border-blue-600",
    }
  ];

  // --- SLIDER OTOMATİK GEÇİŞ ---
  useEffect(() => {
    const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 7000); 
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // --- KULLANICI BİLGİLERİ VE SİPARİŞ KONTROLÜ ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        setIsLoggedIn(true);
        
        // 1. Profil Bilgisi
        fetch("https://candostumbox-api.onrender.com/auth/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setUserName(data.name || "Dostum");
        })
        .catch(err => console.log(err));

        // 2. Sipariş Kontrolü (Yeni üye mi yoksa eski mi?)
        fetch("https://candostumbox-api.onrender.com/orders/my-orders", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(orders => {
            if (Array.isArray(orders) && orders.length > 0) {
                setHasOrders(true); // Eski üye (Siparişi var)
            } else {
                setHasOrders(false); // Yeni üye (Siparişi yok)
            }
        })
        .catch(() => setHasOrders(false));
    }

    const urunleriGetir = async () => {
      try {
        const cevap = await fetch("https://candostumbox-api.onrender.com/products");
        const veri = await cevap.json();
        setProducts(Array.isArray(veri) ? veri : []);
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };
    urunleriGetir();
  }, []);

  const handleRegisterSuccess = () => {
      setIsLoggedIn(true);      
      setRegisterOpen(false);   
      window.location.reload();
  };

  // 👇 YENİ: AKILLI BUTON MANTIĞI
  // Bu fonksiyon, kullanıcının durumuna göre butonun ne yapacağını belirler.
  const getHeroButtonConfig = (slideId: number) => {
      // Varsayılan (Misafir)
      let config = { 
          text: "Kutunu Seç 🎁", 
          action: () => router.push('/product') 
      };

      if (slideId === 3) {
           return { text: "Bizi Tanı 🩺", action: () => router.push('/about') };
      }

      if (isLoggedIn) {
          if (hasOrders) {
              // Aktif Üye (Siparişi Var) -> Profile gitmeli
              config = { 
                  text: "Kutunu Takip Et 📦", 
                  action: () => router.push('/profile?tab=siparisler')
              };
          } else {
              // Yeni Üye (Siparişi Yok) -> Satın almaya gitmeli
              config = { 
                  text: `İlk Paketini Seç ${userName ? userName.split(' ')[0] : ''} 🚀`, 
                  action: () => router.push('/product') 
              };
          }
      } else {
          // Misafir -> Ürünlere gitmeli (veya kayıt modalı açabilir)
          config = {
               text: "Hemen Başla 🎁",
               action: () => router.push('/product')
          };
      }
      
      // Slide 2 özel durumu (Premium)
      if (slideId === 2) {
          if (isLoggedIn && hasOrders) {
               config = { text: "Aboneliği Yükselt 🚀", action: () => router.push('/profile?tab=abonelik') };
          } else {
               config = { text: "Planları İncele 🔍", action: () => router.push('/product') };
          }
      }

      return config;
  };

  return (  
    <main className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans relative">
      <Toaster position="top-right" />
      
      {showBanner && (
        <div className="bg-gray-900 text-gray-200 text-xs font-medium py-2 px-4 text-center relative z-50 animate-fade-in">
            <span>🎉 YENİ ÜYELERE ÖZEL İLK KUTUDA %20 İNDİRİM! Kod: DOSTUM2025</span>
            <button onClick={() => setShowBanner(false)} className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:text-white">✕</button>
        </div>
      )}

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setLoginOpen(false)} 
        onSwitchToRegister={() => { setLoginOpen(false); setRegisterOpen(true); }}
        onLoginSuccess={() => { setIsLoggedIn(true); window.location.reload(); }}
      />
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => { setRegisterOpen(false); setLoginOpen(true); }}
        initialData={null} 
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* --- HERO BANNER --- */}
      <div className="relative w-full overflow-hidden group">
        <div 
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] h-[650px] md:h-[800px]"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
            {slides.map((slide, index) => {
                // Her slide için akıllı buton konfigürasyonunu al
                const btnConfig = getHeroButtonConfig(slide.id);

                return (
                <div key={slide.id} className="w-full flex-shrink-0 relative h-full">
                    <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={index === 0} />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>

                    <div className="absolute inset-0 flex items-center justify-center text-center z-10 px-4 pb-12 md:pb-0">
                        <div className="max-w-5xl space-y-6 md:space-y-8">
                            
                            <div className="overflow-hidden inline-block rounded-full">
                                <span className="inline-block py-2 px-6 text-xs md:text-sm font-bold tracking-widest uppercase bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg animate-fade-in-up">
                                    {slide.badge}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl animate-fade-in-up delay-100">
                                {slide.title}
                            </h1>

                            <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-lg animate-fade-in-up delay-200">
                                {slide.description}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 md:pt-8 animate-fade-in-up delay-300">
                                {/* 👇 AKILLI BUTON BURADA */}
                                <button 
                                    onClick={btnConfig.action} 
                                    className={`px-8 py-4 md:px-10 md:py-5 text-white rounded-full font-bold text-lg transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] transform hover:-translate-y-1 active:scale-95 flex items-center gap-3 border ${slide.btnColor}`}
                                >
                                    {btnConfig.text}
                                </button>
                                
                                <button 
                                    onClick={() => router.push('/how-it-works')} 
                                    className="px-8 py-4 md:px-10 md:py-5 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-full font-bold text-lg transition-all hover:border-white/60 flex items-center gap-2 group/btn"
                                >
                                    Nasıl Çalışır?
                                    <span className="group-hover/btn:translate-x-1 transition-transform">➔</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )})}
        </div>
        
        {/* Oklar ve Noktalar (Aynı Kaldı) */}
        <button onClick={prevSlide} className="absolute top-1/2 left-4 md:left-8 transform -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full border border-white/10 transition-all hover:scale-110 z-20 focus:outline-none group opacity-0 group-hover:opacity-100 duration-300">
            <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={nextSlide} className="absolute top-1/2 right-4 md:right-8 transform -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full border border-white/10 transition-all hover:scale-110 z-20 focus:outline-none group opacity-0 group-hover:opacity-100 duration-300">
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {slides.map((_, index) => (
                <button 
                    key={index} 
                    onClick={() => setCurrentSlide(index)} 
                    className={`h-2 rounded-full transition-all duration-500 ${currentSlide === index ? 'bg-white w-8 md:w-12' : 'bg-white/40 hover:bg-white/60 w-2 md:w-3'}`}
                ></button>
            ))}
        </div>
      </div>

      {/* --- ABONELİK SİSTEMİ BİLGİLENDİRME (AYNI) --- */}
      <section className="py-16 bg-white border-b border-gray-100">
          <div className="container mx-auto px-6 text-center">
              <h2 className="text-3xl font-black text-gray-900 mb-8">Nasıl Çalışır?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-6 bg-gray-50 rounded-2xl">
                      <div className="text-4xl mb-4">📦</div>
                      <h3 className="text-xl font-bold mb-2">Paketini Seç</h3>
                      <p className="text-gray-600">Dostunun ihtiyacına uygun 6 farklı paketten birini seç.</p>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-2xl">
                      <div className="text-4xl mb-4">🗓️</div>
                      <h3 className="text-xl font-bold mb-2">Süreyi Belirle</h3>
                      <p className="text-gray-600">3, 6, 9 veya 12 aylık avantajlı aboneliklerden faydalan.</p>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-2xl">
                      <div className="text-4xl mb-4">🚚</div>
                      <h3 className="text-xl font-bold mb-2">Kapına Gelsin</h3>
                      <p className="text-gray-600">Her ay düzenli olarak sürprizlerle dolu kutunu teslim al.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- KUTU İÇERİĞİ (AYNI) --- */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
           <div className="flex-1 relative order-2 md:order-1">
              <div className="absolute inset-0 bg-blue-200 rounded-full blur-3xl opacity-20 transform -rotate-12"></div>
              <img src="https://images.unsplash.com/photo-1597843786271-105221b033c4?q=80&w=1000&auto=format&fit=crop" alt="Kutu İçeriği Örnek" className="relative z-10 rounded-[3rem] shadow-2xl transform hover:scale-105 transition-transform duration-500 border-8 border-white" />
           </div>
           <div className="flex-1 space-y-8 order-1 md:order-2">
              <div>
                <span className="text-blue-500 font-bold tracking-wider text-sm uppercase">MERAK EDENLER İÇİN</span>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mt-2">Kutunun İçinden <br/> Neler Çıkıyor?</h2>
              </div>
              <p className="text-xl text-gray-600 font-medium">Her ay piyasa değeri kutu fiyatının çok üzerinde olan 5-8 parça premium ürün gönderiyoruz.</p>
              
              <ul className="space-y-6 pt-4">
                  <li className="flex items-start gap-5 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">🧸</div>
                    <div><h4 className="font-bold text-gray-900 text-lg">Eğlenceli Oyuncaklar</h4><p className="text-sm text-gray-500 mt-1">Dayanıklı, zeka geliştirici ve güvenli.</p></div>
                  </li>
                  <li className="flex items-start gap-5 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">🍖</div>
                    <div><h4 className="font-bold text-gray-900 text-lg">Doğal Ödül Mamaları</h4><p className="text-sm text-gray-500 mt-1">Katkısız, sağlıklı ve veteriner onaylı.</p></div>
                  </li>
                  <li className="flex items-start gap-5 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">🎀</div>
                    <div><h4 className="font-bold text-gray-900 text-lg">Bakım & Aksesuar</h4><p className="text-sm text-gray-500 mt-1">Şampuanlar, tasmalar veya mevsimlik sürprizler.</p></div>
                  </li>
              </ul>
           </div>
        </div>
      </section>

      {/* --- MUTLU KULÜP (AYNI) --- */}
      <section className="py-20 bg-orange-50/50">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Mutlu CanDostumBox Kulübü 🐶🐱</h2>
            <p className="text-gray-500 mb-12">Binlerce dostumuz ve sahibi yanılıyor olamaz! İşte ailemizden kareler.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 hover:shadow-md transition">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center text-xl">👩</div>
                        <div className="text-left">
                            <h4 className="font-bold text-gray-900 text-sm">Ayşe Y. & Boncuk</h4>
                            <div className="text-yellow-400 text-xs">⭐⭐⭐⭐⭐</div>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm italic leading-relaxed text-left">
                        "Boncuk kargo sesini duyunca kapıya koşuyor artık. İçinden çıkan ödül mamalarına bayıldı, oyuncaklar ise gerçekten çok dayanıklı."
                    </p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 hover:shadow-md transition transform md:-translate-y-2">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-xl">🧔</div>
                        <div className="text-left">
                            <h4 className="font-bold text-gray-900 text-sm">Mert K. & Thor</h4>
                            <div className="text-yellow-400 text-xs">⭐⭐⭐⭐⭐</div>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm italic leading-relaxed text-left">
                        "Premium kutuyu denemek için aldık, şimdi vazgeçemiyoruz. Özellikle her ay farklı bir tema olması çok heyecan verici. Teşekkürler!"
                    </p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 hover:shadow-md transition">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-xl">👧</div>
                        <div className="text-left">
                            <h4 className="font-bold text-gray-900 text-sm">Elif S. & Limon</h4>
                            <div className="text-yellow-400 text-xs">⭐⭐⭐⭐⭐</div>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm italic leading-relaxed text-left">
                        "Kedi Limon normalde çok seçicidir ama bu kutudaki yaş mamaları iştahla yedi. Oyuncaklarla oynayıp duruyor. Kesinlikle tavsiye ederim."
                    </p>
                </div>
            </div>
        </div>
      </section>
    </main>
  );
}