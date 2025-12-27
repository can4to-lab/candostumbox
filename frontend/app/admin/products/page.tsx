"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

// --- TİP TANIMI (PostgreSQL Uyumlu) ---
interface Product {
  id: number;
  name: string;
  price: number;     // Postgres: Decimal/Numeric
  description: string | null;
  image: string | null;
  stock: number;     // Postgres: Integer
  isVisible: boolean; // Postgres: Boolean
}

export default function AdminProductsPage() {
  const router = useRouter();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State (String olarak tutuyoruz, gönderirken çevireceğiz)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    stock: "",
    isVisible: true
  });

  // --- VERİ ÇEKME ---
  const fetchProducts = useCallback(async () => {
    try {
      // API adresini kendi backend adresinle güncelle
      const res = await fetch("https://candostumbox-api.onrender.com/products", {
          cache: "no-store"
      });
      if (!res.ok) throw new Error("Veri çekilemedi");
      
      const data: Product[] = await res.json();
      // ID'ye göre sırala (Yeni eklenen en sonda olsun)
      setProducts(data.sort((a, b) => a.id - b.id));
    } catch (err) {
      console.error(err);
      toast.error("Ürünler yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Basit token kontrolü (Gelişmiş kontrol middleware'de yapılmalı)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
        router.push("/admin/login");
        return;
    }
    fetchProducts();
  }, [fetchProducts, router]);

  // --- FORM İŞLEMLERİ ---
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || "",
      image: product.image || "",
      stock: product.stock.toString(),
      isVisible: product.isVisible
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "", price: "", description: "", image: "", stock: "", isVisible: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // PostgreSQL İçin Tip Dönüşümleri (Type Casting)
    const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price), // String -> Float
        stock: parseInt(formData.stock),   // String -> Int
        description: formData.description.trim() === "" ? null : formData.description,
        image: formData.image.trim() === "" ? null : formData.image,
        isVisible: formData.isVisible
    };

    if (isNaN(payload.price) || isNaN(payload.stock)) {
        toast.error("Fiyat ve Stok geçerli bir sayı olmalıdır.");
        return;
    }

    const url = editingId 
        ? `https://candostumbox-api.onrender.com/products/${editingId}`
        : "https://candostumbox-api.onrender.com/products";
    
    const method = editingId ? "PATCH" : "POST";

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("İşlem başarısız");

        toast.success(editingId ? "Ürün güncellendi!" : "Yeni ürün eklendi!");
        handleCancel(); // Formu temizle
        fetchProducts(); // Listeyi yenile
    } catch (error) {
        toast.error("Kaydedilemedi. Sunucu hatası.");
    }
  };

  // --- SİLME ---
  const handleDelete = async (id: number) => {
    if (!confirm("Bu ürünü silmek istediğine emin misin?")) return;
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`https://candostumbox-api.onrender.com/products/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            toast.success("Ürün silindi.");
            fetchProducts();
        } else {
            throw new Error();
        }
    } catch (error) {
        toast.error("Silme işlemi başarısız.");
    }
  };

  // --- GİZLİ/GÖRÜNÜR YAP (Hızlı İşlem) ---
  const toggleVisibility = async (product: Product) => {
      // Optimistik güncelleme (Anında arayüzde değişsin)
      const newStatus = !product.isVisible;
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isVisible: newStatus } : p));
      
      const token = localStorage.getItem("token");
      try {
          await fetch(`https://candostumbox-api.onrender.com/products/${product.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify({ isVisible: newStatus })
          });
          toast.success(`Ürün ${newStatus ? 'görünür' : 'gizli'} yapıldı.`);
      } catch (error) {
          toast.error("Güncellenemedi.");
          fetchProducts(); // Hata varsa geri al
      }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center text-green-600 font-bold">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-20">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 pt-10 pb-24 px-8 shadow-xl">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Ürün Yönetimi</h1>
                <p className="text-green-100 mt-2 text-lg">PostgreSQL Veritabanı</p>
            </div>
            <button onClick={() => router.push("/admin")} className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2 rounded-xl font-bold hover:bg-white/30 transition">
                ← Panele Dön
            </button>
          </div>
       </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 space-y-8">
        
        {/* --- FORM KARTI --- */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className={`p-6 border-b border-gray-100 ${editingId ? "bg-orange-50" : "bg-green-50"}`}>
                <h2 className={`text-xl font-bold ${editingId ? "text-orange-700" : "text-green-700"} flex items-center gap-2`}>
                    {editingId ? "✏️ Ürünü Düzenle" : "✨ Yeni Ürün Ekle"}
                </h2>
            </div>
            
            <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Ürün Adı</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Görsel URL</label>
                            <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition" placeholder="https://..." />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Fiyat (₺)</label>
                            <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Stok</label>
                            <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition" required />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Açıklama</label>
                        <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none resize-none transition"></textarea>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <div 
                            onClick={() => setFormData(prev => ({...prev, isVisible: !prev.isVisible}))}
                            className={`w-12 h-7 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${formData.isVisible ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${formData.isVisible ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                            {formData.isVisible ? "Vitrine Koy (Satışa Açık)" : "Gizli Ürün (Listelenmez)"}
                        </span>
                    </div>
                    
                    <div className="flex gap-4 pt-2">
                        <button type="submit" className={`flex-1 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-95 ${editingId ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gradient-to-r from-green-600 to-green-800"}`}>
                            {editingId ? "Değişiklikleri Kaydet" : "+ Ürünü Ekle"}
                        </button>
                        {editingId && (
                            <button type="button" onClick={handleCancel} className="px-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">
                                İptal
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>

        {/* --- LİSTE --- */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                            <th className="p-5 font-bold">Ürün</th>
                            <th className="p-5 font-bold">Fiyat</th>
                            <th className="p-5 font-bold">Stok</th>
                            <th className="p-5 font-bold">Durum</th>
                            <th className="p-5 font-bold text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-green-50/30 transition group">
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                            {product.image ? (
                                                <img src={product.image} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Yok</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{product.name}</div>
                                            <div className="text-xs text-gray-400">ID: {product.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5 font-mono font-bold text-green-700">₺{Number(product.price).toFixed(2)}</td>
                                <td className="p-5">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <button 
                                        onClick={() => toggleVisibility(product)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border transition ${product.isVisible ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                                    >
                                        {product.isVisible ? 'Aktif' : 'Gizli'}
                                    </button>
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(product)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition">✏️</button>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && <div className="p-10 text-center text-gray-400">Henüz ürün eklenmemiş.</div>}
            </div>
        </div>
      </div>
    </div>
  );
}