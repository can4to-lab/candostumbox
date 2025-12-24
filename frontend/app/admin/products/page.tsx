"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- TİP TANIMI ---
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  order: number;
}

export default function AdminPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form Verileri
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    stock: "",
    order: "0",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // İstatistikler (Frontend Hesaplama)
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock < 5 && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

  // --- 1. GÜVENLİK VE VERİ ÇEKME (GÜNCELLENDİ 🛡️) ---
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) { 
        router.push("/admin/login"); 
        return; 
      }

      try {
        // A. KİMLİK VE ROL KONTROLÜ
        const profileRes = await fetch("http://localhost:3000/auth/profile", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!profileRes.ok) throw new Error("Oturum geçersiz");

        const user = await profileRes.json();

        // Admin değilse at
        if (user.role?.toUpperCase() !== 'ADMIN') {
          router.push("/");
          return;
        } 

        // Admin ise yetki ver ve ürünleri çek
        setIsAuthorized(true);
        await fetchProducts(); // await ekledik ki sıra şaşmasın

      } catch (err) {
        console.error("Yetki hatası:", err);
        localStorage.removeItem("token"); // 👈 İŞTE EKSİK OLAN BU SATIRDI (Temizlik)
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router]);

  // Ürünleri Çek
  const fetchProducts = async () => {
    try {
      // Ürünleri çekerken token göndermene gerek yok (Public endpoint ise), 
      // ama admin tarafında garanti olsun diye gönderebilirsin.
      const res = await fetch("http://localhost:3000/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Hata:", err);
    }
  };

  // Form Değişince
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // SİLME İŞLEMİ
  const handleDelete = async (id: number) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3000/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (res.ok) {
        setMessage("🗑️ Ürün silindi.");
        fetchProducts();
        setTimeout(() => setMessage(""), 3000);
      } else {
        alert("Silinirken hata oluştu. Yetkiniz olmayabilir.");
      }
    } catch (err) {
      alert("Hata oluştu.");
    }
  };

  // DÜZENLE MODUNU AÇ
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || "",
      image: product.image || "",
      stock: product.stock.toString(),
      order: product.order.toString(),
    });
    setMessage("✏️ Düzenleme modu aktif.");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // HIZLI SIRA DEĞİŞTİRME
  const handleQuickOrderChange = async (id: number, newOrder: string) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:3000/products/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ order: parseInt(newOrder) }),
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // KAYDET
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    const token = localStorage.getItem("token");

    const url = editingId 
        ? `http://localhost:3000/products/${editingId}` 
        : "http://localhost:3000/products";
    
    const method = editingId ? "PATCH" : "POST";

    const payload: any = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description,
        image: formData.image,
    };

    if (editingId) {
        payload.order = parseInt(formData.order);
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Hata oluştu.");

      setMessage(editingId ? "✅ Ürün güncellendi!" : "✅ Ürün eklendi!");
      setEditingId(null);
      setFormData({ name: "", price: "", description: "", image: "", stock: "", order: "0" });
      fetchProducts();
      
      setTimeout(() => setMessage(""), 3000);

    } catch (err: any) {
      setError("❌ " + err.message);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-green-600 font-bold animate-pulse">Ürünler Yükleniyor... 🎁</div>;
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-20">
      
      {/* --- HEADER (Gradient) --- */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 pt-10 pb-24 px-8 shadow-xl">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Ürün Yönetimi</h1>
                <p className="text-green-100 mt-2 text-lg">Paketleri düzenle, stokları yönet, fiyatları güncelle.</p>
            </div>
            <button onClick={() => router.push("/admin")} className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2 rounded-xl font-bold hover:bg-white/30 transition">
                ← Geri Git
            </button>
          </div>
       </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 space-y-8">
        
        {/* --- İSTATİSTİK KARTLARI --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform hover:-translate-y-1 transition duration-300">
                <p className="text-gray-500 text-xs font-bold uppercase">Toplam Paket</p>
                <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{totalProducts}</h2>
                <div className="mt-2 text-xs text-green-600 font-bold">Aktif Satışta</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform hover:-translate-y-1 transition duration-300">
                <p className="text-gray-500 text-xs font-bold uppercase">Kritik Stok</p>
                <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{lowStockCount}</h2>
                <div className="mt-2 text-xs text-orange-500 font-bold">5 adetten az</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform hover:-translate-y-1 transition duration-300">
                <p className="text-gray-500 text-xs font-bold uppercase">Tükenenler</p>
                <h2 className="text-3xl font-extrabold text-gray-800 mt-2">{outOfStockCount}</h2>
                <div className="mt-2 text-xs text-red-500 font-bold">Satışa Kapalı</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform hover:-translate-y-1 transition duration-300">
                <p className="text-gray-500 text-xs font-bold uppercase">Envanter Değeri</p>
                <h2 className="text-3xl font-extrabold text-gray-800 mt-2">₺{totalInventoryValue.toLocaleString()}</h2>
                <div className="mt-2 text-xs text-blue-500 font-bold">Tahmini Kazanç</div>
            </div>
        </div>

        {/* --- FORM ALANI --- */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className={`p-6 px-8 flex justify-between items-center ${editingId ? "bg-orange-50" : "bg-green-50"}`}>
                <div className="flex items-center gap-3">
                    <span className={`text-2xl ${editingId ? "text-orange-600" : "text-green-600"}`}>
                        {editingId ? "✏️" : "✨"}
                    </span>
                    <h2 className={`text-xl font-bold ${editingId ? "text-orange-700" : "text-green-700"}`}>
                        {editingId ? "Paketi Düzenle" : "Yeni Paket Oluştur"}
                    </h2>
                </div>
            </div>
            
            <div className="p-8">
                {message && (
                    <div className="bg-blue-50 text-blue-700 p-4 rounded-xl mb-6 font-bold flex items-center gap-2 animate-pulse">
                        ℹ️ {message}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 font-bold flex items-center gap-2">
                        🚨 {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-bold mb-2 text-gray-700 text-sm">Kutu Adı</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-900 transition" placeholder="Örn: Süper Başlangıç Kutusu" required />
                        </div>
                        <div>
                            <label className="block font-bold mb-2 text-gray-700 text-sm">Sıra No (Küçük üstte)</label>
                            <input type="number" name="order" value={formData.order} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-900 transition" placeholder="0" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block font-bold mb-2 text-gray-700 text-sm">Fiyat (₺)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">₺</span>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-900 transition font-bold" step="0.01" required />
                            </div>
                        </div>
                        <div>
                            <label className="block font-bold mb-2 text-gray-700 text-sm">Stok Adedi</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-900 transition font-bold" required />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block font-bold mb-2 text-gray-700 text-sm">Resim URL</label>
                        <input type="text" name="image" value={formData.image} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-900 transition" placeholder="https://..." />
                    </div>
                    
                    <div>
                        <label className="block font-bold mb-2 text-gray-700 text-sm">Açıklama</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 h-24 text-gray-900 transition resize-none" placeholder="Ürün özelliklerini buraya yazın..."></textarea>
                    </div>
                    
                    <div className="flex gap-4 pt-2">
                        <button type="submit" className={`flex-1 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-95 ${editingId ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gradient-to-r from-green-500 to-green-700"}`}>
                            {editingId ? "Değişiklikleri Kaydet" : "+ Yeni Paket Ekle"}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => {setEditingId(null); setFormData({ name: "", price: "", description: "", image: "", stock: "", order: "0" }); setMessage("");}} className="px-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">
                                İptal
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>

        {/* --- LİSTE ALANI --- */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-800">Paket Listesi & Envanter</h2>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 bg-white">
                            <th className="p-5 w-20 text-center">Sıra</th>
                            <th className="p-5">Ürün</th>
                            <th className="p-5">Fiyat</th>
                            <th className="p-5">Stok Durumu</th>
                            <th className="p-5 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 divide-y divide-gray-50">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-green-50/20 transition duration-150 group">
                                <td className="p-5 text-center">
                                    <input 
                                        type="number" 
                                        defaultValue={product.order} 
                                        onBlur={(e) => handleQuickOrderChange(product.id, e.target.value)}
                                        className="w-12 h-10 border border-gray-200 rounded-lg text-center font-bold focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-gray-50 focus:bg-white"
                                    />
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                                            <img src={product.image || "https://via.placeholder.com/100?text=No+Img"} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-lg">{product.name}</div>
                                            <div className="text-xs text-gray-400 line-clamp-1 max-w-[200px]">{product.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className="font-mono font-bold text-green-700 bg-green-50 px-3 py-1 rounded-lg">
                                        ₺{product.price}
                                    </span>
                                </td>
                                <td className="p-5">
                                    {product.stock <= 0 ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Tükendi
                                        </span>
                                    ) : product.stock < 5 ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600 border border-orange-200">
                                            <span className="w-2 h-2 rounded-full bg-orange-500"></span> Kritik: {product.stock}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600 border border-green-200">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Stokta: {product.stock}
                                        </span>
                                    )}
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(product)} className="bg-white text-blue-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-50 border border-blue-200 shadow-sm transition hover:-translate-y-0.5">
                                            Düzenle
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="bg-white text-red-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-50 border border-red-200 shadow-sm transition hover:-translate-y-0.5">
                                            Sil
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && (
                    <div className="p-12 text-center flex flex-col items-center justify-center bg-gray-50 border-t border-gray-100">
                        <span className="text-4xl mb-3">📦</span>
                        <p className="text-gray-500 font-medium">Henüz hiç paket oluşturulmadı.</p>
                        <p className="text-sm text-gray-400">Yukarıdaki formdan ilk ürününü ekle!</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}