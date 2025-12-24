"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  
  // --- STATE ---
  const [dashboardData, setDashboardData] = useState({
    stats: {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        totalUsers: 0
    },
    // Tip güvenliği için "as any[]" kullanıyoruz
    recentOrders: [] as any[] 
  });

  const [loading, setLoading] = useState(true);

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token"); 
      if (!token) { router.push("/admin/login"); return; }

      try {
        // 1. Yetki Kontrolü
        const profileRes = await fetch("http://localhost:3000/auth/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!profileRes.ok) throw new Error("Yetkisiz");
        
        const user = await profileRes.json();
        if (user.role?.toUpperCase() !== 'ADMIN') { 
            router.push("/"); 
            return; 
        }

        // 2. Paralel Veri Çekme
        const [ordersRes, productsRes, usersRes] = await Promise.all([
            fetch("http://localhost:3000/orders", { headers: { "Authorization": `Bearer ${token}` } }),
            fetch("http://localhost:3000/products"),
            fetch("http://localhost:3000/users", { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        const orders = await ordersRes.json();
        const products = await productsRes.json();
        const users = usersRes.ok ? await usersRes.json() : [];

        // 3. İstatistik Hesaplama
        const revenue = Array.isArray(orders) 
            ? orders.reduce((acc: number, order: any) => acc + (order.totalPrice || 0), 0) 
            : 0;
        
        const pending = Array.isArray(orders) 
            ? orders.filter((o: any) => o.status === "Hazırlanıyor" || o.status === "Sipariş Alındı").length 
            : 0;

        const lowStock = Array.isArray(products) 
            ? products.filter((p: any) => p.stock < 5).length 
            : 0;

        // Son 5 siparişi al
        const recentOrdersList = Array.isArray(orders) ? orders.slice(0, 5) : [];

        // State Güncellemesi
        setDashboardData({
            stats: {
                totalRevenue: revenue,
                totalOrders: Array.isArray(orders) ? orders.length : 0,
                pendingOrders: pending,
                totalProducts: Array.isArray(products) ? products.length : 0,
                lowStockProducts: lowStock,
                totalUsers: Array.isArray(users) ? users.length : 0
            },
            recentOrders: recentOrdersList
        });

      } catch (error) {
        console.error("Dashboard verisi çekilemedi", error);
        localStorage.removeItem("token");
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Kısa erişim için
  const { stats, recentOrders } = dashboardData;

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-green-600 font-bold">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <span className="animate-pulse">Panel Verileri Yükleniyor... 🚀</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-20">
      
      {/* --- HEADER --- */}
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 pt-12 pb-32 px-8 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400 opacity-5 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>

         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end relative z-10 gap-6">
            <div>
                <h2 className="text-green-200 font-bold tracking-widest uppercase text-xs mb-2">YÖNETİM MERKEZİ</h2>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Genel Bakış</h1>
                <p className="text-green-100 mt-4 text-lg max-w-xl leading-relaxed opacity-90">
                    İşletmenizin kalbi burada atıyor. Siparişleri takip edin, stokları yönetin ve büyümeyi izleyin.
                </p>
            </div>
            <div className="flex gap-3">
                <button onClick={() => router.push("/")} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition flex items-center gap-2 group">
                    <span>🏠</span> Siteye Git
                </button>
                <button onClick={() => { localStorage.removeItem('token'); router.push('/admin/login'); }} className="bg-red-500/80 backdrop-blur-md border border-red-400/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition flex items-center gap-2">
                    Çıkış Yap 🚪
                </button>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20">
        
        {/* --- 1. SATIR: İSTATİSTİKLER --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {/* Ciro */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-green-500 flex items-center justify-between transform hover:-translate-y-1 transition duration-300">
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Toplam Ciro</p>
                    <h3 className="text-3xl font-black text-gray-800 mt-1">₺{stats.totalRevenue.toLocaleString('tr-TR')}</h3>
                </div>
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-3xl shadow-sm">💰</div>
            </div>
            {/* Sipariş */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-blue-500 flex items-center justify-between transform hover:-translate-y-1 transition duration-300">
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Toplam Sipariş</p>
                    <h3 className="text-3xl font-black text-gray-800 mt-1">{stats.totalOrders}</h3>
                </div>
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-3xl shadow-sm">📦</div>
            </div>
            
            {/* 👇 BURASI GÜNCELLENDİ: Abonelik Listesine Gider 👇 */}
            {/* Aktif Paketler (Abonelikler) */}
            <div 
                onClick={() => router.push('/admin/subscriptions')} // Yönlendirme eklendi
                className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-purple-500 flex items-center justify-between transform hover:-translate-y-1 transition duration-300 cursor-pointer hover:bg-purple-50/20"
            >
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Abonelik Yönetimi</p> {/* İsmi güncelledim */}
                    <h3 className="text-3xl font-black text-gray-800 mt-1">Yönet ➜</h3> {/* Tıklanabilir hissi verdim */}
                </div>
                <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-3xl shadow-sm">🔄</div>
            </div>
            
            {/* Bekleyen */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-orange-500 flex items-center justify-between transform hover:-translate-y-1 transition duration-300">
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Bekleyen İşler</p>
                    <h3 className="text-3xl font-black text-gray-800 mt-1">{stats.pendingOrders}</h3>
                </div>
                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-3xl shadow-sm animate-pulse">🔔</div>
            </div>
        </div>

        {/* --- 2. SATIR: HIZLI MENÜ VE UYARILAR --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* SOL: HIZLI ERİŞİM KARTLARI (2 Birim Genişlik) */}
            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    ⚡ Hızlı Yönetim
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. Sipariş Yönetimi */}
                    <div 
                        onClick={() => router.push("/admin/orders")}
                        className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 cursor-pointer group hover:border-blue-300 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
                        <div className="flex items-start justify-between relative z-10">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform shadow-sm">🚚</div>
                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-[10px] font-bold border border-blue-100">{stats.pendingOrders} Yeni</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-800 mt-4 group-hover:text-blue-600 transition">Siparişler</h4>
                        <p className="text-gray-400 mt-1 text-xs leading-relaxed">Sipariş durumlarını ve kargo takibini yönet.</p>
                    </div>

                    {/* 2. Ürün Yönetimi */}
                    <div 
                        onClick={() => router.push("/admin/products")}
                        className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 cursor-pointer group hover:border-green-300 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
                        <div className="flex items-start justify-between relative z-10">
                            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform shadow-sm">✨</div>
                            <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-[10px] font-bold border border-green-100">{stats.totalProducts} Paket</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-800 mt-4 group-hover:text-green-600 transition">Ürünler</h4>
                        <p className="text-gray-400 mt-1 text-xs leading-relaxed">Paket ekle, fiyat güncelle ve stok takibi yap.</p>
                    </div>

                    {/* 3. Müşteri Yönetimi */}
                    <div 
                        onClick={() => router.push("/admin/users")}
                        className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 cursor-pointer group hover:border-indigo-300 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
                        <div className="flex items-start justify-between relative z-10">
                            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform shadow-sm">👥</div>
                            <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full text-[10px] font-bold border border-indigo-100">{stats.totalUsers} Üye</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-800 mt-4 group-hover:text-indigo-600 transition">Müşteriler</h4>
                        <p className="text-gray-400 mt-1 text-xs leading-relaxed">Kayıtlı kullanıcıları listele ve detayları gör.</p>
                    </div>
                </div>
            </div>

            {/* SAĞ: DURUM PANOSU */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    📢 Durum Panosu
                </h3>
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 relative">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 group">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors ${stats.lowStockProducts > 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
                                {stats.lowStockProducts > 0 ? '⚠️' : '✅'}
                            </div>
                            <div>
                                <h5 className="font-bold text-gray-800">Stok Durumu</h5>
                                <p className="text-sm text-gray-500">
                                    {stats.lowStockProducts > 0 
                                        ? <span className="text-red-500 font-bold">{stats.lowStockProducts} ürün kritik!</span>
                                        : "Tüm stoklar yeterli."}
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-gray-100"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl text-orange-600">⏳</div>
                            <div>
                                <h5 className="font-bold text-gray-800">Operasyon</h5>
                                <p className="text-sm text-gray-500">Hazırlanacak <span className="font-bold text-gray-800">{stats.pendingOrders}</span> sipariş.</p>
                            </div>
                        </div>
                        <div className="border-t border-gray-100"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl text-blue-600">🛡️</div>
                            <div>
                                <h5 className="font-bold text-gray-800">Sistem</h5>
                                <p className="text-sm text-gray-500">Admin paneli aktif.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- 3. SATIR: SON SİPARİŞLER (YENİ EKLENDİ) --- */}
        <div className="mt-8 mb-10">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        📦 Son Gelen Siparişler
                    </h3>
                    <button onClick={() => router.push("/admin/orders")} className="text-xs font-bold text-green-600 hover:underline bg-green-50 px-3 py-1 rounded-full transition">Tümünü Gör ➜</button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                                <th className="pb-3 font-bold pl-2">Sipariş No</th>
                                <th className="pb-3 font-bold">Müşteri</th>
                                <th className="pb-3 font-bold">Tutar</th>
                                <th className="pb-3 font-bold">Durum</th>
                                <th className="pb-3 font-bold text-right pr-2">Tarih</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {recentOrders.length > 0 ? (
                                recentOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition group">
                                        <td className="py-3 pl-2 font-mono text-gray-500">#{order.id}</td>
                                        <td className="py-3 font-bold text-gray-800">
                                            {order.user ? order.user.name : order.guestName}
                                            <div className="text-xs text-gray-400 font-normal">{order.petName ? `🐾 ${order.petName}` : 'Misafir'}</div>
                                        </td>
                                        <td className="py-3 font-bold text-green-600">₺{order.totalPrice}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border
                                                ${order.status === 'Sipariş Alındı' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                                  order.status === 'Hazırlanıyor' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                  order.status === 'Kargoya Verildi' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                  order.status === 'Teslim Edildi' ? 'bg-green-50 text-green-600 border-green-100' :
                                                  'bg-gray-50 text-gray-500 border-gray-100'}
                                            `}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right pr-2 text-gray-400 text-xs">
                                            {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-6 text-center text-gray-400">Henüz sipariş yok.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}