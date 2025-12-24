"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}

export default function AddPetModal({ isOpen, onClose, onSuccess }: AddPetModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "kopek",
    breed: "",
    birthDate: "",
    weight: "",
    isNeutered: "false",
    allergies: ""
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/users/pets", {
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
            {/* Tür Seçimi */}
            <div className="flex gap-4 mb-4">
                <label className={`flex-1 border-2 rounded-xl p-3 cursor-pointer text-center transition ${formData.type==='kopek' ? 'border-green-500 bg-green-50 text-green-700':'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <input type="radio" name="type" value="kopek" checked={formData.type==='kopek'} onChange={handleChange} className="hidden"/>🐶 Köpek
                </label>
                <label className={`flex-1 border-2 rounded-xl p-3 cursor-pointer text-center transition ${formData.type==='kedi' ? 'border-green-500 bg-green-50 text-green-700':'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <input type="radio" name="type" value="kedi" checked={formData.type==='kedi'} onChange={handleChange} className="hidden"/>🐱 Kedi
                </label>
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
      
      {/* 👇 DÜZELTİLEN CSS BURASI */}
      <style jsx>{`
        .input-field {
            width: 100%;
            padding: 0.8rem 1rem;
            border-radius: 0.75rem;
            border: 2px solid #f3f4f6; /* Daha belirgin kenarlık */
            background-color: #ffffff; /* Arka plan kesinlikle beyaz */
            color: #111827; /* Yazı rengi KOYU (Neredeyse Siyah) - Saydam değil! */
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
            color: #9ca3af; /* Placeholder rengi gri */
        }
      `}</style>
    </div>
  );
}