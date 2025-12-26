"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // DİKKAT: Burası dün yazdığımız YENİ admin giriş kapısı
      const res = await fetch("https://candostumbox-api.onrender.com/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Giriş başarısız.");
      }

      // Token'ı kaydediyoruz
      localStorage.setItem("token", data.access_token);
      
      // Admin paneline yönlendir
      router.push("/admin");

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-orange-600">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Yönetici Girişi 🔒</h1>
            <p className="text-gray-500 mt-2 text-sm">Sadece yetkili personel içindir.</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 text-sm font-bold text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Yönetici E-posta</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
              placeholder="admin@candostum.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Şifre</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-lg hover:shadow-orange-500/40 transform active:scale-95"
          >
            Panele Giriş Yap
          </button>
        </form>

        <div className="mt-8 text-center">
            <a href="/" className="text-gray-400 text-sm hover:text-gray-600 transition">← Ana Sayfaya Dön</a>
        </div>
      </div>
    </div>
  );
}