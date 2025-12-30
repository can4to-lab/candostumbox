"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface AddAddressModalProps {
  isOpen: boolean; onClose: () => void; onSuccess: () => void;
}

export default function AddAddressModal({ isOpen, onClose, onSuccess }: AddAddressModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "", city: "", district: "", neighborhood: "", street: "", buildingNo: "", floor: "", apartmentNo: "" });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://candostumbox-api.onrender.com/users/addresses", {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Ekleme başarısız");
      toast.success("Yeni adres eklendi! 📍");
      onSuccess(); onClose(); setFormData({ title: "", city: "", district: "", neighborhood: "", street: "", buildingNo: "", floor: "", apartmentNo: "" });
    } catch (err) { toast.error("Bir hata oluştu."); } finally { setLoading(false); }
  };

  const inputClass = "w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-bold outline-none focus:border-green-500 focus:bg-white transition text-sm";

  return (
    <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-[2rem] w-full max-w-lg relative shadow-2xl p-6 md:p-8 animate-fade-in-up my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">&times;</button>
        <h2 className="text-2xl font-black text-gray-900 mb-6">📍 Yeni Adres</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <input required type="text" name="title" value={formData.title} onChange={handleChange} className={inputClass} placeholder="Başlık (Ev, İş)" />
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="Şehir" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <input required type="text" name="district" value={formData.district} onChange={handleChange} className={inputClass} placeholder="İlçe" />
                <input required type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className={inputClass} placeholder="Mahalle" />
            </div>
            <input required type="text" name="street" value={formData.street} onChange={handleChange} className={inputClass} placeholder="Cadde / Sokak" />
            <div className="grid grid-cols-3 gap-2">
                <input required type="text" name="buildingNo" value={formData.buildingNo} onChange={handleChange} className={inputClass} placeholder="Bina No" />
                <input required type="text" name="floor" value={formData.floor} onChange={handleChange} className={inputClass} placeholder="Kat" />
                <input required type="text" name="apartmentNo" value={formData.apartmentNo} onChange={handleChange} className={inputClass} placeholder="Daire" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition mt-4 shadow-lg text-lg">
                {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
        </form>
      </div>
    </div>
  );
}