"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface EditAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  addressData: any; // Düzenlenecek adres verisi
}

export default function EditAddressModal({
  isOpen,
  onClose,
  onSuccess,
  addressData,
}: EditAddressModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    city: "",
    district: "",
    neighborhood: "",
    street: "",
    buildingNo: "",
    floor: "",
    apartmentNo: "",
  });

  // Modal açıldığında verileri doldur
  useEffect(() => {
    if (addressData) {
      setFormData({
        title: addressData.title || "",
        city: addressData.city || "",
        district: addressData.district || "",
        neighborhood: addressData.neighborhood || "",
        street: addressData.street || "",
        buildingNo: addressData.buildingNo || "",
        floor: addressData.floor || "",
        apartmentNo: addressData.apartmentNo || "",
      });
    }
  }, [addressData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        `https://api.candostumbox.com/users/addresses/${addressData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (res.ok) {
        toast.success("Adres güncellendi! 📍");
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black text-gray-900 mb-1">
          Adresi Düzenle
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Teslimat adresini aşağıdan güncelleyebilirsin.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Adres Başlığı
            </label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ev, İş vb."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 text-gray-800 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                İl
              </label>
              <input
                required
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                İlçe
              </label>
              <input
                required
                type="text"
                value={formData.district}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 text-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Mahalle
              </label>
              <input
                required
                type="text"
                value={formData.neighborhood}
                onChange={(e) =>
                  setFormData({ ...formData, neighborhood: e.target.value })
                }
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Sokak/Cadde
              </label>
              <input
                required
                type="text"
                value={formData.street}
                onChange={(e) =>
                  setFormData({ ...formData, street: e.target.value })
                }
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 text-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Bina No
              </label>
              <input
                required
                type="text"
                value={formData.buildingNo}
                onChange={(e) =>
                  setFormData({ ...formData, buildingNo: e.target.value })
                }
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Kat
              </label>
              <input
                type="text"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Daire No
              </label>
              <input
                type="text"
                value={formData.apartmentNo}
                onChange={(e) =>
                  setFormData({ ...formData, apartmentNo: e.target.value })
                }
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 text-gray-800"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition transform active:scale-95"
          >
            Adresi Güncelle
          </button>
        </form>
      </div>
    </div>
  );
}
