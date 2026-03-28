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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
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
            `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${oldSubId}`,
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
    <main className="min-h-screen bg-[#F8F9FA] font-sans pb-20 text-[#111827]">
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
      {/* 🦸‍♂️ HERO BÖLÜMÜ (Modern Glow Efektli) 🦸‍♂️ */}
      {/* ================================================================== */}
      <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-white">
        {/* Arka Plan Glow Efektleri */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-pulse"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-pulse delay-1000"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {isUpgradeMode ? (
            <div className="inline-block animate-fade-in-up mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[2rem] p-8 md:p-10 max-w-3xl mx-auto shadow-lg shadow-blue-900/5">
                <div className="text-6xl mb-4 animate-bounce">🚀</div>
                <h2 className="text-3xl md:text-4xl font-black text-blue-950 mb-4 tracking-tight">
                  Seviye Atlatma Zamanı!
                </h2>
                <p className="text-blue-800 md:text-lg leading-relaxed font-medium">
                  <span className="font-black bg-blue-200 px-2 py-1 rounded-md">
                    {petName}
                  </span>{" "}
                  bu değişimi çok sevecek. Mevcut paketinden daha kapsamlı ve
                  eğlenceli paketleri senin için sıraladık.
                </p>
              </div>
            </div>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-green-50 border border-green-200 text-green-700 font-bold text-xs tracking-widest uppercase mb-6 shadow-sm">
                <span className="animate-pulse">✨</span> Mutluluk Garantili
                Kutular
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-[1.15]">
                Dostun İçin{" "}
                <span className="relative inline-block whitespace-nowrap">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                    Kusursuz
                  </span>
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-green-200/50 -z-0 -rotate-2 rounded-full"></span>
                </span>{" "}
                <br className="hidden md:block" />
                Paketi Seç
              </h1>
              <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
                Her ay yenilenen temalar, veteriner onaylı ürünler ve sürpriz
                hediyeler. Üstelik iptal etmek istediğin an tek tıkla özgürsün.
              </p>
            </>
          )}

          {/* GÜVEN BARI (Kart Tasarımlı) */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-12">
            {[
              { icon: "🚚", text: "Ücretsiz Kargo", sub: "Tüm Türkiye'ye" },
              { icon: "🔒", text: "Güvenli Ödeme", sub: "256-bit SSL Koruma" },
              { icon: "✨", text: "Kolay İptal", sub: "Cayma bedeli yok" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl shadow-inner">
                  {item.icon}
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900 text-sm">
                    {item.text}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {item.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 2. PAKETLER (Fiyatlandırma Tablosu) */}
      {/* ================================================================== */}
      <div className="py-16 container mx-auto px-4 md:px-6 relative z-20 -mt-8">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {[1, 2, 3].map((skeleton) => (
              <div
                key={skeleton}
                className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm animate-pulse flex flex-col"
              >
                <div className="w-1/2 h-8 bg-gray-200 rounded-lg mb-4"></div>
                <div className="w-full h-4 bg-gray-100 rounded-full mb-2"></div>
                <div className="w-3/4 h-4 bg-gray-100 rounded-full mb-8"></div>
                <div className="w-2/3 h-12 bg-gray-200 rounded-xl mb-10"></div>
                <div className="space-y-3 flex-grow mb-8">
                  <div className="w-full h-3 bg-gray-100 rounded-full"></div>
                  <div className="w-5/6 h-3 bg-gray-100 rounded-full"></div>
                  <div className="w-full h-3 bg-gray-100 rounded-full"></div>
                </div>
                <div className="w-full h-14 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && displayedProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {displayedProducts.map((product, index) => {
              const isPopular =
                product.name.toLowerCase().includes("premium") || index === 1;
              const hasStock = product.stock > 0;

              return (
                <div
                  key={product.id}
                  className={`relative flex flex-col p-8 rounded-[2rem] bg-white transition-all duration-500 border
                    ${!hasStock ? "grayscale opacity-70 cursor-not-allowed" : "hover:-translate-y-2"}
                    ${isPopular ? "border-green-500 shadow-2xl md:scale-105 z-10 ring-4 ring-green-500/10" : "border-gray-200 shadow-lg hover:shadow-xl"}
                  `}
                >
                  {/* Popüler Paket Etiketi */}
                  {isPopular && hasStock && (
                    <div className="absolute -top-4 inset-x-0 flex justify-center z-20">
                      <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[11px] font-black py-2 px-6 rounded-full shadow-lg shadow-green-500/40 uppercase tracking-widest border border-green-400">
                        🌟 En Çok Tercih Edilen
                      </span>
                    </div>
                  )}

                  <div className="mb-6 mt-2">
                    <h3 className="text-2xl font-black text-gray-900 mb-3">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed min-h-[40px]">
                      {product.description ||
                        "Dostunuz için özenle seçilmiş sürprizler."}
                    </p>
                  </div>

                  <div className="mb-8 pb-8 border-b border-gray-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-gray-900 tracking-tighter">
                        ₺{Number(product.price).toFixed(0)}
                      </span>
                      <span className="text-gray-400 font-bold text-lg">
                        / ay
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 font-medium bg-gray-50 inline-block px-3 py-1 rounded-md">
                      KDV Kargo Dahil Fiyat
                    </p>
                    {isUpgradeMode && (
                      <p className="text-xs text-blue-600 mt-2 font-bold bg-blue-50 inline-block px-3 py-1 rounded-md">
                        * İade tutarı ödemede düşülecek
                      </p>
                    )}
                  </div>

                  <ul className="space-y-4 flex-grow mb-10">
                    {product.features && product.features.length > 0 ? (
                      product.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isPopular ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
                          >
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-700 leading-tight">
                            {feature}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-400 italic">
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
                            ? "bg-green-500 text-white hover:bg-green-600 hover:shadow-[0_10px_25px_rgba(34,197,94,0.4)]"
                            : "bg-gray-900 text-white hover:bg-black hover:shadow-[0_10px_25px_rgba(0,0,0,0.3)]"
                      }
                    `}
                  >
                    {hasStock && (
                      <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-25deg] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    )}
                    <span className="relative z-10">
                      {!hasStock
                        ? "Stok Dışı"
                        : isUpgradeMode
                          ? "Paketi Yükselt 🚀"
                          : "İncele & Satın Al 🐾"}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* 3. KUTU İÇERİĞİ */}
      {/* ================================================================== */}
      {!isUpgradeMode && (
        <div className="py-24 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* SOL TARA: GÖRSEL */}
              <div className="relative h-[450px] md:h-[550px] rounded-[3rem] overflow-hidden shadow-2xl group">
                <Image
                  src="/kutu_icerik_urun.png"
                  alt="Can Dostum Box Kutu İçeriği"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Resim Üzeri İnce Karartma */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>

              {/* SAĞ TARAF: İÇERİK LİSTESİ */}
              <div>
                <h2 className="text-3xl md:text-5xl font-black mb-6 text-gray-900 tracking-tight">
                  Kutunun İçinde{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                    Neler Var?
                  </span>
                </h2>
                <p className="text-lg text-gray-500 font-medium mb-12 leading-relaxed">
                  Her ay veteriner hekimlerimiz ve uzman eğitmenlerimiz
                  tarafından, dostunuzun ihtiyaçlarına özel olarak seçilen
                  sürpriz ürünler.
                </p>

                <div className="space-y-8">
                  {/* Madde 1 */}
                  <div className="flex gap-5 items-start">
                    <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                      🦴
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Doğal & Sağlıklı Atıştırmalıklar
                      </h3>
                      <p className="text-gray-500 font-medium leading-relaxed">
                        Katkı maddesi içermeyen, eğitimde veya ödül olarak
                        kullanabileceğiniz besleyici atıştırmalıklar.
                      </p>
                    </div>
                  </div>
                  {/* Madde 2 */}
                  <div className="flex gap-5 items-start">
                    <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                      🧸
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Zeka & Aktivite Oyuncakları
                      </h3>
                      <p className="text-gray-500 font-medium leading-relaxed">
                        Dostunuzun zihinsel gelişimini destekleyen, sıkılmasını
                        önleyen, dayanıklı ve interaktif oyuncaklar.
                      </p>
                    </div>
                  </div>
                  {/* Madde 3 */}
                  <div className="flex gap-5 items-start">
                    <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                      🧴
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Faydalı Bakım Ürünleri
                      </h3>
                      <p className="text-gray-500 font-medium leading-relaxed">
                        Tüy ve deri sağlığını destekleyen şampuanlar, pati
                        kremleri veya pratik bakım gereçleri.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 4. SIKÇA SORULAN SORULAR (Modern Kart Tasarımı) */}
      {/* ================================================================== */}
      {!isUpgradeMode && (
        <div className="py-24 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
                Aklınıza Takılanlar
              </h2>
              <p className="text-gray-500 font-medium">
                Sürecin ne kadar kolay olduğunu görün.
              </p>
            </div>

            <div className="space-y-4">
              {faqData.map((item, index) => (
                <Disclosure
                  key={index}
                  as="div"
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {({ open }: { open: boolean }) => (
                    <>
                      <Disclosure.Button className="flex justify-between w-full px-6 py-5 text-left focus:outline-none rounded-2xl">
                        <span
                          className={`text-lg font-bold transition-colors ${open ? "text-green-600" : "text-gray-800"}`}
                        >
                          {item.q}
                        </span>
                        <ChevronUpIcon
                          className={`${open ? "transform rotate-180 text-green-500" : "text-gray-400"} w-6 h-6 transition-transform duration-300 flex-shrink-0`}
                        />
                      </Disclosure.Button>
                      <Transition
                        enter="transition duration-200 ease-out"
                        enterFrom="transform scale-95 opacity-0 h-0"
                        enterTo="transform scale-100 opacity-100 h-auto"
                        leave="transition duration-100 ease-out"
                        leaveFrom="transform scale-100 opacity-100 h-auto"
                        leaveTo="transform scale-95 opacity-0 h-0"
                      >
                        <Disclosure.Panel className="px-6 pb-6 text-gray-600 font-medium leading-relaxed">
                          {item.a}
                        </Disclosure.Panel>
                      </Transition>
                    </>
                  )}
                </Disclosure>
              ))}
            </div>

            <div className="text-center mt-12 bg-green-100/50 rounded-2xl p-6 border border-green-200">
              <p className="text-green-800 font-medium">
                Başka bir sorunuz mu var? Hızlıca{" "}
                <a
                  href="mailto:destek@candostumbox.com"
                  className="text-green-600 font-black hover:underline"
                >
                  bize ulaşın.
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Özel Shimmer Keyframes */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(250%);
          }
        }
      `}</style>
    </main>
  );
}

export default function PaketlerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      }
    >
      <ProductContent />
    </Suspense>
  );
}
