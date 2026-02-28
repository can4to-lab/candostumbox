"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Image from "next/image";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";

// --- NAVBAR & LOGIN İÇİN GEREKLİ ---
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  features: string[];
  image?: string;
  order: number;
}

function ProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- UPGRADE MODU DEĞİŞKENLERİ ---
  const isUpgradeMode = searchParams.get("mode") === "upgrade";
  const urlOldPrice = Number(searchParams.get("oldPrice"));
  const oldSubId = searchParams.get("oldSubId");
  const petName = searchParams.get("petName") || "Dostun";

  // --- STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterThreshold, setFilterThreshold] = useState(urlOldPrice || 0);

  // Auth State
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- 1. VERİ ÇEKME ---
  useEffect(() => {
    const initPage = async () => {
      const token = localStorage.getItem("token");
      if (token) setIsLoggedIn(true);

      try {
        const res = await fetch("https://api.candostumbox.com/products");
        const data = await res.json();
        const sortedProducts = Array.isArray(data)
          ? data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          : [];
        setProducts(sortedProducts);
      } catch (error) {
        console.error("Paketler yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  // --- 2. UPGRADE FİYAT KONTROLÜ ---
  useEffect(() => {
    if (isUpgradeMode && filterThreshold === 0 && oldSubId) {
      const fetchOldSubPrice = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
          const res = await fetch(
            `https://api.candostumbox.com/subscriptions/${oldSubId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (res.ok) {
            const subData = await res.json();
            if (subData.product && subData.product.price) {
              setFilterThreshold(Number(subData.product.price));
            }
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchOldSubPrice();
    }
  }, [isUpgradeMode, filterThreshold, oldSubId]);

  const displayedProducts = isUpgradeMode
    ? products.filter((p) => Number(p.price) > filterThreshold)
    : products;

  const handleSelectPackage = (id: string) => {
    if (isUpgradeMode) {
      const currentParams = new URLSearchParams(
        Array.from(searchParams.entries()),
      );
      if (!currentParams.has("oldPrice") && filterThreshold > 0) {
        currentParams.set("oldPrice", filterThreshold.toString());
      }
      router.push(`/product/${id}?${currentParams.toString()}`);
    } else {
      router.push(`/product/${id}`);
    }
  };

  const faqData = [
    {
      q: "Aboneliği istediğim zaman iptal edebilir miyim?",
      a: "Kesinlikle! Taahhüt veya cayma bedeli yoktur. Profilinizden tek tıkla, anında iptal edebilirsiniz.",
    },
    {
      q: "Kutunun içindekileri ben seçebilir miyim?",
      a: "Kutularımız 'sürpriz' konseptlidir. Ancak kayıt sırasında dostunuzun ırkını, yaşını ve alerjilerini belirtirseniz, uzmanlarımız ona en uygun ürünleri seçecektir.",
    },
    {
      q: "Ödeme ne zaman ve nasıl alınır?",
      a: "İlk ödeme sipariş anında alınır. Sonraki ödemeler, her ayın aynı gününde kayıtlı kartınızdan otomatik ve güvenli bir şekilde (ParamPOS altyapısıyla) tahsil edilir.",
    },
    {
      q: "Kargo ücreti var mı?",
      a: "Hayır, tüm abonelik paketlerimizde kargo Türkiye'nin her yerine tamamen ücretsizdir.",
    },
  ];

  return (
    <main className="min-h-screen bg-white font-sans pb-20 text-[#111827]">
      <Toaster position="top-right" />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
        onLoginSuccess={() => window.location.reload()}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
        initialData={null}
        onRegisterSuccess={() => window.location.reload()}
      />

      {/* ================================================================== */}
      {/* 🦸‍♂️ HERO BÖLÜMÜ (Orijinal Canlı Tasarım) 🦸‍♂️ */}
      {/* ================================================================== */}
      <div className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
        {/* Arkaplan Deseni */}
        <div className="absolute inset-0 bg-white">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {isUpgradeMode ? (
            <div className="inline-block animate-fade-in-up mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 md:p-8 max-w-3xl mx-auto shadow-sm">
                <div className="text-5xl mb-4">🚀</div>
                <h2 className="text-2xl md:text-3xl font-black text-blue-900 mb-3">
                  Seviye Atlatma Zamanı!
                </h2>
                <p className="text-blue-700 md:text-lg leading-relaxed">
                  <span className="font-bold">{petName}</span> bu değişimi çok
                  sevecek. Mevcut paketinden daha kapsamlı, daha dolu ve daha
                  eğlenceli paketleri senin için sıraladık.
                </p>
              </div>
            </div>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-green-100/50 border border-green-200 text-green-700 font-bold text-xs tracking-wider uppercase mb-6 animate-fade-in-up hover:scale-105 transition cursor-default">
                <span>✨</span> Mutluluk Garantili Kutular
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight animate-fade-in-up delay-100 leading-[1.1]">
                Dostun İçin{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                    Kusursuz
                  </span>
                  <span className="absolute bottom-2 left-0 w-full h-3 bg-green-100/50 -z-0 -rotate-1"></span>
                </span>{" "}
                <br className="hidden md:block" />
                Paketi Seç
              </h1>
              <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                Her ay yenilenen temalar, veteriner onaylı ürünler ve sürpriz
                hediyeler. Üstelik iptal etmek istediğin an tek tıkla özgürsün.
              </p>
            </>
          )}

          {/* GÜVEN BARI */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-10 animate-fade-in-up delay-300">
            {[
              { icon: "🚚", text: "Ücretsiz Kargo", sub: "Tüm Türkiye'ye" },
              { icon: "🛡️", text: "Güvenli Ödeme", sub: "256-bit SSL & Param" },
              { icon: "↩️", text: "Kolay İptal", sub: "Cayma bedeli yok" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-default"
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="text-left">
                  <div className="font-bold text-gray-900 text-sm">
                    {item.text}
                  </div>
                  <div className="text-xs text-gray-500">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 2. PAKETLER (Figma Tarzı Fiyatlandırma Tablosu) */}
      {/* ================================================================== */}
      <div className="py-12 container mx-auto px-4 md:px-6">
        {loading && (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#10b981] rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Paketler yükleniyor...</p>
          </div>
        )}

        {!loading && displayedProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {displayedProducts.map((product, index) => {
              // Orta paketi (index === 1) veya ismi 'Premium' olanı "Popüler" olarak işaretle
              const isPopular =
                product.name.toLowerCase().includes("premium") || index === 1;
              const hasStock = product.stock > 0;

              return (
                <div
                  key={product.id}
                  className={`flex flex-col p-8 rounded-3xl bg-white transition-all duration-300 border
                    ${!hasStock ? "grayscale opacity-70 cursor-not-allowed" : ""}
                    ${
                      isPopular
                        ? "border-[#10b981] shadow-xl scale-105 z-10 relative" // Popüler paket vurgusu
                        : "border-gray-200 shadow-sm hover:shadow-md"
                    }
                  `}
                >
                  {isPopular && hasStock && (
                    <div className="absolute top-0 inset-x-0 -mt-4 flex justify-center">
                      <span className="bg-[#10b981] text-white text-sm font-bold py-1 px-4 rounded-full uppercase tracking-wider">
                        En Çok Tercih Edilen
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-4">{product.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed min-h-[48px]">
                      {product.description || "Aylık mutluluk dozunuz."}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold tracking-tight">
                        ₺{Number(product.price).toFixed(0)}
                      </span>
                      <span className="text-gray-500 font-medium">/ ay</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 font-medium">
                      (KDV Dahil)
                    </p>
                    {isUpgradeMode && (
                      <p className="text-sm text-[#10b981] mt-2 font-medium">
                        * İade tutarı ödemede düşülecek
                      </p>
                    )}
                  </div>

                  <ul className="space-y-4 mb-10 flex-grow">
                    {product.features && product.features.length > 0 ? (
                      product.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm text-gray-700"
                        >
                          {/* Figma tarzı yeşil tik */}
                          <svg
                            className={`w-5 h-5 flex-shrink-0 ${isPopular ? "text-[#10b981]" : "text-gray-400"}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-medium leading-tight pt-0.5">
                            {feature}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 italic">
                        Özellikler yükleniyor...
                      </li>
                    )}
                  </ul>

                  <button
                    onClick={() => handleSelectPackage(product.id)}
                    disabled={!hasStock}
                    className={`
    group relative overflow-hidden w-full py-4 rounded-xl font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2
    ${
      !hasStock
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : isPopular
          ? "bg-[#10b981] text-white hover:bg-[#059669] hover:shadow-[0_15px_35px_rgba(16,185,129,0.4)]"
          : "bg-[#111827] text-white hover:bg-black hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)]"
    }
  `}
                  >
                    {/* Stok varsa Parlama Efekti Aktif Olur */}
                    {hasStock && (
                      <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-25deg] -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                    )}

                    <span className="relative z-10">
                      {!hasStock
                        ? "Stok Dışı"
                        : isUpgradeMode
                          ? "Paketi Yükselt 🚀"
                          : "İNCELE & SATIN AL 🐾"}
                    </span>

                    {hasStock && (
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
                    )}

                    {/* Shimmer Animasyonu için Style */}
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
        )}
      </div>

      {/* ================================================================== */}
      {/* 3. KUTU İÇERİĞİ (Figma Tarzı Görsel + Liste Bölümü) */}
      {/* ================================================================== */}
      {!isUpgradeMode && (
        <div className="py-24 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* SOL TARA: GÖRSEL */}
              <div className="relative h-[500px] rounded-[2rem] overflow-hidden shadow-xl">
                <Image
                  src="/kutu_icerik_urun.png"
                  alt="Can Dostum Box Kutu İçeriği"
                  fill
                  className="object-cover"
                />
              </div>

              {/* SAĞ TARAF: İÇERİK LİSTESİ */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  Kutunun İçinde Neler Var?
                </h2>
                <p className="text-lg text-gray-600 mb-12 leading-relaxed">
                  Her ay veteriner hekimlerimiz ve uzman eğitmenlerimiz
                  tarafından, dostunuzun ihtiyaçlarına özel olarak seçilen
                  sürpriz ürünler.
                </p>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      🦴 Doğal & Sağlıklı Atıştırmalıklar
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Katkı maddesi içermeyen, eğitimde veya ödül olarak
                      kullanabileceğiniz, tamamen doğal ve besleyici
                      atıştırmalıklar.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      🧸 Zeka & Aktivite Oyuncakları
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Dostunuzun zihinsel gelişimini destekleyen, sıkılmasını
                      önleyen, dayanıklı ve interaktif oyuncaklar.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      🧴 Faydalı Bakım Ürünleri
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Tüy ve deri sağlığını destekleyen şampuanlar, pati
                      kremleri veya hayatı kolaylaştıran pratik bakım gereçleri.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 4. SIKÇA SORULAN SORULAR (Figma Tarzı Akordiyon) */}
      {/* ================================================================== */}
      {!isUpgradeMode && (
        <div className="py-24 container mx-auto px-4 md:px-6 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <Disclosure
                key={index}
                as="div"
                className="border-b border-gray-200 pb-4"
              >
                {({ open }: { open: boolean }) => (
                  <>
                    <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-lg font-medium text-left text-[#111827] bg-white hover:text-[#10b981] transition-colors focus:outline-none focus-visible:ring focus-visible:ring-[#10b981] focus-visible:ring-opacity-75">
                      <span>{item.q}</span>
                      <ChevronUpIcon
                        className={`${open ? "transform rotate-180" : ""} w-6 h-6 text-gray-400 transition-transform duration-200`}
                      />
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-200 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-100 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="px-4 pt-2 pb-2 text-gray-600 leading-relaxed">
                        {item.a}
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600">
              Başka bir sorunuz mu var?{" "}
              <a
                href="mailto:destek@candostumbox.com"
                className="text-[#10b981] font-bold hover:underline"
              >
                Bize ulaşın.
              </a>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default function PaketlerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#10b981] rounded-full animate-spin"></div>
        </div>
      }
    >
      <ProductContent />
    </Suspense>
  );
}
