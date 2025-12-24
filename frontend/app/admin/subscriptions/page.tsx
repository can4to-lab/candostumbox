"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Verileri Çek
  useEffect(() => {
    const fetchSubs = async () => {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/admin/login"); return; }

      try {
        const res = await fetch("http://localhost:3000/subscriptions", {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setSubs(data);
        } else {
            toast.error("Abonelikler çekilemedi.");
        }
      } catch (e) {
        toast.error("Bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, [router]);

  if (loading) return <div className="flex justify-center items-center h-screen text-gray-500">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans p-8">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-black text-gray-800">Abonelik Yönetimi</h1>
            <p className="text-gray-500 text-sm mt-1">Sistemdeki tüm aktif ve pasif abonelikler.</p>
        </div>
        <button onClick={() => router.push('/admin')} className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition">
            ← Panele Dön
        </button>
      </div>

      {/* Tablo Kartı */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">ID</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Müşteri</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Paket & Pet</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Başlangıç</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Sonraki Ödeme</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Durum</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">İşlem</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {subs.length > 0 ? (
                        subs.map((sub) => (
                            <tr key={sub.id} className="hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">#{sub.id}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800">{sub.user.name}</div>
                                    <div className="text-xs text-gray-400">{sub.user.email}</div>
                                    <div className="text-xs text-gray-400">{sub.user.phone}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-700">{sub.product.name}</div>
                                    <div className="inline-block bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded mt-1 border border-orange-100">
                                        🐾 {sub.petName || 'Bilinmiyor'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(sub.startDate).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800">
                                        {new Date(sub.nextPaymentDate).toLocaleDateString('tr-TR')}
                                    </div>
                                    <div className="text-[10px] text-green-600 font-bold">Otomatik Çekim</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border
                                        ${sub.status === 'ACTIVE' 
                                            ? 'bg-green-50 text-green-600 border-green-100' 
                                            : 'bg-red-50 text-red-600 border-red-100'}
                                    `}>
                                        {sub.status === 'ACTIVE' ? 'Aktif' : 'İptal'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {sub.status === 'ACTIVE' && (
                                        <button 
                                            onClick={() => toast.error("İptal özelliği backend'e bağlanmalı")}
                                            className="text-red-500 hover:text-red-700 text-xs font-bold underline"
                                        >
                                            İptal Et
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                <div className="text-2xl mb-2">📭</div>
                                Henüz hiç abone yok.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}