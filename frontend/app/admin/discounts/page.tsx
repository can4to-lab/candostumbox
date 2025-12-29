"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

interface DiscountRule {
  id: number;
  durationMonths: number;
  discountPercentage: string;
}

export default function AdminDiscounts() {
  const [rules, setRules] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Verileri Çek
  useEffect(() => {
    fetch("https://candostumbox-api.onrender.com/discounts")
      .then((res) => res.json())
      .then((data) => {
        // Backend sıralı göndermezse diye garantileyelim
        const sorted = data.sort((a: any, b: any) => a.durationMonths - b.durationMonths);
        setRules(sorted);
      })
      .catch(() => toast.error("İndirim kuralları yüklenemedi"))
      .finally(() => setLoading(false));
  }, []);

  // Güncelleme İşlemi
  const handleUpdate = async (duration: number, newPercentage: string) => {
    setSavingId(duration);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("https://candostumbox-api.onrender.com/discounts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          duration: duration,
          percentage: parseFloat(newPercentage)
        })
      });

      if (res.ok) {
        toast.success(`${duration} Aylık indirim oranı güncellendi! 🎉`);
        // State'i güncelle ki ekran yenilenmeden değişsin
        setRules(prev => prev.map(r => r.durationMonths === duration ? {...r, discountPercentage: newPercentage} : r));
      } else {
        throw new Error("Hata");
      }
    } catch (error) {
      toast.error("Güncelleme başarısız oldu.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="text-center mt-20 font-bold text-gray-500">Yükleniyor...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <Toaster position="top-right" />
      
      {/* BAŞLIK */}
      <div>
        <h1 className="text-4xl font-black text-gray-800 tracking-tight">Kampanya & İndirimler 🏷️</h1>
        <p className="text-gray-500 mt-2">Abonelik sürelerine göre uygulanan otomatik indirim oranlarını buradan yönetebilirsiniz.</p>
      </div>

      {/* KARTLAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((rule) => (
          <div key={rule.id} className={`relative bg-white rounded-3xl p-8 border-2 transition-all group ${Number(rule.discountPercentage) > 0 ? 'border-green-100 hover:border-green-400 shadow-xl shadow-green-100/50' : 'border-gray-100 opacity-75 hover:opacity-100'}`}>
            
            {/* Süre Rozeti */}
            <div className="absolute top-6 right-6 bg-gray-100 text-gray-600 font-bold px-4 py-1 rounded-full text-xs uppercase tracking-wider">
              {rule.durationMonths} Aylık Plan
            </div>

            <div className="mt-4">
              <div className="text-5xl font-black text-gray-900 mb-2">
                %{Number(rule.discountPercentage)}
              </div>
              <div className="text-sm font-bold text-gray-400 uppercase">Mevcut İndirim</div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50">
              <label className="block text-xs font-bold text-gray-500 mb-2">Yeni Oran (%)</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  step="0.01"
                  defaultValue={rule.discountPercentage}
                  id={`input-${rule.durationMonths}`}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 font-bold text-gray-900 focus:outline-none focus:border-green-500 focus:bg-white transition"
                />
                <button 
                  onClick={() => {
                    const val = (document.getElementById(`input-${rule.durationMonths}`) as HTMLInputElement).value;
                    handleUpdate(rule.durationMonths, val);
                  }}
                  disabled={savingId === rule.durationMonths}
                  className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition disabled:opacity-50"
                >
                  {savingId === rule.durationMonths ? '...' : 'Kaydet'}
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* BİLGİ KUTUSU */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4 text-blue-800">
        <span className="text-2xl">💡</span>
        <div>
            <h4 className="font-bold mb-1">Nasıl Çalışır?</h4>
            <p className="text-sm opacity-80">Burada yaptığınız değişiklikler anında <strong>Ürün Detay</strong> sayfasındaki fiyat hesaplamalarına yansır. Örneğin 12 aylık paketi %25 yaparsanız, müşteri anında yeni fiyatı görür.</p>
        </div>
      </div>
    </div>
  );
}