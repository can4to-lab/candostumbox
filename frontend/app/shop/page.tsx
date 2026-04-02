"use client";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  description: string;
  image: string;
  stock: number;
  type: "RETAIL" | "SUBSCRIPTION";
  category?: { id: string; name: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function ShopContent() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`),
        ]);

        if (prodRes.ok && catRes.ok) {
          const allProducts = await prodRes.json();
          const retailProducts = allProducts.filter(
            (p: Product) => p.type === "RETAIL",
          );
          setProducts(retailProducts);
          setCategories(await catRes.json());
        }
      } catch (error) {
        console.error("Veri çekme hatası:", error);
        toast.error("Ürünler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "ALL" || product.category?.id === activeCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.discountedPrice || product.price,
      image: product.image,
      type: "RETAIL",
      quantity: 1,
    });
    toast.success(`${product.name} sepete eklendi! 🐾`, {
      style: {
        borderRadius: "16px",
        background: "#fff",
        color: "#333",
        fontWeight: "bold",
        border: "2px solid #f97316", // Turuncu vurgu
      },
      iconTheme: {
        primary: "#f97316",
        secondary: "#fff",
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF9]">
        <div className="w-14 h-14 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold tracking-wider text-orange-500 uppercase">
          Ürünler Yükleniyor...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFDF9] pt-28 pb-32 font-sans">
      <Toaster position="bottom-center" />

      <div className="fixed top-24 left-0 w-full z-30 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-2.5 px-4 text-xs sm:text-sm font-black tracking-widest shadow-md flex items-center justify-center gap-2 animate-fade-in">
        <span className="text-lg">🚚</span> 500 TL VE ÜZERİ PERAKENDE
        SİPARİŞLERİNİZDE KARGO ÜCRETSİZ!
      </div>

      {/* SICAK VE SAMİMİ HERO ALANI */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-orange-50 p-8 md:p-12 rounded-[2rem] border border-orange-100">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
              Dostunuz İçin En İyisi 🐾
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-medium">
              Mama, oyuncak, ödül ve çok daha fazlası. Onların sağlığı ve
              mutluluğu için özenle seçilmiş tüm ürünlerimiz burada.
            </p>
          </div>

          {/* ARAMA ÇUBUĞU */}
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-6 w-6 text-orange-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Mama, oyuncak veya ödül ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-orange-100 rounded-2xl text-base font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* SEVİMLİ KATEGORİ FİLTRELERİ */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 mb-10 sticky top-20 z-20 bg-[#FFFDF9]/90 backdrop-blur-xl py-4">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`snap-start whitespace-nowrap px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 border-2 ${
              activeCategory === "ALL"
                ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30 scale-105"
                : "bg-white text-gray-600 border-orange-100 hover:border-orange-300 hover:text-orange-500"
            }`}
          >
            Tüm Ürünler
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`snap-start whitespace-nowrap px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 border-2 ${
                activeCategory === cat.id
                  ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/30 scale-105"
                  : "bg-white text-gray-600 border-orange-100 hover:border-orange-300 hover:text-orange-500"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* PETSHOP ÜRÜN IZGARASI */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
        {filteredProducts.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-[2rem] border-2 border-dashed border-orange-200">
            <div className="text-6xl mb-4">🦴</div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
              Pati İzleri Karıştı!
            </h3>
            <p className="text-gray-500 max-w-md font-medium">
              Aradığınız ürünü şu an bulamadık. Lütfen farklı bir kategori
              seçmeyi veya aramayı değiştirmeyi deneyin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {filteredProducts.map((product) => (
              <Link
                href={`/shop/${product.id}`}
                key={product.id}
                className="group flex flex-col h-full bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200"
              >
                {/* GÖRSEL ALANI */}
                <div className="relative aspect-square w-full bg-[#F8F9FA] rounded-[1.5rem] overflow-hidden mb-4">
                  {product.discountedPrice && (
                    <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-md">
                      İndirim
                    </div>
                  )}

                  <Image
                    src={product.image || "/kutu_icerik_urun.png"}
                    alt={product.name}
                    fill
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* ÜRÜN BİLGİLERİ */}
                <div className="flex flex-col flex-grow px-2">
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">
                    {product.category?.name || "Kategori"}
                  </p>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* FİYAT VE SEPET BUTONU */}
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                      {product.discountedPrice ? (
                        <>
                          <span className="text-sm font-bold text-gray-400 line-through">
                            ₺{product.price}
                          </span>
                          <span className="text-2xl font-black text-gray-900">
                            ₺{product.discountedPrice}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-black text-gray-900">
                          ₺{product.price}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={product.stock <= 0}
                      className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                        product.stock > 0
                          ? "bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                      aria-label="Sepete Ekle"
                    >
                      {product.stock > 0 ? (
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFDF9]"></div>}>
      <ShopContent />
    </Suspense>
  );
}
