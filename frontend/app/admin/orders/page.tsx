"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Veri Çekme
  useEffect(() => {
    const fetchOrders = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("https://candostumbox-api.onrender.com/orders", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            toast.error("Siparişler yüklenemedi");
        } finally {
            setLoading(false);
        }
    };
    fetchOrders();
  }, []);

  // Durum Güncelleme
  const updateStatus = async (id: string, newStatus: string) => {
      const token = localStorage.getItem("token");
      try {
          const res = await fetch(`https://candostumbox-api.onrender.com/orders/${id}/status`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) {
              setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
              toast.success("Sipariş durumu güncellendi");
              if (selectedOrder?.id === id) setSelectedOrder(null); // Modalı kapat
          }
      } catch (e) {
          toast.error("Güncelleme hatası");
      }
  };

  // Filtreleme
  const filteredOrders = orders.filter(order => {
      const matchesStatus = filterStatus === "ALL" || order.status === filterStatus;
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddressSnapshot?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
  });

  if (loading) return <div className="text-gray-500 font-bold mt-10">Siparişler Yükleniyor...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
        <Toaster position="top-right" />
        
        {/* BAŞLIK VE FİLTRELER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black text-gray-800">Sipariş Yönetimi</h1>
                <p className="text-gray-500">Toplam {orders.length} sipariş bulundu.</p>
            </div>
            <div className="flex gap-2">
                <input 
                  placeholder="Sipariş No veya İsim Ara..." 
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-500"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="ALL">Tümü</option>
                    <option value="PAID">Ödendi (Hazırlanacak)</option>
                    <option value="SHIPPED">Kargolandı</option>
                    <option value="DELIVERED">Teslim Edildi</option>
                </select>
            </div>
        </div>

        {/* TABLO */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs text-gray-400 uppercase font-bold">
                    <tr>
                        <th className="p-6">Sipariş No</th>
                        <th className="p-6">Müşteri</th>
                        <th className="p-6">Tutar</th>
                        <th className="p-6">Durum</th>
                        <th className="p-6 text-right">İşlem</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition">
                            <td className="p-6 font-mono text-xs text-gray-500">#{order.id.slice(0,8)}...</td>
                            <td className="p-6 font-bold text-gray-900">
                                {order.user?.name || order.shippingAddressSnapshot?.name || "Misafir"}
                            </td>
                            <td className="p-6 font-bold text-green-600">₺{Number(order.totalPrice).toFixed(2)}</td>
                            <td className="p-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    order.status === 'PAID' ? 'bg-yellow-100 text-yellow-700' :
                                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {order.status === 'PAID' ? 'Hazırlanıyor' : 
                                     order.status === 'SHIPPED' ? 'Kargoda' : order.status}
                                </span>
                            </td>
                            <td className="p-6 text-right">
                                <button onClick={() => setSelectedOrder(order)} className="text-sm font-bold text-gray-500 hover:text-black underline">Detay</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* DETAY MODALI */}
        {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                    <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-gray-400 hover:text-black text-xl font-bold">✕</button>
                    
                    <h2 className="text-2xl font-black mb-6">Sipariş Detayı</h2>
                    
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Teslimat Adresi</h4>
                            <div className="text-sm text-gray-800 leading-relaxed">
                                <p className="font-bold">{selectedOrder.shippingAddressSnapshot?.title}</p>
                                <p>{selectedOrder.shippingAddressSnapshot?.address}</p>
                                <p>{selectedOrder.shippingAddressSnapshot?.city} / {selectedOrder.shippingAddressSnapshot?.district}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Sipariş İçeriği</h4>
                            {selectedOrder.items?.map((item: any) => (
                                <div key={item.id} className="mb-2 text-sm border-b border-gray-100 pb-2">
                                    <p className="font-bold">{item.productNameSnapshot}</p>
                                    <p className="text-gray-500 text-xs">{item.quantity} Adet x ₺{item.priceAtPurchase}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl mb-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Durum Güncelle</h4>
                        <div className="flex gap-2">
                            <button onClick={() => updateStatus(selectedOrder.id, "SHIPPED")} className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-200 transition">📦 Kargola</button>
                            <button onClick={() => updateStatus(selectedOrder.id, "DELIVERED")} className="flex-1 bg-green-100 text-green-700 py-3 rounded-xl font-bold hover:bg-green-200 transition">✅ Teslim Et</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}