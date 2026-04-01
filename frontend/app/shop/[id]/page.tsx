"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { useCart } from "@/context/CartContext";

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  description: string;
  image: string; // Kapak
  gallery?: string[]; // 👈 YENİ: Galeri dizisi
  stock: number;
  type: "RETAIL" | "SUBSCRIPTION";
  category?: { id: string; name: string };
}

export default function ShopProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Etkileşim State'leri
  const [activeImage, setActiveImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
        );
        if (!res.ok) throw new Error("Ürün bulunamadı");

        const data: ProductDetail = await res.json();

        if (data.type !== "RETAIL") {
          router.push(`/product/${data.id}`);
          return;
        }

        setProduct(data);
        setActiveImage(data.image || "/kutu_icerik_urun.png");
      } catch (error) {
        toast.error("Ürün yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, router]);

  const handleAddToCart = () => {
    if (!product || product.stock < quantity) {
      toast.error("Yeterli stok bulunmuyor. 😔");
      return;
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.discountedPrice || product.price,
      image: activeImage,
      type: "RETAIL",
      quantity: quantity,
    });

    toast.success(`${quantity} adet ${product.name} sepete eklendi! 🐾`, {
      style: {
        borderRadius: "16px",
        background: "#fff",
        color: "#333",
        fontWeight: "bold",
        border: "2px solid #f97316",
      },
      iconTheme: { primary: "#f97316", secondary: "#fff" },
    });
  };

  // 👇 YENİ: Tüm Görselleri Birleştirme (Kapak + Galeri)
  const allImages = [product?.image, ...(product?.gallery || [])].filter(
    Boolean,
  ) as string[];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF9]">
        <div className="w-14 h-14 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold tracking-wider text-orange-500 uppercase">
          Pati İzleri Takip Ediliyor...
        </p>
      </div>
    );
  }

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9] text-gray-500 font-medium">
        Ürün bulunamadı.
      </div>
    );

  return (
    <main className="min-h-screen bg-[#FFFDF9] pt-32 pb-24 font-sans text-gray-900">
      <Toaster position="bottom-center" />
      <div className="container mx-auto px-6 md:px-12 max-w-[1200px]">
        {/* BREADCRUMB (GEZİNME) */}
        <nav className="flex text-sm font-medium text-gray-500 mb-8 gap-2">
          <Link href="/" className="hover:text-orange-500 transition-colors">
            Ana Sayfa
          </Link>
          <span>/</span>
          <Link
            href="/shop"
            className="hover:text-orange-500 transition-colors"
          >
            Mağaza
          </Link>
          <span>/</span>
          <span className="text-gray-900">
            {product.category?.name || "Ürün"}
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 bg-white p-6 md:p-12 rounded-[2.5rem] shadow-sm border border-orange-50">
          {/* 🖼️ SOL TARAF: GÖRSEL GALERİSİ */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            {/* BÜYÜK GÖRSEL */}
            <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden bg-[#F8F9FA] border border-gray-100 group">
              {product.discountedPrice && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-sm font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg">
                  İndirim
                </div>
              )}
              <Image
                src={activeImage}
                alt={product.name}
                fill
                className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* KÜÇÜK RESİMLER (THUMBNAILS) */}
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`snap-start relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 bg-[#F8F9FA] ${activeImage === img ? "border-orange-500 shadow-md scale-105" : "border-transparent hover:border-orange-200"}`}
                  >
                    <Image
                      src={img}
                      alt={`Görsel ${idx + 1}`}
                      fill
                      className="object-cover p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ TARAF: ÜRÜN DETAYLARI VE SİPARİŞ */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="text-sm font-black text-orange-500 tracking-widest uppercase mb-3">
              {product.category?.name || "Kategori"}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-gray-900">
              {product.name}
            </h1>

            {/* Fiyat Alanı */}
            <div className="flex items-center gap-4 mb-8">
              {product.discountedPrice ? (
                <>
                  <span className="text-5xl font-black text-gray-900">
                    ₺{product.discountedPrice}
                  </span>
                  <span className="text-2xl text-gray-400 line-through font-bold">
                    ₺{product.price}
                  </span>
                </>
              ) : (
                <span className="text-5xl font-black text-gray-900">
                  ₺{product.price}
                </span>
              )}
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-10 font-medium whitespace-pre-wrap">
              {product.description ||
                "Dostunuz için özenle seçilmiş, en yüksek kalite standartlarında üretilmiş premium ürün."}
            </p>

            {/* GÜVEN VE BİLGİ ROZETLERİ */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="flex items-center gap-3 bg-orange-50 p-4 rounded-2xl text-orange-700 font-semibold">
                <span className="text-2xl">📦</span> Aynı Gün Kargo
              </div>
              <div className="flex items-center gap-3 bg-green-50 p-4 rounded-2xl text-green-700 font-semibold">
                <span className="text-2xl">🛡️</span> %100 Orijinal
              </div>
            </div>

            {/* MİKTAR VE SEPETE EKLE */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
              <div className="flex items-center border-2 border-gray-100 rounded-2xl bg-[#F8F9FA] h-16 w-full sm:w-auto p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-full flex items-center justify-center font-black text-2xl text-gray-400 hover:text-orange-500 transition-colors"
                >
                  -
                </button>
                <span className="w-16 text-center font-black text-xl text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="w-12 h-full flex items-center justify-center font-black text-2xl text-gray-400 hover:text-orange-500 transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-grow h-16 rounded-2xl font-extrabold text-lg transition-all duration-300 flex items-center justify-center gap-3 w-full
                  ${
                    product.stock > 0
                      ? "bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/30 hover:-translate-y-1"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {product.stock > 0 ? (
                  <>
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    Sepete Ekle
                  </>
                ) : (
                  "Tükendi"
                )}
              </button>
            </div>

            {/* Stok Uyarısı */}
            <div className="mt-6 text-center sm:text-left">
              {product.stock > 0 && product.stock <= 5 ? (
                <p className="text-red-500 font-bold flex items-center justify-center sm:justify-start gap-2">
                  <span>🔥</span> Acele edin, stokta sadece {product.stock} adet
                  kaldı!
                </p>
              ) : product.stock > 5 ? (
                <p className="text-green-500 font-bold flex items-center justify-center sm:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>{" "}
                  Stokta var
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
