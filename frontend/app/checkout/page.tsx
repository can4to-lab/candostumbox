"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Script from "next/script"; 
import Image from "next/image"; 
import { useCart } from "@/context/CartContext";

// Modallar
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";
import AddAddressModal from "../components/modals/AddAddressModal";
import AgreementsModal from "@/components/AgreementsModal"; // 👈 YENİ EKLENDİ

// İkonlar (SVG)
const UserIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const MailIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const PhoneIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const MapIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LockIcon = () => <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;

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
  const { items } = useCart();
  
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [iframeToken, setIframeToken] = useState<string | null>(null); 
  
  // 👇 YENİ: SÖZLEŞME STATE'LERİ
  const [agreementsAccepted, setAgreementsAccepted] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);

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

  const handlePayment = async () => {
      // 👇 YENİ: SÖZLEŞME KONTROLÜ (PAYTR İÇİN ŞART)
      if (!agreementsAccepted) {
          toast.error("Lütfen Mesafeli Satış Sözleşmesi'ni okuyup onaylayınız.", {
              icon: '📜',
              duration: 4000
          });
          return;
      }

      setLoading(true);
      const token = localStorage.getItem("token");
      
      if(verifiedTotal === null) {
          toast.error("Fiyat hesaplanıyor, lütfen bekleyin...");
          setLoading(false);
          return;
      }

      let payload: any = {
          price: verifiedTotal, 
          items: [], 
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
          payload.address = { fullAddress: addr?.fullAddress || "Adres Bilgisi Yok" };
          payload.user = { email: "user@candostum.com", phone: "05555555555" }; 
      } else {
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
              toast.success("Güvenli ödeme ortamına bağlanıldı 🔒");
          } else {
              toast.error("Ödeme başlatılamadı: " + result.message);
          }

      } catch (error: any) {
          toast.error("Sunucu hatası oluştu.");
      } finally {
          setLoading(false);
      }
  };
  
  if (items.length === 0) return null;

  return (
    <main className="min-h-screen bg-[#F3F4F6] font-sans pb-20">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Modallar */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} onSwitchToRegister={() => {setLoginOpen(false); setRegisterOpen(true);}} onLoginSuccess={() => window.location.reload()} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} onSwitchToLogin={() => {setRegisterOpen(false); setLoginOpen(true);}} initialData={null} onRegisterSuccess={() => window.location.reload()} />
      <AddAddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} onSuccess={handleAddressSuccess} />
      
      {/* 👇 YENİ: SÖZLEŞME MODALI */}
      <AgreementsModal isOpen={isAgreementModalOpen} onClose={() => setIsAgreementModalOpen(false)} />

      {/* HEADER ALANI */}
      <div className="bg-white border-b border-gray-200 py-6 mb-8 shadow-sm">
         <div className="max-w-7xl mx-auto px-6 flex items-center gap-3">
             <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">←</button>
             <h1 className="text-2xl font-black text-gray-900 tracking-tight">Ödemeyi Tamamla</h1>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* SOL KOLON: Form ve Ödeme */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* 1. ADRES & İLETİŞİM KARTI */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60 relative overflow-hidden group hover:shadow-md transition duration-300">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-400 to-teal-500"></div>
                    
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">1</div>
                            <h2 className="text-xl font-bold text-gray-900">Teslimat Bilgileri</h2>
                        </div>
                        {!isGuest && (
                            <button onClick={() => setIsAddressModalOpen(true)} className="text-sm font-bold text-green-600 hover:text-green-700 bg-green-50 px-4 py-2 rounded-lg transition">
                                + Yeni Adres
                            </button>
                        )}
                    </div>

                    {isGuest ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-green-500 transition"><UserIcon /></div>
                                    <input name="firstName" placeholder="Adınız" value={guestData.firstName} onChange={handleGuestChange} className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition outline-none font-medium text-gray-900" />
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon /></div>
                                    <input name="lastName" placeholder="Soyadınız" value={guestData.lastName} onChange={handleGuestChange} className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition outline-none font-medium text-gray-900" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MailIcon /></div>
                                    <input name="email" type="email" placeholder="E-posta Adresiniz" value={guestData.email} onChange={handleGuestChange} className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition outline-none font-medium text-gray-900" />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><PhoneIcon /></div>
                                    <input name="phone" type="tel" placeholder="Telefon (5XX...)" value={guestData.phone} onChange={handleGuestChange} className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition outline-none font-medium text-gray-900" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <input name="city" placeholder="İl" value={guestData.city} onChange={handleGuestChange} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition outline-none font-medium text-gray-900" />
                                <input name="district" placeholder="İlçe" value={guestData.district} onChange={handleGuestChange} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition outline-none font-medium text-gray-900" />
                            </div>

                            <div className="relative">
                                <div className="absolute top-3.5 left-3 pointer-events-none"><MapIcon /></div>
                                <textarea name="fullAddress" placeholder="Açık Adres (Mahalle, Sokak, Bina No, Kapı No...)" rows={3} value={guestData.fullAddress} onChange={handleGuestChange} className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition outline-none font-medium resize-none text-gray-900" />
                            </div>
                        </div>
                    ) : (
                        addresses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map((addr) => (
                                    <div key={addr.id} onClick={() => setSelectedAddressId(addr.id)} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative flex flex-col justify-between h-full group ${selectedAddressId === addr.id ? 'border-green-500 bg-green-50/50 shadow-green-100 shadow-lg' : 'border-gray-100 hover:border-green-200 bg-white'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-gray-900 flex items-center gap-2">
                                                <span className="bg-gray-100 p-1.5 rounded-lg"><MapIcon/></span>
                                                {addr.title}
                                            </span>
                                            {selectedAddressId === addr.id && <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs shadow-md">✓</div>}
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed pl-1">{addr.fullAddress}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-green-400 transition cursor-pointer group" onClick={() => setIsAddressModalOpen(true)}>
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition"><span className="text-3xl text-gray-400 group-hover:text-green-500">+</span></div>
                                <p className="text-gray-500 font-medium">Kayıtlı adresiniz yok, hemen ekleyin.</p>
                            </div>
                        )
                    )}
                </div>

                {/* 2. ÖDEME ALANI (PAYTR IFRAME) */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/60 relative overflow-hidden min-h-[300px]" id="paytr-iframe">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gray-200"></div>
                    
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${iframeToken ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>2</div>
                            <h2 className="text-xl font-bold text-gray-900">Ödeme Yöntemi</h2>
                        </div>
                        {iframeToken && (
                            <span className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 animate-pulse">
                                <LockIcon /> 256-Bit SSL Korumalı
                            </span>
                        )}
                    </div>
                    
                    {iframeToken ? (
                        <div className="w-full min-h-[600px] border border-gray-100 rounded-2xl overflow-hidden shadow-inner bg-gray-50">
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
                        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-8 text-center flex flex-col items-center justify-center h-[300px]">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            </div>
                            <h3 className="text-gray-900 font-bold text-lg mb-2">Güvenli Ödeme Ortamı</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm">
                                Ödemeniz PayTR altyapısı ile 256-bit SSL şifreleme kullanılarak korunmaktadır. Kart bilgileriniz tarafımızca saklanmaz.
                            </p>
                            
                            <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition duration-500">
                                <span className="bg-white border px-2 py-1 rounded text-xs font-bold text-gray-500">Visa</span>
                                <span className="bg-white border px-2 py-1 rounded text-xs font-bold text-gray-500">Mastercard</span>
                                <span className="bg-white border px-2 py-1 rounded text-xs font-bold text-gray-500">Troy</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SAĞ KOLON: SİPARİŞ ÖZETİ (STICKY) */}
            <div className="lg:col-span-4">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-6 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <h3 className="text-xl font-black text-gray-900 mb-6 relative z-10">Sipariş Özeti 🛍️</h3>
                    
                    {verifiedTotal === null ? (
                        <div className="py-12 flex justify-center text-green-600">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-6 mb-8 relative z-10">
                            <div className="flex gap-4 items-start">
                                <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl">📦</div>
                                <div>
                                    <div className="font-bold text-gray-900">{verifiedItem?.productName || items[0].productName}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {items[0].duration} Aylık Plan • {items[0].petName}
                                    </div>
                                    {verifiedItem?.discountRate > 0 && (
                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-2">
                                            %{verifiedItem.discountRate} Kampanya İndirimi
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="border-t border-dashed border-gray-200 my-4"></div>
                            
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Ara Toplam</span>
                                    <span className="font-bold text-gray-900">₺{(verifiedItem?.rawPrice || 0).toLocaleString('tr-TR')}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>Kargo</span>
                                    <span className="font-bold">Ücretsiz</span>
                                </div>
                                {verifiedItem?.discountRate > 0 && (
                                     <div className="flex justify-between text-green-600">
                                        <span>İndirim</span>
                                        <span className="font-bold">-₺{((verifiedItem?.rawPrice || 0) - verifiedTotal).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="border-t border-gray-200 pt-4 mt-2">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500 font-medium">Toplam Tutar</span>
                                        <span className="text-3xl font-black text-gray-900 tracking-tighter">
                                            ₺{verifiedTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 text-right">KDV Dahildir.</p>
                            </div>
                        </div>
                    )}

                    {!iframeToken && (
                        <>
                            {/* 👇 YENİ: SÖZLEŞME ONAY KUTUSU */}
                            <div className="flex items-start gap-3 mb-4 relative z-10 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <input
                                    type="checkbox"
                                    id="agreements"
                                    checked={agreementsAccepted}
                                    onChange={(e) => setAgreementsAccepted(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300 cursor-pointer accent-green-600"
                                />
                                <label htmlFor="agreements" className="text-xs text-gray-600 cursor-pointer select-none leading-relaxed">
                                    <span 
                                        className="font-bold text-gray-900 hover:underline hover:text-green-600 transition"
                                        onClick={(e) => { e.preventDefault(); setIsAgreementModalOpen(true); }} 
                                    >
                                        Mesafeli Satış Sözleşmesi
                                    </span>
                                    'ni ve 
                                    <span className="font-bold text-gray-900 hover:underline ml-1">
                                        Ön Bilgilendirme Formu
                                    </span>
                                    'nu okudum, onaylıyorum.
                                </label>
                            </div>

                            <button 
                                onClick={handlePayment} 
                                disabled={loading || verifiedTotal === null || (!isGuest && addresses.length === 0)} 
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg transform active:scale-95 flex items-center justify-center gap-3 relative z-10 group
                                    ${loading || verifiedTotal === null || (!isGuest && addresses.length === 0) 
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                                        : 'bg-gray-900 text-white hover:bg-black hover:shadow-xl hover:shadow-gray-400/20'}
                                `}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Yükleniyor...</span>
                                ) : (
                                    <>
                                        Güvenli Ödemeye Geç <span className="group-hover:translate-x-1 transition">👉</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                    
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                        <LockIcon/> Ödemeniz 256-Bit SSL ile korunmaktadır.
                    </div>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}