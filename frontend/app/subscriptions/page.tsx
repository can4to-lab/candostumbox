"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function MySubscriptionsPage() {
  const router = useRouter();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Verileri Çek
  useEffect(() => {
    const fetchSubs = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const res = await fetch("https://api.candostumbox.com/subscriptions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSubs(data);
        } else {
          toast.error("Abonelikler yüklenemedi.");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, [router]);

  // --- İŞLEMLER ---

  // 1. İptal Etme İşlemi
  const handleCancel = async (id: number) => {
    if (!confirm("Aboneliğinizi iptal etmek istediğinize emin misiniz? 😢"))
      return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://api.candostumbox.com/subscriptions/${id}/cancel`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        toast.success("Abonelik iptal edildi.");
        // Listeyi güncelle (sayfayı yenilemeden)
        setSubs(
          subs.map((sub) =>
            sub.id === id ? { ...sub, status: "CANCELLED" } : sub,
          ),
        );
      } else {
        toast.error("İptal işlemi başarısız.");
      }
    } catch (error) {
      toast.error("Bir hata oluştu.");
    }
  };

  // 2. Tarih Değiştirme (Simülasyon)
  const handleDateChange = () => {
    toast("📅 Tarih değiştirme özelliği çok yakında!", { icon: "🚧" });
  };

  // 3. Adres Değiştirme (Simülasyon)
  const handleAddressChange = () => {
    // İleride /profile sayfasına yönlendirebiliriz
    toast("📍 Lütfen Profil sayfasından adresinizi güncelleyin.", {
      icon: "ℹ️",
    });
    // router.push('/profile');
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-green-600 font-bold">
        Yükleniyor...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      <Toaster position="top-right" />

      {/* Header Alanı */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white pt-24 pb-32 px-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="container mx-auto max-w-4xl relative z-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Aboneliklerim
            </h1>
            <p className="text-green-100 text-lg opacity-90">
              Aktif paketlerini yönet, teslimat tarihlerini güncelle.
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-lg transition backdrop-blur-sm border border-white/20"
          >
            ← Ana Sayfaya Dön
          </button>
        </div>
      </div>

      {/* Kart Listesi */}
      <div className="container mx-auto max-w-4xl px-6 -mt-20 pb-20 relative z-20 space-y-6">
        {subs.length > 0 ? (
          subs.map((sub) => {
            const isActive =
              sub.status === "ACTIVE" || sub.status === "PENDING"; // Aktif mi?

            return (
              <div
                key={sub.id}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition hover:shadow-2xl"
              >
                {/* Kart Başlığı (Durum Barı) */}
                <div
                  className={`h-2 w-full ${isActive ? "bg-green-500" : "bg-red-500"}`}
                ></div>

                <div className="p-8 flex flex-col md:flex-row gap-8">
                  {/* SOL: Paket Bilgisi */}
                  <div className="flex-1 flex items-start gap-6">
                    <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center text-4xl shadow-sm border-4 border-white ring-1 ring-gray-100">
                      🎁
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-2xl font-black text-gray-800">
                          {sub.product?.name || "Sürpriz Kutu"}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            isActive
                              ? "bg-green-50 text-green-600 border-green-100"
                              : "bg-red-50 text-red-600 border-red-100"
                          }`}
                        >
                          {isActive ? "Aktif Üyelik" : "İptal Edildi"}
                        </span>
                      </div>
                      <p className="text-gray-400 font-bold text-sm tracking-wide mb-4">
                        #{sub.id.toString().padStart(6, "0")} • Aylık Plan
                      </p>
                      <div className="text-2xl font-black text-gray-900">
                        {sub.product?.price} ₺{" "}
                        <span className="text-sm text-gray-400 font-medium">
                          /ay
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ORTA: Detaylar */}
                  <div className="flex-1 border-l border-gray-100 pl-0 md:pl-8 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-50 p-2 rounded-lg text-xl">
                        📅
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                          Sonraki Yenilenme
                        </p>
                        <p className="font-bold text-gray-800 text-lg">
                          {sub.nextPaymentDate
                            ? new Date(sub.nextPaymentDate).toLocaleDateString(
                                "tr-TR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )
                            : "-"}
                        </p>
                        {isActive && (
                          <p className="text-xs text-green-600 font-bold mt-1">
                            Otomatik yenilenecek
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-gray-50 p-2 rounded-lg text-xl">
                        📍
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                          Teslimat Adresi
                        </p>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed mt-1">
                          Kayıtlı varsayılan adresine gönderilecek.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SAĞ: Aksiyon Butonları */}
                  <div className="w-full md:w-48 flex flex-col gap-3 justify-center">
                    {isActive ? (
                      <>
                        <button
                          onClick={handleDateChange}
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-gray-100 text-gray-600 font-bold text-sm hover:border-gray-300 hover:bg-gray-50 transition"
                        >
                          📅 Tarih Değiştir
                        </button>
                        <button
                          onClick={handleAddressChange}
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-gray-100 text-gray-600 font-bold text-sm hover:border-gray-300 hover:bg-gray-50 transition"
                        >
                          📍 Adres Değiştir
                        </button>
                        <button
                          onClick={() => handleCancel(sub.id)}
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-50 text-red-600 border border-red-100 font-bold text-sm hover:bg-red-100 hover:border-red-200 transition mt-2"
                        >
                          ✕ Aboneliği İptal Et
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-gray-400 font-bold text-sm">
                          Bu üyelik pasif.
                        </p>
                        <button
                          onClick={() => router.push("/")}
                          className="text-green-600 text-xs font-bold underline mt-2 hover:text-green-700"
                        >
                          Tekrar Abone Ol
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // BOŞ STATE (Abonelik Yoksa)
          <div
            className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100 relative overflow-hidden group cursor-pointer"
            onClick={() => router.push("/#paketler")}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 group-hover:scale-110 transition duration-300">
              📭
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">
              Henüz Aktif Aboneliğin Yok
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Minik dostunu sevindirmek için hemen bir paket seç! İlk kutuda
              sürpriz hediyeler seni bekliyor.
            </p>
            <button className="bg-green-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-green-200 hover:bg-green-700 hover:shadow-green-300 transition transform hover:-translate-y-1">
              Paketleri İncele 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
