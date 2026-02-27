"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  initialData?: any; // Artık kullanılmıyor ama hata vermemesi için tutuyoruz
  onRegisterSuccess: () => void;
}

export default function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
  onRegisterSuccess,
}: RegisterModalProps) {
  const [loading, setLoading] = useState(false);

  // Sadece temel bilgiler (Adres ve Pet tamamen kaldırıldı)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone
    ) {
      toast.error("Zorunlu alanları doldurmalısın ✍️");
      return;
    }
    if (!isValidEmail(formData.email)) {
      toast.error("Lütfen geçerli bir e-posta adresi girin 📧");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://api.candostumbox.com/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Hata oluştu 😔");
      } else {
        toast.success("Kayıt başarılı! Yönlendiriliyorsunuz... 🚀");
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
          setTimeout(() => {
            onRegisterSuccess();
            onClose();
            // Formu temizle
            setFormData({ name: "", email: "", password: "", phone: "" });
          }, 1000);
        } else {
          setTimeout(() => {
            onSwitchToLogin();
          }, 1500);
        }
      }
    } catch (err) {
      toast.error("Sunucu hatası ⚠️");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full px-4 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition font-medium text-sm shadow-sm";

  return (
    <div className="fixed inset-0 bg-black/70 z-[999] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md relative shadow-2xl z-10 flex flex-col my-auto animate-fade-in-up">
        {/* HEADER */}
        <div className="bg-white p-6 border-b border-gray-100 relative rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-black text-2xl font-bold p-2 transition"
          >
            ✕
          </button>
          <h2 className="text-xl font-black text-gray-900">
            ✨ Hızlı Kayıt Ol
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Saniyeler içinde aramıza katılın.
          </p>
        </div>

        {/* BODY */}
        <div className="p-6 md:p-8">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputStyle}
              placeholder="Ad Soyad *"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputStyle}
              placeholder="E-posta *"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={inputStyle}
              placeholder="Şifre *"
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputStyle}
              placeholder="Telefon *"
            />
          </form>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-3xl">
          <button
            onClick={onSwitchToLogin}
            className="text-green-600 font-bold text-sm hover:underline"
          >
            Zaten üye misin?
          </button>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black transition flex gap-2 shadow-lg disabled:opacity-70"
          >
            {loading && <span className="animate-spin">↻</span>} Kayıt Ol
          </button>
        </div>
      </div>
    </div>
  );
}
