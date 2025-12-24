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

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin, initialData, onRegisterSuccess }: RegisterModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "",
    gender: "", userBirthDate: "", tcKimlikNo: "",
    petName: "", petType: "kopek", petBirthDate: "", petWeight: "",
    petBreed: "", petNeutered: "false", petAllergies: "", 
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
        }));
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.email || !formData.password || !formData.phone)) {
        toast.error("Zorunlu alanları doldurmalısın ✍️");
        return;
    }
    if (step === 2 && (!formData.petName || !formData.petBirthDate || !formData.petWeight)) {
        toast.error("Dostunun temel bilgilerini girmelisin 🐾");
        return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/auth/signup", {
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

  // 👇 TEK VE ORTAK STİL: Gri kutu, siyah yazı
  const inputStyle = "w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-black placeholder-gray-500 focus:bg-white focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition font-medium text-sm";
  const labelStyle = "block text-sm font-bold text-gray-800 mb-1 ml-1";

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-white rounded-3xl w-full max-w-2xl relative shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        {/* HEADER */}
        <div className="bg-gray-50 p-6 border-b border-gray-200 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl font-bold">&times;</button>
            <h2 className="text-xl font-black text-black">
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
            <form className="space-y-5">
                
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

                        <select name="gender" value={formData.gender} onChange={handleChange} className={`${inputStyle} bg-white`}>
                            <option value="">Cinsiyet Seçiniz</option>
                            <option value="Kadin">Kadın</option>
                            <option value="Erkek">Erkek</option>
                            <option value="BelirtmekIstemiyorum">Belirtmek İstemiyorum</option>
                        </select>
                        <input type="date" name="userBirthDate" value={formData.userBirthDate} onChange={handleChange} className={`${inputStyle} text-gray-500`} />
                        <input type="text" name="tcKimlikNo" value={formData.tcKimlikNo} onChange={handleChange} className={`col-span-2 ${inputStyle}`} placeholder="TC Kimlik No (Opsiyonel)" />
                    </div>
                )}

                {/* --- AŞAMA 2 --- */}
                {step === 2 && (
                    <div className="space-y-5">
                        <div className="flex gap-4 mb-4">
                             <label className={`flex-1 border-2 rounded-xl p-4 cursor-pointer text-center transition ${formData.petType==='kopek' ? 'border-green-500 bg-green-50 text-green-800 font-bold':'border-gray-200 bg-gray-50 text-gray-500'}`}>
                                <input type="radio" name="petType" value="kopek" checked={formData.petType==='kopek'} onChange={handleChange} className="hidden"/>🐶 Köpek
                             </label>
                             <label className={`flex-1 border-2 rounded-xl p-4 cursor-pointer text-center transition ${formData.petType==='kedi' ? 'border-green-500 bg-green-50 text-green-800 font-bold':'border-gray-200 bg-gray-50 text-gray-500'}`}>
                                <input type="radio" name="petType" value="kedi" checked={formData.petType==='kedi'} onChange={handleChange} className="hidden"/>🐱 Kedi
                             </label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" name="petName" value={formData.petName} onChange={handleChange} className={inputStyle} placeholder="Adı *" />
                            <input type="text" name="petBreed" value={formData.petBreed} onChange={handleChange} className={inputStyle} placeholder="Irkı" />
                            <input type="date" name="petBirthDate" value={formData.petBirthDate} onChange={handleChange} className={`${inputStyle} text-gray-500`} />
                            <input type="number" step="0.1" name="petWeight" value={formData.petWeight} onChange={handleChange} className={inputStyle} placeholder="Kilo (kg) *" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <select name="petNeutered" value={formData.petNeutered} onChange={handleChange} className={`${inputStyle} bg-white`}>
                                <option value="false">Kısırlaştırılmamış</option>
                                <option value="true">Kısırlaştırılmış</option>
                             </select>
                             <input type="text" name="petAllergies" value={formData.petAllergies} onChange={handleChange} className={inputStyle} placeholder="Alerjiler" />
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