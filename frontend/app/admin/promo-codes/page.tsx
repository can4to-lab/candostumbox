"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminPromoCodes() {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Yeni Kod Formu State
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    sourceType: "GENERAL",
    sourceName: "",
    expiryDate: "",
    minBasketAmount: "0",
    usageLimit: "0",
  });

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "https://candostumbox-api.onrender.com/promo-codes",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) setCodes(await res.json());
    } catch (err) {
      toast.error("Kodlar yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "https://candostumbox-api.onrender.com/promo-codes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (res.ok) {
        toast.success("İndirim kodu başarıyla oluşturuldu.");
        setIsModalOpen(false);
        fetchCodes();
      }
    } catch (err) {
      toast.error("Kod oluşturulamadı.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kodu silmek istediğinize emin misiniz?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`https://candostumbox-api.onrender.com/promo-codes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCodes(codes.filter((c) => c.id !== id));
      toast.success("Kod silindi.");
    } catch (err) {
      toast.error("Silme işlemi başarısız.");
    }
  };

  if (loading)
    return <div className="p-10 font-bold text-gray-500">Yükleniyor...</div>;

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-800">
          Kampanya & İndirim Kodları 🎟️
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-purple-700 transition"
        >
          + Yeni Kod Oluştur
        </button>
      </div>

      {/* İSTATİSTİK ÖZETİ (TAKİP İÇİN) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase">
            Toplam Kullanım
          </p>
          <p className="text-3xl font-black text-purple-600">
            {codes.reduce((acc, curr) => acc + curr.usedCount, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase">
            En Popüler Kaynak
          </p>
          <p className="text-xl font-black text-gray-800">
            {codes.sort((a, b) => b.usedCount - a.usedCount)[0]?.sourceName ||
              "-"}
          </p>
        </div>
      </div>

      {/* KOD LİSTESİ */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs text-gray-400 uppercase font-bold">
            <tr>
              <th className="p-6">Kod & Kaynak</th>
              <th className="p-6">İndirim</th>
              <th className="p-6">Durum / Limit</th>
              <th className="p-6">Kullanım</th>
              <th className="p-6">Bitiş</th>
              <th className="p-6">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {codes.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition">
                <td className="p-6">
                  <div className="font-black text-gray-900">{c.code}</div>
                  <div className="text-xs text-purple-500 font-bold">
                    {c.sourceType} - {c.sourceName}
                  </div>
                </td>
                <td className="p-6 font-bold text-green-600">
                  {c.discountType === "percentage"
                    ? `%${c.discountValue}`
                    : `₺${c.discountValue}`}
                </td>
                <td className="p-6">
                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {c.isActive ? "AKTİF" : "PASİF"}
                  </span>
                  <div className="text-[10px] text-gray-400 mt-1">
                    Limit: {c.usageLimit === 0 ? "Sınırsız" : c.usageLimit}
                  </div>
                </td>
                <td className="p-6 font-black text-gray-700">{c.usedCount}</td>
                <td className="p-6 text-xs text-gray-500">
                  {c.expiryDate
                    ? new Date(c.expiryDate).toLocaleDateString("tr-TR")
                    : "Süresiz"}
                </td>
                <td className="p-6">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-400 hover:text-red-600 transition"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* OLUŞTURMA MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg space-y-4 shadow-2xl"
          >
            <h2 className="text-2xl font-black mb-4">Yeni Kampanya Kodu</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-400 ml-2">
                  KUPON KODU (Örn: PATI20)
                </label>
                <input
                  required
                  className="w-full bg-gray-50 p-4 rounded-2xl outline-none border border-gray-100"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 ml-2">
                  TÜR
                </label>
                <select
                  className="w-full bg-gray-50 p-4 rounded-2xl outline-none"
                  onChange={(e) =>
                    setFormData({ ...formData, discountType: e.target.value })
                  }
                >
                  <option value="percentage">Yüzde (%)</option>
                  <option value="fixed">Sabit (₺)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 ml-2">
                  DEĞER
                </label>
                <input
                  required
                  type="number"
                  className="w-full bg-gray-50 p-4 rounded-2xl outline-none"
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 ml-2">
                  KAYNAK
                </label>
                <select
                  className="w-full bg-gray-50 p-4 rounded-2xl outline-none"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sourceType: e.target.value as any,
                    })
                  }
                >
                  <option value="GENERAL">Genel</option>
                  <option value="INFLUENCER">Influencer</option>
                  <option value="SOCIAL">Sosyal Medya</option>
                  <option value="SPECIAL_DAY">Özel Gün</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 ml-2">
                  KAYNAK ADI (Takip)
                </label>
                <input
                  className="w-full bg-gray-50 p-4 rounded-2xl outline-none"
                  placeholder="Örn: Instagram"
                  onChange={(e) =>
                    setFormData({ ...formData, sourceName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 ml-2">
                  MİN. SEPET (₺)
                </label>
                <input
                  type="number"
                  className="w-full bg-gray-50 p-4 rounded-2xl outline-none"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minBasketAmount: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 ml-2">
                  BİTİŞ TARİHİ
                </label>
                <input
                  type="date"
                  className="w-full bg-gray-50 p-4 rounded-2xl outline-none text-sm"
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 p-4 font-bold text-gray-400"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 bg-purple-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-purple-200"
              >
                Kodu Yayınla
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
