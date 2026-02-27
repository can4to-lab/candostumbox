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
const CalendarIcon = () => (
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
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
const PetIcon = () => (
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
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // --- 1. VERİ ÇEKME ---
  useEffect(() => {
    fetchSubs();
  }, []);

  const fetchSubs = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://api.candostumbox.com/subscriptions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubs(data);
      }
    } catch (err) {
      toast.error("Veriler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. ABONELİK İPTAL ETME ---
  const handleCancelSub = async (id: string) => {
    const reason = prompt("Lütfen iptal nedenini giriniz:");
    if (!reason) return;

    const token = localStorage.getItem("token");
    const toastId = toast.loading("İptal ediliyor...");

    try {
      const res = await fetch(
        `https://api.candostumbox.com/subscriptions/${id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        },
      );

      if (res.ok) {
        toast.success("Abonelik İptal Edildi", { id: toastId });
        setSubs((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, status: "cancelled", cancellationReason: reason }
              : s,
          ),
        );
        if (selectedSub?.id === id)
          setSelectedSub({
            ...selectedSub,
            status: "cancelled",
            cancellationReason: reason,
          });
      } else {
        toast.error("İşlem başarısız", { id: toastId });
      }
    } catch (e) {
      toast.error("Hata oluştu", { id: toastId });
    }
  };

  // --- HELPER: İSİM ÇÖZÜCÜ ---
  const getUserName = (sub: any) => {
    // 1. Önce doğrudan faturaya (shippingAddressSnapshot) bakalım (EN GÜVENİLİR YOL)
    if (sub.order && sub.order.shippingAddressSnapshot) {
      const snap = sub.order.shippingAddressSnapshot;
      if (snap.firstName || snap.lastName) {
        return `${snap.firstName || ""} ${snap.lastName || ""}`.trim();
      }
      if (snap.name) {
        return snap.name;
      }
    }

    // 2. Faturada yoksa, 'User' tablosuna bakalım
    if (sub.user) {
      if (sub.user.firstName || sub.user.lastName) {
        return `${sub.user.firstName || ""} ${sub.user.lastName || ""}`.trim();
      }
      if (sub.user.name) {
        return sub.user.name;
      }
      // Kullanıcının ismi yoksa en azından emailini gösterelim ki "Misafir" yazmasın
      if (sub.user.email) {
        return sub.user.email.split("@")[0]; // ornek@mail.com -> ornek
      }
    }

    // İkisi de yoksa mecburen misafir
    return "Misafir Müşteri";
  };

  // --- FİLTRELEME ---
  const filteredSubs = subs.filter((sub) => {
    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "ACTIVE" &&
        (sub.status === "active" || sub.status === "ACTIVE")) ||
      (filterStatus === "CANCELLED" &&
        (sub.status === "cancelled" || sub.status === "CANCELLED")) ||
      (filterStatus === "COMPLETED" &&
        (sub.status === "completed" || sub.status === "COMPLETED"));

    const search = searchTerm.toLowerCase();
    const userName = getUserName(sub).toLowerCase();
    const petName = sub.pet?.name?.toLowerCase() || "";

    return (
      matchesStatus &&
      (userName.includes(search) ||
        petName.includes(search) ||
        sub.id.includes(search))
    );
  });

  // --- İSTATİSTİKLER ---
  const stats = {
    totalActive: subs.filter(
      (s) => s.status === "active" || s.status === "ACTIVE",
    ).length,
    totalRevenue: subs.reduce((acc, s) => acc + (Number(s.pricePaid) || 0), 0),
    churned: subs.filter(
      (s) => s.status === "cancelled" || s.status === "CANCELLED",
    ).length,
  };

  // --- HELPER: PROGRESS BAR ---
  const getProgress = (sub: any) => {
    const total = sub.totalMonths || 1;
    const remaining = sub.remainingMonths || 0;
    const used = total - remaining;
    return (used / total) * 100;
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
            Aktif Aboneler
          </div>
          <div className="text-4xl font-black text-green-600 group-hover:scale-105 transition origin-left">
            {stats.totalActive}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 group">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">
            Toplam Abonelik Cirosu
          </div>
          <div className="text-4xl font-black text-purple-600 group-hover:scale-105 transition origin-left">
            ₺{stats.totalRevenue.toLocaleString("tr-TR")}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 group">
          <div className="text-gray-400 text-xs font-bold uppercase mb-1">
            İptal / Kayıp (Churn)
          </div>
          <div className="text-4xl font-black text-red-500 group-hover:scale-105 transition origin-left">
            {stats.churned}
          </div>
        </div>
      </div>

      {/* FİLTRE TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <SearchIcon />
          </div>
          <input
            placeholder="Müşteri, Pet Adı veya ID Ara..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "ACTIVE", "CANCELLED", "COMPLETED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${
                filterStatus === status
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-purple-50"
              }`}
            >
              {status === "ALL"
                ? "Tümü"
                : status === "ACTIVE"
                  ? "Aktif"
                  : status === "CANCELLED"
                    ? "İptal"
                    : "Biten"}
            </button>
          ))}
        </div>
      </div>

      {/* TABLO */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-6">Abonelik Detayı</th>
                <th className="p-6">Müşteri & Pet</th>
                <th className="p-6">İlerleme</th>
                <th className="p-6">Sonraki Kutu</th>
                <th className="p-6">Durum</th>
                <th className="p-6 text-right">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSubs.map((sub) => {
                const isActive =
                  sub.status === "ACTIVE" || sub.status === "active";
                const progress = getProgress(sub);

                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-gray-50/80 transition group cursor-pointer"
                    onClick={() => setSelectedSub(sub)}
                  >
                    <td className="p-6">
                      <div className="font-mono text-xs text-gray-400 font-bold">
                        #{sub.id.slice(0, 6)}
                      </div>
                      <div className="font-bold text-gray-900 text-sm mt-1">
                        {sub.product?.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {sub.totalMonths} Aylık Plan
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="font-bold text-gray-900 text-sm">
                        {getUserName(sub)}
                      </div>
                      {sub.pet && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                            {sub.pet.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {sub.pet.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-6 w-48">
                      <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                        <span>{sub.totalMonths - sub.remainingMonths}. Ay</span>
                        <span>{sub.totalMonths}. Ay</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-center text-[10px] text-gray-400 mt-1 font-mono">
                        {sub.remainingMonths} ay kaldı
                      </div>
                    </td>
                    <td className="p-6">
                      {isActive ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <CalendarIcon />
                          {sub.nextDeliveryDate
                            ? new Date(sub.nextDeliveryDate).toLocaleDateString(
                                "tr-TR",
                              )
                            : "-"}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isActive
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : sub.status === "CANCELLED" ||
                                sub.status === "cancelled"
                              ? "bg-red-50 text-red-700 border border-red-100"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {isActive
                          ? "Aktif"
                          : sub.status === "CANCELLED" ||
                              sub.status === "cancelled"
                            ? "İptal"
                            : "Tamamlandı"}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-purple-600 hover:border-purple-200 bg-white shadow-sm transition">
                        <EyeIcon />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAY MODALI */}
      {selectedSub && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedSub(null)}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  Abonelik Detayı
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  ID: {selectedSub.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-red-50 hover:text-red-500 transition flex items-center justify-center font-bold text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SOL KOLON: Müşteri & Pet */}
                <div className="space-y-6">
                  {/* Müşteri Kartı */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">
                      Müşteri Bilgileri
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                        {getUserName(selectedSub).charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">
                          {getUserName(selectedSub)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedSub.user?.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedSub.user?.phone || "Telefon Yok"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pet Kartı */}
                  {selectedSub.pet && (
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider flex items-center gap-2">
                        <PetIcon /> Pet Profili
                      </h4>
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">
                          {selectedSub.pet.type?.toLowerCase().includes("kedi")
                            ? "🐱"
                            : "🐶"}
                        </div>
                        <div className="flex-1">
                          <div className="font-black text-gray-900 text-lg">
                            {selectedSub.pet.name}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="bg-gray-50 p-2 rounded-lg text-xs">
                              <span className="block text-gray-400 font-bold text-[10px]">
                                IRK
                              </span>
                              <span className="font-bold text-gray-700">
                                {selectedSub.pet.breed || "-"}
                              </span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg text-xs">
                              <span className="block text-gray-400 font-bold text-[10px]">
                                KİLO
                              </span>
                              <span className="font-bold text-gray-700">
                                {selectedSub.pet.weight} kg
                              </span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg text-xs col-span-2">
                              <span className="block text-gray-400 font-bold text-[10px]">
                                ALERJİLER
                              </span>
                              {selectedSub.pet.allergies &&
                              selectedSub.pet.allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {selectedSub.pet.allergies.map(
                                    (a: string, i: number) => (
                                      <span
                                        key={i}
                                        className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-red-100"
                                      >
                                        {a}
                                      </span>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500 italic">
                                  Yok
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SAĞ KOLON: Plan & Finans */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">
                      Abonelik Detayları
                    </h4>

                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-lg shadow-purple-200">
                      <div className="opacity-80 text-xs font-bold uppercase mb-1">
                        Seçilen Paket
                      </div>
                      <div className="text-2xl font-black">
                        {selectedSub.product?.name}
                      </div>
                      <div className="mt-4 flex justify-between items-end">
                        <div>
                          <div className="text-xs opacity-70">Ödenen Tutar</div>
                          <div className="text-xl font-bold">
                            ₺
                            {Number(
                              selectedSub.pricePaid ||
                                selectedSub.product?.price,
                            ).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs opacity-70">Ödeme Tipi</div>
                          <div className="font-bold bg-white/20 px-2 py-1 rounded text-sm mt-1">
                            {selectedSub.paymentType === "upfront"
                              ? "Peşin Ödeme"
                              : "Aylık Çekim"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="text-gray-500">Başlangıç Tarihi</span>
                        <span className="font-bold text-gray-900">
                          {new Date(selectedSub.startDate).toLocaleDateString(
                            "tr-TR",
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="text-gray-500">Sonraki Gönderim</span>
                        <span className="font-bold text-purple-600">
                          {selectedSub.nextDeliveryDate
                            ? new Date(
                                selectedSub.nextDeliveryDate,
                              ).toLocaleDateString("tr-TR")
                            : "Bitti"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="text-gray-500">Durum</span>
                        <span
                          className={`font-bold ${
                            selectedSub.status === "ACTIVE" ||
                            selectedSub.status === "active"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {selectedSub.status === "ACTIVE" ||
                          selectedSub.status === "active"
                            ? "Aktif"
                            : "Pasif"}
                        </span>
                      </div>
                      {selectedSub.cancellationReason && (
                        <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
                          <span className="text-xs font-bold text-red-500 uppercase block mb-1">
                            İptal Nedeni
                          </span>
                          <span className="text-red-700 text-sm">
                            {selectedSub.cancellationReason}
                          </span>
                        </div>
                      )}
                    </div>

                    {(selectedSub.status === "ACTIVE" ||
                      selectedSub.status === "active") && (
                      <button
                        onClick={() => handleCancelSub(selectedSub.id)}
                        className="w-full mt-6 py-3 border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition"
                      >
                        Aboneliği İptal Et
                      </button>
                    )}
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
