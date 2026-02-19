"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

// --- ICONS ---
const PlusIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);
const TrashIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const EditIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);
const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
const BoxIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // FORM DATASI (Değişken adları backend'e uyumlu hale getirildi)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    image: "", // imageUrl yerine image
    features: "",
  });

  // --- 1. VERİ ÇEKME ---
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("https://candostumbox-api.onrender.com/products");
      if (res.ok) {
        const data = await res.json();
        const sortedData = Array.isArray(data)
          ? data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          : [];
        setProducts(sortedData);
      }
    } catch (error) {
      toast.error("Ürünler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. SİLME İŞLEMİ ---
  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    const token = localStorage.getItem("token");
    const loadingToast = toast.loading("Siliniyor...");

    try {
      const res = await fetch(
        `https://candostumbox-api.onrender.com/products/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        toast.success("Ürün silindi", { id: loadingToast });
        setProducts(products.filter((p) => p.id !== id));
      } else {
        toast.error("Silme başarısız", { id: loadingToast });
      }
    } catch (e) {
      toast.error("Hata oluştu", { id: loadingToast });
    }
  };

  // --- 3. EKLEME / GÜNCELLEME İŞLEMİ ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const loadingToast = toast.loading("Kaydediliyor...");

    const featuresArray = formData.features
      ? formData.features
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== "")
      : [];

    // 👇 KRİTİK DEĞİŞİKLİK: imageUrl yerine image yazıldı
    const payload = {
      name: formData.name,
      price: Number(formData.price),
      stock: Number(formData.stock),
      description: formData.description,
      image: formData.image || "https://placehold.co/400", // Backend 'image' bekliyor
      features: featuresArray,
    };

    try {
      let res;
      if (editingProduct) {
        res = await fetch(
          `https://candostumbox-api.onrender.com/products/${editingProduct.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );
      } else {
        res = await fetch("https://candostumbox-api.onrender.com/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const savedProduct = await res.json();
        toast.success(
          editingProduct ? "Ürün Güncellendi" : "Yeni Ürün Eklendi",
          { id: loadingToast },
        );

        if (editingProduct) {
          setProducts(
            products.map((p) =>
              p.id === editingProduct.id ? savedProduct : p,
            ),
          );
        } else {
          setProducts([savedProduct, ...products]);
        }
        closeModal();
      } else {
        toast.error("İşlem başarısız", { id: loadingToast });
      }
    } catch (e) {
      toast.error("Sunucu hatası", { id: loadingToast });
    }
  };

  // --- MODAL YÖNETİMİ ---
  const openModal = (product: any = null) => {
    setEditingProduct(product);
    if (product) {
      const featuresString =
        product.features && Array.isArray(product.features)
          ? product.features.join(", ")
          : "";

      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description,
        image: product.image || product.imageUrl || "", // Veritabanından gelen image
        features: featuresString,
      });
    } else {
      setFormData({
        name: "",
        price: "",
        stock: "",
        description: "",
        image: "",
        features: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // --- FİLTRELEME ---
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = {
    totalProducts: products.length,
    lowStock: products.filter((p) => p.stock < 10).length,
    totalValue: products.reduce(
      (acc, p) => acc + Number(p.price) * Number(p.stock),
      0,
    ),
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-8 font-sans">
      <Toaster position="top-right" />

      {/* DASHBOARD KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 group">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">
            Toplam Ürün
          </div>
          <div className="text-4xl font-black text-gray-800 group-hover:scale-105 transition origin-left">
            {stats.totalProducts}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 group">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">
            Kritik Stok (Azalan)
          </div>
          <div className="text-4xl font-black text-red-500 group-hover:scale-105 transition origin-left">
            {stats.lowStock}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 group">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">
            Depo Değeri
          </div>
          <div className="text-4xl font-black text-green-600 group-hover:scale-105 transition origin-left">
            ₺{stats.totalValue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <SearchIcon />
          </div>
          <input
            placeholder="Ürün Ara..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => openModal()}
          className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition flex items-center gap-2"
        >
          <PlusIcon /> Yeni Ürün Ekle
        </button>
      </div>

      {/* TABLO */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-6">Ürün Detayı</th>
                <th className="p-6">Fiyat</th>
                <th className="p-6">Stok Durumu</th>
                <th className="p-6 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50/80 transition group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 relative">
                        {/* 👇 KRİTİK DEĞİŞİKLİK: product.imageUrl yerine product.image kullanıldı */}
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <BoxIcon />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="font-black text-gray-900">
                      ₺{Number(product.price).toFixed(2)}
                    </div>
                  </td>
                  <td className="p-6">
                    {product.stock <= 0 ? (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                        Tükendi
                      </span>
                    ) : product.stock < 10 ? (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">
                        Azaldı ({product.stock})
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                        Stokta ({product.stock})
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(product)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT/CREATE MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900">
                {editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 transition flex items-center justify-center font-bold text-gray-400"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="p-8 overflow-y-auto space-y-6"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Ürün Adı
                  </label>
                  <input
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none font-bold text-gray-700"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Örn: Gurme Paketi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Fiyat (₺)
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none font-bold text-gray-700"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Stok Adedi
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none font-bold text-gray-700"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Paket Özellikleri (Virgülle Ayırın)
                  </label>
                  <textarea
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none text-gray-700 font-medium min-h-[80px]"
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    placeholder="Örn: 5 Adet Oyuncak, Doğal Mama, Ücretsiz Kargo, Veteriner Onaylı"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Görsel URL
                  </label>
                  <div className="flex gap-4">
                    <input
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none text-gray-700 text-sm"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder="https://..."
                    />
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      {formData.image && (
                        <img
                          src={formData.image}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    Kısa Açıklama (Alt Başlık)
                  </label>
                  <textarea
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none text-gray-700 min-h-[80px]"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Ürün başlığının altında görünecek kısa açıklama..."
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition shadow-lg shadow-purple-200"
                >
                  {editingProduct ? "Değişiklikleri Kaydet" : "Ürünü Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
