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
  
  // YENİ: Yan menü kontrolü (Zara Tarzı)
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false); 

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Modal State
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);

  // Data State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // --- SLIDER VERİLERİ (GÜNCELLENDİ: Link Eklendi) ---
  const slides = [
    {
        id: 1,
        badge: "🐾 Mutluluk Kutusu",
        title: "Can Dostun İçin Sürpriz Dolu Bir Dünya",
        description: "Her ay kapına gelen özenle seçilmiş oyuncaklar, doğal atıştırmalıklar ve bakım ürünleri. Onun kuyruğunu, senin yüzünü güldürmek için buradayız.",
        image: "/slider-1.jpg", 
        btnColor: "bg-green-600 hover:bg-green-700 border-transparent",
        link: "/product" // Yönlendirme linki
    },
    {
        id: 2,
        badge: "✨ Her Ay Yeni Macera",
        title: "Keşfetmeyi Seven Patiler İçin",
        description: "Farklı temalarla hazırlanan kutularımızla dostunun merakını her zaman canlı tut. Sıkılmak yok, sadece eğlence var!",
        image: "/slider-3.jpg", 
        btnColor: "bg-orange-600 hover:bg-orange-700 border-transparent",
        link: "/product"
    },
    {
        id: 3,
        badge: "✅ Veteriner Onaylı",
        title: "Sağlıklı ve Güvenilir İçerik",
        description: "Gönderdiğimiz tüm ürünler uzman veterinerler tarafından kontrol edilir. Dostunun sağlığı bizim için her şeyden önemli.",
        image: "/veteriner-onayli.jpg", 
        btnColor: "bg-blue-600 hover:bg-blue-700 border-transparent",
        link: "/neden-biz"
    }
  ];

  // --- SLIDER OTOMATİK GEÇİŞ ---
  useEffect(() => {
    const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        setIsLoggedIn(true);
        fetch("https://candostumbox-api.onrender.com/auth/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setUserName(data.name || "Dostum");
        })
        .catch(err => console.log(err));
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.reload();
  };

  // Eski scroll fonksiyonu (SSS için hala gerekli olabilir)
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsSideMenuOpen(false); 
    }
  };

  // YENİ: Sayfa Yönlendirme Fonksiyonu
  const handleNavigation = (path: string) => {
    router.push(path);
    setIsSideMenuOpen(false);
  };

  const handlePaketSec = (urun: Product) => {
    if (urun.stock <= 0) return;
    router.push(`/product/${urun.id}`);
  };

  const handleRegisterSuccess = () => {
      setIsLoggedIn(true);      
      setRegisterOpen(false);   
      window.location.reload();
  };

  const visibleProducts = products.filter(p => p.isVisible !== false);

  // YENİ: Hero butonu artık linke yönlendiriyor
  const handleHeroButtonClick = (link: string) => {
      if (isLoggedIn) {
          router.push(link);
      } else {
          router.push('/auth/signup'); 
      }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans relative">
      <Toaster position="top-right" />
      
      {/* --- DUYURU BANDI --- */}
      {showBanner && (
        <div className="bg-gray-900 text-gray-200 text-xs font-medium py-2 px-4 text-center relative z-50">
            <span>🎉 YENİ ÜYELERE ÖZEL İLK KUTUDA %20 İNDİRİM! Kod: DOSTUM2025</span>
            <button onClick={() => setShowBanner(false)} className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:text-white">✕</button>
        </div>
      )}

      {/* --- MODALLAR --- */}
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

      {/* --- HERO BANNER (SLIDER) --- */}
      <div className="relative w-full overflow-hidden">
        <div 
            className="flex transition-transform duration-700 ease-in-out h-[600px] md:h-[750px]"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
            {slides.map((slide, index) => (
                <div key={slide.id} className="w-full flex-shrink-0 relative h-full">
                    {/* Placeholder resim yerine kendi resimlerinizi kullanın */}
                    <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={index === 0} />
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-center z-10 px-4">
                        <div className="max-w-4xl space-y-6">
                            <span className="inline-block py-2 px-6 rounded-full text-sm font-bold tracking-widest uppercase mb-2 bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-sm animate-fade-in-up">
                                {slide.badge}
                            </span>
                            <h1 className="text-4xl md:text-7xl font-black text-white leading-tight tracking-tight drop-shadow-lg animate-fade-in-up delay-100">
                                {slide.title}
                            </h1>
                            <p className="text-lg md:text-2xl text-gray-100 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md animate-fade-in-up delay-200">
                                {slide.description}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-fade-in-up delay-300">
                                <button onClick={() => handleHeroButtonClick(slide.link)} className={`px-10 py-4 text-white rounded-full font-bold text-lg transition shadow-xl transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 border ${slide.btnColor}`}>
                                    {isLoggedIn ? "Paketleri İncele 🎁" : "Hemen Başla 🚀"}
                                </button>
                                <button onClick={() => handleNavigation('/nasil-calisir')} className="px-10 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/50 rounded-full font-bold text-lg transition flex items-center gap-2">
                                    Nasıl Çalışır? 🤔
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {/* Slider Okları (Aynen korundu) */}
        <button onClick={prevSlide} className="absolute top-1/2 left-4 md:left-8 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 md:p-4 rounded-full shadow-lg transition z-20 focus:outline-none group border border-white/30">
            <svg className="w-6 h-6 md:w-8 md:h-8 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={nextSlide} className="absolute top-1/2 right-4 md:right-8 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 md:p-4 rounded-full shadow-lg transition z-20 focus:outline-none group border border-white/30">
            <svg className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {slides.map((_, index) => (
                <button key={index} onClick={() => setCurrentSlide(index)} className={`h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white w-10' : 'bg-white/50 hover:bg-white/80 w-3'}`}></button>
            ))}
        </div>
      </div>

      {/* --- KAYAN BANNER (KALDIRILDI - İSTEK ÜZERİNE) --- */}
      
 {/* --- ABONELİK SİSTEMİ BİLGİLENDİRME BANNERI (YENİ) --- */}
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

      {/* --- KUTU İÇERİĞİ (KORUNDU) --- */}
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

      {/* --- NASIL ÇALIŞIR? (KORUNDU) --- */}
      <section id="nasil-calisir" className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <span className="text-green-600 font-bold tracking-wider text-sm uppercase mb-2 block">SÜREÇ NASIL İŞLİYOR?</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-16">Mutluluk Sadece 3 Adım Uzakta</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-1 bg-gray-100 -z-10 rounded-full"></div>
            <div className="group">
              <div className="w-24 h-24 bg-white border-4 border-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-lg group-hover:scale-110 group-hover:border-green-200 transition-all duration-300 relative z-10">1</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Dostunu Tanıt</h3>
              <p className="text-gray-500 leading-relaxed px-4">Can Dostunun boyutunu ve özelliklerini seç, ona en uygun kutuyu yapay zeka ile belirleyelim.</p>
            </div>
            <div className="group">
              <div className="w-24 h-24 bg-white border-4 border-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-lg group-hover:scale-110 group-hover:border-green-200 transition-all duration-300 relative z-10">2</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Biz Hazırlayalım</h3>
              <p className="text-gray-500 leading-relaxed px-4">Uzmanlarımız her ay farklı bir tema ile en kaliteli oyuncak ve ödülleri özenle seçsin.</p>
            </div>
            <div className="group">
              <div className="w-24 h-24 bg-white border-4 border-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-lg group-hover:scale-110 group-hover:border-green-200 transition-all duration-300 relative z-10">3</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Kapına Gelsin</h3>
              <p className="text-gray-500 leading-relaxed px-4">Ücretsiz kargo ile kapına gelen kutuyu aç ve dostunun o paha biçilemez sevincine ortak ol!</p>
            </div>
          </div>
        </div>
      </section>



      {/* --- MUTLU KULÜP (KORUNDU) --- */}
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