"use client";
import { useState, useEffect, Suspense, useCallback } from "react";
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

const API_URL = "https://candostumbox-api.onrender.com";

// --- YARDIMCI BİLEŞEN: TAKSİT TABLOSU (Sadece Bilgi Amaçlı) ---
const InstallmentInfo = () => {
  return (
    <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl text-center animate-fade-in">
      <div className="text-4xl mb-3">💳</div>
      <h4 className="font-bold text-gray-900 mb-2 text-lg">Taksit İmkanı</h4>
      <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
        Tüm kredi kartlarına <strong>12 taksite varan</strong> vade seçenekleri
        sunuyoruz.
        <br />
        Kesin taksit tutarlarını ve vade farklarını{" "}
        <strong>ödeme adımında</strong> görüntüleyebilirsiniz.
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
    <div className="space-y-6 animate-fade-in">
      {/* Özet Kartı */}
      <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <div className="text-center">
          <div className="text-4xl font-black text-gray-900">
            {averageRating}
          </div>
          <div className="text-yellow-400 text-sm">★★★★★</div>
        </div>
        <div className="border-l border-gray-200 pl-4">
          <p className="text-gray-900 font-bold text-sm">Müşteri Memnuniyeti</p>
          <p className="text-gray-500 text-xs">
            {reviews.length} Değerlendirme
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-4">
          Yorumlar yükleniyor...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-200 rounded-2xl">
          <span className="text-2xl block mb-2">💬</span>
          <p className="text-gray-500 text-sm font-medium">
            Henüz yorum yapılmamış.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                    {review.user?.firstName?.charAt(0) || "M"}
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block text-xs">
                      {review.user?.firstName}{" "}
                      {review.user?.lastName?.charAt(0)}.
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
                <div className="text-yellow-400 text-xs">
                  {"★".repeat(review.rating)}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {review.comment}
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

  // URL Parametreleri (Upgrade Modu İçin)
  const isUpgradeMode = searchParams.get("mode") === "upgrade";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "desc" | "installment" | "reviews"
  >("desc");

  // VERİ ÇEKME
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

  // CHECKOUT'A YÖNLENDİRME (Modal Yok)
  const handleStart = () => {
    if (!product) return;

    // Mevcut query parametrelerini koru (mode=upgrade vb.) ve productId ekle
    const query = new URLSearchParams(Array.from(searchParams.entries()));
    query.set("productId", product.id);

    router.push(`/checkout?${query.toString()}`);
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      <Toaster position="top-right" />

      {/* HEADER / NAV AREA */}
      <div className="bg-white border-b border-gray-200 py-4 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-900 font-medium text-sm flex items-center gap-1 transition"
          >
            <span>←</span> Geri Dön
          </button>
          <div className="h-4 w-px bg-gray-300 mx-2"></div>
          <span className="font-bold text-gray-900 text-sm truncate">
            {product.name}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* SOL: GÖRSEL ALANI */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100 relative group overflow-hidden">
              <div className="relative aspect-square w-full bg-gray-50 rounded-xl overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    🎁
                  </div>
                )}
              </div>

              {isUpgradeMode && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-blue-200">
                  🚀 Yükseltme Fırsatı
                </div>
              )}
            </div>
          </div>

          {/* SAĞ: DETAY ALANI */}
          <div className="lg:col-span-7 flex flex-col">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-end gap-2 mb-6 border-b border-gray-100 pb-6">
              <span className="text-5xl font-black text-gray-900 tracking-tighter">
                ₺{Number(product.price).toFixed(0)}
              </span>
              <div className="flex flex-col mb-1.5">
                <span className="text-gray-500 font-bold text-lg leading-none">
                  / Ay
                </span>
                <span className="text-gray-400 text-[10px] font-medium uppercase tracking-wide">
                  KDV Dahil
                </span>
              </div>
            </div>

            {/* SEKME MENÜSÜ */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab("desc")}
                  className={`flex-1 py-4 text-sm font-bold transition-all relative ${
                    activeTab === "desc"
                      ? "text-green-600 bg-green-50/30"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  📦 Paket İçeriği
                  {activeTab === "desc" && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("installment")}
                  className={`flex-1 py-4 text-sm font-bold transition-all relative ${
                    activeTab === "installment"
                      ? "text-green-600 bg-green-50/30"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  💳 Taksitler
                  {activeTab === "installment" && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`flex-1 py-4 text-sm font-bold transition-all relative ${
                    activeTab === "reviews"
                      ? "text-green-600 bg-green-50/30"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  ⭐ Yorumlar
                  {activeTab === "reviews" && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500"></div>
                  )}
                </button>
              </div>

              <div className="p-6 min-h-[200px]">
                {activeTab === "desc" && (
                  <div className="animate-fade-in space-y-4">
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {product.description ||
                        "Can dostunuz için özel olarak hazırlanmış, sürprizlerle dolu bir kutu."}
                    </p>

                    {product.features && product.features.length > 0 && (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {product.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100"
                          >
                            <span className="text-green-500 font-bold mt-0.5">
                              ✓
                            </span>
                            <span>{feature}</span>
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
            </div>

            {/* AKSİYON ALANI */}
            <div className="mt-auto">
              <button
                onClick={handleStart}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 hover:bg-black hover:scale-[1.01] hover:shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <span>{isUpgradeMode ? "Paketi Yükselt" : "Hemen Başla"}</span>
                <span>➔</span>
              </button>

              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 text-lg">
                    🚚
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">
                    Ücretsiz
                    <br />
                    Kargo
                  </p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-lg">
                    🛡️
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">
                    Güvenli
                    <br />
                    Ödeme
                  </p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2 text-lg">
                    ↩️
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">
                    İptal
                    <br />
                    Garantisi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Ana Bileşeni Dışa Aktar (Suspense ile Sarmalanmış)
export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}
