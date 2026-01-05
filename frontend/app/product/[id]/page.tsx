"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";
import UpsellModal from "@/components/UpsellModal";

const API_URL = "https://candostumbox-api.onrender.com";

// --- INTERFACELER (GÜNCELLENDİ: ID'ler string oldu) ---
interface Product { 
    id: string; // UUID olduğu için string
    name: string; 
    price: number; 
    description: string; 
    image: string; 
    features: string[]; 
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
    }
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

interface DiscountRule { durationMonths: number; discountPercentage: string; }

const OTHER_ICONS: Record<string, string> = { 'Kuş': '🦜', 'Hamster': '🐹', 'Tavşan': '🐰', 'Balık': '🐟' };
const MONTHS = [ "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" ];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 25 }, (_, i) => CURRENT_YEAR - i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

// --- YARDIMCI BİLEŞEN: TAKSİT TABLOSU ---
const InstallmentTable = ({ price }: { price: number }) => (
  <div className="overflow-x-auto border border-gray-100 rounded-xl mt-4">
    <div className="bg-blue-50 p-4 text-sm text-blue-800 mb-4 rounded-lg flex items-center gap-2 m-4">
       <span>💡</span>
       <strong>Bilgi:</strong> Aşağıdaki taksit seçenekleri, ödemenin tamamını peşin yaptığınızda geçerlidir.
    </div>
    <table className="w-full text-sm text-left text-gray-600">
      <thead className="bg-gray-50 text-gray-900 font-bold uppercase text-xs">
        <tr>
          <th className="px-6 py-4">Taksit Sayısı</th>
          <th className="px-6 py-4">Aylık Ödeme</th>
          <th className="px-6 py-4">Toplam Tutar</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 text-gray-900 font-medium">
        <tr>
          <td className="px-6 py-4 font-bold text-gray-900">Tek Çekim</td>
          <td className="px-6 py-4">₺{price.toFixed(2)}</td>
          <td className="px-6 py-4 font-bold">₺{price.toFixed(2)}</td>
        </tr>
        <tr>
          <td className="px-6 py-4">3 Taksit</td>
          <td className="px-6 py-4">₺{(price / 3 * 1.035).toFixed(2)}</td>
          <td className="px-6 py-4">₺{(price * 1.035).toFixed(2)}</td>
        </tr>
        <tr>
          <td className="px-6 py-4">6 Taksit</td>
          <td className="px-6 py-4">₺{(price / 6 * 1.065).toFixed(2)}</td>
          <td className="px-6 py-4">₺{(price * 1.065).toFixed(2)}</td>
        </tr>
        <tr>
          <td className="px-6 py-4">9 Taksit</td>
          <td className="px-6 py-4">₺{(price / 9 * 1.095).toFixed(2)}</td>
          <td className="px-6 py-4">₺{(price * 1.095).toFixed(2)}</td>
        </tr>
        <tr>
          <td className="px-6 py-4">12 Taksit</td>
          <td className="px-6 py-4">₺{(price / 12 * 1.125).toFixed(2)}</td>
          <td className="px-6 py-4">₺{(price * 1.125).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>
);

// --- YARDIMCI BİLEŞEN: GERÇEK YORUMLAR ---
const ReviewsSection = ({ productId }: { productId: string }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [rating, setRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/reviews/product/${productId}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error("Yorumlar çekilemedi", error);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleSubmitReview = async () => {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("Yorum yapmak için giriş yapmalısın.");
        if (!newComment.trim()) return toast.error("Lütfen bir yorum yaz.");

        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: productId, // string UUID gönderiyoruz
                    rating: rating,
                    comment: newComment
                })
            });

            if (res.ok) {
                toast.success("Yorumun paylaşıldı! Teşekkürler 🐾");
                setNewComment("");
                fetchReviews();
            } else {
                const err = await res.json();
                toast.error(err.message || "Bir hata oluştu.");
            }
        } catch (e) {
            toast.error("Sunucu hatası.");
        } finally {
            setSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
        : "5.0";

    return (
        <div className="space-y-8 animate-fade-in">
            {/* İSTATİSTİK VE FORM */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="text-center min-w-[120px]">
                    <div className="text-5xl font-black text-gray-900">{averageRating}</div>
                    <div className="text-yellow-400 text-lg">
                        {"★".repeat(Math.round(Number(averageRating)))}{"☆".repeat(5 - Math.round(Number(averageRating)))}
                    </div>
                    <div className="text-xs text-gray-500 font-bold mt-1">{reviews.length} Değerlendirme</div>
                </div>
                
                <div className="flex-1 w-full md:border-l border-gray-200 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">Fikrini Paylaş 💭</h4>
                    <div className="flex gap-2 mb-3">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setRating(star)} className={`text-2xl transition ${star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300'}`}>★</button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Bu paket hakkında ne düşünüyorsun?" 
                            className="flex-grow p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none text-gray-900 font-medium focus:border-green-500 placeholder:text-gray-400"
                        />
                        <button 
                            onClick={handleSubmitReview}
                            disabled={submitting}
                            className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-black transition disabled:opacity-50"
                        >
                            {submitting ? '...' : 'Gönder'}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* YORUM LİSTESİ */}
            {loading ? (
                <div className="text-center text-gray-400 py-4">Yorumlar yükleniyor...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8 bg-white border border-dashed border-gray-200 rounded-2xl">
                    <span className="text-4xl block mb-2">📝</span>
                    <p className="text-gray-500 font-bold">Henüz yorum yapılmamış.</p>
                    <p className="text-xs text-gray-400">İlk yorumu sen yap!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold uppercase shadow-sm">
                                        {review.user?.firstName?.charAt(0) || "M"}
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-900 block text-sm">
                                            {review.user?.firstName} {review.user?.lastName?.charAt(0)}.
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-yellow-400 text-sm tracking-widest">
                                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed font-medium">{review.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function ProductDetail() {
  const params = useParams();
  // params.id string gelir
  const id = params?.id as string; 
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'desc' | 'installment' | 'reviews'>('desc');

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
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  const [petData, setPetData] = useState({
    type: "kopek", otherType: "", name: "", breed: "", weight: "",
    birthDate: "", isNeutered: false, shippingDate: "1-5", allergies: [] as string[], allergyInput: ""
  });
  
  const [dateParts, setDateParts] = useState({ day: "", month: "", year: "" });
  const [isOtherOpen, setIsOtherOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        try {
            if (id) {
                const prodRes = await fetch(`${API_URL}/products/${id}`);
                if (prodRes.ok) { const data = await prodRes.json(); setProduct(data); }
            }
            const discRes = await fetch(`${API_URL}/discounts`);
            if (discRes.ok) { const discData = await discRes.json(); setDiscountRules(discData); }

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
                    if (pets.length > 0) setSelectedPetId(pets[0].id); else setIsNewPetMode(true);
                }
            } else { setIsNewPetMode(true); }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  useEffect(() => { if (duration === 1) setPaymentType('upfront'); }, [duration]);

  useEffect(() => {
    if (dateParts.day && dateParts.month && dateParts.year) {
        const monthIndex = MONTHS.indexOf(dateParts.month) + 1;
        const formattedMonth = monthIndex < 10 ? `0${monthIndex}` : monthIndex;
        const formattedDay = Number(dateParts.day) < 10 ? `0${dateParts.day}` : dateParts.day;
        setPetData(prev => ({ ...prev, birthDate: `${dateParts.year}-${formattedMonth}-${formattedDay}` }));
    }
  }, [dateParts]);

  const calculatePrice = (months: number) => {
    if (!product) return { total: 0, monthly: 0, discountRate: 0, originalTotal: 0 };
    const basePrice = Number(product.price);
    const originalTotal = basePrice * months;
    const rule = discountRules.find(d => d.durationMonths === months);
    const discountRate = rule ? Number(rule.discountPercentage) : 0;
    const total = originalTotal - (originalTotal * (discountRate / 100));
    return { total, monthly: total / months, discountRate, originalTotal };
  };

  const getOtherIcon = () => (petData.otherType && OTHER_ICONS[petData.otherType]) ? OTHER_ICONS[petData.otherType] : '🦜';

  const handleSelectSavedPet = (pet: Pet) => {
      setSelectedPetId(pet.id); setIsNewPetMode(false);
      setPetData({
          ...petData, name: pet.name, type: pet.type, breed: pet.breed || "", weight: pet.weight || "",
          isNeutered: pet.isNeutered || false, allergies: pet.allergies || []
      });
      if(pet.birthDate) {
          const d = new Date(pet.birthDate);
          if(!isNaN(d.getTime())) {
              setDateParts({ day: String(d.getDate()), month: MONTHS[d.getMonth()], year: String(d.getFullYear()) });
          }
      }
  };

  const handleAddAllergy = () => {
      if (petData.allergyInput.trim() && !petData.allergies.includes(petData.allergyInput.trim())) {
          setPetData({...petData, allergies: [...petData.allergies, petData.allergyInput.trim()], allergyInput: ""});
      }
  };
  const removeAllergy = (a: string) => { setPetData({...petData, allergies: petData.allergies.filter(x => x !== a)}); };

  const saveNewPet = async () => {
      const token = localStorage.getItem("token");
      if (!token) return true; 
      try {
          const res = await fetch(`${API_URL}/users/pets`, {
              method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify({ name: petData.name, type: petData.type === 'diger' ? petData.otherType : petData.type, breed: petData.breed, weight: petData.weight, birthDate: petData.birthDate, isNeutered: petData.isNeutered, allergies: petData.allergies }),
          });
          if (!res.ok) throw new Error("Kayıt başarısız");
          const newPet = await res.json();
          setSavedPets([...savedPets, newPet]); setSelectedPetId(newPet.id); setIsNewPetMode(false); return true;
      } catch (error) { toast.error("Dostun kaydedilirken bir hata oluştu."); return false; }
  };

  const handleAuthSuccess = async () => {
      setLoginOpen(false); setRegisterOpen(false);
      const token = localStorage.getItem("token");
      if (token) {
          setIsLoggedIn(true); toast.success("Giriş yapıldı! 🎉");
          try {
              fetch(`${API_URL}/auth/profile`, { headers: { "Authorization": `Bearer ${token}` } }).then(res => res.json()).then(data => setUserName(data.name));
              const petsRes = await fetch(`${API_URL}/users/pets`, { headers: { "Authorization": `Bearer ${token}` } });
              if (petsRes.ok) {
                  const data = await petsRes.json();
                  const pets = Array.isArray(data) ? data : (data.pets || []);
                  setSavedPets(pets);
                  if (pets.length > 0) { setSelectedPetId(pets[0].id); setIsNewPetMode(false); } else { setIsNewPetMode(true); }
              }
          } catch (e) {}
          if (step === 1) setStep(2);
      }
  };

  const handleNextStep = async () => {
      if (step === 1) {
          if (!localStorage.getItem("token") && duration > 1) { setShowUpsellModal(true); return; }
          setStep(2);
      } else if (step === 2) {
          if (isNewPetMode || savedPets.length === 0) {
              if (!petData.name || !petData.breed || !petData.weight) { toast.error("Bilgileri doldurmalısın."); return; }
          }
          if (localStorage.getItem("token") && isNewPetMode) { if (!(await saveNewPet())) return; }
          setStep(3); 
      } else {
          if (!product) return;
          const priceInfo = calculatePrice(duration);
          const finalPrice = paymentType === 'monthly' ? Number(product.price) : priceInfo.total;
          const safePetName = isNewPetMode ? petData.name : savedPets.find(p => p.id === selectedPetId)?.name;
          // ID'leri number'a cast etmeye çalışmıyoruz artık, backend ne verdiyse o.
          addToCart({ 
              productId: product.id as any, // Context number bekliyorsa any ile geçiyoruz (Context güncellenebilir)
              productName: product.name, 
              price: finalPrice, 
              image: product.image, 
              duration: duration, 
              paymentType: paymentType, 
              petId: selectedPetId || 0, 
              petName: safePetName || "", 
              deliveryPeriod: petData.shippingDate 
          });
          toast.success("Ödeme sayfasına yönlendiriliyorsunuz... 🚀"); setTimeout(() => router.push('/checkout'), 500);
      }
  };

  if (loading || !product) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Yükleniyor...</div>;
  const currentPriceInfo = calculatePrice(duration);

  // STYLES
  const inputStyle = "w-full p-4 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-green-500 transition shadow-sm placeholder:text-gray-400";
  const selectStyle = "w-full p-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-green-500 transition cursor-pointer shadow-sm";

  return (
    <main className="min-h-screen bg-[#f8f9fa] font-sans pb-10">
      <Toaster position="top-right" />
      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} onSwitchToRegister={() => {setLoginOpen(false); setRegisterOpen(true);}} onLoginSuccess={handleAuthSuccess} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} onSwitchToLogin={() => {setRegisterOpen(false); setLoginOpen(true);}} initialData={null} onRegisterSuccess={handleAuthSuccess} />
      <UpsellModal isOpen={showUpsellModal} onClose={() => {setShowUpsellModal(false); setDuration(1); setPaymentType('upfront'); setStep(2);}} onAccept={() => {setShowUpsellModal(false); setRegisterOpen(true);}} savingsAmount={currentPriceInfo.originalTotal - currentPriceInfo.total} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => router.back()} className="mb-6 text-gray-500 font-bold hover:text-green-600 transition">← Geri</button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-6">
                {/* ÜRÜN KARTI */}
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 text-center relative overflow-hidden">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">{product.name}</h1>
                    <div className="relative h-64 w-full mb-6 flex items-center justify-center">
                         {product.image ? (
                            <img 
                                src={product.image} 
                                alt={product.name}
                                className="object-contain w-full h-full rounded-xl" 
                            />
                         ) : (
                             <div className="text-8xl">🎁</div>
                         )}
                    </div>
                    <div className="text-5xl font-black text-gray-900 mb-1">₺{Number(product.price).toFixed(2)}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase">Aylık Standart Fiyat</div>
                </div>
            </div>

            <div className="lg:col-span-8">
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                    {/* STEPS */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center text-sm">
                        <span className={step>=1?"text-green-600 font-bold":"text-gray-400"}>1. Süre</span>
                        <span className={step>=2?"text-green-600 font-bold":"text-gray-400"}>2. Dostun</span>
                        <span className={step>=3?"text-green-600 font-bold":"text-gray-400"}>3. Özet</span>
                    </div>

                    <div className="p-6 md:p-10 flex-grow flex flex-col justify-center">
                        {step === 1 && (
                            <div className="animate-fade-in space-y-6">
                                <h2 className="text-2xl font-black text-gray-900">Abonelik Süresi 🗓️</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {[1, 3, 6, 9, 12].map((m) => {
                                        const info = calculatePrice(m);
                                        return (
                                            <button key={m} onClick={() => setDuration(m)} className={`p-4 rounded-2xl border-2 transition relative h-40 flex flex-col justify-between ${duration === m ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-200'}`}>
                                                {info.discountRate > 0 && <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] px-2 rounded-full">%{info.discountRate} İNDİRİM</span>}
                                                <div className="text-2xl font-black text-gray-900">{m}</div>
                                                <div className="text-xs font-bold text-gray-400">AYLIK</div>
                                                <div className="text-sm font-black text-green-700">₺{info.total.toFixed(0)}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="text-right"><button onClick={handleNextStep} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold">Devam Et 👉</button></div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-fade-in space-y-6">
                                <h2 className="text-2xl font-black text-gray-900">Bu Kutu Kimin İçin? 🐾</h2>
                                
                                {savedPets.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                        {savedPets.map(pet => (
                                            <div key={pet.id} onClick={() => handleSelectSavedPet(pet)} className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 ${selectedPetId === pet.id && !isNewPetMode ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}>
                                                <div className="text-2xl">{pet.type==='kopek'?'🐶':pet.type==='kedi'?'🐱':'🦜'}</div>
                                                <div><div className="font-bold text-gray-900">{pet.name}</div><div className="text-xs text-gray-500">{pet.breed}</div></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <button onClick={() => { setIsNewPetMode(true); setSelectedPetId(null); setPetData({ type: "kopek", otherType: "", name: "", breed: "", weight: "", birthDate: "", isNeutered: false, shippingDate: "1-5", allergies: [], allergyInput: "" }); setDateParts({day:"",month:"",year:""}); }} className={`w-full p-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-bold mb-6 ${isNewPetMode ? 'border-green-500 bg-green-50 text-green-700' : ''}`}>+ Yeni Ekle</button>
                                
                                {(isNewPetMode || savedPets.length === 0) && (
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <button onClick={() => {setPetData({...petData, type: 'kopek'}); setIsOtherOpen(false);}} className={`flex-1 py-3 rounded-xl font-bold border-2 ${petData.type==='kopek' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200'}`}>🐶 Köpek</button>
                                            <button onClick={() => {setPetData({...petData, type: 'kedi'}); setIsOtherOpen(false);}} className={`flex-1 py-3 rounded-xl font-bold border-2 ${petData.type==='kedi' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200'}`}>🐱 Kedi</button>
                                            <div className="relative flex-1">
                                                <button onClick={() => setIsOtherOpen(!isOtherOpen)} className={`w-full h-full py-3 rounded-xl font-bold border-2 flex items-center justify-center gap-1 ${(petData.type!=='kopek'&&petData.type!=='kedi')?'border-green-500 bg-green-50 text-green-800':'border-gray-200'}`}><span>{getOtherIcon()}</span> Diğer ▼</button>
                                                {isOtherOpen && (
                                                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl z-20 overflow-hidden">
                                                        {Object.keys(OTHER_ICONS).map(t => <button key={t} onClick={() => {setPetData({...petData, type: 'diger', otherType: t}); setIsOtherOpen(false);}} className="w-full text-left px-4 py-3 hover:bg-green-50 font-bold text-gray-700 border-b border-gray-50 flex gap-2"><span>{OTHER_ICONS[t]}</span> {t}</button>)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" value={petData.name} onChange={e => setPetData({...petData, name: e.target.value})} className={inputStyle} placeholder="İsim (Örn: Pamuk)" />
                                            <input type="text" value={petData.breed} onChange={e => setPetData({...petData, breed: e.target.value})} className={inputStyle} placeholder="Irk (Örn: Golden)" />
                                            
                                            <div className="grid grid-cols-3 gap-2">
                                                <select value={dateParts.day} onChange={e => setDateParts({...dateParts, day: e.target.value})} className={selectStyle}><option value="">Gün</option>{DAYS.map(d=><option key={d} value={d}>{d}</option>)}</select>
                                                <select value={dateParts.month} onChange={e => setDateParts({...dateParts, month: e.target.value})} className={selectStyle}><option value="">Ay</option>{MONTHS.map(m=><option key={m} value={m}>{m.substring(0,3)}</option>)}</select>
                                                <select value={dateParts.year} onChange={e => setDateParts({...dateParts, year: e.target.value})} className={selectStyle}><option value="">Yıl</option>{YEARS.map(y=><option key={y} value={y}>{y}</option>)}</select>
                                            </div>
                                            
                                            <input type="number" value={petData.weight} onChange={e => setPetData({...petData, weight: e.target.value})} className={inputStyle} placeholder="Kilo (kg)" />
                                        </div>

                                        <div className="flex gap-4">
                                            <label className={`flex-1 p-3 rounded-xl border-2 cursor-pointer flex items-center justify-center gap-2 transition shadow-sm ${petData.isNeutered ? 'border-green-600 bg-green-50 text-green-900 ring-1 ring-green-600' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                                                <input type="radio" checked={petData.isNeutered} onChange={() => setPetData({...petData, isNeutered: true})} className="hidden" />
                                                <span className="font-bold text-sm">✅ Kısırlaştırılmış</span>
                                            </label>
                                            <label className={`flex-1 p-3 rounded-xl border-2 cursor-pointer flex items-center justify-center gap-2 transition shadow-sm ${!petData.isNeutered ? 'border-red-400 bg-red-50 text-red-900 ring-1 ring-red-400' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                                                <input type="radio" checked={!petData.isNeutered} onChange={() => setPetData({...petData, isNeutered: false})} className="hidden" />
                                                <span className="font-bold text-sm">❌ Kısır Değil</span>
                                            </label>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Alerjiler</label>
                                            <div className="flex gap-2 mb-2">
                                                <input type="text" value={petData.allergyInput} onChange={e => setPetData({...petData, allergyInput: e.target.value})} className="flex-grow p-3 bg-white rounded-xl outline-none border border-gray-300 font-bold text-gray-900" placeholder="Örn: Tavuk..." onKeyDown={e => e.key==='Enter' && handleAddAllergy()} />
                                                <button onClick={handleAddAllergy} className="bg-green-600 text-white px-4 rounded-xl font-bold">Ekle</button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {petData.allergies.map((a, i) => (
                                                    <span key={i} className="bg-white border px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 text-gray-700">🚫 {a} <button onClick={() => removeAllergy(a)} className="text-red-500 font-black">×</button></span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between pt-6 border-t border-gray-100">
                                    <button onClick={() => setStep(1)} className="text-gray-400 font-bold">Geri</button>
                                    <button onClick={handleNextStep} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold">Sonraki 👉</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-fade-in text-center space-y-6">
                                <h2 className="text-2xl font-black text-gray-900">Özet 🎉</h2>
                                <div className="bg-gray-50 p-6 rounded-2xl text-left space-y-3">
                                    <div className="flex justify-between font-bold text-gray-900"><span>Paket</span><span>{product.name}</span></div>
                                    <div className="flex justify-between font-bold text-gray-900"><span>Süre</span><span>{duration} Ay</span></div>
                                    <div className="flex justify-between font-bold text-gray-900"><span>Dostun</span><span>{petData.name || (savedPets.find(p => p.id === selectedPetId)?.name)}</span></div>
                                </div>
                                
                                {duration > 1 && (
                                    <div className="flex gap-2">
                                        <button onClick={() => setPaymentType('monthly')} disabled={!isLoggedIn} className={`flex-1 py-3 rounded-xl font-bold border-2 ${paymentType === 'monthly' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200'}`}>Her Ay Öde</button>
                                        <button onClick={() => setPaymentType('upfront')} className={`flex-1 py-3 rounded-xl font-bold border-2 ${paymentType === 'upfront' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200'}`}>Tek Çekim</button>
                                    </div>
                                )}

                                <div className="text-3xl font-black text-green-600">₺{paymentType === 'monthly' ? Number(product.price).toFixed(2) : currentPriceInfo.total.toFixed(2)}</div>
                                <button onClick={handleNextStep} className="bg-green-600 text-white w-full py-4 rounded-xl font-bold shadow-lg">Ödemeye Geç 💳</button>
                                <button onClick={() => setStep(2)} className="text-gray-400 font-bold mt-4">Düzenle</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- SEKMELİ BÖLÜM: Kutu İçeriği / Taksit / Yorumlar --- */}
                <div className="mt-8 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-100">
                        <button onClick={() => setActiveTab('desc')} className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'desc' ? 'border-b-4 border-green-500 text-green-600 bg-green-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>📦 Kutu İçeriği</button>
                        {(duration > 1 && paymentType === 'upfront') && (
                            <button onClick={() => setActiveTab('installment')} className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'installment' ? 'border-b-4 border-green-500 text-green-600 bg-green-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>💳 Taksit Seçenekleri</button>
                        )}
                        <button onClick={() => setActiveTab('reviews')} className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'reviews' ? 'border-b-4 border-green-500 text-green-600 bg-green-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>⭐ Yorumlar</button>
                    </div>

                    <div className="p-8">
                        {activeTab === 'desc' && (
                            <div className="animate-fade-in space-y-4">
                                <h3 className="font-bold text-gray-900 text-xl mb-2">Paket Hakkında</h3>
                                <p className="text-gray-600 leading-relaxed font-medium">{product.description}</p>
                                
                                {product.features && product.features.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-bold text-gray-900 mb-3">Bu Kutuda Sizi Neler Bekliyor?</h4>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {product.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-700 text-sm font-medium">
                                                    <span className="text-green-500 font-bold">✓</span> {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'installment' && (
                            <div className="animate-fade-in">
                                <InstallmentTable price={currentPriceInfo.total} />
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="animate-fade-in">
                                <ReviewsSection productId={product.id} />
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