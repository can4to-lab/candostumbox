"use client";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
      description:
        "Her ay kapına gelen özenle seçilmiş oyuncaklar, doğal atıştırmalıklar ve bakım ürünleri. Onun kuyruğunu, senin yüzünü güldürmek için buradayız.",
      image: "/slider-1.jpg",
      btnColor: "bg-green-600 hover:bg-green-700 border-transparent",
      link: "/paketler", // Yönlendirme linki
    },
    {
      id: 2,
      badge: "✨ Her Ay Yeni Macera",
      title: "Keşfetmeyi Seven Patiler İçin",
      description:
        "Farklı temalarla hazırlanan kutularımızla dostunun merakını her zaman canlı tut. Sıkılmak yok, sadece eğlence var!",
      image: "/slider-3.jpg",
      btnColor: "bg-orange-600 hover:bg-orange-700 border-transparent",
      link: "/paketler",
    },
    {
      id: 3,
      badge: "✅ Veteriner Onaylı",
      title: "Sağlıklı ve Güvenilir İçerik",
      description:
        "Gönderdiğimiz tüm ürünler uzman veterinerler tarafından kontrol edilir. Dostunun sağlığı bizim için her şeyden önemli.",
      image: "/veteriner-onayli.jpg",
      btnColor: "bg-blue-600 hover:bg-blue-700 border-transparent",
      link: "/neden-biz",
    },
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
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setUserName(data.name || "Dostum");
        })
        .catch((err) => console.log(err));
    }

    const urunleriGetir = async () => {
      try {
        const cevap = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products`,
        );
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
      element.scrollIntoView({ behavior: "smooth" });
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

  const visibleProducts = products.filter((p) => p.isVisible !== false);

  // YENİ: Hero butonu artık linke yönlendiriyor
  const handleHeroButtonClick = (link: string) => {
    if (isLoggedIn) {
      router.push(link);
    } else {
      router.push("/auth/signup");
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans relative">
      <Toaster position="top-right" />

      {/* --- DUYURU BANDI --- */}
      {showBanner && (
        <div className="bg-gray-900 text-gray-200 text-xs font-medium py-2 px-4 text-center relative z-50">
          <span>
            🎉 YENİ ÜYELERE ÖZEL İLK KUTUDA %20 İNDİRİM! Kod: DOSTUM2025
          </span>
          <button
            onClick={() => setShowBanner(false)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* --- MODALLAR --- */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          window.location.reload();
        }}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
        initialData={null}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* ================================================================== */}
      {/* ✨ YENİ NAVBAR YAPISI (İSTEĞİNİZE GÖRE) ✨ */}
      {/* ================================================================== */}
      <nav className="bg-white shadow-sm sticky top-0 z-40 h-20">
        <div className="container mx-auto px-6 h-full relative flex items-center justify-between">
          {/* 1. SOL: HAMBURGER MENÜ (ZARA TARZI) */}
          <div className="flex items-center">
            <button
              onClick={() => setIsSideMenuOpen(true)}
              className="group flex flex-col gap-1.5 p-2 cursor-pointer"
            >
              <span className="block w-6 h-0.5 bg-gray-900 transition-all group-hover:w-8"></span>
              <span className="block w-6 h-0.5 bg-gray-900 transition-all group-hover:w-8"></span>
              <span className="block w-6 h-0.5 bg-gray-900 transition-all group-hover:w-8"></span>
            </button>
            <span
              className="ml-3 text-sm font-bold text-gray-600 hidden md:block cursor-pointer"
              onClick={() => setIsSideMenuOpen(true)}
            >
              MENÜ
            </span>
          </div>

          {/* 2. ORTA: LOGO (Tam Ortada) */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 flex items-center cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src="/logo_arka.png"
              alt="CanDostumBox"
              className="h-10 md:h-12 w-auto"
            />
            <span className="ml-2 text-2xl font-black text-gray-800 tracking-tighter hidden lg:block">
              CanDostum<span className="text-green-600">Box</span>
            </span>
          </div>

          {/* 3. SAĞ: İKONLAR */}
          <div className="flex items-center gap-6">
            {/* Arama */}
            <button className="text-gray-900 hover:text-green-600 transition hidden sm:block">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Profil */}
            <button
              className="text-gray-900 hover:text-green-600 transition relative"
              onClick={() =>
                isLoggedIn ? router.push("/profile") : setLoginOpen(true)
              }
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {isLoggedIn && (
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Sepet */}
            <button className="text-gray-900 hover:text-green-600 transition relative">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ================================================================== */}
      {/* ✨ YANDAN AÇILAN MENÜ (SIDEBAR) ✨ */}
      {/* ================================================================== */}

      {/* Arka Plan Karartma */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isSideMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsSideMenuOpen(false)}
      ></div>

      {/* Menü Paneli */}
      <div
        className={`fixed top-0 left-0 h-full w-[85%] md:w-[400px] bg-white z-[60] shadow-2xl transform transition-transform duration-500 ease-in-out ${isSideMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full p-8">
          {/* Üst Kısım: Kapat Butonu ve Logo */}
          <div className="flex justify-between items-center mb-10">
            <span className="text-xl font-bold text-gray-900">MENÜ</span>
            <button
              onClick={() => setIsSideMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <svg
                className="w-6 h-6 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Linkler */}
          <nav className="flex flex-col space-y-6">
            <button
              onClick={() => handleNavigation("/")}
              className="text-left text-2xl font-bold text-gray-900 hover:text-green-600 transition"
            >
              Ana Sayfa
            </button>
            <button
              onClick={() => handleNavigation("/paketler")}
              className="text-left text-2xl font-bold text-gray-900 hover:text-green-600 transition"
            >
              Paketler
            </button>
            <button
              onClick={() => handleNavigation("/neden-biz")}
              className="text-left text-2xl font-bold text-gray-900 hover:text-green-600 transition"
            >
              Neden Biz?
            </button>
            <button
              onClick={() => scrollToSection("sss")}
              className="text-left text-2xl font-bold text-gray-900 hover:text-green-600 transition"
            >
              S.S.S.
            </button>
          </nav>

          {/* Alt Kısım: Giriş/Çıkış */}
          <div className="mt-auto pt-8 border-t border-gray-100">
            {isLoggedIn ? (
              <div className="space-y-4">
                <button
                  onClick={() => handleNavigation("/profile")}
                  className="block w-full text-left text-lg font-medium text-gray-700 hover:text-green-600"
                >
                  Hesabım
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-lg font-medium text-red-600 hover:text-red-700"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setLoginOpen(true);
                    setIsSideMenuOpen(false);
                  }}
                  className="bg-gray-100 text-gray-900 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => {
                    setRegisterOpen(true);
                    setIsSideMenuOpen(false);
                  }}
                  className="bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                >
                  Kayıt Ol
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* ================================================================== */}

      {/* --- HERO BANNER (SLIDER) --- */}
      <div className="relative w-full overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out h-[600px] md:h-[750px]"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="w-full flex-shrink-0 relative h-full"
            >
              {/* Placeholder resim yerine kendi resimlerinizi kullanın */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
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
                    <button
                      onClick={() => handleHeroButtonClick(slide.link)}
                      className={`px-10 py-4 text-white rounded-full font-bold text-lg transition shadow-xl transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 border ${slide.btnColor}`}
                    >
                      {isLoggedIn ? "Paketleri İncele 🎁" : "Hemen Başla 🚀"}
                    </button>
                    <button
                      onClick={() => handleNavigation("/nasil-calisir")}
                      className="px-10 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/50 rounded-full font-bold text-lg transition flex items-center gap-2"
                    >
                      Nasıl Çalışır? 🤔
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Okları (Aynen korundu) */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 md:left-8 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 md:p-4 rounded-full shadow-lg transition z-20 focus:outline-none group border border-white/30"
        >
          <svg
            className="w-6 h-6 md:w-8 md:h-8 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 md:right-8 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 md:p-4 rounded-full shadow-lg transition z-20 focus:outline-none group border border-white/30"
        >
          <svg
            className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 ${currentSlide === index ? "bg-white w-10" : "bg-white/50 hover:bg-white/80 w-3"}`}
            ></button>
          ))}
        </div>
      </div>

      {/* --- KAYAN BANNER (KALDIRILDI - İSTEK ÜZERİNE) --- */}

      {/* --- ABONELİK SİSTEMİ BİLGİLENDİRME BANNERI (YENİ) --- */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-8">
            Nasıl Çalışır?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-2xl">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold mb-2">Paketini Seç</h3>
              <p className="text-gray-600">
                Dostunun ihtiyacına uygun 6 farklı paketten birini seç.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl">
              <div className="text-4xl mb-4">🗓️</div>
              <h3 className="text-xl font-bold mb-2">Süreyi Belirle</h3>
              <p className="text-gray-600">
                3, 6, 9 veya 12 aylık avantajlı aboneliklerden faydalan.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold mb-2">Kapına Gelsin</h3>
              <p className="text-gray-600">
                Her ay düzenli olarak sürprizlerle dolu kutunu teslim al.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- KUTU İÇERİĞİ (KORUNDU) --- */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1 relative order-2 md:order-1">
            <div className="absolute inset-0 bg-blue-200 rounded-full blur-3xl opacity-20 transform -rotate-12"></div>
            <img
              src="https://images.unsplash.com/photo-1597843786271-105221b033c4?q=80&w=1000&auto=format&fit=crop"
              alt="Kutu İçeriği Örnek"
              className="relative z-10 rounded-[3rem] shadow-2xl transform hover:scale-105 transition-transform duration-500 border-8 border-white"
            />
          </div>
          <div className="flex-1 space-y-8 order-1 md:order-2">
            <div>
              <span className="text-blue-500 font-bold tracking-wider text-sm uppercase">
                MERAK EDENLER İÇİN
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mt-2">
                Kutunun İçinden <br /> Neler Çıkıyor?
              </h2>
            </div>
            <p className="text-xl text-gray-600 font-medium">
              Her ay piyasa değeri kutu fiyatının çok üzerinde olan 5-8 parça
              premium ürün gönderiyoruz.
            </p>

            <ul className="space-y-6 pt-4">
              <li className="flex items-start gap-5 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  🧸
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    Eğlenceli Oyuncaklar
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Dayanıklı, zeka geliştirici ve güvenli.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-5 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  🍖
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    Doğal Ödül Mamaları
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Katkısız, sağlıklı ve veteriner onaylı.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-5 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                  🎀
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    Bakım & Aksesuar
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Şampuanlar, tasmalar veya mevsimlik sürprizler.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- NASIL ÇALIŞIR? (KORUNDU) --- */}
      <section id="nasil-calisir" className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <span className="text-green-600 font-bold tracking-wider text-sm uppercase mb-2 block">
            SÜREÇ NASIL İŞLİYOR?
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-16">
            Mutluluk Sadece 3 Adım Uzakta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-1 bg-gray-100 -z-10 rounded-full"></div>
            <div className="group">
              <div className="w-24 h-24 bg-white border-4 border-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-lg group-hover:scale-110 group-hover:border-green-200 transition-all duration-300 relative z-10">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Dostunu Tanıt
              </h3>
              <p className="text-gray-500 leading-relaxed px-4">
                Can Dostunun boyutunu ve özelliklerini seç, ona en uygun kutuyu
                yapay zeka ile belirleyelim.
              </p>
            </div>
            <div className="group">
              <div className="w-24 h-24 bg-white border-4 border-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-lg group-hover:scale-110 group-hover:border-green-200 transition-all duration-300 relative z-10">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Biz Hazırlayalım
              </h3>
              <p className="text-gray-500 leading-relaxed px-4">
                Uzmanlarımız her ay farklı bir tema ile en kaliteli oyuncak ve
                ödülleri özenle seçsin.
              </p>
            </div>
            <div className="group">
              <div className="w-24 h-24 bg-white border-4 border-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-8 shadow-lg group-hover:scale-110 group-hover:border-green-200 transition-all duration-300 relative z-10">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Kapına Gelsin
              </h3>
              <p className="text-gray-500 leading-relaxed px-4">
                Ücretsiz kargo ile kapına gelen kutuyu aç ve dostunun o paha
                biçilemez sevincine ortak ol!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PAKETLER (KORUNDU) --- */}
      <section id="paketler" className="container mx-auto px-4 py-24 bg-white">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900">
            Size Uygun Paketi Seçin
          </h2>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
            Dostunuzun boyutuna ve ihtiyacına en uygun kutuyu seçin, mutluluğu
            başlatın.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-green-500 text-xl font-bold animate-pulse flex items-center gap-2">
              <span className="text-3xl">🎁</span> Paketler yükleniyor...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {visibleProducts.map((urun, index) => {
              const stokYok = urun.stock <= 0;
              const stokAz = !stokYok && urun.stock < 5;

              return (
                <div
                  key={urun.id}
                  className={`relative bg-white rounded-[2.5rem] p-8 transition-all duration-500 flex flex-col
                    ${
                      index === 1
                        ? "border-2 border-green-500 shadow-2xl scale-105 z-10 ring-4 ring-green-50"
                        : "border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-3"
                    }
                `}
                >
                  {index === 1 && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-6 py-2 rounded-full shadow-lg tracking-widest uppercase">
                      En Popüler
                    </div>
                  )}
                  {stokYok && (
                    <div className="absolute top-6 right-6 bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full border border-red-100">
                      TÜKENDİ
                    </div>
                  )}
                  {stokAz && (
                    <div className="absolute top-6 right-6 bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-100 animate-pulse">
                      Son {urun.stock} Adet
                    </div>
                  )}

                  <div className="text-center mb-8 pt-4">
                    <h3 className="text-2xl font-black text-gray-900">
                      {urun.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-3 leading-relaxed min-h-[40px]">
                      {urun.description}
                    </p>
                  </div>

                  <div className="flex justify-center items-end gap-1 mb-10 pb-10 border-b border-dashed border-gray-200">
                    <span className="text-3xl font-bold text-gray-400 -mb-1">
                      ₺
                    </span>
                    <span className="text-7xl font-black text-gray-900 tracking-tighter">
                      {urun.price}
                    </span>
                    <span className="text-gray-400 font-bold text-lg mb-2">
                      /ay
                    </span>
                  </div>

                  <ul className="space-y-4 mb-10 text-gray-600 text-left px-2 flex-grow">
                    <li className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      <span className="font-medium">
                        Orijinal Lisanslı Ürünler
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      <span className="font-medium">Veteriner Kontrolünde</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      <span className="font-bold text-gray-900">
                        Ücretsiz Kargo 🚚
                      </span>
                    </li>
                  </ul>

                  <button
                    onClick={() => handlePaketSec(urun)}
                    disabled={stokYok}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-md active:scale-95 ${stokYok ? "bg-gray-100 text-gray-400 cursor-not-allowed" : index === 1 ? "bg-green-600 text-white hover:bg-green-700 shadow-green-200 hover:shadow-green-300" : "bg-gray-900 text-white hover:bg-gray-800"}`}
                  >
                    {stokYok ? "Stoklar Tükendi" : "Paketi Seç"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* --- SSS (KORUNDU) --- */}
      <section id="sss" className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-gray-500 mt-2">
              Aklınıza takılan soruların cevapları burada.
            </p>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <details className="group">
                <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 text-gray-800">
                  <span> Kutular ne zaman kargolanır?</span>
                  <span className="transition group-open:rotate-180">
                    <svg
                      fill="none"
                      height="24"
                      shapeRendering="geometricPrecision"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <p className="text-gray-600 text-sm px-6 pb-6 leading-relaxed">
                  Abonelik kutularımız her ayın 1'i ile 5'i arasında kargoya
                  verilir. Siparişinizi ayın ortasında verdiyseniz, ilk kutunuz
                  hemen ertesi gün kargolanır!
                </p>
              </details>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <details className="group">
                <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 text-gray-800">
                  <span>
                    {" "}
                    Aboneliğimi istediğim zaman iptal edebilir miyim?
                  </span>
                  <span className="transition group-open:rotate-180">
                    <svg
                      fill="none"
                      height="24"
                      shapeRendering="geometricPrecision"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <p className="text-gray-600 text-sm px-6 pb-6 leading-relaxed">
                  Elbette! Profil sayfanızdaki "Aboneliklerim" sekmesinden tek
                  tıkla iptal edebilirsiniz. Hiçbir taahhüt veya cayma bedeli
                  yoktur.
                </p>
              </details>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <details className="group">
                <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 text-gray-800">
                  <span> Kutunun içindekileri ben seçebilir miyim?</span>
                  <span className="transition group-open:rotate-180">
                    <svg
                      fill="none"
                      height="24"
                      shapeRendering="geometricPrecision"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <p className="text-gray-600 text-sm px-6 pb-6 leading-relaxed">
                  Sürpriz kutu konseptimizde içerikleri uzmanlarımız seçer.
                  Ancak dostunuzun alerjisi veya özel durumu varsa, profil
                  oluştururken belirtebilirsiniz, buna göre özel seçim yaparız.
                </p>
              </details>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <details className="group">
                <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 text-gray-800">
                  <span> Kargo ücreti ödüyor muyum?</span>
                  <span className="transition group-open:rotate-180">
                    <svg
                      fill="none"
                      height="24"
                      shapeRendering="geometricPrecision"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <p className="text-gray-600 text-sm px-6 pb-6 leading-relaxed">
                  Hayır! CanDostumBox ailesinde kargo her zaman ücretsizdir.
                  Sadece kutu ücretini ödersiniz.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* --- MUTLU KULÜP (KORUNDU) --- */}
      <section className="py-20 bg-orange-50/50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Mutlu CanDostumBox Kulübü 🐶🐱
          </h2>
          <p className="text-gray-500 mb-12">
            Binlerce dostumuz ve sahibi yanılıyor olamaz! İşte ailemizden
            kareler.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center text-xl">
                  👩
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 text-sm">
                    Ayşe Y. & Boncuk
                  </h4>
                  <div className="text-yellow-400 text-xs">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm italic leading-relaxed text-left">
                "Boncuk kargo sesini duyunca kapıya koşuyor artık. İçinden çıkan
                ödül mamalarına bayıldı, oyuncaklar ise gerçekten çok
                dayanıklı."
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 hover:shadow-md transition transform md:-translate-y-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-xl">
                  🧔
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 text-sm">
                    Mert K. & Thor
                  </h4>
                  <div className="text-yellow-400 text-xs">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm italic leading-relaxed text-left">
                "Premium kutuyu denemek için aldık, şimdi vazgeçemiyoruz.
                Özellikle her ay farklı bir tema olması çok heyecan verici.
                Teşekkürler!"
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-xl">
                  👧
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 text-sm">
                    Elif S. & Limon
                  </h4>
                  <div className="text-yellow-400 text-xs">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm italic leading-relaxed text-left">
                "Kedi Limon normalde çok seçicidir ama bu kutudaki yaş mamaları
                iştahla yedi. Oyuncaklarla oynayıp duruyor. Kesinlikle tavsiye
                ederim."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER (KORUNDU) --- */}
      <footer className="bg-gray-900 text-white py-20 border-t border-gray-800 mt-0">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <img
                  src="/logo_arka.png"
                  alt="Logo"
                  className="h-10 w-auto opacity-90 invert brightness-0"
                />
                <span className="font-bold text-xl">CanDostumBox</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Minik dostlarınız için her ay özenle hazırlanan sürpriz mutluluk
                kutuları. Sevgiyle paketlendi.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Kurumsal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-green-400 transition">
                    Hakkımızda
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("sss");
                    }}
                    className="hover:text-green-400 transition"
                  >
                    Sıkça Sorulan Sorular
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition">
                    İletişim
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Yasal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-green-400 transition">
                    Kullanım Koşulları
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition">
                    Gizlilik Politikası
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-400 transition">
                    Mesafeli Satış Sözleşmesi
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Haberdar Olun</h4>
              <p className="text-gray-400 text-sm mb-4">
                Kampanyalardan ilk siz haberdar olun.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="E-posta adresiniz"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm w-full outline-none focus:border-green-500 text-white"
                />
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-green-700 transition">
                  Go
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 Can Dostum Box. Tüm hakları saklıdır.
            </p>
            <div className="flex gap-6 text-gray-400">
              <span className="cursor-pointer hover:text-white transition">
                Instagram
              </span>
              <span className="cursor-pointer hover:text-white transition">
                Twitter
              </span>
              <span className="cursor-pointer hover:text-white transition">
                TikTok
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
