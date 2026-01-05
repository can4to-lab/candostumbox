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
  const [hasOrders, setHasOrders] = useState(false); 

  // --- SLIDER VERİLERİ ---
  const slides = [
    {
        id: 1,
        badge: "🚀 En Popüler",
        title: "Dostun İçin Mutluluk Kutusu",
        description: "İçinde ne olduğunu sadece biz biliyoruz! Her ay kapına gelen sürpriz lezzet ve oyun şöleni.",
        image: "/slider_1.png", 
        btnColor: "bg-green-600 hover:bg-green-700 border-green-600",
    },
    {
        id: 2,
        badge: "✨ Premium",
        title: "Sıkıcı Oyuncaklara Veda Et",
        description: "Sıradan bir top yerine, zeka geliştirici ve dayanıklı oyuncaklar gönderiyoruz.",
        image: "/slider_2.png", 
        btnColor: "bg-orange-500 hover:bg-orange-600 border-orange-500",
    },
    {
        id: 3,
        badge: "🛡️ %100 Güvenli",
        title: "Veteriner Hekim Onaylı",
        description: "Dostunun sağlığı şakaya gelmez. Her ürün uzman veterinerlerimizce kontrol edilir.",
        image: "/slider_3.png", 
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

  // --- KULLANICI BİLGİLERİ ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        setIsLoggedIn(true);
        fetch("https://candostumbox-api.onrender.com/auth/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setUserName(data.name || "Dostum"))
        .catch(err => console.log(err));

        fetch("https://candostumbox-api.onrender.com/orders/my-orders", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(orders => {
            if (Array.isArray(orders) && orders.length > 0) setHasOrders(true); 
            else setHasOrders(false); 
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

  const getHeroButtonConfig = (slideId: number) => {
      let config = { text: "Kutunu Seç 🎁", action: () => router.push('/product') };

      if (slideId === 3) return { text: "Bizi Tanı 🩺", action: () => router.push('/about') };

      if (isLoggedIn) {
          if (hasOrders) config = { text: "Kutunu Takip Et 📦", action: () => router.push('/profile?tab=siparisler') };
          else config = { text: "İlk Paketini Seç $", action: () => router.push('/product') };
      } else {
          config = { text: "Hemen Başla 🎁", action: () => router.push('/product') };
      }
      
      if (slideId === 2) {
          if (isLoggedIn && hasOrders) config = { text: "Aboneliği Yükselt 🚀", action: () => router.push('/profile?tab=abonelik') };
          else config = { text: "Planları İncele 🔍", action: () => router.push('/product') };
      }
      return config;
  };

  return (  
    <main className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans relative">
      <Toaster position="top-right" />
      
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

      {/* ================================================================== */}
      {/* 🖼️ BÖLÜM 1: GÖRSEL SLIDER (Sadece Resim) */}
      {/* ================================================================== */}
      <div className="relative w-full overflow-hidden group bg-gray-100">
        <div 
            className="flex transition-transform duration-700 ease-in-out h-[350px] md:h-[550px] lg:h-[650px]"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
            {slides.map((slide, index) => (
                <div key={slide.id} className="w-full flex-shrink-0 relative h-full">
                    {/* Görsel artık tertemiz, üzerinde yazı yok */}
                    <Image 
                        src={slide.image} 
                        alt={slide.title} 
                        fill 
                        className="object-cover object-center" 
                        priority={index === 0} 
                    />
                </div>
            ))}
        </div>

        {/* Oklar - Görselin üzerinde kalsın */}
        <button onClick={prevSlide} className="absolute top-1/2 left-4 md:left-8 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/30 hover:bg-white/50 backdrop-blur-md text-white rounded-full transition-all z-20">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={nextSlide} className="absolute top-1/2 right-4 md:right-8 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/30 hover:bg-white/50 backdrop-blur-md text-white rounded-full transition-all z-20">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* ================================================================== */}
      {/* 📝 BÖLÜM 2: METİN SLIDER (Görselin Altında) */}
      {/* ================================================================== */}
      <div className="bg-white border-b border-gray-100 py-8 md:py-10 shadow-sm relative z-10">
          <div className="container mx-auto px-4 overflow-hidden">
              <div 
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                  {slides.map((slide) => {
                      const btnConfig = getHeroButtonConfig(slide.id);
                      return (
                          <div key={slide.id} className="w-full flex-shrink-0 flex flex-col items-center text-center px-4">
                              {/* Badge */}
                              <span className="inline-block py-1.5 px-3 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] md:text-xs tracking-wider uppercase mb-3">
                                  {slide.badge}
                              </span>

                              {/* Başlık (Siyah ve Belirgin) */}
                              <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">
                                  {slide.title}
                              </h2>

                              {/* Açıklama (Gri ve Okunaklı) */}
                              <p className="text-sm md:text-lg text-gray-500 font-medium max-w-2xl mx-auto mb-6 leading-relaxed">
                                  {slide.description}
                              </p>

                              {/* Butonlar (Küçültüldü ve Yan Yana) */}
                              <div className="flex items-center gap-4">
                                  <button 
                                      onClick={btnConfig.action} 
                                      className={`px-6 py-3 rounded-xl text-white font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 ${slide.btnColor}`}
                                  >
                                      {btnConfig.text}
                                  </button>
                                  <button 
                                      onClick={() => router.push('/how-it-works')} 
                                      className="px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-sm transition-all hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2"
                                  >
                                      Bilgi Al <span>➔</span>
                                  </button>
                              </div>
                          </div>
                      );
                  })}
              </div>

              {/* Noktalar (Metnin Altında) */}
              <div className="flex justify-center gap-2 mt-8">
                  {slides.map((_, index) => (
                      <button 
                          key={index} 
                          onClick={() => setCurrentSlide(index)} 
                          className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-gray-800 w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'}`}
                      ></button>
                  ))}
              </div>
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
              <img src="/kutu_icerik.png" alt="Kutu İçeriği Örnek" className="relative z-10 rounded-[3rem] shadow-2xl transform hover:scale-105 transition-transform duration-500 border-8 border-white" />
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