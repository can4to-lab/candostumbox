"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  pets: any[];
  orders: any[];
}

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/admin/login"); return; }

      try {
        // 1. Yetki Kontrolü (Hızlıca)
        const profileRes = await fetch("http://localhost:3000/auth/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const adminCheck = await profileRes.json();
        if (adminCheck.role?.toUpperCase() !== 'ADMIN') { router.push("/"); return; }

        // 2. Kullanıcıları Çek
        const res = await fetch("http://localhost:3000/users", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            setUsers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-green-600 font-bold animate-pulse">Kullanıcılar Yükleniyor... 👥</div>;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-20">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 pt-10 pb-24 px-8 shadow-xl">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Müşteri Listesi</h1>
                <p className="text-green-100 mt-2 text-lg">Toplam {users.length} kayıtlı üye var.</p>
            </div>
            <button onClick={() => router.push("/admin")} className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2 rounded-xl font-bold hover:bg-white/30 transition">
                ← Geri Git
            </button>
          </div>
       </div>

       {/* LİSTE */}
       <div className="max-w-6xl mx-auto px-4 -mt-16">
         <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                            <th className="p-6">ID</th>
                            <th className="p-6">Kullanıcı</th>
                            <th className="p-6">Rol</th>
                            <th className="p-6 text-center">Pet Sayısı</th>
                            <th className="p-6 text-center">Sipariş</th>
                            <th className="p-6">Kayıt Tarihi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-green-50/10 transition group">
                                <td className="p-6 font-mono text-gray-400">#{user.id}</td>
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">{user.name}</div>
                                            <div className="text-xs text-gray-400">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    {user.role === 'ADMIN' ? (
                                        <span className="bg-black text-white px-3 py-1 rounded-lg text-xs font-bold">YÖNETİCİ</span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">Müşteri</span>
                                    )}
                                </td>
                                <td className="p-6 text-center">
                                    <span className="font-bold text-gray-700">{user.pets?.length || 0}</span>
                                    <span className="text-xs text-gray-400 ml-1">🐾</span>
                                </td>
                                <td className="p-6 text-center">
                                    <span className="font-bold text-green-600">{user.orders?.length || 0}</span>
                                    <span className="text-xs text-gray-400 ml-1">📦</span>
                                </td>
                                <td className="p-6 text-sm text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         </div>
       </div>
    </div>
  );
}