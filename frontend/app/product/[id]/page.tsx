"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";

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

const OTHER_ICONS: Record<string, string> = {
    'Kuş': '🦜',
    'Hamster': '🐹',
    'Tavşan': '🐰',
    'Balık': '🐟'
};

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // --- NAVBAR STATE ---
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(""); 

  // --- FORM STATE ---
  const [step, setStep] = useState(1);
  const [duration, setDuration] = useState(1);
  const [paymentType, setPaymentType] = useState<'monthly' | 'upfront'>('monthly');
  
  // PET STATE
  const [savedPets, setSavedPets] = useState<Pet[]>([]); 
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null); 
  const [isNewPetMode, setIsNewPetMode] = useState(false); 

  // 👇 YENİ: Misafir "Downgrade" Modalı için State
  const [showGuestModal, setShowGuestModal] = useState(false);

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
  
  const [isOtherOpen, setIsOtherOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        setIsLoggedIn(true);
        fetch(`${API_URL}/auth/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setUserName(data.name || "Dostum"))
        .catch(() => localStorage.removeItem("token")); 

        fetch(`${API_URL}/users/pets`, { 
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error("Pet verisi çekilemedi");
            return res.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                setSavedPets(data);
            } else if (data.pets && Array.isArray(data.pets)) {
                setSavedPets(data.pets);
            }
        })
        .catch(err => console.log("Petler çekilemedi:", err));
    }

    const fetchProduct = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if(res.ok){
            const data = await res.json();
            setProduct(data);
        } else {
            console.error("Ürün API'de bulunamadı");
        }
      } catch (error) {
        console.error("Ürün yüklenemedi sunucu hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddAllergy = () => {
      if (petData.allergyInput.trim() && !petData.allergies.includes(petData.allergyInput.trim())) {
          setPetData({...petData, allergies: [...petData.allergies, petData.allergyInput.trim()], allergyInput: ""});
      }
  };

  const removeAllergy = (allergy: string) => {
      setPetData({...petData, allergies: petData.allergies.filter(a => a !== allergy)});
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
  };

  const saveNewPet = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
          toast.error("Lütfen önce giriş yapın.");
          setLoginOpen(true); 
          return false;
      }
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
          toast.success("Dostun başarıyla kaydedildi! 🎉");
          return true;
      } catch (error) {
          toast.error("Dostun kaydedilirken bir hata oluştu.");
          return false;
      }
  };
// A) MİSAFİR: "Üye Olmak İstiyorum" derse
  const handleGuestRegister = () => {
      setShowGuestModal(false); // Bu uyarıyı kapat
      setRegisterOpen(true);    // Kayıt olma modalını aç
  };

  // B) MİSAFİR: "Üye Olmadan Devam Et" derse (Downgrade İşlemi)
  const handleGuestDowngrade = () => {
      setShowGuestModal(false);

      // Eğer 1 aydan uzun süre seçtiyse, zorla 1 aya düşür
      if (duration > 1) {
          setDuration(1);
          setPaymentType('upfront'); // Mecburen peşin olacak
          
          toast("Üye girişi yapılmadığı için '1 Aylık Deneme Paketi' seçildi.", {
              icon: 'ℹ️',
              style: { border: '1px solid #3b82f6', color: '#1e40af' },
              duration: 4000
          });
      }

      setStep(3); // Özet ekranına geç
  };
 // 👇 GÜNCELLENEN STEP 2 MANTIĞI
  const handleNextStep = async () => {
      if (step === 1) {
          setStep(2);
      } 
      else if (step === 2) {
          // 1. Validasyon (Pet Bilgileri Dolu mu?)
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

          // 2. Token Kontrolü (Giriş Yapılmış mı?)
          const token = localStorage.getItem("token");

          if (token) {
              // --- GİRİŞ YAPMIŞ KULLANICI ---
              // Yeni pet ekliyorsa kaydet
              if (isNewPetMode) {
                  const isSaved = await saveNewPet();
                  if (!isSaved) return; 
              }
              setStep(3); // Sorunsuz devam et
          } else {
              // --- MİSAFİR KULLANICI ---
              // Eğer 1 aydan fazla seçtiyse (3, 6, 9, 12) -> MODALI AÇ VE DURDUR
              if (duration > 1) {
                  setShowGuestModal(true);
              } else {
                  // Zaten 1 ay seçmişse sorun yok, devam etsin
                  setStep(3);
              }
          }
      } 
      else {
          // ... Step 3 (Sepete Ekleme) kodu AYNI KALSIN ...
          if (!product) return;

          const calculatedPrice = paymentType === 'monthly' 
            ? Number(product.price) 
            : Number((Number(product.price) * duration).toFixed(2));

          const cartItem = {
              productId: product.id,
              productName: product.name,
              price: calculatedPrice,
              image: product.image,
              duration: duration,
              paymentType: paymentType,
              petId: selectedPetId || 0, // Misafir için geçici ID
              petName: petData.name, 
              deliveryPeriod: petData.shippingDate
          };

          addToCart(cartItem);
          toast.success("Ödeme sayfasına yönlendiriliyorsunuz... 🚀");
          setTimeout(() => {
              router.push('/checkout');
          }, 500);
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

  const monthlyPrice = Number(product.price);
  const totalPrice = monthlyPrice * duration;

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans">
      <Toaster position="top-right" />
      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} onSwitchToRegister={() => {setLoginOpen(false); setRegisterOpen(true);}} onLoginSuccess={() => window.location.reload()} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} onSwitchToLogin={() => {setRegisterOpen(false); setLoginOpen(true);}} initialData={null} onRegisterSuccess={() => window.location.reload()} />
{/* ... Diğer Modallar ... */}
      
      {/* 👇 YENİ: MİSAFİR DOWNGRADE MODALI */}
      {showGuestModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative border border-gray-100 transform transition-all scale-100">
                <button onClick={() => setShowGuestModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition text-xl font-bold">✕</button>
                
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner">
                        🔒
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">
                        Abonelik Fırsatı!
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed px-2">
                        Seçtiğin <span className="font-bold text-gray-900">{duration} Aylık</span> avantajlı paket bir abonelik planıdır ve indirimleri korumak için üyelik gerektirir.
                    </p>
                </div>

                <div className="space-y-3">
                    {/* Seçenek 1: Üye Ol (Tavsiye Edilen) */}
                    <button 
                        onClick={handleGuestRegister}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition shadow-lg shadow-green-200 flex items-center justify-center gap-2 group"
                    >
                        <span>🚀</span> Üye Ol ve İndirimi Kap
                    </button>

                    {/* Ayırıcı */}
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-100"></div>
                        <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-400 uppercase">Veya</span>
                        <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    {/* Seçenek 2: Downgrade (Misafir Devam) */}
                    <button 
                        onClick={handleGuestDowngrade}
                        className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl transition flex items-center justify-center gap-2 border border-gray-200"
                    >
                        <span>📦</span> Üye Olmadan "Deneme Paketi" Al
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-2">
                        *Deneme paketi tek seferliktir ve abonelik avantajlarını içermez.
                    </p>
                </div>
            </div>
        </div>
      )}
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
                    <div className="text-5xl font-black text-gray-900 mb-1 tracking-tighter">₺{monthlyPrice.toFixed(2)}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-8">Aylık Fiyat</div>
                    {product.features && product.features.length > 0 && (
                        <div className="space-y-3 text-left border-t border-gray-100 pt-6">
                            {product.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm text-gray-600 font-medium"><span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>{feature}</div>
                            ))}
                        </div>
                    )}
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
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[3, 6, 9, 12].map((m) => (
                                        <button key={m} onClick={() => setDuration(m)} className={`p-6 rounded-2xl border-2 transition-all duration-300 relative group ${duration === m ? 'border-green-500 bg-green-50 shadow-lg scale-105 ring-2 ring-green-200' : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'}`}>
                                            {m === 12 && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">EN AVANTAJLI</div>}
                                            <div className="text-4xl font-black text-gray-900 mb-1">{m}</div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">AYLIK PLAN</div>
                                        </button>
                                    ))}
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
                                <button onClick={() => { setIsNewPetMode(true); setSelectedPetId(null); setPetData({ type: "kopek", otherType: "", name: "", breed: "", weight: "", birthDate: "", isNeutered: false, shippingDate: "1-5", allergies: [], allergyInput: "" }); }} className={`w-full p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-bold hover:border-green-500 hover:text-green-600 transition flex items-center justify-center gap-2 ${isNewPetMode ? 'border-green-500 bg-green-50 text-green-700' : ''}`}><span>+</span> {savedPets.length > 0 ? 'Farklı Bir Dost Ekle' : 'Yeni Bir Dost Ekle'}</button>
                                {(isNewPetMode || savedPets.length === 0) && (
                                    <div className="animate-slide-down border-t border-gray-100 pt-6">
                                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">📝 Dostunun Bilgileri</h3>
                                        <div className="flex gap-4 justify-center mb-6">
                                            <button onClick={() => { setPetData({...petData, type: 'kopek', otherType: ''}); setIsOtherOpen(false); }} className={`flex-1 py-4 rounded-xl font-bold border-2 transition ${petData.type === 'kopek' ? 'border-green-500 bg-white text-green-700' : 'border-gray-200 bg-white text-gray-400'}`}>🐶 Köpek</button>
                                            <button onClick={() => { setPetData({...petData, type: 'kedi', otherType: ''}); setIsOtherOpen(false); }} className={`flex-1 py-4 rounded-xl font-bold border-2 transition ${petData.type === 'kedi' ? 'border-green-500 bg-white text-green-700' : 'border-gray-200 bg-white text-gray-400'}`}>🐱 Kedi</button>
                                            <div className="relative flex-1">
                                                <button onClick={() => setIsOtherOpen(!isOtherOpen)} className={`w-full h-full py-4 rounded-xl font-bold border-2 transition ${petData.type === 'diger' ? 'border-green-500 bg-white text-green-700' : 'border-gray-200 bg-white text-gray-400'}`}>{getOtherIcon()} Diğer ▼</button>
                                                {isOtherOpen && (
                                                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl z-20 overflow-hidden">{['Kuş', 'Hamster', 'Tavşan', 'Balık'].map((t) => (<button key={t} onClick={() => {setPetData({...petData, type: 'diger', otherType: t}); setIsOtherOpen(false);}} className="w-full text-left px-4 py-3 hover:bg-green-50 hover:text-green-700 font-medium text-gray-600 transition border-b border-gray-50 last:border-0 flex items-center gap-2"><span>{OTHER_ICONS[t]}</span> {t}</button>))}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <input type="text" value={petData.name} onChange={e => setPetData({...petData, name: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-green-500 transition" placeholder="İsim (Örn: Pamuk)" />
                                            <input type="text" value={petData.breed} onChange={e => setPetData({...petData, breed: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-green-500 transition" placeholder="Irk (Örn: Golden)" />
                                            <input type="number" value={petData.weight} onChange={e => setPetData({...petData, weight: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-green-500 transition" placeholder="Kilo (kg)" />
                                            <input type="date" value={petData.birthDate} onChange={e => setPetData({...petData, birthDate: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-green-500 transition" />
                                        </div>
                                        <div className="mb-6"><label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Kargo Gönderim Dönemi 🚚</label><div className="grid grid-cols-2 md:grid-cols-4 gap-2">{["1-5", "6-10", "11-15", "16-20"].map((range) => (<button key={range} onClick={() => setPetData({...petData, shippingDate: range})} className={`py-2 px-1 rounded-lg font-bold border-2 transition text-xs ${petData.shippingDate === range ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-200'}`}>Her Ayın {range}'i</button>))}</div></div>
                                        <div className="space-y-4">
                                            <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition group bg-white"><input type="checkbox" checked={petData.isNeutered} onChange={e => setPetData({...petData, isNeutered: e.target.checked})} className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300" /><span className="font-bold text-gray-700 group-hover:text-gray-900 text-sm">Dostum Kısırlaştırılmış</span></label>
                                            <div className="p-4 border border-gray-200 rounded-xl bg-white"><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Alerjiler (Varsa)</label><div className="flex gap-2"><input type="text" value={petData.allergyInput} onChange={e => setPetData({...petData, allergyInput: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleAddAllergy()} placeholder="Örn: Tavuk..." className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg font-medium outline-none focus:border-green-500 text-gray-900 text-sm" /><button onClick={handleAddAllergy} className="px-4 bg-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-300">+</button></div><div className="flex flex-wrap gap-2 mt-3">{petData.allergies.map((allergy, idx) => (<span key={idx} className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-red-100">{allergy}<button onClick={() => removeAllergy(allergy)} className="hover:text-red-800">×</button></span>))}</div></div>
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
                                    <div className="flex justify-between border-b border-gray-200 pb-3"><span className="text-gray-500 font-medium">Can Dostun</span><span className="font-bold text-gray-900">{petData.name} ({petData.type === 'diger' ? petData.otherType : petData.type})</span></div>
                                    <div className="flex justify-between border-b border-gray-200 pb-3"><span className="text-gray-500 font-medium">Kargo Dönemi</span><span className="font-bold text-gray-900">Ayın {petData.shippingDate}'i</span></div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 mt-4">
                                        <div className="text-xs font-bold text-gray-400 uppercase mb-3">Ödeme Planı Seç</div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setPaymentType('monthly')} className={`flex-1 py-3 px-2 rounded-lg font-bold text-sm border-2 transition ${paymentType === 'monthly' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}>Her Ay Öde</button>
                                            <button onClick={() => setPaymentType('upfront')} className={`flex-1 py-3 px-2 rounded-lg font-bold text-sm border-2 transition ${paymentType === 'upfront' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}>Tek Çekim Öde</button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between pt-4 items-center">
                                        <span className="text-lg font-bold text-gray-900">{paymentType === 'monthly' ? 'Aylık Tutar' : 'Toplam Tutar'}</span>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-green-600 tracking-tighter">₺{paymentType === 'monthly' ? monthlyPrice.toFixed(2) : totalPrice.toFixed(2)}</div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">{paymentType === 'monthly' ? `${duration} Ay Boyunca` : 'Tek Seferlik Ödeme'}</div>
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
        <div className="mt-20 border-t border-gray-200 pt-12">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Paket Hakkında Detaylar</h3>
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 text-gray-600 leading-relaxed space-y-4">
                <p><strong>{product.name}</strong>, dostunuzun hem fiziksel hem de zihinsel ihtiyaçlarını karşılamak üzere uzman veterinerlerimiz tarafından özenle hazırlanmıştır. Her ay değişen temalarla dostunuzun ilgisini canlı tutarken, kaliteli içeriklerle sağlığını destekliyoruz.</p>
                <p>Kutunun içerisinde yer alan oyuncaklar, ısırmaya dayanıklı ve güvenli materyallerden üretilmiştir. Ödül mamaları ise %100 doğal içerikli olup, koruyucu ve katkı maddesi içermez. Ayrıca bakım ürünlerimiz, dostunuzun tüy ve deri sağlığını korumaya yardımcı olur.</p>
                <ul className="list-disc pl-5 space-y-1"><li>Her ay farklı ve heyecan verici konseptler.</li><li>Alerji durumuna göre özelleştirilebilir içerik.</li><li>Piyasa değerinin çok altında avantajlı fiyat.</li><li>Memnun kalmazsanız kolay iade ve iptal imkanı.</li></ul>
            </div>
        </div>
      </div>
    </main>
  );
}