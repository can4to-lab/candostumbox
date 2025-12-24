"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAddressModal({ isOpen, onClose, onSuccess }: AddAddressModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", city: "", district: "", neighborhood: "", street: "", buildingNo: "", floor: "", apartmentNo: ""
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/users/addresses", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Ekleme başarısız");
      
      toast.success("Yeni adres eklendi! 📍");
      onSuccess();
      onClose();
      setFormData({ title: "", city: "", district: "", neighborhood: "", street: "", buildingNo: "", floor: "", apartmentNo: "" });

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
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">📍 Yeni Adres Ekle</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="input-field" placeholder="Başlık (Ev, İş)" />
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="input-field" placeholder="Şehir" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <input required type="text" name="district" value={formData.district} onChange={handleChange} className="input-field" placeholder="İlçe" />
                <input required type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="input-field" placeholder="Mahalle" />
            </div>

            <input required type="text" name="street" value={formData.street} onChange={handleChange} className="input-field" placeholder="Cadde / Sokak" />

            <div className="grid grid-cols-3 gap-2">
                <input required type="text" name="buildingNo" value={formData.buildingNo} onChange={handleChange} className="input-field" placeholder="Bina No" />
                <input required type="text" name="floor" value={formData.floor} onChange={handleChange} className="input-field" placeholder="Kat" />
                <input required type="text" name="apartmentNo" value={formData.apartmentNo} onChange={handleChange} className="input-field" placeholder="Daire No" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition mt-4">
                {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
        </form>
      </div>
      
      {/* 👇 AYNI CSS DÜZELTMESİ BURADA DA VAR */}
      <style jsx>{`
        .input-field {
            width: 100%;
            padding: 0.8rem 1rem;
            border-radius: 0.75rem;
            border: 2px solid #f3f4f6;
            background-color: #ffffff; 
            color: #111827; /* Koyu Yazı */
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