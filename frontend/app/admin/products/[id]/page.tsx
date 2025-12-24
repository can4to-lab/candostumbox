"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

// --- TİPLER ---
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  isVisible: boolean; // 👈 Kritik Alan: Gizli ürün yönetimi için
}

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    isVisible: true // Varsayılan görünür olsun
  });

  // --- VERİ ÇEKME ---
  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/admin/login"); return; }

    try {
      const res = await fetch("http://localhost:3000/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // ID'ye göre sırala
        setProducts(data.sort((a: Product, b: Product) => a.id - b.id));
      }
    } catch (error) {
      console.error("Ürünler çekilemedi", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- FORM İŞLEMLERİ ---
  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        description: product.description,
        isVisible: product.isVisible
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: "", price: "", stock: "", description: "", isVisible: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    // Veri hazırlığı (String -> Number dönüşümü)
    const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
    };

    try {
        let res;
        if (editingProduct) {
            // GÜNCELLEME (PUT/PATCH)
            res = await fetch(`http://localhost:3000/products/${editingProduct.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
        } else {
            // YENİ EKLEME (POST)
            res = await fetch("http://localhost:3000/products", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
        }

        if (res.ok) {
            toast.success(editingProduct ? "Ürün güncellendi!" : "Yeni ürün eklendi!");
            setIsModalOpen(false);
            fetchProducts(); // Listeyi yenile
        } else {
            throw new Error("İşlem başarısız");
        }
    } catch (error) {
        toast.error("Bir hata oluştu.");
    }
  };

  // --- SİLME İŞLEMİ ---
  const handleDelete = async (id: number) => {
      if(!window.confirm("Bu ürünü silmek istediğine emin misin?")) return;

      const token = localStorage.getItem("token");
      try {
          const res = await fetch(`http://localhost:3000/products/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` }
          });
          if(res.ok) {
              toast.success("Ürün silindi.");
              fetchProducts();
          }
      } catch (error) {
          toast.error("Silinemedi.");
      }
  };

  // --- GÖRÜNÜRLÜK (GİZLİ ÜRÜN) SWITCH ---
  const toggleVisibility = async (product: Product) => {
      // Optimistik UI (Anında tepki)
      const updatedProducts = products.map(p => p.id === product.id ? { ...p, isVisible: !p.isVisible } : p);
      setProducts(updatedProducts);

      const token = localStorage.getItem("token");
      try {
          await fetch(`http://localhost:3000/products/${product.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ isVisible: !product.isVisible })
          });
          toast.success(`Ürün ${!product.isVisible ? 'görünür' : 'gizli'} yapıldı.`);
      } catch (error) {
          toast.error("Güncellenemedi");
          fetchProducts(); // Hata varsa geri al
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-green-600 font-bold">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-20">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 pt-10 pb-24 px-8 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Ürün Yönetimi</h1>
            <p className="text-green-100 mt-2 text-lg">Toplam {products.length} ürün listeleniyor.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push("/admin")} className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2 rounded-xl font-bold hover:bg-white/30 transition">
               ← Panel
            </button>
            <button onClick={() => handleOpenModal()} className="bg-white text-green-700 px-6 py-2 rounded-xl font-bold hover:bg-green-50 transition shadow-lg flex items-center gap-2">
               + Yeni Ürün
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16">
        
        {/* TABLO */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto"> 
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                        <th className="p-6 font-bold">#ID</th>
                        <th className="p-6 font-bold">Ürün Adı</th>
                        <th className="p-6 font-bold">Fiyat</th>
                        <th className="p-6 font-bold">Stok</th>
                        <th className="p-6 font-bold">Durum</th>
                        <th className="p-6 font-bold text-right">İşlemler</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition duration-200">
                        <td className="p-6 font-mono text-gray-400">#{product.id}</td>
                        <td className="p-6">
                            <div className="font-bold text-gray-800 text-lg">{product.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                        </td>
                        <td className="p-6 font-black text-green-600 text-lg">₺{product.price}</td>
                        <td className="p-6">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${product.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                {product.stock} Adet
                            </span>
                        </td>
                        <td className="p-6">
                            {/* GİZLİ/GÖRÜNÜR SWITCH */}
                            <button 
                                onClick={() => toggleVisibility(product)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                    product.isVisible 
                                    ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                                    : 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 ring-2 ring-purple-100'
                                }`}
                            >
                                {product.isVisible ? '👁️ Görünür' : '🕵️ Gizli (Misafir)'}
                            </button>
                        </td>
                        <td className="p-6 text-right">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => handleOpenModal(product)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">✏️</button>
                                <button onClick={() => handleDelete(product.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition">🗑️</button>
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* --- MODAL (EKLE / DÜZENLE) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                    {editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ürün Adı</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-green-500" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fiyat (TL)</label>
                            <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-green-500" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stok</label>
                            <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-green-500" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Açıklama</label>
                        <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-green-500 resize-none"></textarea>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <input 
                            type="checkbox" 
                            id="visibleCheck"
                            checked={formData.isVisible} 
                            onChange={e => setFormData({...formData, isVisible: e.target.checked})} 
                            className="w-5 h-5 accent-green-600"
                        />
                        <label htmlFor="visibleCheck" className="text-sm font-bold text-gray-700 cursor-pointer">
                            Vitrine Koy (İşaretli Değilse Gizli Olur)
                        </label>
                    </div>

                    <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition mt-2">
                        {editingProduct ? "Güncelle" : "Kaydet"}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}