"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  initialData?: any;
  onRegisterSuccess: () => void;
}

const OTHER_ICONS: Record<string, string> = {
    'Kuş': '🦜', 'Hamster': '🐹', 'Tavşan': '🐰', 'Balık': '🐟'
};
const MONTHS = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];
const CURRENT_YEAR = new Date().getFullYear();
const USER_YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i); 
const PET_YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);   
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin, initialData, onRegisterSuccess }: RegisterModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isOtherOpen, setIsOtherOpen] = useState(false);
  
  const [allergyInput, setAllergyInput] = useState("");
  const [userDate, setUserDate] = useState({ day: "", month: "", year: "" });
  const [petDate, setPetDate] = useState({ day: "", month: "", year: "" });
  
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "",
    gender: "", userBirthDate: "", tcKimlikNo: "",
    petName: "", petType: "kopek", petBirthDate: "",  
    petWeight: "", petBreed: "", 
    petNeutered: "false", // Radio button için string olarak tutuyoruz ("true"/"false")
    petAllergies: [] as string[], 
    addrTitle: "Ev", addrCity: "", addrDistrict: "", addrNeighborhood: "", 
    addrStreet: "", addrBuilding: "", addrFloor: "", addrApartment: ""
  });

  useEffect(() => {
    if (initialData) {
        setFormData(prev => ({
            ...prev,
            petName: initialData.petName || "",
            petType: initialData.petType || "kopek",
            petBirthDate: initialData.petBirthDate || "",
            petWeight: initialData.petWeight || "",
            petBreed: initialData.petBreed || "",
            petNeutered: initialData.petNeutered || "false",
            petAllergies: Array.isArray(initialData.allergies) ? initialData.allergies : [],
        }));
        
        if (initialData.petBirthDate) {
            const d = new Date(initialData.petBirthDate);
            if(!isNaN(d.getTime())) {
                setPetDate({
                    day: String(d.getDate()),
                    month: MONTHS[d.getMonth()],
                    year: String(d.getFullYear())
                });
            }
        }
    }
  }, [initialData, isOpen]);

  const updateDate = (type: 'user' | 'pet', part: 'day' | 'month' | 'year', value: string) => {
      const stateSetter = type === 'user' ? setUserDate : setPetDate;
      const currentState = type === 'user' ? userDate : petDate;
      
      const newState = { ...currentState, [part]: value };
      stateSetter(newState);

      if (newState.day && newState.month && newState.year) {
          const monthIndex = MONTHS.indexOf(newState.month) + 1;
          const formattedMonth = monthIndex < 10 ? `0${monthIndex}` : monthIndex;
          const formattedDay = Number(newState.day) < 10 ? `0${newState.day}` : newState.day;
          const dateString = `${newState.year}-${formattedMonth}-${formattedDay}`;
          
          setFormData(prev => ({
              ...prev,
              [type === 'user' ? 'userBirthDate' : 'petBirthDate']: dateString
          }));
      }
  };

  const handleAddAllergy = () => {
      if (allergyInput.trim() && !formData.petAllergies.includes(allergyInput.trim())) {
          setFormData({
              ...formData,
              petAllergies: [...formData.petAllergies, allergyInput.trim()]
          });
          setAllergyInput("");
      }
  };

  const removeAllergy = (tag: string) => {
      setFormData({
          ...formData,
          petAllergies: formData.petAllergies.filter(t => t !== tag)
      });
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getOtherIcon = () => OTHER_ICONS[formData.petType] || '🦜';

  const nextStep = () => {
    if (step === 1) {
        if (!formData.name || !formData.email || !formData.password || !formData.phone) {
            toast.error("Zorunlu alanları doldurmalısın ✍️");
            return;
        }
        if (!isValidEmail(formData.email)) {
            toast.error("Lütfen geçerli bir e-posta adresi girin 📧");
            return;
        }
    }
    if (step === 2 && (!formData.petName || !formData.petBirthDate || !formData.petWeight)) {
        toast.error("Dostunun temel bilgilerini (Ad, Tarih, Kilo) girmelisin 🐾");
        return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://candostumbox-api.onrender.com/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Hata oluştu 😔");
      } else {
        toast.success("Kayıt başarılı! Yönlendiriliyorsunuz... 🚀");
        if (data.access_token) {
            localStorage.setItem("token", data.access_token);
            setTimeout(() => { onRegisterSuccess(); onClose(); setStep(1); }, 1000);
        } else {
            setTimeout(() => { onSwitchToLogin(); setStep(1); }, 1500);
        }
      }
    } catch (err) {
      toast.error("Sunucu hatası ⚠️");
    } finally {
      setLoading(false);
    }
  };

  // STYLE CONSTANTS
  const inputStyle = "w-full px-4 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition font-medium text-sm shadow-sm";
  const selectStyle = "w-full px-2 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm font-bold outline-none cursor-pointer focus:border-green-600 shadow-sm";

  return (
    <div className="fixed inset-0 bg-black/70 z-[999] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl relative shadow-2xl z-10 flex flex-col my-auto animate-fade-in-up">
        
        {/* HEADER */}
        <div className="bg-white p-6 border-b border-gray-100 relative rounded-t-3xl">
            <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-black text-2xl font-bold p-2">✕</button>
            <h2 className="text-xl font-black text-gray-900">
                {step === 1 && "👤 Senin Bilgilerin"}
                {step === 2 && "🐾 Dostunun Detayları"}
                {step === 3 && "📍 Adres Detayları"}
            </h2>
            <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
        </div>

        {/* BODY */}
        <div className="p-6 md:p-8">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                
                {/* --- AŞAMA 1 --- */}
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {initialData && (
                            <div className="md:col-span-2 bg-green-50 text-green-800 p-3 rounded-xl text-sm font-bold border border-green-200 text-center">
                                ✨ {formData.petName} için harika bir kutu hazırladık!
                            </div>
                        )}
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className={`md:col-span-2 ${inputStyle}`} placeholder="Ad Soyad *" />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={`md:col-span-2 ${inputStyle}`} placeholder="E-posta *" />
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputStyle} placeholder="Şifre *" />
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputStyle} placeholder="Telefon *" />
                        
                        <div className="md:col-span-2 border-t border-gray-100 my-2"></div>
                        <p className="md:col-span-2 text-xs text-gray-500 font-bold uppercase tracking-wider">Opsiyonel Bilgiler</p>

                        <div className="md:col-span-1">
                            <select name="gender" value={formData.gender} onChange={handleChange} className={`${inputStyle} appearance-none cursor-pointer`}>
                                <option value="">Cinsiyet Seçiniz</option>
                                <option value="Kadin">Kadın</option>
                                <option value="Erkek">Erkek</option>
                                <option value="BelirtmekIstemiyorum">Belirtmek İstemiyorum</option>
                            </select>
                        </div>
                        
                        {/* KULLANICI DOĞUM TARİHİ */}
                        <div className="md:col-span-1 space-y-1">
                            <div className="grid grid-cols-3 gap-2">
                                <select value={userDate.day} onChange={e => updateDate('user', 'day', e.target.value)} className={selectStyle}><option value="">Gün</option>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                <select value={userDate.month} onChange={e => updateDate('user', 'month', e.target.value)} className={selectStyle}><option value="">Ay</option>{MONTHS.map(m => <option key={m} value={m}>{m.substring(0,3)}</option>)}</select>
                                <select value={userDate.year} onChange={e => updateDate('user', 'year', e.target.value)} className={selectStyle}><option value="">Yıl</option>{USER_YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
                            </div>
                        </div>

                        <input type="text" name="tcKimlikNo" value={formData.tcKimlikNo} onChange={handleChange} className={`md:col-span-2 ${inputStyle}`} placeholder="TC Kimlik No (Opsiyonel)" />
                    </div>
                )}

                {/* --- AŞAMA 2 --- */}
                {step === 2 && (
                    <div className="space-y-6">
                        {/* TÜR SEÇİMİ */}
                        <div className="flex gap-3">
                             <button type="button" onClick={() => { setFormData({...formData, petType: 'kopek'}); setIsOtherOpen(false); }} className={`flex-1 py-3.5 rounded-xl font-bold border-2 transition ${formData.petType==='kopek' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>🐶 Köpek</button>
                             <button type="button" onClick={() => { setFormData({...formData, petType: 'kedi'}); setIsOtherOpen(false); }} className={`flex-1 py-3.5 rounded-xl font-bold border-2 transition ${formData.petType==='kedi' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>🐱 Kedi</button>
                             <div className="relative flex-1">
                                <button type="button" onClick={() => setIsOtherOpen(!isOtherOpen)} className={`w-full h-full py-3.5 rounded-xl font-bold border-2 transition flex items-center justify-center gap-1 text-gray-900 ${(formData.petType !== 'kopek' && formData.petType !== 'kedi') ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
                                    <span>{(formData.petType !== 'kopek' && formData.petType !== 'kedi') ? getOtherIcon() : '🦜'}</span> Diğer ▼
                                </button>
                                {isOtherOpen && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl z-20 overflow-hidden">
                                        {Object.keys(OTHER_ICONS).map((t) => (
                                            <button key={t} type="button" onClick={() => { setFormData({...formData, petType: t}); setIsOtherOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-green-50 hover:text-green-700 font-medium text-gray-900 transition border-b border-gray-50 last:border-0 flex items-center gap-2"><span>{OTHER_ICONS[t]}</span> {t}</button>
                                        ))}
                                    </div>
                                )}
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="petName" value={formData.petName} onChange={handleChange} className={inputStyle} placeholder="Dostunun Adı *" />
                            <input type="text" name="petBreed" value={formData.petBreed} onChange={handleChange} className={inputStyle} placeholder="Irkı (Örn: Golden)" />
                            
                            {/* PET DOĞUM TARİHİ */}
                            <div className="grid grid-cols-3 gap-2">
                                <select value={petDate.day} onChange={e => updateDate('pet', 'day', e.target.value)} className={selectStyle}><option value="">Gün</option>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                <select value={petDate.month} onChange={e => updateDate('pet', 'month', e.target.value)} className={selectStyle}><option value="">Ay</option>{MONTHS.map(m => <option key={m} value={m}>{m.substring(0,3)}</option>)}</select>
                                <select value={petDate.year} onChange={e => updateDate('pet', 'year', e.target.value)} className={selectStyle}><option value="">Yıl</option>{PET_YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
                            </div>
                            
                            <input type="number" step="0.1" name="petWeight" value={formData.petWeight} onChange={handleChange} className={inputStyle} placeholder="Kilosu (kg) *" />
                        </div>

                        {/* KISIRLAŞTIRMA (RADIO BUTTONS) */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-2">Kısırlaştırma Durumu</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${formData.petNeutered === 'true' ? 'border-green-500 bg-green-50 text-green-900' : 'border-gray-200 bg-white text-gray-500'}`}>
                                    <input type="radio" name="petNeutered" value="true" checked={formData.petNeutered === 'true'} onChange={handleChange} className="hidden" />
                                    <span className="font-bold text-sm">✅ Evet</span>
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${formData.petNeutered === 'false' ? 'border-red-400 bg-red-50 text-red-900' : 'border-gray-200 bg-white text-gray-500'}`}>
                                    <input type="radio" name="petNeutered" value="false" checked={formData.petNeutered === 'false'} onChange={handleChange} className="hidden" />
                                    <span className="font-bold text-sm">❌ Hayır</span>
                                </label>
                            </div>
                        </div>

                        {/* ALERJİLER */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Alerjiler (Varsa)</label>
                            <div className="flex gap-2 mb-3">
                                <input type="text" value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)} className="flex-grow p-3 bg-white rounded-xl text-sm font-medium outline-none border border-gray-300 text-gray-900 focus:border-green-500" placeholder="Örn: Tavuk, Tahıl..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())} />
                                <button type="button" onClick={handleAddAllergy} className="bg-green-600 text-white px-4 rounded-xl text-sm font-bold hover:bg-green-700">Ekle</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.petAllergies.length > 0 ? (
                                    formData.petAllergies.map((allergy, index) => (
                                        <span key={index} className="bg-white border border-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
                                            🚫 {allergy} <button type="button" onClick={() => removeAllergy(allergy)} className="text-red-500 hover:text-red-700 font-black">×</button>
                                        </span>
                                    ))
                                ) : <span className="text-xs text-gray-400 italic">Henüz alerji eklenmedi.</span>}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- AŞAMA 3 --- */}
                {step === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="addrTitle" value={formData.addrTitle} onChange={handleChange} className={inputStyle} placeholder="Adres Başlığı (Ev, İş)" />
                        <input type="text" name="addrCity" value={formData.addrCity} onChange={handleChange} className={inputStyle} placeholder="Şehir *" />
                        <input type="text" name="addrDistrict" value={formData.addrDistrict} onChange={handleChange} className={inputStyle} placeholder="İlçe *" />
                        <input type="text" name="addrNeighborhood" value={formData.addrNeighborhood} onChange={handleChange} className={inputStyle} placeholder="Mahalle *" />
                        <input type="text" name="addrStreet" value={formData.addrStreet} onChange={handleChange} className={`md:col-span-2 ${inputStyle}`} placeholder="Cadde / Sokak *" />
                        <div className="md:col-span-2 grid grid-cols-3 gap-2">
                            <input type="text" name="addrBuilding" value={formData.addrBuilding} onChange={handleChange} className={inputStyle} placeholder="Bina No" />
                            <input type="text" name="addrFloor" value={formData.addrFloor} onChange={handleChange} className={inputStyle} placeholder="Kat" />
                            <input type="text" name="addrApartment" value={formData.addrApartment} onChange={handleChange} className={inputStyle} placeholder="Daire No" />
                        </div>
                    </div>
                )}
            </form>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 flex justify-between bg-white rounded-b-3xl">
            {step > 1 ? <button onClick={prevStep} className="text-gray-500 font-bold hover:text-black transition">← Geri</button> : <button onClick={onSwitchToLogin} className="text-green-600 font-bold text-sm hover:underline">Zaten üye misin?</button>}
            
            {step < 3 ? (
                <button onClick={nextStep} className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black transition shadow-lg">Devam Et →</button>
            ) : ( 
                <button onClick={handleRegister} disabled={loading} className="bg-green-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-green-700 transition flex gap-2 shadow-lg shadow-green-200">
                    {loading && <span className="animate-spin">↻</span>} Tamamla & Kayıt Ol
                </button>
            )}
        </div>
      </div>
    </div>
  );
}