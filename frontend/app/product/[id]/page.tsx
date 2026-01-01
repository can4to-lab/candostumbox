"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";
import UpsellModal from "@/components/UpsellModal";

const API_URL = "https://candostumbox-api.onrender.com";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  features: string[];
}

interface Pet {
    id: number;
    name: string;
    type: string;
    breed?: string;
    weight?: string;
    birthDate?: string;
    isNeutered?: boolean;
    allergies?: string[];
}

interface DiscountRule {
    durationMonths: number;
    discountPercentage: string; 
}

const OTHER_ICONS: Record<string, string> = {
    'Kuş': '🦜',
    'Hamster': '🐹',
    'Tavşan': '🐰',
    'Balık': '🐟'
};

const MONTHS = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 25 }, (_, i) => CURRENT_YEAR - i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState(true);

  // --- NAVBAR STATE ---
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(""); 

  // --- FORM STATE ---
  const [step, setStep] = useState(1);
  const [duration, setDuration] = useState(1);
  const [paymentType, setPaymentType] = useState<'monthly' | 'upfront'>('upfront');
  
  // PET STATE
  const [savedPets, setSavedPets] = useState<Pet[]>([]); 
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null); 
  const [isNewPetMode, setIsNewPetMode] = useState(false); 

  // MODAL STATE
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  const [petData, setPetData] = useState({
    type: "kopek",
    otherType: "",
    name: "",
    breed: "",
    weight: "",
    birthDate: "",
    isNeutered: false,
    shippingDate: "1-5",
    allergies: [] as string[],
    allergyInput: ""
  });
  
  const [dateParts, setDateParts] = useState({ day: "", month: "", year: "" });
  const [isOtherOpen, setIsOtherOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        try {
            if (id) {
                const prodRes = await fetch(`${API_URL}/products/${id}`);
                if (prodRes.ok) {
                    const data = await prodRes.json();
                    setProduct(data);
                }
            }

            const discRes = await fetch(`${API_URL}/discounts`);
            if (discRes.ok) {
                const discData = await discRes.json();
                setDiscountRules(discData);
            }

            const token = localStorage.getItem("token");
            if (token) {
                setIsLoggedIn(true);
                fetch(`${API_URL}/auth/profile`, { headers: { "Authorization": `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => setUserName(data.name || "Dostum"))
                .catch(() => localStorage.removeItem("token")); 

                const petsRes = await fetch(`${API_URL}/users/pets`, { headers: { "Authorization": `Bearer ${token}` } });
                if (petsRes.ok) {
                    const data = await petsRes.json();
                    const pets = Array.isArray(data) ? data : (data.pets || []);
                    setSavedPets(pets);
                    if (pets.length > 0) setSelectedPetId(pets[0].id);
                    else setIsNewPetMode(true);
                }
            } else {
                setIsNewPetMode(true); 
            }

        } catch (error) {
            console.error("Veri yükleme hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
      if (duration === 1) {
          setPaymentType('upfront');
      }
  }, [duration]);

  // Tarih Dropdown Listener
  useEffect(() => {
    if (dateParts.day && dateParts.month && dateParts.year) {
        const monthIndex = MONTHS.indexOf(dateParts.month) + 1;
        const formattedMonth = monthIndex < 10 ? `0${monthIndex}` : monthIndex;
        const formattedDay = Number(dateParts.day) < 10 ? `0${dateParts.day}` : dateParts.day;
        
        setPetData(prev => ({
            ...prev,
            birthDate: `${dateParts.year}-${formattedMonth}-${formattedDay}`
        }));
    }
  }, [dateParts]);

  const calculatePrice = (months: number) => {
    if (!product) return { total: 0, monthly: 0, discountRate: 0, originalTotal: 0 };
    
    const basePrice = Number(product.price);
    const originalTotal = basePrice * months;

    const rule = discountRules.find(d => d.durationMonths === months);
    const discountRate = rule ? Number(rule.discountPercentage) : 0;

    const discountAmount = originalTotal * (discountRate / 100);
    const total = originalTotal - discountAmount;
    
    return {
        total: total,
        monthly: total / months,
        discountRate: discountRate,
        originalTotal: originalTotal
    };
  };

  const getOtherIcon = () => {
      if (petData.otherType && OTHER_ICONS[petData.otherType]) {
          return OTHER_ICONS[petData.otherType];
      }
      return '🦜';
  };

  const handleSelectSavedPet = (pet: Pet) => {
      setSelectedPetId(pet.id);
      setIsNewPetMode(false);
      setPetData({
          ...petData,
          name: pet.name,
          type: pet.type,
          breed: pet.breed || "",
          weight: pet.weight || "",
          isNeutered: pet.isNeutered || false,
          allergies: pet.allergies || []
      });
      if(pet.birthDate) {
          const d = new Date(pet.birthDate);
          if(!isNaN(d.getTime())) {
              setDateParts({
                  day: String(d.getDate()),
                  month: MONTHS[d.getMonth()],
                  year: String(d.getFullYear())
              });
          }
      }
  };

  const handleAddAllergy = () => {
      if (petData.allergyInput.trim() && !petData.allergies.includes(petData.allergyInput.trim())) {
          setPetData({...petData, allergies: [...petData.allergies, petData.allergyInput.trim()], allergyInput: ""});
      }
  };

  const removeAllergy = (allergy: string) => {
      setPetData({...petData, allergies: petData.allergies.filter(a => a !== allergy)});
  };

  const saveNewPet = async () => {
      const token = localStorage.getItem("token");
      if (!token) return true; 
      try {
          const res = await fetch(`${API_URL}/users/pets`, {
              method: "POST",
              headers: { 
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                  name: petData.name,
                  type: petData.type === 'diger' ? petData.otherType : petData.type,
                  breed: petData.breed,
                  weight: petData.weight,
                  birthDate: petData.birthDate,
                  isNeutered: petData.isNeutered,
                  allergies: petData.allergies
              }),
          });
          if (!res.ok) throw new Error("Kayıt başarısız");
          const newPet = await res.json();
          setSavedPets([...savedPets, newPet]); 
          setSelectedPetId(newPet.id); 
          setIsNewPetMode(false); 
          return true;
      } catch (error) {
          toast.error("Dostun kaydedilirken bir hata oluştu.");
          return false;
      }
  };

  const handleDowngrade = () => {
      setShowUpsellModal(false);
      setDuration(1);
      setPaymentType('upfront');
      setStep(2); 
      toast("Üyeliksiz devam ettiğiniz için '1 Aylık Deneme Paketi' seçildi.", {
          icon: 'ℹ️',
          style: { border: '1px solid #3b82f6', color: '#1e40af' },
          duration: 4000
      });
  };

  const handleAcceptUpsell = () => {
      setShowUpsellModal(false);
      setRegisterOpen(true);
  };

  const handleAuthSuccess = async () => {
      setLoginOpen(false);
      setRegisterOpen(false);
      const token = localStorage.getItem("token");
      
      if (token) {
          setIsLoggedIn(true);
          toast.success("Giriş yapıldı, indirimli fiyatınız korundu! 🎉");

          try {
              fetch(`${API_URL}/auth/profile`, { headers: { "Authorization": `Bearer ${token}` } })
                  .then(res => res.json())
                  .then(data => setUserName(data.name || "Dostum"));

              const petsRes = await fetch(`${API_URL}/users/pets`, { headers: { "Authorization": `Bearer ${token}` } });
              if (petsRes.ok) {
                  const data = await petsRes.json();
                  const pets = Array.isArray(data) ? data : (data.pets || []);
                  setSavedPets(pets);
                  
                  if (pets.length > 0) {
                      setSelectedPetId(pets[0].id);
                      setIsNewPetMode(false);
                  } else {
                      setIsNewPetMode(true);
                  }
              }
          } catch (e) { console.error("Veri yenileme hatası", e); }

          if (step === 1) setStep(2);
      }
  };

  const handleNextStep = async () => {
      if (step === 1) {
          const token = localStorage.getItem("token");
          if (!token && duration > 1) {
              setShowUpsellModal(true);
              return; 
          }
          setStep(2);
      } 
      else if (step === 2) {
          if (isNewPetMode || savedPets.length === 0) {
              if (!petData.name || !petData.breed || !petData.weight) {
                  toast.error("Lütfen dostunun bilgilerini eksiksiz doldur.");
                  return;
              }
              if (petData.type === 'diger' && !petData.otherType) {
                  toast.error("Lütfen hayvan türünü belirt.");
                  return;
              }
          } else if (!selectedPetId) {
              toast.error("Lütfen bir dostunu seç veya yeni ekle.");
              return;
          }

          const token = localStorage.getItem("token");
          if (token && isNewPetMode) {
              const isSaved = await saveNewPet();
              if (!isSaved) return; 
          }
          setStep(3); 
      } 
      else {
          if (!product) return;
          const priceInfo = calculatePrice(duration);
          const finalPrice = paymentType === 'monthly' ? Number(product.price) : priceInfo.total;

          const safePetName = isNewPetMode 
              ? petData.name 
              : savedPets.find(p => p.id === selectedPetId)?.name;

          const cartItem = {
              productId: product.id,
              productName: product.name,
              price: finalPrice, 
              image: product.image,
              duration: duration,
              paymentType: paymentType,
              petId: selectedPetId || 0, 
              petName: safePetName || "", 
              deliveryPeriod: petData.shippingDate
          };

          addToCart(cartItem);
          toast.success("Ödeme sayfasına yönlendiriliyorsunuz... 🚀");
          setTimeout(() => { router.push('/checkout'); }, 500);
      }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin text-5xl">🎁</div>
            <p className="text-gray-500 font-bold">Paket yükleniyor...</p>
        </div>
    </div>
  );

  if (!product) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Aradığınız Paket Bulunamadı</h2>
          <button onClick={() => router.push('/')} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition">Anasayfaya Dön</button>
      </div>
  );

  const currentPriceInfo = calculatePrice(duration);
  const potentialSavings = (currentPriceInfo.originalTotal - currentPriceInfo.total).toFixed(0);

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans">
      <Toaster position="top-right" />
      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} onSwitchToRegister={() => {setLoginOpen(false); setRegisterOpen(true);}} onLoginSuccess={handleAuthSuccess} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} onSwitchToLogin={() => {setRegisterOpen(false); setLoginOpen(true);}} initialData={null} onRegisterSuccess={handleAuthSuccess} />
      <UpsellModal isOpen={showUpsellModal} onClose={handleDowngrade} onAccept={handleAcceptUpsell} savingsAmount={Number(potentialSavings)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => router.back()} className="mb-6 text-gray-500 font-bold hover:text-green-600 transition flex items-center gap-2">← Listeye Dön</button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">{product.name}</h1>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">{product.description || "Açıklama bulunmuyor."}</p>
                    <div className="relative h-64 w-full mb-6 group">
                        <img src={product.image || "https://placehold.co/400x400/png?text=Paket"} alt={product.name} className="object-contain w-full h-full drop-shadow-2xl transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="text-5xl font-black text-gray-900 mb-1 tracking-tighter">₺{Number(product.price).toFixed(2)}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-8">Aylık Standart Fiyat</div>
                </div>
            </div>

            <div className="lg:col-span-8">
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                    <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                        <div className={`flex items-center gap-3 ${step >= 1 ? 'text-green-600' : 'text-gray-300'}`}><span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${step >= 1 ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>1</span><span className="font-bold hidden sm:block text-sm uppercase tracking-wider">Süre</span></div>
                        <div className={`h-0.5 w-12 ${step >= 2 ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                        <div className={`flex items-center gap-3 ${step >= 2 ? 'text-green-600' : 'text-gray-300'}`}><span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${step >= 2 ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>2</span><span className="font-bold hidden sm:block text-sm uppercase tracking-wider">Dostun</span></div>
                        <div className={`h-0.5 w-12 ${step >= 3 ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                        <div className={`flex items-center gap-3 ${step >= 3 ? 'text-green-600' : 'text-gray-300'}`}><span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${step >= 3 ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>3</span><span className="font-bold hidden sm:block text-sm uppercase tracking-wider">Özet</span></div>
                    </div>

                    <div className="p-8 md:p-12 flex-grow flex flex-col justify-center">
                        
                        {step === 1 && (
                            <div className="animate-fade-in space-y-8">
                                <div><h2 className="text-3xl font-black text-gray-900 mb-2">Abonelik Süresi 🗓️</h2><p className="text-gray-500">Ne kadar uzun süreli dostluk, o kadar avantaj!</p></div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {[1, 3, 6, 9, 12].map((m) => {
                                        const info = calculatePrice(m);
                                        const isSelected = duration === m;
                                        return (
                                            <button key={m} onClick={() => setDuration(m)} className={`p-4 rounded-2xl border-2 transition-all duration-300 relative group flex flex-col justify-between h-44 ${isSelected ? 'border-green-500 bg-green-50 shadow-lg scale-105 ring-2 ring-green-200' : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'}`}>
                                                {m === 1 && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-400 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md whitespace-nowrap">DENEME</div>}
                                                {info.discountRate > 0 && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md whitespace-nowrap">%{info.discountRate} İNDİRİM</div>}
                                                <div className="text-3xl font-black text-gray-900 mt-2">{m}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AYLIK</div>
                                                <div className="mb-1">
                                                    {info.discountRate > 0 && <div className="text-[10px] text-red-400 line-through decoration-red-400 font-bold">₺{info.originalTotal.toFixed(0)}</div>}
                                                    <div className="text-sm font-black text-green-700">₺{info.total.toFixed(0)}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-end pt-8"><button onClick={handleNextStep} className="bg-gray-900 text-white px-12 py-4 rounded-xl font-bold hover:bg-black transition shadow-lg transform active:scale-95 flex items-center gap-2">Devam Et <span className="text-xl">👉</span></button></div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-fade-in space-y-8">
                                <div><h2 className="text-3xl font-black text-gray-900 mb-2">Bu Kutu Kimin İçin? 🐾</h2><p className="text-gray-500">Kayıtlı dostlarından birini seç veya yeni bir tane ekle.</p></div>
                                
                                {savedPets.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {savedPets.map(pet => (
                                            <div key={pet.id} onClick={() => handleSelectSavedPet(pet)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedPetId === pet.id && !isNewPetMode ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-200 hover:border-green-200'}`}>
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">{pet.type === 'kopek' ? '🐶' : pet.type === 'kedi' ? '🐱' : '🦜'}</div>
                                                <div><h4 className="font-bold text-gray-900">{pet.name}</h4><p className="text-xs text-gray-500">{pet.breed || pet.type} • {pet.weight}kg</p></div>
                                                {selectedPetId === pet.id && !isNewPetMode && <div className="ml-auto text-green-600 font-bold">✓</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <button onClick={() => { setIsNewPetMode(true); setSelectedPetId(null); setPetData({ type: "kopek", otherType: "", name: "", breed: "", weight: "", birthDate: "", isNeutered: false, shippingDate: "1-5", allergies: [], allergyInput: "" }); setDateParts({day:"",month:"",year:""}); }} className={`w-full p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-bold hover:border-green-500 hover:text-green-600 transition flex items-center justify-center gap-2 ${isNewPetMode ? 'border-green-500 bg-green-50 text-green-700' : ''}`}><span>+</span> {savedPets.length > 0 ? 'Farklı Bir Dost Ekle' : 'Yeni Bir Dost Ekle'}</button>
                                
                                {(isNewPetMode || savedPets.length === 0) && (
                                    <div className="animate-slide-down border-t border-gray-100 pt-6">
                                        
                                        <div className="flex gap-4 justify-center mb-6">
                                            <button onClick={() => { setPetData({...petData, type: 'kopek', otherType: ''}); setIsOtherOpen(false); }} className={`flex-1 py-4 rounded-xl font-bold border-2 transition ${petData.type === 'kopek' ? 'border-green-500 bg-white text-green-700' : 'border-gray-200 bg-white text-gray-400'}`}>🐶 Köpek</button>
                                            <button onClick={() => { setPetData({...petData, type: 'kedi', otherType: ''}); setIsOtherOpen(false); }} className={`flex-1 py-4 rounded-xl font-bold border-2 transition ${petData.type === 'kedi' ? 'border-green-500 bg-white text-green-700' : 'border-gray-200 bg-white text-gray-400'}`}>🐱 Kedi</button>
                                            <div className="relative flex-1">
                                                <button onClick={() => setIsOtherOpen(!isOtherOpen)} className={`w-full h-full py-4 rounded-xl font-bold border-2 transition ${petData.type === 'diger' ? 'border-green-500 bg-white text-green-700' : 'border-gray-200 bg-white text-gray-400'}`}>{getOtherIcon()} Diğer ▼</button>
                                                {isOtherOpen && (<div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl z-20 overflow-hidden">{['Kuş', 'Hamster', 'Tavşan', 'Balık'].map((t) => (<button key={t} onClick={() => {setPetData({...petData, type: 'diger', otherType: t}); setIsOtherOpen(false);}} className="w-full text-left px-4 py-3 hover:bg-green-50 hover:text-green-700 font-medium text-gray-600 transition border-b border-gray-50 last:border-0 flex items-center gap-2"><span>{OTHER_ICONS[t]}</span> {t}</button>))}</div>)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <input type="text" value={petData.name} onChange={e => setPetData({...petData, name: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-green-500 transition" placeholder="İsim (Örn: Pamuk)" />
                                            <input type="text" value={petData.breed} onChange={e => setPetData({...petData, breed: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-green-500 transition" placeholder="Irk (Örn: Golden)" />
                                            <input type="number" value={petData.weight} onChange={e => setPetData({...petData, weight: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-green-500 transition" placeholder="Kilo (kg)" />
                                            
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Doğum Tarihi</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <select value={dateParts.day} onChange={e => setDateParts({...dateParts, day: e.target.value})} className="p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-green-500 transition cursor-pointer">
                                                        <option value="">Gün</option>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                                    </select>
                                                    <select value={dateParts.month} onChange={e => setDateParts({...dateParts, month: e.target.value})} className="p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-green-500 transition cursor-pointer">
                                                        <option value="">Ay</option>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                    </select>
                                                    <select value={dateParts.year} onChange={e => setDateParts({...dateParts, year: e.target.value})} className="p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-green-500 transition cursor-pointer">
                                                        <option value="">Yıl</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-6">
                                            {/* 👇 YENİ CHECKBOX KISMI */}
                                            <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition mb-4">
                                                <input
                                                    type="checkbox"
                                                    checked={petData.isNeutered}
                                                    onChange={(e) => setPetData({...petData, isNeutered: e.target.checked})}
                                                    className="w-5 h-5 accent-green-600 rounded"
                                                />
                                                <span className="font-bold text-gray-900">
                                                    {petData.isNeutered ? "✅ Kısırlaştırılmış" : "❌ Kısırlaştırılmamış"}
                                                </span>
                                            </label>

                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-2 block">Alerjiler (Varsa)</label>
                                            <div className="flex gap-2 mb-3">
                                                <input 
                                                    type="text" 
                                                    value={petData.allergyInput} 
                                                    onChange={e => setPetData({...petData, allergyInput: e.target.value})} 
                                                    className="flex-grow p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-green-500 transition" 
                                                    placeholder="Örn: Tavuk, Tahıl..." 
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddAllergy()}
                                                />
                                                <button onClick={handleAddAllergy} className="bg-green-100 hover:bg-green-200 text-green-700 font-bold px-6 rounded-xl transition">Ekle +</button>
                                            </div>
                                            {petData.allergies.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {petData.allergies.map((allergy, index) => (
                                                        <span key={index} className="bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 animate-fade-in">
                                                            🚫 {allergy}
                                                            <button onClick={() => removeAllergy(allergy)} className="hover:text-red-800 bg-red-100 w-5 h-5 rounded-full flex items-center justify-center text-xs">✕</button>
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 pl-1">Henüz alerji eklenmedi.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex justify-between pt-8 border-t border-gray-100">
                                    <button onClick={() => setStep(1)} className="text-gray-400 font-bold hover:text-gray-900 px-6 py-3">Geri Dön</button>
                                    <button onClick={handleNextStep} className="bg-gray-900 text-white px-12 py-4 rounded-xl font-bold hover:bg-black transition shadow-lg transform active:scale-95">Sonraki Adım 👉</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-fade-in text-center space-y-8">
                                <div><div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm">🎉</div><h2 className="text-3xl font-black text-gray-900 mb-2">Harika Seçim!</h2><p className="text-gray-500">Siparişini oluşturmadan önce son bir kez kontrol et.</p></div>
                                
                                <div className="bg-gray-50 rounded-3xl p-8 text-left space-y-4 border border-gray-200 shadow-inner">
                                    <div className="flex justify-between border-b border-gray-200 pb-3"><span className="text-gray-500 font-medium">Paket</span><span className="font-bold text-gray-900 text-lg">{product.name}</span></div>
                                    <div className="flex justify-between border-b border-gray-200 pb-3"><span className="text-gray-500 font-medium">Süre</span><span className="font-bold text-gray-900">{duration} Ay</span></div>
                                    <div className="flex justify-between border-b border-gray-200 pb-3"><span className="text-gray-500 font-medium">Can Dostun</span><span className="font-bold text-gray-900">{petData.name || (savedPets.find(p => p.id === selectedPetId)?.name)}</span></div>
                                    
                                    {duration > 1 && (
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 mt-4">
                                            <div className="text-xs font-bold text-gray-400 uppercase mb-3">Ödeme Planı Seç</div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setPaymentType('monthly')} disabled={!isLoggedIn && duration > 1} className={`flex-1 py-3 px-2 rounded-lg font-bold text-sm border-2 transition ${paymentType === 'monthly' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}>Her Ay Öde</button>
                                                <button onClick={() => setPaymentType('upfront')} className={`flex-1 py-3 px-2 rounded-lg font-bold text-sm border-2 transition ${paymentType === 'upfront' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}>Tek Çekim (İndirimli)</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between pt-4 items-center">
                                        <span className="text-lg font-bold text-gray-900">{paymentType === 'monthly' ? 'Aylık Tutar' : 'Toplam Tutar'}</span>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-green-600 tracking-tighter">₺{paymentType === 'monthly' ? Number(product.price).toFixed(2) : currentPriceInfo.total.toFixed(2)}</div>
                                            {currentPriceInfo.discountRate > 0 && paymentType === 'upfront' && <div className="text-xs text-orange-500 font-bold">%{currentPriceInfo.discountRate} İndirim Uygulandı</div>}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center pt-4">
                                    <button onClick={() => setStep(2)} className="text-gray-400 font-bold hover:text-gray-900 px-6">Düzenle</button>
                                    <button onClick={handleNextStep} className="bg-green-600 text-white px-12 py-5 rounded-xl font-bold hover:bg-green-700 transition shadow-xl shadow-green-200 transform active:scale-95 flex items-center gap-3 text-lg">Ödemeye Geç <span className="text-2xl">💳</span></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}