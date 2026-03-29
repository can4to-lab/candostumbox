"use client";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import { useCart } from "@/context/CartContext"; // Yeni sağlam sepetimizi bağladık

interface Product {
  id: string;
  name: string;
  price: number;
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
    // Hem ürünleri hem kategorileri aynı anda çek (Sadece perakende ürünler)
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`),
        ]);

        if (prodRes.ok && catRes.ok) {
          const prodData = await prodRes.json();
          const catData = await catRes.json();

          // SADECE Perakende ürünleri filtreleyip gösteriyoruz
          const retailProducts = Array.isArray(prodData)
            ? prodData.filter((p) => p.type === "RETAIL")
            : [];

          setProducts(retailProducts);
          setCategories(catData);
        }
      } catch (error) {
        toast.error("Mağaza yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // FİLTRELEME MANTIĞI
  const filteredProducts = products.filter((product) => {
    // 👇 DÜZELTME: Artık product.categoryId değil, product.category.id'ye bakıyoruz
    const productCatId = product.category ? product.category.id : null;
    const matchesCategory =
      activeCategory === "ALL" || productCatId === activeCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // SEPETE EKLEME İŞLEMİ (Adet mantığıyla)
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("Bu ürün maalesef tükendi.");
      return;
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      price: Number(product.price),
      image: product.image,
      type: "RETAIL", // Bunun bir market ürünü olduğunu sepete söylüyoruz
      quantity: 1, // Varsayılan olarak 1 adet eklenir, sepette artırabilirler
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] font-sans pb-24 pt-24 text-[#111827]">
      <Toaster position="top-right" />

      {/* HEADER ALANI */}
      <div className="bg-indigo-900 text-white py-16 mb-12 shadow-xl relative overflow-hidden">
        {/* Arka plan süslemeleri */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Can Dostum <span className="text-pink-400">Market</span> 🛍️
          </h1>
          <p className="text-indigo-200 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Dostunuzun günlük ihtiyaçları, favori oyuncakları ve lezzetli
            atıştırmalıkları burada.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* SOL TARA: FİLTRELER & KATEGORİLER */}
          <aside className="w-full lg:w-1/4 flex-shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <span>🔍</span> Arama
              </h3>
              <input
                type="text"
                placeholder="Ürün adı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
              />
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <span>📁</span> Kategoriler
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveCategory("ALL")}
                  className={`text-left px-4 py-3 rounded-xl font-bold transition-all ${activeCategory === "ALL" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  Tüm Ürünler
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`text-left px-4 py-3 rounded-xl font-bold transition-all ${activeCategory === category.id ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* SAĞ TARAF: ÜRÜN LİSTESİ (GRID) */}
          <div className="w-full lg:w-3/4">
            {/* Sonuç Sayısı */}
            <div className="mb-6 flex justify-between items-center text-gray-500 font-medium">
              <span>
                <strong className="text-gray-900">
                  {filteredProducts.length}
                </strong>{" "}
                ürün bulundu
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in-up">
              {filteredProducts.map((product) => {
                const hasStock = product.stock > 0;
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                  >
                    {/* Resim */}
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-gray-50 mb-4">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-4xl">
                          🛍️
                        </div>
                      )}
                      {/* Stok Tükendi Rozeti */}
                      {!hasStock && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-red-500 text-white font-black px-4 py-2 rounded-full text-sm shadow-lg rotate-12">
                            TÜKENDİ
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Ürün Bilgisi */}
                    <div className="flex-grow">
                      <h3 className="font-black text-lg text-gray-900 mb-1 line-clamp-2 leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-medium h-10">
                        {product.description}
                      </p>
                    </div>

                    {/* Fiyat ve Buton */}
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="font-black text-2xl text-indigo-600">
                        ₺{Number(product.price).toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!hasStock}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${hasStock ? "bg-gray-900 text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-1" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                      >
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
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="text-6xl mb-4 opacity-50">🔍</div>
                <h3 className="text-xl font-bold text-gray-900">
                  Ürün Bulunamadı
                </h3>
                <p className="text-gray-500 mt-2">
                  Seçtiğiniz kategoriye veya aramaya uygun ürün bulunmuyor.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA]"></div>}>
      <ShopContent />
    </Suspense>
  );
}
