"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}

const OTHER_ICONS: Record<string, string> = {
    'Kuş': '🦜', 'Hamster': '🐹', 'Tavşan': '🐰', 'Balık': '🐟'
};

export default function AddPetModal({ isOpen, onClose, onSuccess }: AddPetModalProps) {
  const [loading, setLoading] = useState(false);
  const [isOtherOpen, setIsOtherOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "", type: "kopek", breed: "", birthDate: "", weight: "", isNeutered: "false", allergies: ""
  });

  const getOtherIcon = () => OTHER_ICONS[formData.type] || '🦜';

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
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Ekleme başarısız");
      toast.success("Aramıza yeni bir dost katıldı! 🐾");
      onSuccess(); onClose();   
      setFormData({ name: "", type: "kopek", breed: "", birthDate: "", weight: "", isNeutered: "false", allergies: "" }); 
    } catch (err) { toast.error("Bir hata oluştu."); } finally { setLoading(false); }
  };

  const inputClass = "w-full p-3 md:p-4 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-900 font-bold outline-none focus:border-green-500 focus:bg-white transition placeholder:text-gray-400 text-sm md:text-base";

  return (
    <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-[2rem] w-full max-w-lg relative shadow-2xl p-6 md:p-8 animate-fade-in-up my-auto">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full transition">&times;</button>
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">🐾 Yeni Dost Ekle</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 👇 KESİN ÇÖZÜM: Grid Yapısı (3 Eşit Sütun) */}
            <div className="grid grid-cols-3 gap-2 mb-4 font-bold">
                {['kopek', 'kedi'].map((t) => (
                   <button key={t} type="button" onClick={() => { setFormData({...formData, type: t}); setIsOtherOpen(false); }}
                    className={`w-full h-14 rounded-xl border-2 transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-xs md:text-sm
                        ${formData.type===t ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                   >
                    <span className="text-lg md:text-xl">{t==='kopek' ? '🐶' : '🐱'}</span>
                    <span>{t==='kopek' ? 'Köpek' : 'Kedi'}</span>
                   </button> 
                ))}
                
                <div className="relative w-full">
                    <button type="button" onClick={() => setIsOtherOpen(!isOtherOpen)} 
                        className={`w-full h-14 px-2 md:px-3 rounded-xl border-2 transition flex items-center justify-between text-xs md:text-sm
                        ${!['kopek','kedi'].includes(formData.type) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                    >
                        <div className="flex items-center gap-1 md:gap-2 truncate">
                            <span className="text-lg md:text-xl">{!['kopek','kedi'].includes(formData.type) ? getOtherIcon() : '🦜'}</span>
                            <span className="truncate">{!['kopek','kedi'].includes(formData.type) ? formData.type : 'Diğer'}</span>
                        </div>
                        <span className="text-[10px]">▼</span>
                    </button>
                    
                    {isOtherOpen && (
                        <div className="absolute top-full right-0 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl z-20 overflow-hidden min-w-[120px]">
                            {Object.keys(OTHER_ICONS).map((t) => (
                                <button key={t} type="button" onClick={() => { setFormData({...formData, type: t}); setIsOtherOpen(false); }} 
                                    className="w-full text-left px-4 py-3 hover:bg-green-50 hover:text-green-700 font-bold text-gray-600 border-b border-gray-50 last:border-0 flex items-center gap-2 text-sm transition">
                                    <span className="text-xl">{OTHER_ICONS[t]}</span> {t}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="Adı *" />
                <input type="text" name="breed" value={formData.breed} onChange={handleChange} className={inputClass} placeholder="Irkı" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">Doğum Tarihi</label>
                    <input required type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className={`${inputClass} text-gray-500`} />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">Kilo (Kg)</label>
                    <input required type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} className={inputClass} placeholder="0.0" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select name="isNeutered" value={formData.isNeutered} onChange={handleChange} className={`${inputClass} bg-white`}>
                    <option value="false">Kısır Değil</option>
                    <option value="true">Kısırlaştırılmış</option>
                </select>
                <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} className={inputClass} placeholder="Alerjiler (Örn: Tavuk)" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition mt-4 shadow-lg shadow-green-200 text-lg">
                {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
        </form>
      </div>
    </div>
  );
}