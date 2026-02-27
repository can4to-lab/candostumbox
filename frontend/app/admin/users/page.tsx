"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

// --- ICONS ---
const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
const EyeIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);
const PhoneIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);
const MapIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. VERİ ÇEKME ---
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      // Backend'in user objesi içinde 'pets', 'orders', 'addresses' ilişkilerini döndürdüğünden emin olun.
      const res = await fetch("https://api.candostumbox.com/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        let cleanData = Array.isArray(data) ? data : data.users || [];
        setUsers(cleanData);
      } else {
        toast.error("Kullanıcı verisi çekilemedi.");
      }
    } catch (err) {
      toast.error("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER: İSİM ÇÖZÜCÜ ---
  const getUserName = (user: any) => {
    return user.firstName
      ? `${user.firstName} ${user.lastName || ""}`
      : user.name || "İsimsiz Müşteri";
  };

  // --- HELPER: BAŞ HARF ---
  const getInitials = (user: any) => {
    const name = getUserName(user);
    return name.charAt(0).toUpperCase();
  };

  // --- HELPER: TOPLAM HARCAMA (LTV) ---
  const calculateLTV = (orders: any[]) => {
    if (!orders) return 0;
    return orders.reduce(
      (acc, order) => acc + Number(order.totalPrice || 0),
      0,
    );
  };

  // --- FİLTRELEME ---
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    const name = getUserName(user).toLowerCase();
    const email = (user.email || "").toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  // --- İSTATİSTİKLER ---
  const stats = {
    totalUsers: users.length,
    totalPets: users.reduce((acc, u) => acc + (u.pets?.length || 0), 0),
    totalOrders: users.reduce((acc, u) => acc + (u.orders?.length || 0), 0),
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-8 font-sans">
      <Toaster position="top-right" />

      {/* DASHBOARD KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 group">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">
            Toplam Müşteri
          </div>
          <div className="text-4xl font-black text-gray-800 group-hover:scale-105 transition origin-left">
            {stats.totalUsers}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 group">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">
            Kayıtlı Pet Sayısı
          </div>
          <div className="text-4xl font-black text-purple-600 group-hover:scale-105 transition origin-left">
            {stats.totalPets} 🐾
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 group">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">
            Toplam Sipariş
          </div>
          <div className="text-4xl font-black text-green-600 group-hover:scale-105 transition origin-left">
            {stats.totalOrders} 📦
          </div>
        </div>
      </div>

      {/* FİLTRE & ARAMA */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <SearchIcon />
          </div>
          <input
            placeholder="İsim veya E-posta Ara..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs text-gray-400 font-bold">
          {filteredUsers.length} Kullanıcı Listeleniyor
        </div>
      </div>

      {/* TABLO */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-6">Müşteri</th>
                <th className="p-6">İletişim</th>
                <th className="p-6">Pet & Sipariş</th>
                <th className="p-6">Rol</th>
                <th className="p-6">Kayıt Tarihi</th>
                <th className="p-6 text-right">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50/80 transition group cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white ring-1 ring-purple-100">
                        {getInitials(user)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {getUserName(user)}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          #{user.id.slice(0, 5)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-sm text-gray-600">{user.email}</div>
                    {user.phone && (
                      <div className="text-xs text-gray-400 mt-1">
                        {user.phone}
                      </div>
                    )}
                  </td>
                  <td className="p-6">
                    <div className="flex gap-3 text-sm">
                      <div className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md font-bold border border-orange-100">
                        {user.pets?.length || 0} Pet
                      </div>
                      <div className="bg-green-50 text-green-700 px-2 py-1 rounded-md font-bold border border-green-100">
                        {user.orders?.length || 0} Sipariş
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    {user.role === "ADMIN" ? (
                      <span className="bg-black text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm tracking-wider">
                        YÖNETİCİ
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-bold border border-gray-200">
                        MÜŞTERİ
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-xs text-gray-400 font-medium">
                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="p-6 text-right">
                    <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-purple-600 hover:border-purple-200 bg-white shadow-sm transition">
                      <EyeIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAY MODALI */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-purple-200">
                  {getInitials(selectedUser)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    {getUserName(selectedUser)}
                  </h2>
                  <div className="flex gap-2 text-xs mt-1">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-mono">
                      ID: {selectedUser.id}
                    </span>
                    {selectedUser.role === "ADMIN" && (
                      <span className="bg-black text-white px-2 py-0.5 rounded font-bold">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-red-50 hover:text-red-500 transition flex items-center justify-center font-bold text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SOL KOLON: Kişisel & Petler */}
                <div className="space-y-6">
                  {/* İletişim Kartı */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">
                      İletişim Bilgileri
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                          ✉️
                        </div>
                        <div className="font-medium text-gray-700">
                          {selectedUser.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                          <PhoneIcon />
                        </div>
                        <div className="font-medium text-gray-700">
                          {selectedUser.phone || "Telefon Kayıtlı Değil"}
                        </div>
                      </div>
                    </div>

                    {/* Adresler */}
                    {selectedUser.addresses &&
                      selectedUser.addresses.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-50">
                          <h5 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <MapIcon /> Kayıtlı Adresler
                          </h5>
                          <div className="space-y-2">
                            {selectedUser.addresses.map((addr: any) => (
                              <div
                                key={addr.id}
                                className="text-xs bg-gray-50 p-3 rounded-xl text-gray-600 border border-gray-100"
                              >
                                <span className="font-bold text-gray-800 block mb-1">
                                  {addr.title}
                                </span>
                                {addr.fullAddress || addr.address},{" "}
                                {addr.district}/{addr.city}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Pet Kartları */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider ml-2">
                      Evcil Hayvanlar ({selectedUser.pets?.length || 0})
                    </h4>
                    {!selectedUser.pets || selectedUser.pets.length === 0 ? (
                      <div className="text-center p-6 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 text-sm">
                        Pet kaydı yok.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {selectedUser.pets.map((pet: any) => (
                          <div
                            key={pet.id}
                            className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4"
                          >
                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl">
                              {pet.type?.toLowerCase().includes("kedi")
                                ? "🐱"
                                : "🐶"}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                {pet.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {pet.breed || "Irk Bilinmiyor"} •{" "}
                                {pet.weight ? `${pet.weight}kg` : "-"}
                              </div>
                              {pet.allergies && pet.allergies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {pet.allergies.map((a: string, i: number) => (
                                    <span
                                      key={i}
                                      className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold border border-red-100"
                                    >
                                      {a}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* SAĞ KOLON: Siparişler & Finans */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Sipariş Geçmişi
                      </h4>
                      <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-bold border border-green-100">
                        Toplam Harcama: ₺
                        {calculateLTV(selectedUser.orders).toLocaleString(
                          "tr-TR",
                        )}
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar space-y-3">
                      {!selectedUser.orders ||
                      selectedUser.orders.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                          Henüz sipariş vermemiş.
                        </div>
                      ) : (
                        selectedUser.orders.map((order: any) => (
                          <div
                            key={order.id}
                            className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-mono text-xs text-gray-400 font-bold">
                                  #{order.id.slice(0, 8)}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "tr-TR",
                                  )}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 rounded text-[10px] font-bold ${
                                  order.status === "PAID" ||
                                  order.status === "PREPARING"
                                    ? "bg-orange-100 text-orange-700"
                                    : order.status === "SHIPPED"
                                      ? "bg-blue-100 text-blue-700"
                                      : order.status === "CANCELLED"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <div className="flex justify-between items-end">
                              <div className="text-xs text-gray-500">
                                {order.items?.length || 1} Ürün
                              </div>
                              <div className="font-bold text-gray-900">
                                ₺{Number(order.totalPrice).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
