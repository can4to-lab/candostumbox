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
  isVisible: boolean;
}

export default function AdminProductsPage() {
  const router = useRouter();
  
  // --- API URL AYARI ---
  // Dashboard kodlarınla uyumlu olması için localhost yaptık.
  // Yayına alırken burayı "https://candostumbox-api.onrender.com" yapmalısın.
  const API_URL = "http://localhost:3000"; 

  // State Tanımları
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form Verileri
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    stock: "",
    isVisible: true
  });

  // --- 1. ÜRÜNLERİ LİSTELE ---
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/products`, {
          cache: "no-store"
      });
      if (!res.ok) throw new Error("Veri çekilemedi");
      
      const data: Product[] = await res.json();
      // ID'ye göre sırala (Eskiden yeniye veya tam tersi)
      setProducts(data.sort((a, b) => a.id - b.id));
    } catch (err) {
      console.error(err);
      toast.error("Ürün listesi yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- 2. GÜVENLİK VE YETKİ KONTROLÜ (REDIRECT SORUNUNU ÇÖZEN KISIM) ---
  useEffect(() => {
    const checkAuth = async () => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            console.log("Token yok, login'e atılıyor...");
            router.push("/admin/login");
            return;
        }

        try {
            // Dashboard'daki gibi profil kontrolü yapıyoruz
            const profileRes = await fetch(`${API_URL}/auth/profile`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!profileRes.ok) throw new Error("Oturum geçersiz");

            const user = await profileRes.json();
            
            // Log ekleyelim ki konsoldan hatayı görebilesin
            console.log("Giriş Yapan Kullanıcı Rolü:", user.role);

            // Büyük/Küçük harf duyarlılığını kaldırdık (toUpperCase)
            if (user.role?.toUpperCase() !== 'ADMIN') {
                console.log("Yetkisiz kullanıcı, anasayfaya atılıyor...");
                router.push("/");
                return;
            }

            // Yetki tamamsa ürünleri çek
            fetchProducts();

        } catch (err) {
            console.error("Yetki kontrol hatası:", err);
            localStorage.removeItem("token");
            router.push("/admin/login");
        }
    };

    checkAuth();
  }, [router, fetchProducts]);

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

    // Backend sayı bekliyor, string'i çeviriyoruz (Postgres Uyumlu)
    const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description.trim() === "" ? null : formData.description,
        image: formData.image.trim() === "" ? null : formData.image,
        isVisible: formData.isVisible
    };

    if (isNaN(payload.price) || isNaN(payload.stock)) {
        toast.error("Fiyat ve Stok sayı olmalıdır.");
        return;
    }

    const url = editingId 
        ? `${API_URL}/products/${editingId}`
        : `${API_URL}/products`;
    
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

        if (!res.ok) throw new Error("Kayıt başarısız");

        toast.success(editingId ? "Ürün güncellendi!" : "Ürün eklendi!");
        handleCancel();
        fetchProducts();
    } catch (error) {
        toast.error("Bir hata oluştu.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Silmek istediğine emin misin?")) return;
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            toast.success("Ürün silindi.");
            fetchProducts();
        } else {
            toast.error("Silinemedi.");
        }
    } catch (error) {
        toast.error("Hata oluştu.");
    }
  };

  const toggleVisibility = async (product: Product) => {
      const newStatus = !product.isVisible;
      // Hızlı tepki için arayüzü hemen güncelle (Optimistic UI)
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isVisible: newStatus } : p));
      
      const token = localStorage.getItem("token");
      try {
          await fetch(`${API_URL}/products/${product.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify({ isVisible: newStatus })
          });
          toast.success(`Durum güncellendi: ${newStatus ? 'Görünür' : 'Gizli'}`);
      } catch (error) {
          toast.error("Güncellenemedi.");
          fetchProducts(); // Hata varsa eski haline döndür
      }
  };

  if (isLoading) return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-green-600 font-bold animate-pulse">Yetki kontrol ediliyor ve ürünler yükleniyor...</div>
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
                <p className="text-green-100 mt-2">Paket ekle, düzenle veya stok takibi yap.</p>
            </div>
            <button onClick={() => router.push("/admin")} className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2 rounded-xl font-bold hover:bg-white/30 transition">
                ← Panele Dön
            </button>
          </div>
       </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 space-y-8">
        
        {/* --- FORM ALANI --- */}
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
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition" required placeholder="Örn: Yavru Köpek Paketi" />
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
                        <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none resize-none transition" placeholder="Ürün detaylarını buraya yazın..."></textarea>
                    </div>

                    <div className="flex items-center gap-3 py-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div 
                            onClick={() => setFormData(prev => ({...prev, isVisible: !prev.isVisible}))}
                            className={`w-12 h-7 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${formData.isVisible ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${formData.isVisible ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                            {formData.isVisible ? "Vitrine Koy (Satışa Açık)" : "Gizli Ürün (Müşteriler Göremez)"}
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

        {/* --- LİSTE ALANI --- */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                            <th className="p-5 font-bold pl-8">Ürün Detayı</th>
                            <th className="p-5 font-bold">Fiyat</th>
                            <th className="p-5 font-bold">Stok</th>
                            <th className="p-5 font-bold">Durum</th>
                            <th className="p-5 font-bold text-right pr-8">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-green-50/30 transition group">
                                    <td className="p-5 pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 relative">
                                                {product.image ? (
                                                    <img src={product.image} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Görsel Yok</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-lg">{product.name}</div>
                                                <div className="text-xs text-gray-400">ID: #{product.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 font-mono font-bold text-green-700 text-lg">₺{Number(product.price).toFixed(2)}</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock < 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
                                            {product.stock} Adet
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <button 
                                            onClick={() => toggleVisibility(product)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border transition ${product.isVisible ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}
                                        >
                                            {product.isVisible ? 'Aktif' : 'Gizli'}
                                        </button>
                                    </td>
                                    <td className="p-5 pr-8 text-right">
                                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(product)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-100 transition">Düzenle</button>
                                            <button onClick={() => handleDelete(product.id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-red-100 transition">Sil</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl mb-2">📦</span>
                                        <span>Henüz hiç ürün eklenmemiş.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}