"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
      name: "", price: "", description: "", stock: "", image: "", features: "", order: 0
  });

  const fetchProducts = async () => {
    try {
        const res = await fetch("https://candostumbox-api.onrender.com/products");
        const data = await res.json();
        setProducts(data.sort((a:any, b:any) => a.order - b.order));
    } catch (e) { toast.error("Ürünler yüklenemedi"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const token = localStorage.getItem("token");
      const url = editingProduct 
        ? `https://candostumbox-api.onrender.com/products/${editingProduct.id}`
        : "https://candostumbox-api.onrender.com/products";
      
      const method = editingProduct ? "PATCH" : "POST";
      
      // Feature string to array
      const payload = {
          ...formData,
          features: typeof formData.features === 'string' ? formData.features.split(',').map(s=>s.trim()) : formData.features,
          price: Number(formData.price),
          stock: Number(formData.stock),
          order: Number(formData.order)
      };

      try {
          const res = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify(payload)
          });
          if (res.ok) {
              toast.success(editingProduct ? "Ürün güncellendi" : "Yeni ürün eklendi");
              setModalOpen(false);
              fetchProducts();
          }
      } catch (err) { toast.error("İşlem başarısız"); }
  };

  const openEdit = (p: any) => {
      setEditingProduct(p);
      setFormData({
          name: p.name, price: p.price, description: p.description, 
          stock: p.stock, image: p.image, features: p.features?.join(', '), order: p.order
      });
      setModalOpen(true);
  };

  const openNew = () => {
      setEditingProduct(null);
      setFormData({ name: "", price: "", description: "", stock: "", image: "", features: "", order: 0 });
      setModalOpen(true);
  };

  if (loading) return <div className="mt-10 font-bold text-gray-500">Yükleniyor...</div>;

  return (
      <div className="space-y-6 animate-fade-in">
          <Toaster position="top-right" />
          
          <div className="flex justify-between items-center">
              <h1 className="text-3xl font-black text-gray-800">Ürün & Stok Yönetimi</h1>
              <button onClick={openNew} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition flex items-center gap-2">
                  <span>+</span> Yeni Paket Ekle
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                  <div key={p.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg group hover:border-green-200 transition relative">
                      <div className="absolute top-4 right-4 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500">Sıra: {p.order}</div>
                      
                      <div className="h-32 w-full mb-4 relative">
                          <img src={p.image || "https://placehold.co/400x300/e2e8f0/94a3b8?text=Resim+Yok"} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                      <div className="flex justify-between items-center mt-2">
                          <span className="text-2xl font-black text-green-600">₺{Number(p.price).toFixed(0)}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${p.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                              {p.stock} Adet Stok
                          </span>
                      </div>
                      
                      <button onClick={() => openEdit(p)} className="w-full mt-4 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-900 hover:text-white transition">Düzenle</button>
                  </div>
              ))}
          </div>

          {/* EKLEME/DÜZENLEME MODALI */}
          {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative">
                      <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 font-bold hover:text-black">✕</button>
                      <h2 className="text-2xl font-black mb-6">{editingProduct ? "Paketi Düzenle" : "Yeni Paket Oluştur"}</h2>
                      <form onSubmit={handleSubmit} className="space-y-4">
                          <input required placeholder="Paket Adı" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" />
                          <div className="grid grid-cols-2 gap-4">
                              <input required type="number" placeholder="Fiyat (TL)" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" />
                              <input required type="number" placeholder="Stok Adedi" value={formData.stock} onChange={e=>setFormData({...formData, stock: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" />
                          </div>
                          <input placeholder="Görsel URL" value={formData.image} onChange={e=>setFormData({...formData, image: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" />
                          <textarea placeholder="Açıklama" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 h-24" />
                          <input placeholder="Özellikler (Virgülle ayır)" value={formData.features} onChange={e=>setFormData({...formData, features: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm" />
                          <input type="number" placeholder="Sıralama (Order)" value={formData.order} onChange={e=>setFormData({...formData, order: Number(e.target.value)})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" />
                          
                          <button type="submit" className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200">Kaydet ✅</button>
                      </form>
                  </div>
              </div>
          )}
      </div>
  );
}