"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast"; 

// 👇 1. Interface
interface GuestData {
  petName: string;
  petType?: string;
  petBreed?: string;
  petWeight?: string;
  petBirthDate?: string;
  petNeutered?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  productPrice: number;
  guestData?: GuestData | null;
  // 👇 YENİ: Başarı ekranından kayıt olmaya yönlendirmek için
  onSwitchToRegister?: () => void; 
}

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  productId, 
  productName, 
  productPrice, 
  guestData,
  onSwitchToRegister // 👈 Prop'u aldık
}: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isGuest, setIsGuest] = useState(false); 
  
  const [userPets, setUserPets] = useState<any[]>([]);
  const [selectedUserPet, setSelectedUserPet] = useState<string>(""); 

  // 👇 GÜNCELLEME: İlçe (district) eklendi
  const [formData, setFormData] = useState({
    name: "",      
    email: "",     
    phone: "",     
    city: "",
    district: "",  // 👈 Yeni
    address: "",   // Açık Adres
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    if (isOpen) {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("https://candostumbox-api.onrender.com/auth/profile", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                // Adres varsa parçalamaya çalış veya olduğu gibi koy
                setFormData(prev => ({ 
                    ...prev, 
                    address: data.addresses?.[0]?.fullAddress || "", 
                    city: data.addresses?.[0]?.city || "" 
                }));
                
                if (data.pets && Array.isArray(data.pets) && data.pets.length > 0) {
                    setUserPets(data.pets);
                    if (!guestData?.petName) {
                        setSelectedUserPet(data.pets[0].name);
                    }
                }
            })
            .catch(() => setIsGuest(true)); 
        } else {
            setIsGuest(true); 
        }
    }
  }, [isOpen, guestData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- YARDIMCI FONKSİYONLAR ---
  const currentSelectedPet = userPets.find(p => p.name === selectedUserPet);

  const getPetEmoji = (type?: string) => {
      if (!type) return '🐾';
      const lowerType = type.toLowerCase();
      if (lowerType.includes('kedi')) return '🐱';
      if (lowerType.includes('kopek') || lowerType.includes('köpek')) return '🐶';
      return '🐾';
  };

  const formatPetType = (type?: string) => {
      if (!type) return '';
      const lower = type.toLowerCase();
      if (lower === 'kopek') return 'Köpek';
      if (lower === 'kedi') return 'Kedi';
      return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // --- ÖDEME İŞLEMİ ---
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    const actuallyLoggedIn = !!token; 
    
    // Validasyon
    if (!actuallyLoggedIn && (!formData.name || !formData.email || !formData.phone)) {
        toast.error("Lütfen ad, e-posta ve telefon bilgilerini eksiksiz doldurun.");
        setLoading(false);
        return;
    }
    
    // Adres Validasyonu
    if (!formData.city || !formData.district || !formData.address) {
        toast.error("Lütfen adres bilgilerini (İl, İlçe ve Açık Adres) tam girin.");
        setLoading(false);
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 1500)); 

    const finalPetName = guestData?.petName || selectedUserPet;

    // 👇 Backend'e gönderirken İlçe bilgisini Adres metnine ekliyoruz
    const fullAddressString = `${formData.district} - ${formData.address}`;

    const orderPayload = {
        productId,
        totalPrice: productPrice,
        city: formData.city,
        address: fullAddressString, // Birleştirilmiş adres
        
        guestName: isGuest ? formData.name : undefined,
        guestEmail: isGuest ? formData.email : undefined,
        guestPhone: isGuest ? formData.phone : undefined,

        petName: finalPetName,
        petType: guestData?.petType,
        petBreed: guestData?.petBreed,
        petWeight: guestData?.petWeight,
        petBirthDate: guestData?.petBirthDate,
        petNeutered: guestData?.petNeutered,
    };

    try {
      const res = await fetch("https://candostumbox-api.onrender.com/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Sipariş alınamadı");
      
      setSuccess(true);
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- BAŞARI EKRANI (GÜNCELLENDİ: ABONELİK TEKLİFİ) ---
  if (success) return (
      <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 text-center max-w-md animate-fade-in-up shadow-2xl border-4 border-green-100 relative overflow-hidden">
              
              {/* Arka plan süsü */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>

              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Siparişin Alındı!</h2>
              <p className="text-gray-500 mb-6 text-sm">
                 {(guestData?.petName || selectedUserPet) 
                    ? `${guestData?.petName || selectedUserPet} için hazırlıklara başladık bile!` 
                    : "Can dostun buna bayılacak."}
              </p>

              {/* 👇 MİSAFİRLER İÇİN ABONELİK TEKLİFİ (UPSELL) */}
              {isGuest && onSwitchToRegister && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 text-left transform transition hover:scale-105 duration-300 shadow-sm hover:shadow-md">
                      <h4 className="font-bold text-orange-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                          <span className="text-xl">🎁</span> Bu Mutluluk Bitmesin!
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 mb-3 leading-relaxed">
                          Her ay sipariş vermekle uğraşma. Şimdi <strong>ücretsiz üye ol</strong>, dostunun kutusu her ay kapına gelsin.
                      </p>
                      <button 
                          onClick={onSwitchToRegister}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition shadow-lg flex items-center justify-center gap-2 text-sm"
                      >
                          Hesap Oluştur ve Abone Ol ➔
                      </button>
                  </div>
              )}

              <button onClick={() => { setSuccess(false); onClose(); }} className="text-gray-400 hover:text-gray-600 text-sm underline">
                  {isGuest ? "Şimdilik hayır, teşekkürler" : "Tamamdır, kapat"}
              </button>
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col my-10 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 text-2xl z-10">&times;</button>
        
        {/* --- BAŞLIK ve FİYAT GÖSTERİMİ --- */}
        <div className="bg-gray-50 p-6 border-b border-gray-100 rounded-t-3xl">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Güvenli Ödeme 🔒
            </h2>
            <div className="flex justify-between items-end mt-2">
                <div>
                    <p className="text-sm text-gray-500">{productName}</p>
                    {guestData?.petName && <p className="text-xs text-green-600 mt-1 font-bold">🐾 {guestData.petName} için hazırlanıyor</p>}
                </div>
                {/* 👇 FİYAT PSİKOLOJİSİ */}
                <div className="text-right">
                    <span className="block text-xs text-gray-400 line-through font-bold">₺{Math.round(productPrice * 1.2)}</span>
                    <span className="block text-2xl font-black text-green-600">₺{productPrice}</span>
                </div>
            </div>
        </div>

        <form onSubmit={handlePayment} className="p-8 space-y-5">
            
            {/* 1. PET SEÇİMİ (Üye ise) */}
            {!isGuest && !guestData?.petName && userPets.length > 0 && (
                <div className="mb-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                        <span className="bg-purple-100 text-purple-600 p-1.5 rounded-lg text-lg">
                            {getPetEmoji(currentSelectedPet?.type)}
                        </span> 
                        Hangi Dostumuz İçin?
                    </label>
                    <div className="relative">
                        <select 
                            value={selectedUserPet}
                            onChange={(e) => setSelectedUserPet(e.target.value)}
                            className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 appearance-none font-bold text-gray-800 cursor-pointer transition-all shadow-sm hover:border-purple-300"
                        >
                            {userPets.map((pet) => (
                                <option key={pet.id} value={pet.name} className="py-2">
                                    {pet.name} ({formatPetType(pet.type)})
                                </option>
                            ))}
                        </select>
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">
                            {getPetEmoji(currentSelectedPet?.type)}
                        </div>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                    </div>
                </div>
            )}

            {/* 2. MİSAFİR BİLGİLERİ */}
            {isGuest && (
                <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100 space-y-3 animate-fade-in-up">
                    <div className="flex items-center gap-2 text-yellow-800 font-bold text-xs uppercase mb-1">
                        <span>👤</span> İletişim Bilgileri
                    </div>
                    <input type="text" name="name" placeholder="Adınız Soyadınız" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-yellow-400 transition bg-white" required />
                    <input type="email" name="email" placeholder="E-posta Adresiniz" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-yellow-400 transition bg-white" required />
                    <input type="tel" name="phone" placeholder="Telefon (Kargo Bilgilendirmesi İçin)" onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-yellow-400 transition bg-white" required />
                </div>
            )}

            {/* 3. ADRES BİLGİLERİ (Geliştirilmiş) */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-800 font-bold text-xs uppercase">
                    <span>📍</span> Teslimat Adresi
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="city" placeholder="İl (Örn: İstanbul)" value={formData.city} onChange={handleChange} className="col-span-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition" required />
                    {/* 👇 YENİ: İlçe Alanı */}
                    <input type="text" name="district" placeholder="İlçe (Örn: Kadıköy)" value={formData.district} onChange={handleChange} className="col-span-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition" required />
                </div>
                {/* 👇 YENİ: Geniş Adres Alanı */}
                <textarea name="address" rows={2} placeholder="Mahalle, Sokak, Bina No, Daire No..." value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-500 focus:bg-white transition resize-none" required></textarea>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase flex items-center gap-1">💳 Kart Bilgileri</h3>
                <input type="text" name="cardNumber" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none mb-3 focus:border-black transition" required />
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="expiry" placeholder="AA/YY" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black transition" required />
                    <input type="text" name="cvv" placeholder="CVV" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-black transition" required />
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition transform hover:scale-[1.02] active:scale-95 shadow-lg flex justify-center items-center gap-2">
                {loading ? "İşleniyor..." : (
                    <>
                        <span>Ödemeyi Tamamla</span>
                        <span className="bg-gray-700 px-2 py-0.5 rounded text-sm">₺{productPrice}</span>
                    </>
                )}
            </button>
        </form>
      </div>
    </div>
  );
}