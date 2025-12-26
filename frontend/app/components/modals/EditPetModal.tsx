"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface EditPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  petData: any; // Düzenlenecek hayvanın verisi
}

export default function EditPetModal({ isOpen, onClose, onSuccess, petData }: EditPetModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "kopek",
    breed: "",
    weight: "",
    birthDate: "",
    isNeutered: false,
    allergies: "",
  });

  // Modal açıldığında veya petData değiştiğinde formu doldur
  useEffect(() => {
    if (petData) {
      setFormData({
        name: petData.name || "",
        type: petData.type || "kopek",
        breed: petData.breed || "",
        weight: petData.weight || "",
        // Tarihi input formatına (YYYY-MM-DD) çevir
        birthDate: petData.birthDate ? new Date(petData.birthDate).toISOString().split('T')[0] : "",
        isNeutered: petData.isNeutered || false,
        // Alerji array'ini string'e çevir (virgülle ayrılmış)
        allergies: petData.allergies ? petData.allergies.join(", ") : "",
      });
    }
  }, [petData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    // Alerjileri array'e çevir
    const allergiesArray = formData.allergies.split(",").map(item => item.trim()).filter(item => item !== "");

    try {
      const res = await fetch(`https://candostumbox-api.onrender.com/users/pets/${petData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            ...formData,
            allergies: allergiesArray
        })
      });

      if (res.ok) {
        toast.success("Bilgiler güncellendi! 🐾");
        onSuccess();
        onClose();
      } else {
        toast.error("Güncelleme başarısız.");
      }
    } catch (error) {
      toast.error("Bir hata oluştu.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">✕</button>
        
        <h2 className="text-2xl font-black text-gray-900 mb-1">Dostunu Düzenle</h2>
        <p className="text-gray-500 text-sm mb-6">Bilgileri güncelleyerek ona en uygun kutuyu seçmemize yardım et.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Tür Seçimi */}
            <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setFormData({...formData, type: 'kopek'})} className={`p-4 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition ${formData.type === 'kopek' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}>
                    🐶 Köpek
                </button>
                <button type="button" onClick={() => setFormData({...formData, type: 'kedi'})} className={`p-4 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition ${formData.type === 'kedi' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}>
                    🐱 Kedi
                </button>
            </div>

            {/* İsim & Irk */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">İsim</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 text-gray-800 font-bold" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Irk</label>
                    <input type="text" value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 text-gray-800" />
                </div>
            </div>

            {/* Kilo & Doğum Tarihi */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kilo (kg)</label>
                    <input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 text-gray-800" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Doğum Tarihi</label>
                    <input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 text-gray-800" />
                </div>
            </div>

            {/* Kısırlaştırma Durumu */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <input 
                    type="checkbox" 
                    id="isNeutered" 
                    checked={formData.isNeutered} 
                    onChange={e => setFormData({...formData, isNeutered: e.target.checked})} 
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500 accent-green-600" 
                />
                <label htmlFor="isNeutered" className="text-sm font-bold text-gray-700 cursor-pointer">Kısırlaştırılmış</label>
            </div>

            {/* Alerjiler */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alerjiler (Opsiyonel)</label>
                <input 
                    type="text" 
                    value={formData.allergies} 
                    onChange={e => setFormData({...formData, allergies: e.target.value})} 
                    placeholder="Örn: Tavuk, Tahıl (Virgülle ayırın)" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 text-gray-800" 
                />
            </div>

            <button type="submit" className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition transform active:scale-95">
                Kaydet
            </button>
        </form>
      </div>
    </div>
  );
}