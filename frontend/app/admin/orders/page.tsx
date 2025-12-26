"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast"; // Toast ekledim, yoksa silebilirsin

// --- TİP TANIMLARI (Backend ile Eşitledim) ---
interface Pet {
  name: string;
  breed?: string;
  weight?: string;
  allergies?: string[]; 
  birthDate?: string;
}

interface OrderItem {
  id: number;
  quantity: number; // Adet bilgisini backend'den alıyoruz
  price: number;    // O anki satış fiyatı
  product: {
    name: string;
    price: number;
    image?: string;
  };
}

interface Order {
  id: number;
  user: {
    firstName: string; // Backend 'name' yerine firstName/lastName gönderiyor olabilir
    lastName: string;
    name?: string;     // Eski yapıdan kalma ihtimaline karşı
    email: string;
    phone?: string;
    pets?: Pet[]; 
  } | null;
  
  // 👇 Misafir ve Pet Bilgileri
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  
  petName?: string;
  petType?: string;
  petBreed?: string;
  petWeight?: string;
  petBirthDate?: string;
  petNeutered?: string;

  totalPrice: number;
  status: string;
  city?: string;
  address?: string;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrders() {
  const router = useRouter();
  
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Aktif"); 

  // --- 🛡️ GÜVENLİK VE VERİ ÇEKME ---
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/auth/login"); return; }

      try {
        // 1. Yetki Kontrolü
        const profileRes = await fetch("https://candostumbox-api.onrender.com/auth/profile", { headers: { Authorization: `Bearer ${token}` } });
        if (!profileRes.ok) throw new Error("Yetkisiz");
        
        const user = await profileRes.json();
        // Role kontrolünü case-insensitive yaptım (admin/ADMIN)
        if (user.role?.toUpperCase() !== 'ADMIN') { router.push("/"); return; }

        // 2. Siparişleri Çek
        const res = await fetch("https://candostumbox-api.onrender.com/orders", { headers: { Authorization: `Bearer ${token}` } });
        
        if (res.ok) {
          const data = await res.json();
          
          // 🛡️ KRİTİK DÜZELTME: Gelen verinin dizi (array) olup olmadığını kontrol ediyoruz.
          if (Array.isArray(data)) {
              setOrders(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          } else {
              setOrders([]); // Dizi değilse boş dizi ata (Hata vermesini engeller)
          }
        } else {
          throw new Error("Veri çekilemedi");
        }
      } catch (err) {
        console.error(err);
        // Hata durumunda hemen logout yapma, belki geçici sunucu hatasıdır.
        // Sadece yüklemeyi durdur.
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  // --- FİLTRELEME MANTIĞI ---
  useEffect(() => {
    let result = orders || []; // orders undefined ise boş dizi kabul et

    if (searchTerm) {
      result = result.filter(order => {
        // İsim kontrolü: User varsa firstName+lastName, yoksa guestName
        const nameToCheck = order.user 
            ? `${order.user.firstName} ${order.user.lastName} ${order.user.name || ''}` 
            : order.guestName || "";
            
        return (
            nameToCheck.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toString().includes(searchTerm)
        );
      });
    }

    if (statusFilter === "Aktif") {
        result = result.filter(order => order.status !== "Teslim Edildi" && order.status !== "İptal Edildi");
    } else if (statusFilter !== "Tümü") {
        result = result.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  // --- DURUM GÜNCELLEME ---
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    // 1. Önce UI'ı güncelle (Hızlı tepki)
    const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    
    // Eğer modal açıksa onu da güncelle
    if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
    }

    // 2. Sonra Backend'e gönder
    try {
        const token = localStorage.getItem("token");
        await fetch(`https://candostumbox-api.onrender.com/orders/${orderId}/status`, {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
        });
        toast.success("Durum güncellendi");
    } catch (error) {
        toast.error("Bağlantı hatası!");
        // Hata olursa eski haline döndürmek isteyebilirsin ama şimdilik reload kalsın
        window.location.reload();
    }
  };

  const getStatusStyles = (status: string) => {
      switch(status) {
          case 'Sipariş Alındı': return 'bg-gray-100 text-gray-600 border-gray-200';
          case 'Hazırlanıyor': return 'bg-amber-100 text-amber-700 border-amber-200 ring-amber-100';
          case 'Kargoya Verildi': return 'bg-blue-100 text-blue-700 border-blue-200 ring-blue-100';
          case 'Teslim Edildi': return 'bg-emerald-100 text-emerald-700 border-emerald-200 ring-emerald-100';
          case 'İptal Edildi': return 'bg-red-100 text-red-700 border-red-200';
          default: return 'bg-gray-50 text-gray-500';
      }
  };

  // Helper: İsim Gösterimi
  const getUserName = (order: Order) => {
      if (order.user) {
          // Backend bazen firstName/lastName bazen name gönderebilir, ikisini de kontrol et
          return order.user.firstName ? `${order.user.firstName} ${order.user.lastName}` : order.user.name;
      }
      return order.guestName || "Misafir";
  };

  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-green-600 font-bold animate-pulse">Yükleniyor... 📦</div>;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-20">
       <Toaster />
       
       {/* HEADER */}
       <div className="bg-gradient-to-r from-green-800 to-green-600 pt-10 pb-24 px-8 shadow-xl">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Sipariş Yönetimi</h1>
                <p className="text-green-100 mt-2 text-lg">Toplam {orders.length} sipariş, {filteredOrders.length} tanesi listede.</p>
            </div>
            <button onClick={() => router.push("/admin")} className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2 rounded-xl font-bold hover:bg-white/30 transition">
                ← Panele Dön
            </button>
          </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 -mt-16">
        
        {/* FİLTRE ALANI */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex-1 relative w-full">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                <input 
                    type="text" 
                    placeholder="Sipariş No, Müşteri Adı..." 
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-sm font-bold text-gray-500 whitespace-nowrap">Durum:</span>
                <select 
                    className="p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-500 cursor-pointer font-bold text-gray-700 w-full md:w-48"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="Aktif">⚡ Aktif İşler</option>
                    <option value="Tümü">📂 Tüm Kayıtlar</option>
                    <option value="Sipariş Alındı">⚪ Sipariş Alındı</option>
                    <option value="Hazırlanıyor">🟡 Hazırlanıyor</option>
                    <option value="Kargoya Verildi">🔵 Kargoya Verildi</option>
                    <option value="Teslim Edildi">🟢 Teslim Edildi</option>
                </select>
            </div>
        </div>

        {/* TABLO */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto"> 
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                        <th className="p-6 font-bold">#No</th>
                        <th className="p-6 font-bold">Müşteri</th>
                        <th className="p-6 font-bold">Paket İçeriği</th>
                        <th className="p-6 font-bold">Tutar</th>
                        <th className="p-6 font-bold">Şehir</th>
                        <th className="p-6 font-bold">Durum</th>
                        <th className="p-6 font-bold text-right">Detay</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-green-50/10 transition duration-200 group cursor-pointer" onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}>
                        <td className="p-6">
                            <span className="font-mono text-green-600 font-bold bg-green-50 px-2 py-1 rounded">#{order.id}</span>
                        </td>
                        <td className="p-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${order.user ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-orange-400 to-orange-600'}`}>
                                    {getUserName(order)?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800">{getUserName(order)}</div>
                                    <div className="text-xs text-gray-400 font-medium">{new Date(order.createdAt).toLocaleDateString("tr-TR")}</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-6">
                            {order.petName && <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded mr-2 border border-purple-100">🐾 {order.petName}</span>}
                            <span className="text-sm text-gray-600">{order.items.length} Ürün</span>
                        </td>
                        <td className="p-6 font-extrabold text-gray-800">₺{order.totalPrice.toFixed(2)}</td>
                        <td className="p-6 text-sm font-medium text-gray-600">{order.city}</td>
                        <td className="p-6">
                            <div className="relative">
                                <select 
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`appearance-none w-full pl-3 pr-8 py-2 rounded-xl text-xs font-bold border shadow-sm outline-none cursor-pointer transition hover:scale-105 focus:ring-2 focus:ring-offset-1 focus:ring-green-300 ${getStatusStyles(order.status)}`}
                                >
                                    <option>Sipariş Alındı</option>
                                    <option>Hazırlanıyor</option>
                                    <option>Kargoya Verildi</option>
                                    <option>Teslim Edildi</option>
                                    <option>İptal Edildi</option>
                                </select>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</div>
                            </div>
                        </td>
                        <td className="p-6 text-right">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setIsModalOpen(true); }}
                                className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-black transition shadow-md flex items-center gap-1 ml-auto"
                            >
                                <span>🔍</span> İncele
                            </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
                {filteredOrders.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        <span className="text-4xl block mb-2">📭</span>
                        Kriterlere uygun sipariş yok.
                    </div>
                )}
            </div>
        </div>
       </div>

       {/* --- DETAY MODALI (GÜNCELLENMİŞ VERSİYON) --- */}
       {isModalOpen && selectedOrder && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
               <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                   
                   {/* Modal Header */}
                   <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                       <div>
                           <h2 className="text-2xl font-black text-gray-800">Sipariş #{selectedOrder.id}</h2>
                           <p className="text-sm text-gray-500">{new Date(selectedOrder.createdAt).toLocaleDateString("tr-TR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                       </div>
                       <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-full shadow-sm border border-gray-200 hover:bg-gray-100 text-xl transition">✕</button>
                   </div>

                   <div className="p-8 space-y-6">
                       
                       {/* 👇 1. PET KARTI (EN ÖNEMLİ KISIM) */}
                       <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 relative overflow-hidden shadow-sm">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                           
                           <h3 className="text-purple-800 font-bold uppercase text-xs mb-4 flex items-center gap-2 relative z-10">
                               🐾 Kutu Sahibi (Pet Bilgileri)
                           </h3>

                           <div className="flex flex-col md:flex-row gap-6 relative z-10">
                               {/* Sol: İsim ve Avatar */}
                               <div className="flex items-center gap-4">
                                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-5xl shadow-md border-4 border-purple-100">
                                       {selectedOrder.petType?.toLowerCase().includes("kedi") ? "🐱" : "🐶"}
                                   </div>
                                   <div>
                                       <div className="text-sm text-purple-600 font-bold uppercase">Can Dostumuz</div>
                                       <div className="text-3xl font-black text-purple-900">{selectedOrder.petName || "İsimsiz"}</div>
                                   </div>
                               </div>

                               {/* Sağ: Detaylar (Akıllı Gösterim) */}
                               <div className="flex-1 bg-white/60 rounded-xl p-4 border border-purple-100 backdrop-blur-sm">
                                   {(() => {
                                       // 1. Önce Sipariş Üzerindeki Snapshot Veriye Bak (En Güvenilir)
                                       if (selectedOrder.petBreed || selectedOrder.petWeight) {
                                           return (
                                               <div className="grid grid-cols-2 gap-4">
                                                   <div>
                                                       <p className="text-xs text-gray-500 font-bold uppercase">Irk</p>
                                                       <p className="font-bold text-gray-800">{selectedOrder.petBreed || "Belirtilmemiş"}</p>
                                                   </div>
                                                   <div>
                                                       <p className="text-xs text-gray-500 font-bold uppercase">Kilo</p>
                                                       <p className="font-bold text-gray-800">{selectedOrder.petWeight ? `${selectedOrder.petWeight} kg` : "-"}</p>
                                                   </div>
                                                   <div>
                                                       <p className="text-xs text-gray-500 font-bold uppercase">Doğum</p>
                                                       <p className="font-bold text-gray-800">{selectedOrder.petBirthDate ? new Date(selectedOrder.petBirthDate).toLocaleDateString() : "-"}</p>
                                                   </div>
                                                   <div>
                                                       <p className="text-xs text-gray-500 font-bold uppercase">Kısır?</p>
                                                       <p className="font-bold text-gray-800">
                                                           {selectedOrder.petNeutered === 'true' ? "Evet ✅" : selectedOrder.petNeutered === 'false' ? "Hayır ❌" : "-"}
                                                       </p>
                                                   </div>
                                               </div>
                                           );
                                       }
                                       // 2. Yoksa, Üye Profilindeki Pet Listesinden Eşleştir
                                       const petDetails = selectedOrder.user?.pets?.find(p => 
                                         (p.name && selectedOrder.petName) 
                                         ? p.name.toLowerCase().trim() === selectedOrder.petName?.toLowerCase().trim()
                                         : false
                                       );

                                       if (petDetails) {
                                           return (
                                               <div className="grid grid-cols-2 gap-4">
                                                   <div>
                                                       <p className="text-xs text-gray-500 font-bold uppercase">Irk</p>
                                                       <p className="font-bold text-gray-800">{petDetails.breed || "Bilinmiyor"}</p>
                                                   </div>
                                                   <div>
                                                       <p className="text-xs text-gray-500 font-bold uppercase">Kilo</p>
                                                       <p className="font-bold text-gray-800">{petDetails.weight ? `${petDetails.weight} kg` : "-"}</p>
                                                   </div>
                                                   <div className="col-span-2">
                                                       <p className="text-xs text-gray-500 font-bold uppercase mb-1">Alerji Durumu ⚠️</p>
                                                       {petDetails.allergies && petDetails.allergies.length > 0 ? (
                                                           <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg font-bold text-sm border border-red-200">
                                                               🚫 {Array.isArray(petDetails.allergies) ? petDetails.allergies.join(", ") : petDetails.allergies}
                                                           </div>
                                                       ) : (
                                                           <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded">✅ Alerjisi Yok</span>
                                                       )}
                                                   </div>
                                               </div>
                                           );
                                       }
                                       // 3. Hiçbiri Yoksa
                                       return <div className="text-gray-400 italic text-sm">Bu sipariş için detaylı pet bilgisi bulunamadı.</div>;
                                   })()}
                               </div>
                           </div>
                       </div>

                       {/* 2. Müşteri & Adres Bilgileri */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {/* Müşteri */}
                           <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-200 transition">
                               <h3 className="text-gray-400 font-bold uppercase text-xs mb-3 flex items-center gap-2">👤 Müşteri İletişim</h3>
                               <div className="space-y-1">
                                   <p className="font-bold text-gray-900 text-lg">{getUserName(selectedOrder)}</p>
                                   <p className="text-sm text-gray-600">{selectedOrder.user ? selectedOrder.user.email : selectedOrder.guestEmail}</p>
                                   <div className="mt-3 flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg w-fit font-mono text-sm font-bold">
                                       📞 {selectedOrder.user?.phone || selectedOrder.guestPhone || "Telefon Yok"}
                                   </div>
                               </div>
                           </div>
                           
                           {/* Adres */}
                           <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-green-200 transition">
                               <h3 className="text-gray-400 font-bold uppercase text-xs mb-3 flex items-center gap-2">📍 Teslimat Adresi</h3>
                               <p className="font-black text-gray-800 text-lg mb-1">{selectedOrder.city}</p>
                               <p className="text-gray-600 leading-relaxed text-sm">{selectedOrder.address}</p>
                           </div>
                       </div>

                       {/* 3. Paket İçeriği (Ürünler) */}
                       <div className="border border-gray-200 rounded-2xl overflow-hidden">
                           <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                               <h3 className="font-bold text-gray-700 text-sm uppercase">📦 Paket İçeriği</h3>
                           </div>
                           <div className="p-6">
                               <ul className="space-y-4">
                                   {selectedOrder.items.map((item, idx) => (
                                       <li key={idx} className="flex items-center justify-between">
                                           <div className="flex items-center gap-4">
                                               <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl">🎁</div>
                                               <div>
                                                   <p className="font-bold text-gray-900">{item.product.name}</p>
                                                   <p className="text-xs text-gray-500">Adet: {item.quantity}</p>
                                               </div>
                                           </div>
                                           <span className="font-bold text-gray-700">₺{(item.price * item.quantity).toFixed(2)}</span>
                                       </li>
                                   ))}
                               </ul>
                               <div className="mt-6 pt-6 border-t border-dashed border-gray-200 flex justify-end">
                                   <div className="text-right">
                                       <p className="text-xs text-gray-400 font-bold uppercase">Toplam Tutar</p>
                                       <p className="text-3xl font-black text-green-600">₺{selectedOrder.totalPrice.toFixed(2)}</p>
                                   </div>
                               </div>
                           </div>
                       </div>

                   </div>

                   {/* Footer Actions */}
                   <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4 sticky bottom-0 z-10">
                       <button onClick={() => window.print()} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2">
                           🖨️ Yazdır
                       </button>
                       {selectedOrder.status !== "Kargoya Verildi" && selectedOrder.status !== "Teslim Edildi" && selectedOrder.status !== "İptal Edildi" && (
                           <button 
                               onClick={() => { handleStatusChange(selectedOrder.id, "Kargoya Verildi"); setIsModalOpen(false); }}
                               className="flex-[2] bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition shadow-lg flex items-center justify-center gap-2"
                           >
                               🚀 Kargoya Verildi İşaretle
                           </button>
                       )}
                   </div>

               </div>
           </div>
       )}

    </div>
  );
}