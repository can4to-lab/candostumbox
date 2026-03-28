"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface GuestData {
  petName: string;
  petType?: string;
  petBreed?: string;
  petWeight?: string;
  petBirthDate?: string;
  petNeutered?: string;
}
interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  productPrice: number;
  guestData?: GuestData | null;
  onSwitchToRegister?: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  productId,
  productName,
  productPrice,
  guestData,
  onSwitchToRegister,
}: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [userPets, setUserPets] = useState<any[]>([]);
  const [selectedUserPet, setSelectedUserPet] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    district: "",
    address: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("token");
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            setFormData((prev) => ({
              ...prev,
              address: data.addresses?.[0]?.fullAddress || "",
              city: data.addresses?.[0]?.city || "",
            }));
            if (data.pets && Array.isArray(data.pets) && data.pets.length > 0) {
              setUserPets(data.pets);
              if (!guestData?.petName) setSelectedUserPet(data.pets[0].name);
            }
          })
          .catch(() => setIsGuest(true));
      } else {
        setIsGuest(true);
      }
    }
  }, [isOpen, guestData]);

  if (!isOpen) return null;
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-bold outline-none focus:border-green-500 focus:bg-white transition placeholder:text-gray-400";

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!formData.city || !formData.district || !formData.address) {
      toast.error("Lütfen adres bilgilerini tam girin.");
      setLoading(false);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const finalPetName = guestData?.petName || selectedUserPet;
    const fullAddressString = `${formData.district} - ${formData.address}`;
    const orderPayload = {
      productId,
      totalPrice: productPrice,
      city: formData.city,
      address: fullAddressString,
      guestName: isGuest ? formData.name : undefined,
      guestEmail: isGuest ? formData.email : undefined,
      guestPhone: isGuest ? formData.phone : undefined,
      petName: finalPetName,
      petType: guestData?.petType,
      petBreed: guestData?.petBreed,
      petWeight: guestData?.petWeight,
      petBirthDate: guestData?.petBirthDate,
      petNeutered: guestData?.petNeutered,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(orderPayload),
      });
      if (!res.ok) throw new Error("Sipariş alınamadı");
      setSuccess(true);
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success)
    return (
      <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full animate-fade-in-up relative overflow-hidden">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Siparişin Alındı!
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Dostun için hazırlıklara başladık bile!
          </p>

          {isGuest && onSwitchToRegister && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 text-left">
              <h4 className="font-bold text-orange-800 text-sm mb-1">
                🎁 Bu Mutluluk Bitmesin!
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                Şimdi ücretsiz üye ol, kutun her ay kapına gelsin.
              </p>
              <button
                onClick={onSwitchToRegister}
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg text-sm shadow-lg shadow-orange-200"
              >
                Hesap Oluştur ➔
              </button>
            </div>
          )}
          <button
            onClick={() => {
              setSuccess(false);
              onClose();
            }}
            className="text-gray-400 font-bold text-sm"
          >
            Kapat
          </button>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col my-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 text-2xl z-10"
        >
          &times;
        </button>

        <div className="bg-gray-50 p-6 border-b border-gray-100 rounded-t-3xl">
          <h2 className="text-xl font-black text-gray-900">Güvenli Ödeme 🔒</h2>
          <div className="flex justify-between items-end mt-2">
            <div>
              <p className="text-sm text-gray-500">{productName}</p>
            </div>
            <div className="text-right">
              <span className="block text-2xl font-black text-green-600">
                ₺{productPrice}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handlePayment} className="p-6 space-y-4">
          {!isGuest && !guestData?.petName && userPets.length > 0 && (
            <div className="mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                Hangi Dostumuz İçin?
              </label>
              <select
                value={selectedUserPet}
                onChange={(e) => setSelectedUserPet(e.target.value)}
                className={inputClass}
              >
                {userPets.map((pet) => (
                  <option key={pet.id} value={pet.name}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isGuest && (
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 space-y-3">
              <div className="text-yellow-800 font-bold text-xs uppercase">
                👤 İletişim Bilgileri
              </div>
              <input
                type="text"
                name="name"
                placeholder="Adınız Soyadınız"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={inputClass}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="E-posta"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={inputClass}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Telefon"
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="text-gray-400 font-bold text-xs uppercase">
              📍 Teslimat Adresi
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="city"
                placeholder="İl"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className={inputClass}
                required
              />
              <input
                type="text"
                name="district"
                placeholder="İlçe"
                value={formData.district}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
            <textarea
              name="address"
              rows={2}
              placeholder="Açık Adres"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className={`${inputClass} resize-none`}
              required
            ></textarea>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="text-gray-400 font-bold text-xs uppercase mb-2">
              💳 Kart Bilgileri
            </div>
            <input
              type="text"
              placeholder="Kart Numarası"
              className={`${inputClass} mb-3`}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="AA/YY"
                className={inputClass}
                required
              />
              <input
                type="text"
                placeholder="CVV"
                className={inputClass}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition shadow-lg text-lg"
          >
            {loading ? "İşleniyor..." : `Ödemeyi Tamamla (₺${productPrice})`}
          </button>
        </form>
      </div>
    </div>
  );
}
