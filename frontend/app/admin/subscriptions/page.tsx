"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("https://candostumbox-api.onrender.com/subscriptions", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) setSubs(await res.json());
      } catch (err) {} 
      finally { setLoading(false); }
    };
    fetchSubs();
  }, []);

  if (loading) return <div className="mt-10 font-bold text-gray-500">Abonelikler Yükleniyor...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
        <Toaster position="top-right" />
        <h1 className="text-3xl font-black text-gray-800">Abonelikler 🔄</h1>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs text-gray-400 uppercase font-bold">
                    <tr>
                        <th className="p-6">ID</th>
                        <th className="p-6">Müşteri & Pet</th>
                        <th className="p-6">Paket</th>
                        <th className="p-6">Kalan Süre</th>
                        <th className="p-6">Sonraki Gönderim</th>
                        <th className="p-6">Durum</th>
                    </tr>
                </thead>
               <tbody className="divide-y divide-gray-50">
                    {subs.map((sub) => {
                        // 👇 İSİM GÖSTERME MANTIĞI GÜNCELLENDİ
                        const userName = sub.user?.firstName 
                            ? `${sub.user.firstName} ${sub.user.lastName || ''}`
                            : (sub.user?.name || "Misafir");

                        return (
                            <tr key={sub.id} className="hover:bg-gray-50 transition">
                                <td className="p-6 font-mono text-xs text-gray-400">#{sub.id.toString().slice(0,5)}</td>
                                <td className="p-6">
                                    <div className="font-bold text-gray-900">{userName}</div>
                                    <div className="text-xs text-gray-500">🐾 {sub.pet?.name || "İsimsiz"}</div>
                                </td>
                                <td className="p-6 text-sm text-gray-700">{sub.product?.name}</td>
                                <td className="p-6 font-bold text-blue-600">{sub.remainingMonths} / {sub.totalMonths} Ay</td>
                                <td className="p-6 text-sm text-gray-500">
                                    {sub.nextDeliveryDate ? new Date(sub.nextDeliveryDate).toLocaleDateString("tr-TR") : "-"}
                                </td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        (sub.status === 'ACTIVE' || sub.status === 'active' || sub.status === 1) 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                        {(sub.status === 'ACTIVE' || sub.status === 'active' || sub.status === 1) ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
  );
}