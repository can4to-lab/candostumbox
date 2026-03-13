"use client";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";
import WelcomePopUp from "@/components/WelcomePopUp";

interface Product {
  id: string; // ID string olabilir (UUID)
  name: string;
  price: number;
  description: string;
  stock: number;
  image?: string;
  features?: string[];
  order?: number;
}

export default function Home() {
  const router = useRouter();

  // --- STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Modal State
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);

  // Data State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasOrders, setHasOrders] = useState(false);
  // Instagram State
  const [instagramFeed, setInstagramFeed] = useState<any[]>([]);
  const [instaLoading, setInstaLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  // --- SLIDER VERİLERİ ---
  const slides = [
    {
      id: 1,
      badge: "🚀 En Popüler",
      title: "Dostun İçin Mutluluk Kutusu",
      description:
        "İçinde ne olduğunu sadece biz biliyoruz! Her ay kapına gelen sürpriz lezzet ve oyun şöleni.",
      image: "/slider_1.png",
      btnColor: "bg-green-600 hover:bg-green-700 border-green-600",
    },
    {
      id: 2,
      badge: "✨ Premium",
      title: "Sıkıcı Oyuncaklara Veda Et",
      description:
        "Sıradan bir top yerine, zeka geliştirici ve dayanıklı oyuncaklar gönderiyoruz.",
      image: "/slider_2.png",
      btnColor: "bg-orange-500 hover:bg-orange-600 border-orange-500",
    },
    {
      id: 3,
      badge: "🛡️ %100 Güvenli",
      title: "Veteriner Hekim Onaylı",
      description:
        "Dostunun sağlığı şakaya gelmez. Her ürün uzman veterinerlerimizce kontrol edilir.",
      image: "/slider_3.png",
      btnColor: "bg-blue-600 hover:bg-blue-700 border-blue-600",
    },
  ];

  // --- SLIDER OTOMATİK GEÇİŞ GÜNCELLEME ---
  useEffect(() => {
    const interval = setInterval(() => {
      // slides.length yerine direkt 3 yazabilirsin ya da fonksiyonel güncelleme kullan:
      setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1));
    }, 5000); // 7 saniye çok uzun gelebilir, 5 idealdir.
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetch("https://api.candostumbox.com/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((orders) => {
          if (Array.isArray(orders) && orders.length > 0) setHasOrders(true);
        })
        .catch(() => setHasOrders(false));
    }

    const urunleriGetir = async () => {
      try {
        const cevap = await fetch("https://api.candostumbox.com/products");
        const veri = await cevap.json();
        // Order'a göre sırala
        const siraliUrunler = Array.isArray(veri)
          ? veri.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          : [];
        setProducts(siraliUrunler);
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };
    urunleriGetir();

    const instagramGetir = async () => {
      try {
        const cevap = await fetch(
          "https://api.candostumbox.com/instagram/feed",
        );
        const veri = await cevap.json();
        if (veri.status === "success") {
          setInstagramFeed(veri.data);
        }
      } catch (error) {
        console.error("Instagram Hatası:", error);
      } finally {
        setInstaLoading(false);
      }
    };
    instagramGetir(); // Bunu useEffect içinde çağır
  }, []);

  const handleRegisterSuccess = () => {
    setIsLoggedIn(true);
    setRegisterOpen(false);
    window.location.reload();
  };

  const getHeroButtonConfig = (slideId: number) => {
    let config = {
      text: "Kutunu Seç 🎁",
      action: () => router.push("/product"),
    };
    if (slideId === 3)
      return { text: "Bizi Tanı 🩺", action: () => router.push("/about") };
    if (isLoggedIn) {
      if (hasOrders)
        config = {
          text: "Kutunu Takip Et 📦",
          action: () => router.push("/profile?tab=siparisler"),
        };
      else
        config = {
          text: "İlk Paketini Seç 🎁",
          action: () => router.push("/product"),
        };
    }
    return config;
  };

  // İlk 3 ürünü al (Çok Satanlar için)
  const bestSellers = products.slice(0, 3);

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans relative">
      <Toaster position="top-right" />

      {/* LANSMANDAN 2 GÜN SONRA DEVREYE ALINACAK ANASAYFA İNDİRİM KODU */}
      {/* <WelcomePopUp /> */}

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
      {/* 🖼️ BÖLÜM 1: GÖRSEL SLIDER */}
      {/* ================================================================== */}
      <div className="relative w-full overflow-hidden group bg-gray-100">
        <div
          className="flex transition-transform duration-700 ease-in-out h-[350px] md:h-[550px] lg:h-[650px]"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="w-full flex-shrink-0 relative h-full"
            >
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

        {/* Oklar */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 md:left-8 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/30 hover:bg-white/50 backdrop-blur-md text-white rounded-full transition-all z-20"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
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
          className="absolute top-1/2 right-4 md:right-8 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/30 hover:bg-white/50 backdrop-blur-md text-white rounded-full transition-all z-20"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
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
      </div>

      {/* ================================================================== */}
      {/* 📝 BÖLÜM 2: METİN SLIDER */}
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
                <div
                  key={slide.id}
                  className="w-full flex-shrink-0 flex flex-col items-center text-center px-4"
                >
                  <span className="inline-block py-1.5 px-3 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] md:text-xs tracking-wider uppercase mb-3">
                    {slide.badge}
                  </span>
                  <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-sm md:text-lg text-gray-500 font-medium max-w-2xl mx-auto mb-6 leading-relaxed">
                    {slide.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={btnConfig.action}
                      className={`px-6 py-3 rounded-xl text-white font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 ${slide.btnColor}`}
                    >
                      {btnConfig.text}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index ? "bg-gray-800 w-8" : "bg-gray-300 w-2 hover:bg-gray-400"}`}
              ></button>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 📸 BÖLÜM: TOPLULUKTAN KARELER (HELLO BELLO TARZI) */}
      {/* ================================================================== */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4 text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-serif text-[#2b1c4a] mb-6">
            Can Dostum Ailesinden Kareler
          </h2>

          {/* Instagram Tarzı Takip Et Butonu */}
          <a
            href="https://instagram.com/candostumbox"
            target="_blank"
            className="inline-flex items-center gap-2 bg-[#fafafa] border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all shadow-sm group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px]">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-1">
                <img
                  src="/insta-icon.png"
                  alt="Instagram"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <span className="font-semibold text-sm text-gray-700">
              @candostumbox
            </span>
            <span className="bg-[#0095f6] text-white text-xs font-bold px-3 py-1 rounded-md group-hover:bg-[#1877f2]">
              Takip Et
            </span>
          </a>
        </div>

        {/* Yatay Kaydırılabilir Alan */}
        <div className="flex gap-4 overflow-x-auto pb-8 px-4 md:px-10 no-scrollbar">
          {instaLoading
            ? [1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="min-w-[280px] md:min-w-[320px] aspect-square bg-gray-100 animate-pulse rounded-lg"
                />
              ))
            : instagramFeed.map((post) => (
                <div
                  key={post.id}
                  className="min-w-[280px] md:min-w-[320px] relative aspect-square group cursor-pointer overflow-hidden rounded-lg shadow-sm border border-gray-100"
                  onClick={() => setSelectedPost(post)} // Modal açmak için
                >
                  <Image
                    src={
                      post.media_type === "VIDEO"
                        ? post.thumbnail_url
                        : post.media_url
                    }
                    alt="Pati Dostu"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {post.media_type === "VIDEO" && (
                    <div className="absolute top-3 right-3 text-white drop-shadow-md">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
        </div>
      </section>
      {/* ================================================================== */}
      {/* 🔥 BÖLÜM 3: ÇOK SATANLAR (YENİ EKLENDİ) */}
      {/* ================================================================== */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              En Çok Tercih Edilen Paketler
            </h2>
            <p className="text-gray-500">
              Binlerce pati dostumuzun favorisi olan kutulara göz atın.
            </p>
          </div>

          {!loading && bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {bestSellers.map((product, index) => {
                const isPopular = index === 1; // Ortadaki ürünü popüler yap
                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-[2rem] p-8 flex flex-col items-center text-center transition-all duration-300 ${isPopular ? "border-2 border-green-500 shadow-xl scale-105 z-10" : "border border-gray-100 shadow-sm hover:shadow-lg"}`}
                  >
                    {isPopular && (
                      <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                        🌟 Editörün Seçimi
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <div className="text-gray-400 text-sm mb-6 flex-grow flex items-center justify-center">
                      {product.description ||
                        "Sürprizlerle dolu harika bir kutu."}
                    </div>
                    <div className="text-3xl font-black text-gray-900 mb-6">
                      ₺{Number(product.price).toFixed(0)}{" "}
                      <span className="text-sm font-medium text-gray-400">
                        /ay
                      </span>
                    </div>
                    <button
                      onClick={() => router.push(`/product/${product.id}`)}
                      className={`
                                  group relative overflow-hidden w-full py-4 rounded-2xl font-black uppercase tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3
                                    ${
                                      isPopular
                                        ? "bg-green-500 text-white hover:bg-green-600 hover:shadow-[0_20px_50px_rgba(34,197,94,0.4)]"
                                        : "bg-gray-900 text-white hover:bg-black hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                                    }
                          `}
                    >
                      {/* Parlama Efekti (Hover olunca üzerinden ışık geçer) */}
                      <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-25deg] -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>

                      <span className="relative z-10">
                        İNCELE & SATIN AL 🐾
                      </span>

                      <svg
                        className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>

                      {/* Tailwind config'de shimmer animasyonu yoksa eklemek için inline style: */}
                      <style jsx>{`
                        @keyframes shimmer {
                          100% {
                            transform: translateX(250%);
                          }
                        }
                        .group-hover\:animate-\[shimmer_1s_infinite\]:hover {
                          animation: shimmer 1.5s infinite;
                        }
                      `}</style>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[1, 2, 3].map((skeleton) => (
                <div
                  key={skeleton}
                  className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm animate-pulse flex flex-col items-center"
                >
                  <div className="w-3/4 h-6 bg-gray-200 rounded-full mb-4"></div>
                  <div className="w-full h-4 bg-gray-200 rounded-full mb-2"></div>
                  <div className="w-5/6 h-4 bg-gray-200 rounded-full mb-8"></div>
                  <div className="w-1/2 h-10 bg-gray-200 rounded-xl mb-6"></div>
                  <div className="w-full h-14 bg-gray-200 rounded-2xl"></div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => router.push("/product")}
              className="text-gray-600 font-bold border-b-2 border-gray-300 hover:text-gray-900 hover:border-gray-900 transition pb-1"
            >
              Tüm Paketleri Gör ➔
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 🧩 BÖLÜM 4: KUTUDA NE VAR? (GÜNCELLENDİ - PRODUCT SAYFASI TARZI) */}
      {/* ================================================================== */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* SOL TARAF: GÖRSEL */}
            <div className="relative h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden shadow-2xl group">
              <Image
                src="/kutu_icerik.png"
                alt="Mutlu Köpek ve Kutu"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <div className="text-sm font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-block mb-2">
                  Her Ay Yeni Tema
                </div>
                <div className="text-2xl font-bold">Sürprizleri Keşfet</div>
              </div>
            </div>

            {/* SAĞ TARAF: İÇERİK LİSTESİ */}
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                Kutunun İçinden{" "}
                <span className="text-green-600">Neler Çıkıyor?</span>
              </h2>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                Sıradan pet shop ürünlerini unutun. Veteriner hekimlerimiz ve
                eğitmenlerimiz tarafından seçilen, piyasada bulamayacağınız özel
                ürünler.
              </p>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                    🦴
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Doğal Atıştırmalıklar
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Katkısız, sağlıklı ve lezzetli. Eğitimlerde motivasyon
                      için birebir.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl flex-shrink-0">
                    🧸
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Zeka Oyuncakları
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Dostunun zihinsel gelişimini destekleyen, dayanıklı
                      interaktif oyuncaklar.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
                    🧴
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Premium Bakım Ürünleri
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Tüy ve deri sağlığı için şampuanlar, pati kremleri ve
                      sürpriz aksesuarlar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 🛡️ BÖLÜM 5: GÜVEN & CTA (KULÜP YERİNE EKLENDİ) */}
      {/* ================================================================== */}
      <section className="py-20 bg-[#111827] text-white overflow-hidden relative">
        {/* Arkaplan Efektleri */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="text-green-400 font-bold tracking-widest text-sm uppercase mb-4 block">
            RİSK YOK, SADECE MUTLULUK VAR
          </span>
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            Memnun Kalmazsan İade Et
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
            Can Dostum Box ailesine katılmak tamamen risksizdir. Taahhüt yok,
            cayma bedeli yok. İstediğin an iptal edebilir, memnun kalmazsan
            paranı iade alabilirsin.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-6 mb-12">
            <div className="flex items-center gap-3 justify-center text-gray-300">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                ✓
              </div>
              <span>Kolay İptal</span>
            </div>
            <div className="flex items-center gap-3 justify-center text-gray-300">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                ✓
              </div>
              <span>Ücretsiz Kargo</span>
            </div>
            <div className="flex items-center gap-3 justify-center text-gray-300">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                ✓
              </div>
              <span>Güvenli Ödeme</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/product")}
            className="bg-green-500 hover:bg-green-600 text-white text-lg font-bold py-4 px-10 rounded-2xl shadow-xl shadow-green-900/50 transition-all hover:scale-105 active:scale-95"
          >
            Hemen Mutluluğu Başlat 🚀
          </button>
          <p className="mt-6 text-xs text-gray-500">
            Kredi kartı bilgileriniz 256-bit SSL ile korunmaktadır.
          </p>
        </div>
      </section>

      {/* MODALI BURAYA, MAIN ETİKETİNDEN HEMEN ÖNCEYE TAŞIDIK */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            {/* Sol: Görsel/Video */}
            <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-[300px]">
              <Image
                src={
                  selectedPost.media_type === "VIDEO"
                    ? selectedPost.thumbnail_url || selectedPost.media_url
                    : selectedPost.media_url
                }
                alt="Post"
                fill
                className="object-contain"
              />
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 left-4 text-white bg-black/20 rounded-full p-2 hover:bg-black/40 md:hidden"
              >
                ✕
              </button>
            </div>

            {/* Sağ: Detaylar */}
            <div className="md:w-2/5 p-6 flex flex-col h-full bg-white">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                  <Image
                    src="/logo.png"
                    alt="CanDostum"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">
                    candostumbox
                  </p>
                  <p className="text-xs text-gray-400">Instagram</p>
                </div>
              </div>
              <div className="flex-grow overflow-y-auto text-sm text-gray-600 leading-relaxed mb-6 whitespace-pre-wrap">
                {selectedPost.caption}
              </div>
              <a
                href={selectedPost.permalink}
                target="_blank"
                className="w-full bg-[#0095f6] text-white py-3 rounded-lg font-bold text-center hover:bg-[#1877f2] transition-colors"
              >
                Instagram'da Görüntüle
              </a>
              <button
                onClick={() => setSelectedPost(null)}
                className="mt-4 text-gray-400 text-xs font-medium uppercase tracking-widest hover:text-gray-900"
              >
                KAPAT
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
