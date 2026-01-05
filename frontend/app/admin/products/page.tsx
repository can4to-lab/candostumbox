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
        // Sıralama (Order'a göre)
        setProducts(data.sort((a:any, b:any) => (a.order || 0) - (b.order || 0)));
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
      
      // Feature string to array (Virgülle ayrılan stringi diziye çevir)
      const featuresArray = typeof formData.features === 'string' 
            ? formData.features.split(',').map(s => s.trim()).filter(s => s !== "") 
            : formData.features;

      const payload = {
          ...formData,
          features: featuresArray,
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
          } else {
              toast.error("İşlem başarısız.");
          }
      } catch (err) { toast.error("Bağlantı hatası."); }
  };

  const openEdit = (p: any) => {
      setEditingProduct(p);
      setFormData({
          name: p.name, 
          price: p.price, 
          description: p.description, 
          stock: p.stock, 
          image: p.image, 
          // Diziyi string'e çevir ki input'ta düzenlenebilsin
          features: Array.isArray(p.features) ? p.features.join(', ') : "", 
          order: p.order || 0
      });
      setModalOpen(true);
  };

  const openNew = () => {
      setEditingProduct(null);
      setFormData({ name: "", price: "", description: "", stock: "", image: "", features: "", order: 0 });
      setModalOpen(true);
  };

  if (loading) return <div className="mt-10 font-bold text-gray-500 ml-4">Yükleniyor...</div>;

  return (
      <div className="space-y-6 animate-fade-in">
          <Toaster position="top-right" />
          
          <div className="flex justify-between items-center">
              <div>
                  <h1 className="text-3xl font-black text-gray-800">Ürün & Stok Yönetimi</h1>
                  <p className="text-sm text-gray-500">Paketleri düzenle, fiyatları güncelle.</p>
              </div>
              <button onClick={openNew} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition flex items-center gap-2 shadow-lg shadow-gray-300">
                  <span>+</span> Yeni Paket Ekle
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                  <div key={p.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative group">
                      <div className="absolute top-4 right-4 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500 border border-gray-200">Sıra: {p.order || 0}</div>
                      
                      <div className="h-32 w-full mb-4 relative rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                          {p.image ? (
                              <img src={p.image} alt={p.name} className="h-full object-contain" />
                          ) : (
                              <span className="text-4xl">📦</span>
                          )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{p.name}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-4 h-8">{p.description}</p>
                      
                      <div className="flex justify-between items-center mt-auto">
                          <span className="text-2xl font-black text-gray-900">₺{Number(p.price).toFixed(0)}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${p.stock < 10 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                              {p.stock} Stok
                          </span>
                      </div>
                      
                      <button onClick={() => openEdit(p)} className="w-full mt-4 py-3 bg-white border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition">Düzenle ✏️</button>
                  </div>
              ))}
          </div>

          {/* EKLEME/DÜZENLEME MODALI */}
          {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                  <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative border border-gray-100">
                      <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 font-bold hover:bg-gray-200 transition">✕</button>
                      
                      <h2 className="text-2xl font-black mb-6 text-gray-900">{editingProduct ? "Paketi Düzenle" : "Yeni Paket Oluştur"}</h2>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 ml-1">Paket İsmi</label>
                              <input required placeholder="Örn: Yavru Köpek Paketi" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 font-bold focus:ring-2 focus:ring-green-500 outline-none" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-bold text-gray-500 ml-1">Fiyat (TL)</label>
                                  <input required type="number" placeholder="0.00" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 font-bold focus:ring-2 focus:ring-green-500 outline-none" />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 ml-1">Stok</label>
                                  <input required type="number" placeholder="0" value={formData.stock} onChange={e=>setFormData({...formData, stock: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 font-bold focus:ring-2 focus:ring-green-500 outline-none" />
                              </div>
                          </div>
                          
                          <div>
                              <label className="text-xs font-bold text-gray-500 ml-1">Görsel URL</label>
                              <input placeholder="https://..." value={formData.image} onChange={e=>setFormData({...formData, image: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                          </div>
                          
                          <div>
                              <label className="text-xs font-bold text-gray-500 ml-1">Açıklama</label>
                              <textarea placeholder="Ürün detayları..." value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 text-sm h-24 focus:ring-2 focus:ring-green-500 outline-none resize-none" />
                          </div>
                          
                          <div>
                              <label className="text-xs font-bold text-gray-500 ml-1">Özellikler (Virgülle Ayır)</label>
                              <input placeholder="Kargo Bedava, Lisanslı Ürün, vs." value={formData.features} onChange={e=>setFormData({...formData, features: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                          </div>
                          
                          <div>
                              <label className="text-xs font-bold text-gray-500 ml-1">Sıralama (Order)</label>
                              <input type="number" placeholder="0" value={formData.order} onChange={e=>setFormData({...formData, order: Number(e.target.value)})} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 font-bold focus:ring-2 focus:ring-green-500 outline-none" />
                          </div>
                          
                          <button type="submit" className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 mt-4">Kaydet ✅</button>
                      </form>
                  </div>
              </div>
          )}
      </div>
  );
}