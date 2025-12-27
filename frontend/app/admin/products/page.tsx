"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

// --- TİP TANIMI ---
interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  stock: number;
  order: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const API_URL = "https://candostumbox-api.onrender.com";

  // State'ler
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Debug için ekrana hata basma state'i
  const [debugError, setDebugError] = useState<string | null>(null);

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

  // İstatistikler
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock < 5 && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (Number(p.price) * Number(p.stock)), 0);

  // --- ÜRÜNLERİ GETİR ---
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/products`, { cache: "no-store" });
      if (!res.ok) throw new Error("Veri çekilemedi");
      const data: Product[] = await res.json();
      const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setProducts(sortedData);
    } catch (err) {
      console.error("Hata:", err);
      toast.error("Ürün listesi yüklenemedi.");
    }
  }, [API_URL]);

  // --- GÜVENLİK VE BAŞLANGIÇ KONTROLÜ (DÜZENLENMİŞ KISIM) ---
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      
      // 1. Token Kontrolü
      if (!token) { 
        console.log("❌ Token yok, login'e yönlendiriliyor.");
        router.push("/admin/login"); 
        return; 
      }

      try {
        // 2. Profil ve Yetki Kontrolü
        const profileRes = await fetch(`${API_URL}/auth/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!profileRes.ok) throw new Error("Oturum geçersiz (Profile Fetch Failed)");

        const user = await profileRes.json();

        // --- SORUN TESPİT LOGLARI (BURAYA DİKKAT) ---
        console.log("-----------------------------------------");
        console.log("🕵️‍♂️ DETAYLI KULLANICI ANALİZİ BAŞLADI");
        console.log("1. API'den gelen ham veri:", user);
        console.log("2. Kullanıcının Rolü (user.role):", user.role);
        console.log("-----------------------------------------");

        // 3. Admin Rol Kontrolü
        if (user.role?.toUpperCase() !== 'ADMIN') {
          // Normalde burası router.push("/") yapar.
          // Ama sorunu görmek için yönlendirmeyi kapattım ve ekrana hata yazdırdım.
          
          const hataMesaji = `YETKİ REDDEDİLDİ! Beklenen: ADMIN, Gelen: ${user.role}`;
          console.error(hataMesaji);
          setDebugError(hataMesaji); // Ekrana kırmızı yazı ile basacağız
          toast.error("YETKİ HATASI! (Konsola bakınız)");
          
          // router.push("/"); // <--- YÖNLENDİRME GEÇİCİ OLARAK KAPALI
          return;
        } 

        // 4. Yetki tamamsa ürünleri çek
        console.log("✅ Yetki başarılı, ürünler getiriliyor...");
        await fetchProducts();

      } catch (err: any) {
        console.error("Yetki hatası catch bloğu:", err);
        setDebugError("Bir hata oluştu: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router, fetchProducts, API_URL]);

  // Form Değişince
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- CRUD İŞLEMLERİ (DELETE, EDIT, SAVE) ---
  
  const handleDelete = async (id: number) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Ürün başarıyla silindi");
        fetchProducts();
      } else {
        toast.error("Silinirken hata oluştu.");
      }
    } catch (err) {
      toast.error("Sunucu hatası.");
    }
  };

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

  const handleQuickOrderChange = async (id: number, newOrder: string) => {
    const token = localStorage.getItem("token");
    const orderInt = parseInt(newOrder);
    if(isNaN(orderInt)) return;
    try {
      await fetch(`${API_URL}/products/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ order: orderInt }),
      });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, order: orderInt } : p).sort((a,b) => a.order - b.order));
      toast.success("Sıra güncellendi");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    const token = localStorage.getItem("token");
    const url = editingId ? `${API_URL}/products/${editingId}` : `${API_URL}/products`;
    const method = editingId ? "PATCH" : "POST";
    const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        order: parseInt(formData.order) || 0,
        description: formData.description,
        image: formData.image,
    };
    if (isNaN(payload.price) || isNaN(payload.stock)) {
        setError("Fiyat ve Stok sayısal değer olmalıdır.");
        return;
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
      toast.success(editingId ? "Ürün güncellendi!" : "Ürün eklendi!");
      setFormData({ name: "", price: "", description: "", image: "", stock: "", order: "0" });
      if(editingId) setEditingId(null);
      fetchProducts();
      setMessage("");
    } catch (err: any) {
      setError("❌ " + err.message);
      toast.error(err.message);
    }
  };

  // --- RENDER KISMI ---

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-green-600 font-bold">
        <div className="animate-pulse mb-4">Veriler Kontrol Ediliyor... 🚀</div>
        <div className="text-gray-400 text-sm">Lütfen bekleyin</div>
    </div>
  );

  // EĞER HATA VARSA EKRANA BAS (Böylece anasayfaya atılmadan sorunu görürsün)
  if (debugError) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-10">
        <h1 className="text-3xl font-bold text-red-600 mb-4">⚠️ ERİŞİM SORUNU TESPİT EDİLDİ</h1>
        <div className="bg-white p-6 rounded-xl shadow-xl border border-red-200 max-w-2xl w-full">
            <p className="font-bold text-gray-800 mb-2">Hata Detayı:</p>
            <code className="block bg-gray-100 p-4 rounded text-red-700 font-mono text-sm mb-6 break-all">
                {debugError}
            </code>
            <p className="text-gray-600 mb-4">
                Bu mesajı görüyorsanız, veritabanındaki rolünüz ile kodun beklediği rol uyuşmuyor demektir.
            </p>
            <div className="flex gap-4">
                <button onClick={() => router.push("/admin/login")} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Giriş Sayfasına Git</button>
                <button onClick={() => window.location.reload()} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Sayfayı Yenile</button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-20">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 pt-10 pb-24 px-8 shadow-xl">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Ürün Yönetimi</h1>
                <p className="text-green-100 mt-2">Paketleri düzenle, stokları yönet, fiyatları güncelle.</p>
            </div>
            <button 
                onClick={() => router.push("/admin/dashboard")} 
                className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2 rounded-xl font-bold hover:bg-white/30 transition"
            >
                ← Panele Dön
            </button>
          </div>
       </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="TOPLAM PAKET" value={totalProducts} sub="Aktif Satışta" color="text-gray-800" />
            <StatCard title="KRİTİK STOK" value={lowStockCount} sub="< 5 Adet" color="text-orange-600" />
            <StatCard title="TÜKENENLER" value={outOfStockCount} sub="Satışa Kapalı" color="text-red-600" />
            <StatCard title="ENVANTER DEĞERİ" value={`₺${totalInventoryValue.toLocaleString()}`} sub="Tahmini Kazanç" color="text-blue-600" />
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className={`p-6 px-8 flex justify-between items-center ${editingId ? "bg-orange-50" : "bg-green-50"}`}>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{editingId ? "✏️" : "✨"}</span>
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
                        <InputGroup label="Sıra No (Küçük üstte)" name="order" value={formData.order} onChange={handleChange} type="number" placeholder="0" />
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

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-800">Paket Listesi & Envanter</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 bg-white">
                            <th className="p-5 w-24 text-center">Sıra</th>
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
                                        className="w-14 h-10 border border-gray-200 rounded-lg text-center font-bold focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-gray-50 focus:bg-white"
                                    />
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                                            {product.image ? (
                                                <img src={product.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">Resim Yok</div>
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
                        <p className="text-gray-500 font-medium">Henüz hiç paket oluşturulmadı.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

// --- YARDIMCI BİLEŞENLER ---
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
                    className={`w-full ${icon ? 'pl-8' : 'px-4'} pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-gray-900 transition font-bold`} 
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