"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeSubscribers: 0,
    lowStock: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return; 

      try {
        const [ordersRes, usersRes, productsRes] = await Promise.all([
           fetch("https://candostumbox-api.onrender.com/orders", { headers: { "Authorization": `Bearer ${token}` } }),
           fetch("https://candostumbox-api.onrender.com/users", { headers: { "Authorization": `Bearer ${token}` } }),
           fetch("https://candostumbox-api.onrender.com/products")
        ]);

        const orders = await ordersRes.json();
        const users = await usersRes.json();
        const products = await productsRes.json();

        const revenue = Array.isArray(orders) ? orders.reduce((acc: number, o: any) => acc + Number(o.totalPrice), 0) : 0;
        const stockAlert = Array.isArray(products) ? products.filter((p: any) => p.stock < 20).length : 0;

        setStats({
            totalOrders: Array.isArray(orders) ? orders.length : 0,
            totalRevenue: revenue,
            activeSubscribers: Array.isArray(users) ? users.length : 0,
            lowStock: stockAlert
        });

      } catch (e) {
        console.error("Dashboard veri hatası", e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-black text-gray-800 tracking-tight">Hoş Geldin, Yönetici 👋</h1>
        <p className="text-gray-500 mt-2">İşletmenizin genel durumunu buradan takip edebilirsiniz.</p>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Toplam Ciro" value={`₺${stats.totalRevenue.toLocaleString('tr-TR')}`} icon="💰" color="bg-green-100 text-green-700" />
          <StatCard title="Toplam Sipariş" value={stats.totalOrders} icon="📦" color="bg-blue-100 text-blue-700" />
          <StatCard title="Aktif Müşteri" value={stats.activeSubscribers} icon="👥" color="bg-purple-100 text-purple-700" />
          <StatCard title="Kritik Stok" value={stats.lowStock} icon="⚠️" color="bg-red-100 text-red-700" />
      </div>

      {/* HIZLI İŞLEMLER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <h3 className="font-bold text-xl mb-4 text-gray-800">Hızlı Menü</h3>
              <div className="grid grid-cols-2 gap-4">
                  {/* 👇 DÜZELTME BURADA: Butonlara belirgin renkler verildi */}
                  <button onClick={() => router.push('/admin/orders')} className="p-4 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-900 hover:text-white transition font-bold text-left flex items-center gap-2">
                    <span className="text-xl">📦</span> Bekleyen Siparişler
                  </button>
                  <button onClick={() => router.push('/admin/discounts')} className="p-4 bg-green-100 text-green-800 rounded-xl hover:bg-green-600 hover:text-white transition font-bold text-left flex items-center gap-2">
                    <span className="text-xl">🏷️</span> İndirim Ayarla
                  </button>
                  <button onClick={() => router.push('/admin/products')} className="p-4 bg-purple-100 text-purple-800 rounded-xl hover:bg-purple-600 hover:text-white transition font-bold text-left flex items-center gap-2">
                    <span className="text-xl">🎁</span> Yeni Paket Ekle
                  </button>
                  <button onClick={() => router.push('/admin/users')} className="p-4 bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-600 hover:text-white transition font-bold text-left flex items-center gap-2">
                    <span className="text-xl">👥</span> Müşteri Listesi
                  </button>
              </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
              <div className="relative z-10">
                  <h3 className="font-bold text-xl mb-2">Sistem Durumu</h3>
                  <p className="text-gray-400 text-sm mb-6">Backend ve Veritabanı bağlantıları aktif.</p>
                  <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-500 font-bold text-xs uppercase">Sistem Online</span>
                  </div>
              </div>
              <div className="absolute -bottom-10 -right-10 text-9xl opacity-10">⚙️</div>
          </div>
      </div>
    </div>
  );
}

// Yardımcı Bileşen
function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                <h4 className="text-2xl font-black text-gray-900">{value}</h4>
            </div>
        </div>
    )
}