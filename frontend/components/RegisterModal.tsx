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

// 1. SABİTLER
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
    gender: "", 
    userBirthDate: "", 
    tcKimlikNo: "",
    petName: "", petType: "kopek", 
    petBirthDate: "",  
    petWeight: "",
    petBreed: "", petNeutered: "false", 
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
        if (formData.password.length < 6) {
            toast.error("Şifreniz en az 6 karakter olmalıdır 🔒");
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
            setTimeout(() => {
                onRegisterSuccess();
                onClose();
                setStep(1);
            }, 1000);
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

  // 👇 GÜNCELLENDİ: "text-gray-900" eklenerek yazı rengi siyah yapıldı.
  const inputStyle = "w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition font-medium text-sm";
  
  const selectStyle = "px-1 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 text-sm font-bold outline-none cursor-pointer focus:bg-white focus:border-green-600";

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-white rounded-3xl w-full max-w-2xl relative shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        {/* HEADER */}
        <div className="bg-gray-50 p-6 border-b border-gray-200 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl font-bold">&times;</button>
            <h2 className="text-xl font-black text-gray-900">
                {step === 1 && "👤 Senin Bilgilerin"}
                {step === 2 && "🐾 Dostunun Detayları"}
                {step === 3 && "📍 Adres Detayları"}
            </h2>
            <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
        </div>

        {/* BODY */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                
                {/* --- AŞAMA 1 --- */}
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {initialData && (
                            <div className="col-span-2 bg-green-100 text-green-800 p-3 rounded-xl text-sm font-bold border border-green-200 text-center mb-2">
                                ✨ {formData.petName} için harika bir kutu hazırladık!
                            </div>
                        )}
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className={`col-span-2 ${inputStyle}`} placeholder="Ad Soyad *" />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={`col-span-2 ${inputStyle}`} placeholder="E-posta *" />
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputStyle} placeholder="Şifre *" />
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputStyle} placeholder="Telefon *" />
                        
                        <div className="col-span-2 border-t border-gray-100 my-2"></div>
                        <p className="col-span-2 text-xs text-gray-500 font-bold uppercase tracking-wider">Opsiyonel Bilgiler</p>

                        <select name="gender" value={formData.gender} onChange={handleChange} className={`${inputStyle} bg-white text-gray-900`}>
                            <option value="">Cinsiyet Seçiniz</option>
                            <option value="Kadin">Kadın</option>
                            <option value="Erkek">Erkek</option>
                            <option value="BelirtmekIstemiyorum">Belirtmek İstemiyorum</option>
                        </select>
                        
                        {/* KULLANICI DOĞUM TARİHİ */}
                        <div className="col-span-1 space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Doğum Tarihiniz</label>
                            <div className="grid grid-cols-3 gap-1">
                                <select value={userDate.day} onChange={e => updateDate('user', 'day', e.target.value)} className={selectStyle}>
                                    <option value="">Gün</option>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <select value={userDate.month} onChange={e => updateDate('user', 'month', e.target.value)} className={selectStyle}>
                                    <option value="">Ay</option>{MONTHS.map(m => <option key={m} value={m}>{m.substring(0,3)}</option>)}
                                </select>
                                <select value={userDate.year} onChange={e => updateDate('user', 'year', e.target.value)} className={selectStyle}>
                                    <option value="">Yıl</option>{USER_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        <input type="text" name="tcKimlikNo" value={formData.tcKimlikNo} onChange={handleChange} className={`col-span-2 ${inputStyle}`} placeholder="TC Kimlik No (Opsiyonel)" />
                    </div>
                )}

                {/* --- AŞAMA 2 --- */}
                {step === 2 && (
                    <div className="space-y-5">
                        
                        {/* TÜR SEÇİMİ */}
                        <div className="flex gap-4 mb-4">
                             <button type="button" onClick={() => { setFormData({...formData, petType: 'kopek'}); setIsOtherOpen(false); }} className={`flex-1 py-4 rounded-xl font-bold border-2 transition ${formData.petType==='kopek' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>🐶 Köpek</button>
                             <button type="button" onClick={() => { setFormData({...formData, petType: 'kedi'}); setIsOtherOpen(false); }} className={`flex-1 py-4 rounded-xl font-bold border-2 transition ${formData.petType==='kedi' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>🐱 Kedi</button>
                             <div className="relative flex-1">
                                <button type="button" onClick={() => setIsOtherOpen(!isOtherOpen)} className={`w-full h-full py-4 rounded-xl font-bold border-2 transition flex items-center justify-center gap-2 text-gray-900 ${(formData.petType !== 'kopek' && formData.petType !== 'kedi') ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                    <span>{(formData.petType !== 'kopek' && formData.petType !== 'kedi') ? getOtherIcon() : '🦜'}</span> Diğer ▼
                                </button>
                                {isOtherOpen && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl z-20 overflow-hidden animate-fade-in">
                                        {Object.keys(OTHER_ICONS).map((t) => (
                                            <button key={t} type="button" onClick={() => { setFormData({...formData, petType: t}); setIsOtherOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-green-50 hover:text-green-700 font-medium text-gray-600 transition border-b border-gray-50 last:border-0 flex items-center gap-2"><span>{OTHER_ICONS[t]}</span> {t}</button>
                                        ))}
                                    </div>
                                )}
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" name="petName" value={formData.petName} onChange={handleChange} className={inputStyle} placeholder="Adı *" />
                            <input type="text" name="petBreed" value={formData.petBreed} onChange={handleChange} className={inputStyle} placeholder="Irkı" />
                            
                            {/* PET DOĞUM TARİHİ */}
                            <div className="col-span-1 space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Doğum Tarihi *</label>
                                <div className="grid grid-cols-3 gap-1">
                                    <select value={petDate.day} onChange={e => updateDate('pet', 'day', e.target.value)} className={selectStyle}>
                                        <option value="">Gün</option>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <select value={petDate.month} onChange={e => updateDate('pet', 'month', e.target.value)} className={selectStyle}>
                                        <option value="">Ay</option>{MONTHS.map(m => <option key={m} value={m}>{m.substring(0,3)}</option>)}
                                    </select>
                                    <select value={petDate.year} onChange={e => updateDate('pet', 'year', e.target.value)} className={selectStyle}>
                                        <option value="">Yıl</option>{PET_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <input type="number" step="0.1" name="petWeight" value={formData.petWeight} onChange={handleChange} className={inputStyle} placeholder="Kilo (kg) *" />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                             {/* 👇 YENİ CHECKBOX KISMI (MODAL) */}
                             <label className="flex items-center gap-3 px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.petNeutered === "true"}
                                    onChange={(e) => setFormData({...formData, petNeutered: e.target.checked ? "true" : "false"})}
                                    className="w-5 h-5 accent-green-600 rounded"
                                />
                                <span className="font-medium text-gray-900 text-sm">
                                    {formData.petNeutered === "true" ? "✅ Kısırlaştırılmış" : "❌ Kısırlaştırılmamış"}
                                </span>
                             </label>
                             
                             {/* ALERJİLER */}
                             <div className="bg-gray-100 p-3 rounded-xl border border-gray-300">
                                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 block mb-2">Alerjiler</label>
                                <div className="flex gap-2 mb-2">
                                    <input 
                                        type="text" 
                                        value={allergyInput} 
                                        onChange={(e) => setAllergyInput(e.target.value)} 
                                        className="flex-grow p-2 bg-white rounded-lg text-sm font-medium outline-none border border-gray-200 text-gray-900"
                                        placeholder="Örn: Tavuk, Tahıl..."
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                                    />
                                    <button type="button" onClick={handleAddAllergy} className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-700">Ekle +</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.petAllergies.length > 0 ? (
                                        formData.petAllergies.map((allergy, index) => (
                                            <span key={index} className="bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                                🚫 {allergy}
                                                <button type="button" onClick={() => removeAllergy(allergy)} className="text-red-400 hover:text-red-600 font-black ml-1">×</button>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 italic pl-1">Alerji yok.</span>
                                    )}
                                </div>
                             </div>
                        </div>
                    </div>
                )}

                {/* --- AŞAMA 3 --- */}
                {step === 3 && (
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="addrTitle" value={formData.addrTitle} onChange={handleChange} className={inputStyle} placeholder="Adres Başlığı (Ev)" />
                        <input type="text" name="addrCity" value={formData.addrCity} onChange={handleChange} className={inputStyle} placeholder="Şehir *" />
                        <input type="text" name="addrDistrict" value={formData.addrDistrict} onChange={handleChange} className={inputStyle} placeholder="İlçe *" />
                        <input type="text" name="addrNeighborhood" value={formData.addrNeighborhood} onChange={handleChange} className={inputStyle} placeholder="Mahalle *" />
                        <input type="text" name="addrStreet" value={formData.addrStreet} onChange={handleChange} className={`col-span-2 ${inputStyle}`} placeholder="Cadde / Sokak *" />
                        <div className="grid grid-cols-3 gap-2 col-span-2">
                            <input type="text" name="addrBuilding" value={formData.addrBuilding} onChange={handleChange} className={inputStyle} placeholder="Bina No" />
                            <input type="text" name="addrFloor" value={formData.addrFloor} onChange={handleChange} className={inputStyle} placeholder="Kat" />
                            <input type="text" name="addrApartment" value={formData.addrApartment} onChange={handleChange} className={inputStyle} placeholder="Daire No" />
                        </div>
                    </div>
                )}
            </form>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-200 flex justify-between bg-gray-50">
            {step > 1 ? <button onClick={prevStep} className="text-gray-600 font-bold hover:text-black">← Geri</button> : <button onClick={onSwitchToLogin} className="text-green-600 font-bold text-sm hover:underline">Zaten üye misin?</button>}
            
            {step < 3 ? (
                <button onClick={nextStep} className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg">Devam Et →</button>
            ) : ( 
                <button onClick={handleRegister} disabled={loading} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition flex gap-2 shadow-lg shadow-green-200">
                    {loading && <span className="animate-spin">↻</span>} Tamamla & Kayıt Ol
                </button>
            )}
        </div>
      </div>
    </div>
  );
}