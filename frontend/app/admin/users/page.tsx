"use client";
import { useState, useEffect } from "react";

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
        if (res.ok) setUsers(await res.json());
      } catch (err) {} 
      finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="mt-10 font-bold text-gray-500">Kullanıcılar Yükleniyor...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-black text-gray-800">Müşteri Listesi 👥</h1>
        
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
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition">
                            <td className="p-6 font-mono text-xs text-gray-400">#{user.id}</td>
                            <td className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{user.name}</div>
                                        <div className="text-xs text-gray-400">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-6">
                                {user.role === 'ADMIN' ? 
                                    <span className="bg-black text-white px-2 py-1 rounded text-xs font-bold">YÖNETİCİ</span> : 
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">Müşteri</span>
                                }
                            </td>
                            <td className="p-6 font-bold text-gray-600">{user.pets?.length || 0} 🐾</td>
                            <td className="p-6 font-bold text-green-600">{user.orders?.length || 0} 📦</td>
                            <td className="p-6 text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString("tr-TR")}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}