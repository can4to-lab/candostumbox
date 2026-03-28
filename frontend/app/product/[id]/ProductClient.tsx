"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Toaster } from "react-hot-toast";

// --- INTERFACELER ---
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  features: string[];
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- YARDIMCI BİLEŞEN: TAKSİT TABLOSU (Premium Tasarım) ---
const InstallmentInfo = () => {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/60 p-8 rounded-[2rem] text-center animate-fade-in-up">
      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mx-auto mb-4 border border-orange-100">
        💳
      </div>
      <h4 className="font-black text-gray-900 mb-3 text-xl">Taksit İmkanı</h4>
      <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto font-medium">
        Tüm kredi kartlarına{" "}
        <strong className="text-orange-600">12 taksite varan</strong> vade
        seçenekleri sunuyoruz.
        <br />
        <br />
        <span className="text-xs bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 block">
          Kesin taksit tutarlarını ödeme adımında görebilirsiniz.
        </span>
      </p>
    </div>
  );
};

// --- YARDIMCI BİLEŞEN: GERÇEK YORUMLAR ---
const ReviewsSection = ({ productId }: { productId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/reviews/product/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (error) {
        console.error("Yorumlar çekilemedi", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        ).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Özet Kartı */}
      <div className="flex items-center justify-center md:justify-start gap-5 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)]">
        <div className="text-center">
          <div className="text-5xl font-black text-gray-900 tracking-tighter">
            {averageRating}
          </div>
          <div className="text-yellow-400 text-lg tracking-widest mt-1">
            ★★★★★
          </div>
        </div>
        <div className="border-l-2 border-gray-100 pl-5 py-2">
          <p className="text-gray-900 font-black text-lg">Harika Deneyim</p>
          <p className="text-gray-500 text-sm font-medium">
            {reviews.length} Mutlu Müşteri
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-8 animate-pulse">
          Yorumlar yükleniyor...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 bg-gray-50 rounded-[2rem]">
          <span className="text-4xl block mb-3 opacity-50">💬</span>
          <p className="text-gray-500 text-sm font-bold">
            İlk yorumu yapan siz olun!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-100 p-6 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 text-green-700 rounded-full flex items-center justify-center font-black text-sm uppercase shadow-inner">
                    {review.user?.firstName?.charAt(0) || "M"}
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block text-sm">
                      {review.user?.firstName}{" "}
                      {review.user?.lastName?.charAt(0)}.
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
                <div className="text-yellow-400 text-sm">
                  {"★".repeat(review.rating)}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed font-medium">
                "{review.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function ProductDetailContent() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();

  const isUpgradeMode = searchParams.get("mode") === "upgrade";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "desc" | "installment" | "reviews"
  >("desc");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error("Ürün bulunamadı");
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
        router.push("/product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  const handleStart = () => {
    if (!product) return;
    const query = new URLSearchParams(Array.from(searchParams.entries()));
    query.set("productId", product.id);
    router.push(`/checkout?${query.toString()}`);
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] font-sans pb-24 selection:bg-green-200">
      <Toaster position="top-right" />

      {/* HEADER / NAV AREA */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 mb-8 sticky top-0 z-20">
        <div className="container mx-auto px-4 md:px-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            ←
          </button>
          <span className="font-black text-gray-900 text-sm md:text-base truncate">
            {product.name}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* SOL: GÖRSEL ALANI */}
          <div className="lg:col-span-5 animate-fade-in">
            <div className="bg-white rounded-[3rem] p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-gray-100 relative group overflow-hidden">
              <div className="relative aspect-square w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-[2.5rem] overflow-hidden shadow-inner">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-8 hover:scale-110 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl animate-bounce">
                    🎁
                  </div>
                )}
              </div>

              {isUpgradeMode && (
                <div className="absolute top-8 left-8 bg-blue-600 text-white text-xs font-black px-4 py-2 rounded-full shadow-xl shadow-blue-500/30 uppercase tracking-widest">
                  🚀 Yükseltme Fırsatı
                </div>
              )}
            </div>
          </div>

          {/* SAĞ: DETAY ALANI */}
          <div className="lg:col-span-7 flex flex-col justify-center animate-fade-in-up delay-100">
            {/* Lansman Etiketi */}
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                📦 Kargo Bedava
              </span>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <span className="animate-pulse">🔥</span> Lansmana Özel
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-end gap-3 mb-8 pb-8 border-b border-gray-200">
              <span className="text-6xl font-black text-gray-900 tracking-tighter">
                ₺{Number(product.price).toFixed(0)}
              </span>
              <div className="flex flex-col mb-2">
                <span className="text-gray-500 font-bold text-xl leading-none">
                  / Ay
                </span>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1 bg-gray-100 px-2 py-0.5 rounded">
                  KDV Dahil
                </span>
              </div>
            </div>

            {/* MODERN HAP (PILL) SEKME MENÜSÜ */}
            <div className="bg-gray-100/80 p-1.5 rounded-2xl flex mb-8 overflow-x-auto scrollbar-hide">
              {[
                { id: "desc", icon: "📦", label: "İçerik" },
                { id: "installment", icon: "💳", label: "Taksit" },
                { id: "reviews", icon: "⭐", label: "Yorumlar" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap
                    ${activeTab === tab.id ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"}`}
                >
                  <span className="text-lg opacity-80">{tab.icon}</span>{" "}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-[220px] mb-10">
              {activeTab === "desc" && (
                <div className="animate-fade-in-up">
                  <p className="text-gray-600 leading-relaxed text-base font-medium mb-6">
                    {product.description ||
                      "Can dostunuz için uzman veterinerler tarafından özel olarak hazırlanmış, sürprizlerle dolu bir kutu."}
                  </p>

                  {product.features && product.features.length > 0 && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-sm text-gray-800 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm font-bold"
                        >
                          <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 text-xs">
                            ✓
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {activeTab === "installment" && <InstallmentInfo />}
              {activeTab === "reviews" && (
                <ReviewsSection productId={product.id} />
              )}
            </div>

            {/* AKSİYON ALANI (SABİT BUTONLAR) */}
            <div className="mt-auto space-y-4">
              <button
                onClick={handleStart}
                className={`
                  group relative overflow-hidden w-full py-5 rounded-2xl font-black text-lg transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3
                  ${
                    isUpgradeMode
                      ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-[0_20px_50px_rgba(37,99,235,0.3)]"
                      : "bg-[#ff6000] text-white hover:bg-[#e05500] hover:shadow-[0_20px_50px_rgba(255,96,0,0.3)]"
                  }
                `}
              >
                <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-25deg] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="relative z-10 uppercase tracking-widest">
                  {isUpgradeMode ? "PAKETİ YÜKSELT 🚀" : "ŞİMDİ SİPARİŞ VER 🐾"}
                </span>
                <span className="relative z-10 text-xl group-hover:translate-x-2 transition-transform duration-300">
                  ➔
                </span>
              </button>

              <div className="grid grid-cols-3 gap-2 pt-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <div className="text-xl mb-1">🚚</div>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-wider">
                    Hızlı Kargo
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <div className="text-xl mb-1">🔒</div>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-wider">
                    256-Bit SSL
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <div className="text-xl mb-1">↩️</div>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-wider">
                    Kolay İptal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Animations */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(250%);
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#ff6000] rounded-full animate-spin"></div>
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}
