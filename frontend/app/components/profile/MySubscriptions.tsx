"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Subscription {
  id: string;
  totalMonths: number;
  remainingMonths: number;
  startDate: string;
  status: "active" | "cancelled" | "completed" | "paused";
  pet: { id: string; name: string; image?: string } | null;
  product: { id: string; name: string; price: number } | null;
  nextDeliveryDate: string;
}

// İptal Sebepleri Listesi
const CANCEL_REASONS = [
  "Fiyatlar bütçemi aşıyor 💸",
  "Ürün içeriğini beğenmedim 📦",
  "Artık ihtiyacım kalmadı 🚫",
  "Teslimat sorunları yaşadım 🚚",
  "Sadece denemek istemiştim 🧪",
  "Diğer 📝",
];

export default function MySubscriptions() {
  const router = useRouter();

  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State'leri
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false); // Fatura Geçmişi Modalı
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  // İptal Süreci
  const [cancelStep, setCancelStep] = useState(1); // 1: İkna, 2: Anket
  const [cancelReason, setCancelReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSubs();
  }, []);

  const fetchSubs = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setSubs(data);
      }
    } catch (error) {
      toast.error("Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  // --- DOĞRUDAN ÖDEMEYE YÖNLENDİRME ---
  const handleRenewOrExtend = (sub: Subscription, type: "renew" | "extend") => {
    if (!sub.product) {
      toast.error("Bu paket artık mevcut değil.");
      return;
    }

    // Parametreleri hazırlıyoruz
    const params = new URLSearchParams();
    params.set("productId", sub.product.id.toString()); // Hangi ürün alınacak

    if (type === "extend") {
      // Eğer süre uzatılıyorsa, backend'in bunu tanıması için mevcut abonelik ID'sini gönderiyoruz
      params.set("extendSubId", sub.id);
    }

    const msg =
      type === "extend"
        ? "Süre uzatma işlemine yönlendiriliyorsunuz... 🚀"
        : "Yeniden başlatma işlemine yönlendiriliyorsunuz... 🎉";
    toast.success(msg);

    // Sepete değil, direkt Checkout'a gidiyoruz
    router.push(`/checkout?${params.toString()}`);
  };

  const openCancelModal = (id: string) => {
    setSelectedSubId(id);
    setCancelStep(1); // Başa sar
    setCancelReason("");
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!selectedSubId || !cancelReason) {
      toast.error("Lütfen bir sebep seçin.");
      return;
    }
    setProcessing(true);
    const token = localStorage.getItem("token");

    try {
      // Backend'e sebebi de gönderiyoruz
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${selectedSubId}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: cancelReason }),
        },
      );

      if (res.ok) {
        toast.success("Abonelik iptal edildi.");
        fetchSubs(); // Listeyi yenile
        setShowCancelModal(false);
      } else {
        toast.error("İptal edilemedi.");
      }
    } catch (error) {
      toast.error("Hata oluştu.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-400 animate-pulse">
        Yükleniyor...
      </div>
    );
  if (subs.length === 0)
    return (
      <div className="p-8 text-center text-gray-500">Henüz aboneliğin yok.</div>
    );

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 mb-6">
          Aboneliklerim 🔄
        </h2>

        {subs.map((sub) => (
          <div
            key={sub.id}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-6 relative z-10">
              {/* SOL: Bilgiler */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {sub.status === "active" && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      Aktif ✅
                    </span>
                  )}
                  {sub.status === "cancelled" && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                      İptal Edildi ❌
                    </span>
                  )}
                  {sub.status === "completed" && (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                      Süresi Doldu 🏁
                    </span>
                  )}
                  <span className="text-xs text-gray-400 font-bold uppercase">
                    #{sub.id.slice(0, 6)}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  {sub.product ? sub.product.name : "Sürpriz Paket"}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({sub.pet?.name})
                  </span>
                </h3>

                <div className="text-sm text-gray-500 mt-2 mb-4">
                  <p>
                    Başlangıç:{" "}
                    <b>{new Date(sub.startDate).toLocaleDateString("tr-TR")}</b>
                  </p>
                  {sub.status === "active" && sub.remainingMonths > 0 && (
                    <p className="text-green-600 mt-1">
                      📦 Sonraki Kutu:{" "}
                      <b>
                        {new Date(
                          sub.nextDeliveryDate || sub.startDate,
                        ).toLocaleDateString("tr-TR")}
                      </b>{" "}
                      (Otomatik)
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                {sub.status === "active" && (
                  <div className="mt-4 max-w-md">
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                      <span>Kalan Gönderim</span>
                      <span>
                        {sub.remainingMonths} / {sub.totalMonths} Ay
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden">
                      <div
                        className="bg-green-500 h-full transition-all duration-1000"
                        style={{
                          width: `${((sub.totalMonths - sub.remainingMonths) / sub.totalMonths) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* SAĞ: Butonlar */}
              <div className="flex flex-col items-end justify-center gap-3 border-l border-gray-50 pl-6 md:w-56">
                {/* ÖDEME GEÇMİŞİ BUTONU */}
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="w-full py-2 px-4 bg-gray-50 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-100 transition flex items-center justify-center gap-2"
                >
                  📄 Ödeme Geçmişi
                </button>

                {/* UZAT / YENİLE BUTONLARI */}
                {sub.status === "active" && sub.remainingMonths <= 1 && (
                  <button
                    onClick={() => handleRenewOrExtend(sub, "extend")}
                    className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-200"
                  >
                    ⏰ Süreyi Uzat
                  </button>
                )}
                {(sub.status === "completed" || sub.status === "cancelled") && (
                  <button
                    onClick={() => handleRenewOrExtend(sub, "renew")}
                    className="w-full py-3 px-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm transition shadow-lg"
                  >
                    🔄 Tekrar Başlat
                  </button>
                )}

                {/* İPTAL ET */}
                {sub.status === "active" && (
                  <button
                    onClick={() => openCancelModal(sub.id)}
                    className="text-xs font-bold text-gray-400 hover:text-red-600 hover:underline mt-2 transition"
                  >
                    Aboneliği İptal Et
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- 1. İPTAL MODALI (ANKETLİ) --- */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl relative">
            {/* ADIM 1: DUYGUSAL İKNA */}
            {cancelStep === 1 && (
              <>
                <div className="text-6xl mb-4">😿</div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  Bizi bırakıyor musun?
                </h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Minik dostun{" "}
                  <b>{subs.find((s) => s.id === selectedSubId)?.pet?.name}</b>{" "}
                  sürpriz kutusunu bekliyordu. Gitmene üzülürüz...
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition shadow-lg shadow-green-200"
                  >
                    💖 Vazgeçtim, Kalsın
                  </button>
                  <button
                    onClick={() => setCancelStep(2)}
                    className="w-full py-3 text-gray-400 hover:text-red-500 font-bold text-sm transition"
                  >
                    Yine de devam et
                  </button>
                </div>
              </>
            )}

            {/* ADIM 2: ANKET */}
            {cancelStep === 2 && (
              <>
                <h3 className="text-lg font-black text-gray-900 mb-4">
                  Neden gidiyorsun? 📝
                </h3>
                <div className="space-y-2 mb-6 text-left">
                  {CANCEL_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition"
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        {reason}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="space-y-3">
                  <button
                    onClick={confirmCancel}
                    disabled={processing}
                    className="w-full py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition"
                  >
                    {processing ? "İptal Ediliyor..." : "Aboneliği İptal Et"}
                  </button>
                  <button
                    onClick={() => setCancelStep(1)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Geri Dön
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- 2. ÖDEME GEÇMİŞİ MODALI --- */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">
                Ödeme Geçmişi 🧾
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800">
                  💡 Ödeme geçmişiniz <b>"Siparişlerim"</b> sekmesinde detaylı
                  olarak listelenmektedir. Abonelik kapsamında yapılan tüm
                  ödemeler oraya yansır.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  router.push("/profile?tab=siparisler");
                }}
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl text-sm"
              >
                Siparişlerim'e Git
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
