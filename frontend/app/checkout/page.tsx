"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useCart } from "@/context/CartContext";

// Modallar
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";
import AddAddressModal from "../components/modals/AddAddressModal";

interface Address {
    id: string; 
    title: string;
    city: string;
    district: string;
    fullAddress: string; 
    openAddress?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [verifiedTotal, setVerifiedTotal] = useState(0);
  const [isVerifying, setIsVerifying] = useState(true);

  // Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);

  // --- 1. VERİLERİ YÜKLE ---
  useEffect(() => {
    const initPage = async () => {
        const token = localStorage.getItem("token");

        if (items.length === 0) {
            toast.error("Sepetiniz boş!");
            router.push("/");
            return;
        }

        if (token) {
            try {
                const res = await fetch("https://candostumbox-api.onrender.com/users/addresses", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAddresses(data);
                    if (data.length > 0) setSelectedAddressId(data[0].id);
                }
            } catch (e) { console.error("Adres hatası", e); }
        }

        // Fiyat Doğrulama
        try {
            const promises = items.map(async (item) => {
                const res = await fetch(`https://candostumbox-api.onrender.com/products/${item.productId}`);
                const product = await res.json();
                const price = Number(product.price);
                return item.paymentType === 'upfront' ? price * item.duration : price;
            });

            const prices = await Promise.all(promises);
            const total = prices.reduce((a, b) => a + b, 0);
            setVerifiedTotal(total);

        } catch (e) {
            toast.error("Fiyat bilgisi güncellenemedi.");
        } finally {
            setIsVerifying(false);
        }
    };

    initPage();
  }, [items, router]);

  const handleAddressSuccess = () => {
      const token = localStorage.getItem("token");
      if (token) {
        fetch("https://candostumbox-api.onrender.com/users/addresses", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setAddresses(data);
                if (data.length > 0) setSelectedAddressId(data[0].id);
            }
        });
      }
      setIsAddressModalOpen(false);
  };

  // --- 2. ÖDEME FONKSİYONU (GÜNCELLENDİ) ---
  const handlePayment = async () => {
      if (!selectedAddressId) {
          toast.error("Lütfen bir teslimat adresi seçin.");
          return;
      }
      
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
          toast.error("Lütfen siparişi tamamlamak için giriş yapın.");
          setLoginOpen(true);
          setLoading(false);
          return;
      }

      const payload = {
          addressId: selectedAddressId,
          paymentType: items[0].paymentType, 
          
          items: items.map(item => ({
              productId: item.productId,
              quantity: 1,
              duration: item.duration,
              // 👇 İŞTE EKLENEN KISIMLAR:
              deliveryPeriod: item.deliveryPeriod, // Kargo Dönemi
              subscriptionId: item.subscriptionId  // Uzatılacak Abonelik ID'si
          }))
      };

      try {
          const response = await fetch("https://candostumbox-api.onrender.com/orders", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(payload)
          });

          const result = await response.json();

          if (!response.ok) throw new Error(result.message || "Sipariş oluşturulamadı.");

          toast.success("Siparişiniz başarıyla alındı! 🎉");
          clearCart(); 

          setTimeout(() => {
              router.push('/profile?tab=siparisler');
          }, 2000);

      } catch (error: any) {
          const msg = Array.isArray(error.message) ? error.message[0] : error.message;
          toast.error(msg || "Hata oluştu.");
      } finally {
          setLoading(false);
      }
  };

  if (items.length === 0) return null;

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans">
      <Toaster position="top-right" />
      
      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} onSwitchToRegister={() => {setLoginOpen(false); setRegisterOpen(true);}} onLoginSuccess={() => window.location.reload()} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} onSwitchToLogin={() => {setRegisterOpen(false); setLoginOpen(true);}} initialData={null} onRegisterSuccess={() => window.location.reload()} />
      <AddAddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} onSuccess={handleAddressSuccess} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* SOL TARAFLAR */}
            <div className="lg:col-span-8 space-y-8">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-gray-900">Teslimat Adresi 📍</h2>
                        <button onClick={() => setIsAddressModalOpen(true)} className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1"><span>+</span> Yeni Ekle</button>
                    </div>
                    {addresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((addr) => (
                                <div key={addr.id} onClick={() => setSelectedAddressId(addr.id)} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between h-full ${selectedAddressId === addr.id ? 'border-green-500 bg-green-50/30' : 'border-gray-100 hover:border-green-200'}`}>
                                    {selectedAddressId === addr.id && <div className="absolute top-4 right-4 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>}
                                    <div>
                                        <div className="font-bold text-gray-900 mb-2 text-lg">{addr.title}</div>
                                        <div className="text-sm text-gray-600 leading-relaxed min-h-[40px]">{addr.fullAddress}</div>
                                    </div>
                                    {(addr.district || addr.city) && <div className="text-xs text-gray-400 mt-4 font-bold uppercase pt-4 border-t border-gray-200/50">{addr.district} / {addr.city}</div>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 mb-4">Henüz kayıtlı bir adresin yok.</p>
                            <button onClick={() => setIsAddressModalOpen(true)} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm">Adres Ekle</button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900 mb-6">Kart Bilgileri 💳</h2>
                    <div className="mt-8 flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
                        <div className="text-2xl">🔒</div>
                        <p className="text-xs text-green-700 font-medium">Test Modu Aktif: Ödeme otomatik olarak onaylanacaktır.</p>
                    </div>
                </div>
            </div>

            {/* SAĞ: ÖZET */}
            <div className="lg:col-span-4">
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-24">
                    <h3 className="text-xl font-black text-gray-900 mb-6">Sipariş Özeti</h3>
                    <div className="space-y-4 mb-8">
                        {items.map((item) => (
                            <div key={item.uniqueId} className="flex justify-between items-start pb-4 border-b border-gray-50 last:border-0">
                                <div>
                                    <div className="font-bold text-gray-900">{item.productName}</div>
                                    <div className="text-xs text-gray-500">{item.duration} Ay • {item.petName}</div>
                                    {/* 👇 Uzatma ise görsel uyarı ekle */}
                                    {item.subscriptionId && (
                                        <div className="text-xs text-orange-500 font-bold mt-1">⚡ Süre Uzatma Paketi</div>
                                    )}
                                </div>
                                <div className="font-bold text-gray-900">₺{item.price}</div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Kargo</span><span className="font-bold text-green-600">Ücretsiz</span></div>
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col"><span className="text-lg font-bold text-gray-900">Ödenecek Tutar</span></div>
                            <span className="text-3xl font-black text-green-600 tracking-tighter">₺{verifiedTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handlePayment} 
                        disabled={loading || isVerifying || addresses.length === 0} 
                        className={`w-full py-5 rounded-2xl font-bold text-lg transition shadow-lg transform active:scale-95 flex items-center justify-center gap-3 mt-8
                            ${loading || isVerifying || addresses.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black'}
                        `}
                    >
                        {loading ? 'İşleniyor...' : 'Siparişi Tamamla ✅'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}