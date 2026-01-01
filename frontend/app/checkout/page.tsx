"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Script from "next/script"; // PayTR Scripti için
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

interface GuestForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    district: string;
    fullAddress: string;
    title: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [iframeToken, setIframeToken] = useState<string | null>(null); // PAYTR TOKEN
  
  const [isGuest, setIsGuest] = useState(false);
  const [guestData, setGuestData] = useState<GuestForm>({
      firstName: "", lastName: "", email: "", phone: "",
      city: "", district: "", fullAddress: "", title: "Misafir Adresi"
  });

  const [verifiedTotal, setVerifiedTotal] = useState<number | null>(null); 
  const [verifiedItem, setVerifiedItem] = useState<any>(null); 

  // Modallar
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);

  // --- SAYFA YÜKLENİNCE ---
  useEffect(() => {
    const initPage = async () => {
        const token = localStorage.getItem("token");

        if (items.length === 0) {
            router.push("/");
            return;
        }

        // 1. Adresleri Çek
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
        } else {
            setIsGuest(true);
        }

        // 2. FİYAT DOĞRULAMA
        try {
            const item = items[0]; 
            const [productRes, discountsRes] = await Promise.all([
                fetch(`https://candostumbox-api.onrender.com/products/${item.productId}`),
                fetch(`https://candostumbox-api.onrender.com/discounts`)
            ]);

            const product = await productRes.json();
            const discounts = await discountsRes.json();

            const unitPrice = Number(product.price);
            const duration = Number(item.duration);
            
            let calculatedTotal = 0;
            let discountRate = 0;

            if (item.paymentType === 'monthly') {
                calculatedTotal = unitPrice; 
            } else {
                const rawTotal = unitPrice * duration; 
                const rule = discounts.find((d: any) => Number(d.durationMonths) === duration);
                if (rule) {
                    discountRate = Number(rule.discountPercentage);
                    calculatedTotal = rawTotal - (rawTotal * (discountRate / 100));
                } else {
                    calculatedTotal = rawTotal;
                }
            }

            setVerifiedTotal(calculatedTotal);
            setVerifiedItem({
                ...item,
                productName: product.name,
                rawPrice: item.paymentType === 'monthly' ? unitPrice : (unitPrice * duration),
                discountRate: discountRate
            });

        } catch (e) {
            console.error("Fiyat doğrulama hatası:", e);
            toast.error("Fiyat bilgisi doğrulanamadı.");
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

  const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setGuestData({ ...guestData, [e.target.name]: e.target.value });
  };

  // 👇 GÜNCELLENEN ÖDEME FONKSİYONU (PAYTR)
  // 👇 GÜNCELLENEN HANDLE PAYMENT
  const handlePayment = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Güvenlik: Fiyat null ise işlemi durdur
      if(verifiedTotal === null) {
          toast.error("Fiyat hesaplanıyor, lütfen bekleyin...");
          setLoading(false);
          return;
      }

      // Backend'e gidecek veri
      // Dikkat: items array'ini sadeleştirdik, fiyatı verifiedTotal yaptık.
      let payload: any = {
          price: verifiedTotal, // Örn: 297.00
          items: [], // Backend artık burayı önemsemiyor, kendi oluşturuyor
          user: {},
          address: {}
      };

      if (token) {
          if (!selectedAddressId) {
              toast.error("Lütfen bir teslimat adresi seçin.");
              setLoading(false);
              return;
          }
          const addr = addresses.find(a => a.id === selectedAddressId);
          // Backend'deki user verisini kullanacak ama yedek olsun
          payload.address = { fullAddress: addr?.fullAddress || "Adres Bilgisi Yok" };
          payload.user = { email: "user@candostum.com", phone: "05555555555" }; 
      } else {
          // Misafir Kontrolleri
          if (!guestData.firstName || !guestData.lastName || !guestData.email || !guestData.phone || !guestData.fullAddress) {
              toast.error("Lütfen tüm zorunlu alanları doldurun.");
              setLoading(false);
              return;
          }
          payload.address = { fullAddress: guestData.fullAddress };
          payload.user = { 
              email: guestData.email,
              firstName: guestData.firstName,
              lastName: guestData.lastName,
              phone: guestData.phone
          };
      }

      try {
          const response = await fetch("https://candostumbox-api.onrender.com/payment/start", {
              method: "POST",
              headers: { 
                  "Content-Type": "application/json",
                  ...(token && { "Authorization": `Bearer ${token}` })
              },
              body: JSON.stringify(payload)
          });

          const result = await response.json();
          
          if (result.status === 'success') {
              setIframeToken(result.token);
              setTimeout(() => {
                  document.getElementById('paytr-iframe')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
              toast.success("Ödeme ekranı yüklendi 👇");
          } else {
              // PayTR'den gelen gerçek hatayı göster
              toast.error("Hata: " + result.message);
              console.error("PayTR Hatası:", result);
          }

      } catch (error: any) {
          toast.error("Sunucu hatası oluştu.");
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
                {/* ADRES KARTI (Aynı Kaldı) */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-gray-900">Teslimat Bilgileri 📍</h2>
                        {!isGuest && (
                            <button onClick={() => setIsAddressModalOpen(true)} className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1"><span>+</span> Yeni Ekle</button>
                        )}
                    </div>
                    {isGuest ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                                <p className="text-sm text-blue-800 font-bold">👤 Üye olmadan devam ediyorsunuz.</p>
                                <p className="text-xs text-blue-600">Sipariş takibi için bilgilerinizi eksiksiz doldurunuz.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="firstName" placeholder="Adınız" value={guestData.firstName} onChange={handleGuestChange} className="p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-green-500 font-bold" />
                                <input name="lastName" placeholder="Soyadınız" value={guestData.lastName} onChange={handleGuestChange} className="p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-green-500 font-bold" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="email" type="email" placeholder="E-posta Adresiniz" value={guestData.email} onChange={handleGuestChange} className="p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-green-500 font-bold" />
                                <input name="phone" type="tel" placeholder="Telefon (5XX...)" value={guestData.phone} onChange={handleGuestChange} className="p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-green-500 font-bold" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="city" placeholder="Şehir" value={guestData.city} onChange={handleGuestChange} className="p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-green-500 font-bold" />
                                <input name="district" placeholder="İlçe" value={guestData.district} onChange={handleGuestChange} className="p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-green-500 font-bold" />
                            </div>
                            <textarea name="fullAddress" placeholder="Açık Adres (Mahalle, Sokak, Bina No, Kapı No...)" rows={3} value={guestData.fullAddress} onChange={handleGuestChange} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-green-500 font-bold resize-none" />
                        </div>
                    ) : (
                        addresses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map((addr) => (
                                    <div key={addr.id} onClick={() => setSelectedAddressId(addr.id)} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between h-full ${selectedAddressId === addr.id ? 'border-green-500 bg-green-50/30' : 'border-gray-100 hover:border-green-200'}`}>
                                        {selectedAddressId === addr.id && <div className="absolute top-4 right-4 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>}
                                        <div>
                                            <div className="font-bold text-gray-900 mb-2 text-lg">{addr.title}</div>
                                            <div className="text-sm text-gray-600 leading-relaxed min-h-[40px]">{addr.fullAddress}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-500 mb-4">Henüz kayıtlı bir adresin yok.</p>
                                <button onClick={() => setIsAddressModalOpen(true)} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm">Adres Ekle</button>
                            </div>
                        )
                    )}
                </div>

                {/* 👇 ÖDEME ALANI (PAYTR IFRAME) */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100" id="paytr-iframe">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        Ödeme 💳 
                        {iframeToken && <span className="text-sm font-normal text-green-600 bg-green-50 px-2 py-1 rounded-lg">Güvenli Bağlantı</span>}
                    </h2>
                    
                    {iframeToken ? (
                        <div className="w-full min-h-[600px] border border-gray-100 rounded-xl overflow-hidden">
                             <iframe
                                src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
                                id="paytriframe"
                                style={{ width: '100%', height: '600px', border: 'none' }}
                            ></iframe>
                            <Script src="https://www.paytr.com/js/iframeResizer.min.js" onLoad={() => {
                                // @ts-ignore
                                if(window.iFrameResize) window.iFrameResize({}, '#paytriframe');
                            }} />
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                            <p className="text-gray-500 mb-4">Ödeme adımına geçmek için sağdaki "Ödemeye Geç" butonuna tıklayınız.</p>
                            <div className="flex justify-center gap-2 opacity-50">
                                <span className="bg-white p-2 rounded border">Visa</span>
                                <span className="bg-white p-2 rounded border">MasterCard</span>
                                <span className="bg-white p-2 rounded border">Troy</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SAĞ: ÖZET */}
            <div className="lg:col-span-4">
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 sticky top-24">
                    <h3 className="text-xl font-black text-gray-900 mb-6">Sipariş Özeti</h3>
                    
                    {verifiedTotal === null ? (
                        <div className="py-12 flex justify-center text-green-600">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-6 mb-8">
                            <div className="pb-6 border-b border-gray-100">
                                <div className="mb-4">
                                    <div className="font-bold text-gray-900 text-lg">{verifiedItem?.productName || items[0].productName}</div>
                                    <div className="text-xs text-gray-500">
                                        {items[0].duration} Aylık Plan • {items[0].petName}
                                    </div>
                                    {verifiedItem?.discountRate > 0 && (
                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                                            %{verifiedItem.discountRate} Kampanya İndirimi
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between text-gray-900 font-bold pt-2 border-t border-dashed border-gray-200">
                                    <span>Ödenecek Tutar</span>
                                    <span>₺{verifiedTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Kargo</span><span className="font-bold text-green-600">Ücretsiz</span></div>
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col"><span className="text-lg font-bold text-gray-900">Toplam</span></div>
                            <span className="text-3xl font-black text-green-600 tracking-tighter">
                                {verifiedTotal !== null ? `₺${verifiedTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '...'}
                            </span>
                        </div>
                    </div>

                    {!iframeToken && (
                        <button 
                            onClick={handlePayment} 
                            disabled={loading || verifiedTotal === null || (!isGuest && addresses.length === 0)} 
                            className={`w-full py-5 rounded-2xl font-bold text-lg transition shadow-lg transform active:scale-95 flex items-center justify-center gap-3 mt-8
                                ${loading || verifiedTotal === null || (!isGuest && addresses.length === 0) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black'}
                            `}
                        >
                            {loading ? 'Yükleniyor...' : 'Güvenli Ödemeye Geç 👉'}
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}