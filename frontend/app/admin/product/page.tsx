"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// --- TİP TANIMI ---
// PostgreSQL genellikle id'leri integer (SERIAL) veya UUID tutar.
// Mevcut yapıda number (integer) olarak varsaydık.
interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null; // SQL'de nullable alanlar için
  image: string | null;       // SQL'de nullable alanlar için
  stock: number;
  order: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  
  // State Tanımları
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form Verileri (String olarak tutuyoruz, gönderirken çevireceğiz)
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

  // İstatistikler
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock < 5 && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

  // --- API HELPER: Token Getir ---
  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // --- ÜRÜNLERİ ÇEK (PostgreSQL Sıralaması İçin Client-Side Sort Ekledik) ---
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("https://candostumbox-api.onrender.com/products", {
          cache: "no-store" // Next.js önbelleğini devre dışı bırakır, her zaman taze veri çeker
      });
      if (!res.ok) throw new Error("Veri çekilemedi");
      
      const data: Product[] = await res.json();
      
      // SQL bazen karışık sırada gönderebilir, frontend'de sıraya dizelim:
      const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setProducts(sortedData);

    } catch (err) {
      console.error("Ürün listeleme hatası:", err);
    }
  }, []);

  // --- GÜVENLİK KONTROLÜ ---
  useEffect(() => {
    const init = async () => {
      const token = getToken();
      
      if (!token) { 
        router.push("/admin/login"); 
        return; 
      }

      try {
        const profileRes = await fetch("https://candostumbox-api.onrender.com/auth/profile", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!profileRes.ok) throw new Error("Oturum geçersiz");
        const user = await profileRes.json();

        if (user.role?.toUpperCase() !== 'ADMIN') {
          router.push("/");
          return;
        } 

        setIsAuthorized(true);
        await fetchProducts();

      } catch (err) {
        console.error("Yetki hatası:", err);
        localStorage.removeItem("token");
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router, fetchProducts]);

  // Form Değişince
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- CRUD İŞLEMLERİ ---

  // 1. SİLME
  const handleDelete = async (id: number) => {
    if (!confirm("Bu ürünü ve veritabanındaki kaydını silmek istiyor musunuz?")) return;

    try {
      const res = await fetch(`https://candostumbox-api.onrender.com/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` },
      });

      if (res.ok) {
        setMessage("🗑️ Ürün veritabanından silindi.");
        fetchProducts();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errData = await res.json();
        alert(`Hata: ${errData.message || "Silinemedi."}`);
      }
    } catch (err) {
      alert("Sunucu hatası oluştu.");
    }
  };

  // 2. DÜZENLEME MODU
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || "",
      image: product.image || "",
      stock: product.stock.toString(),
      order: product.order ? product.order.toString() : "0",
    });
    setMessage("✏️ Düzenleme modu aktif.");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. HIZLI SIRA GÜNCELLEME (PATCH)
  const handleQuickOrderChange = async (id: number, newOrder: string) => {
    // Sayı kontrolü
    const orderInt = parseInt(newOrder);
    if(isNaN(orderInt)) return;

    try {
      await fetch(`https://candostumbox-api.onrender.com/products/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ order: orderInt }),
      });
      // Tüm listeyi yeniden çekmeye gerek yok, sadece local state'i güncelle (Performans için)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, order: orderInt } : p).sort((a,b) => a.order - b.order));
    } catch (err) {
      console.error(err);
    }
  };

  // 4. KAYDET (POST / PATCH)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const url = editingId 
        ? `https://candostumbox-api.onrender.com/products/${editingId}` 
        : "https://candostumbox-api.onrender.com/products";
    
    const method = editingId ? "PATCH" : "POST";

    // --- POSTGRES İÇİN VERİ HAZIRLIĞI ---
    // SQL numeric alanlar için string kabul etmez, parse işlemi yapıyoruz.
    // Boş stringleri null'a çeviriyoruz ki veritabanı temiz kalsın.
    const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),     // Postgres DECIMAL/NUMERIC için
        stock: parseInt(formData.stock),       // Postgres INTEGER için
        order: parseInt(formData.order) || 0,  // Postgres INTEGER için
        description: formData.description.trim() === "" ? null : formData.description,
        image: formData.image.trim() === "" ? null : formData.image,
    };

    // Validasyon
    if (isNaN(payload.price) || isNaN(payload.stock)) {
        setError("Fiyat ve Stok alanları sayısal değer olmalıdır.");
        return;
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Veritabanı işlemi başarısız.");

      setMessage(editingId ? "✅ Ürün güncellendi!" : "✅ Yeni ürün eklendi!");
      
      // Formu Sıfırla
      if (!editingId) {
        setFormData({ name: "", price: "", description: "", image: "", stock: "", order: "0" });
      } else {
        setEditingId(null);
        setFormData({ name: "", price: "", description: "", image: "", stock: "", order: "0" });
      }

      fetchProducts();
      setTimeout(() => setMessage(""), 3000);

    } catch (err: any) {
      setError("❌ " + err.message);
    }
  };

  // --- RENDER ---
  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <div className="text-green-600 font-bold animate-pulse">Yükleniyor...</div>
    </div>
  );
  
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-20">
      
      {/* --- HEADER --- */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 pt-10 pb-24 px-8 shadow-xl">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Ürün Yönetimi</h1>
                <p className="text-green-100 mt-2 text-lg">PostgreSQL Veritabanı Yönetim Paneli</p>
            </div>
            <button onClick={() => router.push("/admin")} className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2 rounded-xl font-bold hover:bg-white/30 transition">
                ← Panele Dön
            </button>
          </div>
       </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 space-y-8">
        
        {/* --- İSTATİSTİKLER --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="TOPLAM PAKET" value={totalProducts} sub="Veritabanında Kayıtlı" color="text-gray-800" />
            <StatCard title="KRİTİK STOK" value={lowStockCount} sub="< 5 Adet" color="text-orange-600" />
            <StatCard title="TÜKENENLER" value={outOfStockCount} sub="Satışa Kapalı" color="text-red-600" />
            <StatCard title="ENVANTER DEĞERİ" value={`₺${totalInventoryValue.toLocaleString()}`} sub="Tahmini Ciro" color="text-blue-600" />
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
                {message && <div className="bg-blue-50 text-blue-700 p-4 rounded-xl mb-6 font-bold flex items-center gap-2 animate-pulse">ℹ️ {message}</div>}
                {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 font-bold flex items-center gap-2">🚨 {error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Kutu Adı" name="name" value={formData.name} onChange={handleChange} placeholder="Örn: Süper Başlangıç Kutusu" required />
                        <InputGroup label="Sıra No" name="order" value={formData.order} onChange={handleChange} type="number" placeholder="0" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Fiyat (₺)" name="price" value={formData.price} onChange={handleChange} type="number" step="0.01" required icon="₺" />
                        <InputGroup label="Stok Adedi" name="stock" value={formData.stock} onChange={handleChange} type="number" required />
                    </div>
                    
                    <InputGroup label="Resim URL" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
                    
                    <div>
                        <label className="block font-bold mb-2 text-gray-700 text-sm">Açıklama</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 h-24 text-gray-900 transition resize-none" placeholder="Ürün özelliklerini buraya yazın..."></textarea>
                    </div>
                    
                    <div className="flex gap-4 pt-2">
                        <button type="submit" className={`flex-1 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-95 ${editingId ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gradient-to-r from-green-500 to-green-700"}`}>
                            {editingId ? "Değişiklikleri Kaydet" : "+ Yeni Paket Ekle"}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => {setEditingId(null); setFormData({ name: "", price: "", description: "", image: "", stock: "", order: "0" }); setMessage(""); setError("");}} className="px-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">
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
                <h2 className="text-xl font-bold text-gray-800">Paket Listesi</h2>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 bg-white">
                            <th className="p-5 w-24 text-center">Sıra</th>
                            <th className="p-5">Ürün</th>
                            <th className="p-5">Fiyat</th>
                            <th className="p-5">Stok</th>
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
                                        className="w-14 h-10 border border-gray-200 rounded-lg text-center font-bold focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-gray-50 focus:bg-white"
                                    />
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                                            {product.image ? (
                                                <img src={product.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-lg">{product.name}</div>
                                            <div className="text-xs text-gray-400 line-clamp-1 max-w-[200px]">{product.description || "Açıklama yok"}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className="font-mono font-bold text-green-700 bg-green-50 px-3 py-1 rounded-lg">
                                        ₺{Number(product.price).toFixed(2)}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <StockBadge stock={product.stock} />
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
                        <p className="text-gray-500 font-medium">Veritabanında kayıtlı paket bulunamadı.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

// --- YARDIMCI KOMPONENTLER (Kodu Temiz Tutmak İçin) ---

function StatCard({ title, value, sub, color }: any) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform hover:-translate-y-1 transition duration-300">
            <p className="text-gray-500 text-xs font-bold uppercase">{title}</p>
            <h2 className={`text-3xl font-extrabold mt-2 ${color}`}>{value}</h2>
            <div className={`mt-2 text-xs font-bold opacity-70 ${color}`}>{sub}</div>
        </div>
    );
}

function InputGroup({ label, icon, ...props }: any) {
    return (
        <div>
            <label className="block font-bold mb-2 text-gray-700 text-sm">{label}</label>
            <div className="relative">
                {icon && <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">{icon}</span>}
                <input 
                    className={`w-full ${icon ? 'pl-8' : 'px-4'} pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-900 transition`} 
                    {...props} 
                />
            </div>
        </div>
    );
}

function StockBadge({ stock }: { stock: number }) {
    if (stock <= 0) return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Tükendi
        </span>
    );
    if (stock < 5) return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600 border border-orange-200">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span> Kritik: {stock}
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Stokta: {stock}
        </span>
    );
}