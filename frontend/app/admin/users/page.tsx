"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("https://candostumbox-api.onrender.com/users", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
           // Token süresi dolmuşsa login'e atabiliriz veya hata gösterebiliriz
           throw new Error("Veri çekilemedi");
        }

        const data = await res.json();
        
        // Veri formatını garantiye alalım
        let cleanData: any[] = [];
        if (Array.isArray(data)) {
            cleanData = data;
        } else if (data && Array.isArray(data.users)) {
            cleanData = data.users;
        }

        setUsers(cleanData);

      } catch (err) {
          console.error("Hata:", err);
          toast.error("Liste yüklenirken hata oluştu.");
      } finally { 
          setLoading(false); 
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="mt-10 font-bold text-gray-500 animate-pulse">Kullanıcılar Yükleniyor...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
        <Toaster position="top-right" />
        
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-gray-800">Müşteri Listesi 👥</h1>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                Toplam: {users.length}
            </span>
        </div>
        
        {users.length === 0 ? (
             <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
                 <div className="text-4xl mb-4">📭</div>
                 <h3 className="text-xl font-bold text-gray-900">Henüz müşteri yok</h3>
                 <p className="text-gray-500 text-sm mt-2">Kayıtlı kullanıcılar burada listelenecek.</p>
             </div>
        ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs text-gray-400 uppercase font-bold">
                        <tr>
                            <th className="p-6">ID</th>
                            <th className="p-6">Kullanıcı</th>
                            <th className="p-6">Rol</th>
                            <th className="p-6">Pet Sayısı</th>
                            <th className="p-6">Sipariş</th>
                            <th className="p-6">Kayıt Tarihi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((user) => {
                            // 👇 İSİM OLUŞTURMA MANTIĞI BURAYA EKLENDİ
                            // Eğer firstName varsa Ad + Soyad birleştir, yoksa 'name' alanına bak, o da yoksa 'İsimsiz' de.
                            const displayName = user.firstName 
                                ? `${user.firstName} ${user.lastName || ''}` 
                                : (user.name || "İsimsiz");
                            
                            // Baş harf için de firstName'i öncelikli yapalım
                            const initial = (user.firstName || user.name || "?").charAt(0).toUpperCase();

                            return (
                                <tr key={user?.id || Math.random()} className="hover:bg-gray-50 transition">
                                    <td className="p-6 font-mono text-xs text-gray-400">
                                        #{user?.id ? user.id.toString().slice(0, 5) : "?"}
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            {/* Yuvarlak Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg shadow-sm">
                                                {initial}
                                            </div>
                                            <div>
                                                {/* İsim Alanı */}
                                                <div className="font-bold text-gray-900">{displayName}</div>
                                                <div className="text-xs text-gray-400">{user?.email || "Email Yok"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        {user?.role === 'ADMIN' ? 
                                            <span className="bg-black text-white px-2 py-1 rounded text-xs font-bold shadow-sm">YÖNETİCİ</span> : 
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border border-gray-200">Müşteri</span>
                                        }
                                    </td>
                                    <td className="p-6 font-bold text-gray-600">
                                        {user?.pets?.length || 0} 🐾
                                    </td>
                                    <td className="p-6 font-bold text-green-600">
                                        {user?.orders?.length || 0} 📦
                                    </td>
                                    <td className="p-6 text-xs text-gray-400">
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("tr-TR") : "-"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
}