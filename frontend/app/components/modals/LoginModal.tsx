"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Giriş yapılamadı 😔");
      } else {
        localStorage.setItem("token", data.access_token);
        toast.success("Hoş geldin! Giriş başarılı 🚀");
        setTimeout(() => {
            onLoginSuccess();
            onClose();
        }, 1000);
      }
    } catch (err: any) {
      toast.error("Sunucu ile bağlantı kurulamadı ⚠️");
    } finally {
      setLoading(false);
    }
  };
// 👇 DEĞİŞİKLİK: bg-gray-50 yerine bg-gray-200 yaptık, border-2 ekledik.
const inputStyle = "w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-gray-200 text-gray-900 focus:bg-white focus:border-green-600 focus:ring-0 outline-none transition placeholder-gray-500 font-bold";

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl z-10 animate-fade-in-up">
        
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 text-3xl leading-none transition">&times;</button>
        
        <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Tekrar Hoş Geldin!</h2>
            <p className="text-gray-500 font-medium">Dostunu sevindirmeye devam et.</p>
        </div>
        
        <form className="space-y-4">
          <input 
            type="email" 
            placeholder="E-posta Adresin" 
            className={inputStyle} 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Şifren" 
            className={inputStyle} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          
          <button 
            type="button" 
            onClick={handleLogin}
            disabled={loading} 
            className={`w-full font-bold py-4 rounded-xl transition flex items-center justify-center text-lg shadow-lg
                ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow-green-200"} text-white`}
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
        
        <p className="text-center mt-8 text-gray-500 font-medium">
          Henüz hesabın yok mu? <button onClick={onSwitchToRegister} className="text-green-600 font-bold hover:text-green-700 hover:underline transition">Hemen Kayıt Ol</button>
        </p>
      </div>
    </div>
  );
}