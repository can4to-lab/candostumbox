"use client";
import { useState } from "react";
import Link from "next/link";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
  onLoginSuccess,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Giriş yapılamadı.");

      localStorage.setItem("token", data.access_token);
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 👇 İŞTE SİHİRLİ SATIR: Gri arka plan, siyah yazı, belirgin çerçeve
  const inputStyle =
    "w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-black placeholder-gray-500 focus:bg-white focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition font-medium";

  return (
    <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-3xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-3xl font-black text-black mb-2">Giriş Yap</h2>
        <p className="text-gray-600 font-medium mb-6 text-sm">
          Dostunu sevindirmeye devam et.
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm font-bold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-posta"
            className={inputStyle} // Yukarıdaki stili kullandık
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            className={inputStyle} // Yukarıdaki stili kullandık
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200"
          >
            Giriş Yap
          </button>
        </form>
        <div className="text-right mt-2">
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Şifremi unuttum
          </Link>
        </div>
        <p className="text-center mt-6 text-gray-600 text-sm font-medium">
          Hesabın yok mu?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-green-600 font-bold hover:underline"
          >
            Kayıt Ol
          </button>
        </p>
      </div>
    </div>
  );
}
