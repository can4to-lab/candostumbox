"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}

// 1. İKON LİSTESİ
const OTHER_ICONS: Record<string, string> = {
    'Kuş': '🦜',
    'Hamster': '🐹',
    'Tavşan': '🐰',
    'Balık': '🐟'
};

export default function AddPetModal({ isOpen, onClose, onSuccess }: AddPetModalProps) {
  const [loading, setLoading] = useState(false);
  const [isOtherOpen, setIsOtherOpen] = useState(false); // 2. DROPDOWN STATE

  const [formData, setFormData] = useState({
    name: "",
    type: "kopek",
    breed: "",
    birthDate: "",
    weight: "",
    isNeutered: "false",
    allergies: ""
  });

  // 3. YARDIMCI FONKSİYON
  const getOtherIcon = () => {
      if (OTHER_ICONS[formData.type]) {
          return OTHER_ICONS[formData.type];
      }
      return '🦜'; 
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://candostumbox-api.onrender.com/users/pets", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Ekleme başarısız");
      
      toast.success("Aramıza yeni bir dost katıldı! 🐾");
      onSuccess(); 
      onClose();   
      setFormData({ name: "", type: "kopek", breed: "", birthDate: "", weight: "", isNeutered: "false", allergies: "" }); 

    } catch (err) {
      toast.error("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-3xl w-full max-w-lg relative shadow-2xl p-8 animate-fade-in-up">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">🐾 Yeni Dost Ekle</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 4. GÜNCELLENEN TÜR SEÇİMİ */}
            <div className="flex gap-4 mb-4">
                {/* KÖPEK */}
                <button 
                    type="button"
                    onClick={() => { setFormData({...formData, type: 'kopek'}); setIsOtherOpen(false); }}
                    className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${formData.type==='kopek' ? 'border-green-500 bg-green-50 text-green-700':'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                    🐶 Köpek
                </button>

                {/* KEDİ */}
                <button 
                    type="button"
                    onClick={() => { setFormData({...formData, type: 'kedi'}); setIsOtherOpen(false); }}
                    className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${formData.type==='kedi' ? 'border-green-500 bg-green-50 text-green-700':'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                    🐱 Kedi
                </button>

                {/* DİĞER (DROPDOWN) */}
                <div className="relative flex-1">
                    <button 
                        type="button"
                        onClick={() => setIsOtherOpen(!isOtherOpen)} 
                        className={`w-full h-full py-3 rounded-xl font-bold border-2 transition flex items-center justify-center gap-2 ${
                            (formData.type !== 'kopek' && formData.type !== 'kedi') 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                    >
                        <span>{(formData.type !== 'kopek' && formData.type !== 'kedi') ? getOtherIcon() : '🦜'}</span> Diğer ▼
                    </button>
                    
                    {isOtherOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl z-20 overflow-hidden animate-fade-in">
                            {Object.keys(OTHER_ICONS).map((t) => (
                                <button 
                                    key={t} 
                                    type="button"
                                    onClick={() => {
                                        setFormData({...formData, type: t}); 
                                        setIsOtherOpen(false);
                                    }} 
                                    className="w-full text-left px-4 py-3 hover:bg-green-50 hover:text-green-700 font-medium text-gray-600 transition border-b border-gray-50 last:border-0 flex items-center gap-2"
                                >
                                    <span>{OTHER_ICONS[t]}</span> {t}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Adı *" />
                <input type="text" name="breed" value={formData.breed} onChange={handleChange} className="input-field" placeholder="Irkı" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">Doğum Tarihi</label>
                    <input required type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="input-field text-gray-800" />
                </div>
                <div className="relative">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">Kilo (Kg)</label>
                    <input required type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} className="input-field" placeholder="0.0" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <select name="isNeutered" value={formData.isNeutered} onChange={handleChange} className="input-field bg-white text-gray-800">
                    <option value="false">Kısırlaştırılmamış</option>
                    <option value="true">Kısırlaştırılmış</option>
                </select>
                <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} className="input-field" placeholder="Alerjiler (Örn: Tavuk)" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition mt-4 shadow-lg shadow-green-200">
                {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
        </form>
      </div>
      
      <style jsx>{`
        .input-field {
            width: 100%;
            padding: 0.8rem 1rem;
            border-radius: 0.75rem;
            border: 2px solid #f3f4f6;
            background-color: #ffffff;
            color: #111827;
            font-weight: 500;
            outline: none;
            transition: all 0.2s;
        }
        .input-field:focus {
            border-color: #22c55e;
            background-color: #ffffff;
            box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
        }
        .input-field::placeholder {
            color: #9ca3af;
        }
      `}</style>
    </div>
  );
}