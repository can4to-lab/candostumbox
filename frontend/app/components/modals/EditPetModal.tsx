"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface EditPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  petData: any;
}

const OTHER_ICONS: Record<string, string> = {
  Kuş: "🦜",
  Hamster: "🐹",
  Tavşan: "🐰",
  Balık: "🐟",
};

export default function EditPetModal({
  isOpen,
  onClose,
  onSuccess,
  petData,
}: EditPetModalProps) {
  const [isOtherOpen, setIsOtherOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "kopek",
    breed: "",
    weight: "",
    birthDate: "",
    gender: "male",
    isNeutered: false,
    allergies: "",
  });

  useEffect(() => {
    if (petData) {
      setFormData({
        name: petData.name || "",
        type: petData.type || "kopek",
        breed: petData.breed || "",
        weight: petData.weight || "",
        birthDate: petData.birthDate
          ? new Date(petData.birthDate).toISOString().split("T")[0]
          : "",
        gender: petData.gender || "male",
        isNeutered: petData.isNeutered || false,
        allergies: petData.allergies ? petData.allergies.join(", ") : "",
      });
    }
  }, [petData, isOpen]);

  const getOtherIcon = () => OTHER_ICONS[formData.type] || "🦜";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    const allergiesArray = formData.allergies
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/pets/${petData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...formData, allergies: allergiesArray }),
        },
      );
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
  const inputClass =
    "w-full p-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-900 font-bold outline-none focus:border-green-500 focus:bg-white transition text-sm md:text-base";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl bg-gray-50 w-8 h-8 rounded-full flex items-center justify-center"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black text-gray-900 mb-1">
          Dostunu Düzenle
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Bilgileri güncelleyerek ona en uygun kutuyu seçmemize yardım et.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 👇 KESİN ÇÖZÜM: Grid Yapısı (3 Eşit Sütun) */}
          <div className="grid grid-cols-3 gap-2 mb-4 font-bold">
            {["kopek", "kedi"].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => {
                  setFormData({ ...formData, type: t });
                  setIsOtherOpen(false);
                }}
                className={`w-full h-14 rounded-xl border-2 transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-xs md:text-sm
                        ${formData.type === t ? "border-green-500 bg-green-50 text-green-700" : "border-gray-100 text-gray-400 hover:bg-gray-50"}`}
              >
                <span className="text-lg md:text-xl">
                  {t === "kopek" ? "🐶" : "🐱"}
                </span>
                <span>{t === "kopek" ? "Köpek" : "Kedi"}</span>
              </button>
            ))}

            {/* DİĞER BUTONU */}
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => setIsOtherOpen(!isOtherOpen)}
                className={`w-full h-14 px-2 md:px-3 rounded-xl border-2 transition flex items-center justify-between text-xs md:text-sm
                        ${!["kopek", "kedi"].includes(formData.type) ? "border-green-500 bg-green-50 text-green-700" : "border-gray-100 text-gray-400 hover:bg-gray-50"}`}
              >
                <div className="flex items-center gap-1 md:gap-2 truncate">
                  <span className="text-lg md:text-xl">
                    {!["kopek", "kedi"].includes(formData.type)
                      ? getOtherIcon()
                      : "🦜"}
                  </span>
                  <span className="truncate">
                    {!["kopek", "kedi"].includes(formData.type)
                      ? formData.type
                      : "Diğer"}
                  </span>
                </div>
                <span className="text-[10px]">▼</span>
              </button>

              {isOtherOpen && (
                <div className="absolute top-full right-0 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl z-20 overflow-hidden min-w-[120px]">
                  {Object.keys(OTHER_ICONS).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, type: t });
                        setIsOtherOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 hover:text-green-700 font-bold text-gray-600 border-b border-gray-50 last:border-0 flex items-center gap-2 text-sm transition"
                    >
                      <span className="text-xl">{OTHER_ICONS[t]}</span> {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                İSİM
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                IRK
              </label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) =>
                  setFormData({ ...formData, breed: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                KİLO (KG)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                DOĞUM TARİHİ
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block">
              CİNSİYET
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className={inputClass}
            >
              <option value="male">Erkek ♂</option>
              <option value="female">Dişi ♀</option>
            </select>
          </div>

          <div
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition"
            onClick={() =>
              setFormData({ ...formData, isNeutered: !formData.isNeutered })
            }
          >
            <input
              type="checkbox"
              checked={formData.isNeutered}
              onChange={(e) =>
                setFormData({ ...formData, isNeutered: e.target.checked })
              }
              className="w-5 h-5 text-green-600 rounded focus:ring-green-500 accent-green-600 cursor-pointer"
            />
            <span className="text-sm font-bold text-gray-700 select-none">
              Kısırlaştırılmış
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block">
              ALERJİLER (OPSİYONEL)
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) =>
                setFormData({ ...formData, allergies: e.target.value })
              }
              placeholder="Örn: Tavuk, Tahıl"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition text-lg active:scale-95"
          >
            Güncelle
          </button>
        </form>
      </div>
    </div>
  );
}
