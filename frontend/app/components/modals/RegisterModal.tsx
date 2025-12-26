"use client";
import { useState } from "react";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    petName: "",
    petType: "kopek",
    petAge: "",
    petWeight: "",
    address: "",
    city: "",
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.email || !formData.password)) {
      setError("Lütfen zorunlu alanları doldurun.");
      return;
    }
    if (step === 2 && (!formData.petName)) {
      setError("Dostunuzun adını yazmalısınız.");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const prevStep = () => {
    setError("");
    setStep(step - 1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("https://candostumbox-api.onrender.com/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            phone: formData.phone, // Telefonu da ekledik
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Hata oluştu.");

      alert("🎉 Kayıt Başarılı! Dostunuzla aramıza hoş geldiniz.");
      onSwitchToLogin();
      setStep(1);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 👇 ORTAK INPUT STİLİ (Hepsine bunu uygulayacağız)
  // 👇 DEĞİŞİKLİK: RegisterModal için de aynısı
 const inputStyle = "w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-gray-200 text-gray-900 focus:bg-white focus:border-green-600 focus:ring-0 outline-none transition placeholder-gray-500 font-bold";
 const labelStyle = "block text-sm font-bold text-gray-800 mb-1.5 ml-1";

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-white rounded-3xl w-full max-w-lg relative shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-white p-6 border-b border-gray-100 pb-4">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-3xl leading-none">&times;</button>
            
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {step === 1 && "👤 Hesap Oluştur"}
                {step === 2 && "🐾 Dostunu Tanıt"}
                {step === 3 && "📍 Teslimat Bilgileri"}
            </h2>
            
            <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-green-500 transition-all duration-500 ease-out"
                    style={{ width: `${(step / 3) * 100}%` }}
                ></div>
            </div>
        </div>

        {/* BODY */}
        <div className="p-8 overflow-y-auto">
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 flex items-center gap-2">⚠️ {error}</div>}

            <form onSubmit={handleRegister}>
                
                {/* --- AŞAMA 1 --- */}
                {step === 1 && (
                    <div className="space-y-5 animate-fade-in-up">
                        <div>
                            <label className={labelStyle}>Ad Soyad</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputStyle} placeholder="Örn: Doğuş Yılmaz" />
                        </div>
                        <div>
                            <label className={labelStyle}>E-posta</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputStyle} placeholder="ornek@email.com" />
                        </div>
                        <div>
                            <label className={labelStyle}>Telefon</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputStyle} placeholder="0555..." />
                        </div>
                        <div>
                            <label className={labelStyle}>Şifre</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputStyle} placeholder="••••••••" />
                        </div>
                    </div>
                )}

                {/* --- AŞAMA 2 --- */}
                {step === 2 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div>
                            <label className={labelStyle}>Dostunuzun Adı</label>
                            <input type="text" name="petName" value={formData.petName} onChange={handleChange} className={inputStyle} placeholder="Örn: Boncuk" />
                        </div>
                        
                        <div>
                            <label className={labelStyle}>Türü Nedir?</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 border-2 rounded-2xl p-4 cursor-pointer transition text-center ${formData.petType === 'kopek' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'}`}>
                                    <input type="radio" name="petType" value="kopek" checked={formData.petType === 'kopek'} onChange={handleChange} className="hidden" />
                                    <div className="text-3xl mb-1">🐶</div>
                                    <span className="font-bold text-sm">Köpek</span>
                                </label>
                                <label className={`flex-1 border-2 rounded-2xl p-4 cursor-pointer transition text-center ${formData.petType === 'kedi' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'}`}>
                                    <input type="radio" name="petType" value="kedi" checked={formData.petType === 'kedi'} onChange={handleChange} className="hidden" />
                                    <div className="text-3xl mb-1">🐱</div>
                                    <span className="font-bold text-sm">Kedi</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Yaşı</label>
                                <select name="petAge" value={formData.petAge} onChange={handleChange} className={inputStyle}>
                                    <option value="">Seçiniz</option>
                                    <option value="0-1">0-1 Yaş</option>
                                    <option value="1-3">1-3 Yaş</option>
                                    <option value="3-7">3-7 Yaş</option>
                                    <option value="7+">7+ Yaş</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>Kilosu</label>
                                <select name="petWeight" value={formData.petWeight} onChange={handleChange} className={inputStyle}>
                                    <option value="">Seçiniz</option>
                                    <option value="xs">0-5 kg</option>
                                    <option value="s">5-10 kg</option>
                                    <option value="m">10-25 kg</option>
                                    <option value="l">25 kg+</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- AŞAMA 3 --- */}
                {step === 3 && (
                    <div className="space-y-5 animate-fade-in-up">
                        <div>
                            <label className={labelStyle}>Şehir</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputStyle} placeholder="İstanbul" />
                        </div>
                        <div>
                            <label className={labelStyle}>Açık Adres</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} className={`${inputStyle} h-28 resize-none`} placeholder="Mahalle, Sokak, No..."></textarea>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-sm text-green-800 flex items-start gap-3">
                            <span className="text-xl">🌿</span>
                            <p className="font-medium">Sürdürülebilirlik onayını kabul ediyorum.</p>
                        </div>
                    </div>
                )}
            </form>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50">
            {step > 1 ? (
                <button onClick={prevStep} className="text-gray-600 font-bold hover:text-gray-900 px-4 py-2 transition">
                    ← Geri
                </button>
            ) : (
                <button onClick={onSwitchToLogin} className="text-green-600 font-bold hover:text-green-700 text-sm">
                    Zaten üye misin?
                </button>
            )}

            {step < 3 ? (
                <button onClick={nextStep} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg shadow-gray-200">
                    Devam Et
                </button>
            ) : (
                <button onClick={handleRegister} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200">
                    Tamamla 🎉
                </button>
            )}
        </div>
      </div>
    </div>
  );
}