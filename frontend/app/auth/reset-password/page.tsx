"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

// Next.js 14+ için searchParams kullanan komponentleri Suspense ile sarmalamak best-practice'dir.
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const id = searchParams.get("id");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Şifreler birbiriyle eşleşmiyor.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Şifreniz en az 6 karakter olmalıdır.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, token, newPassword }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Geçersiz veya süresi dolmuş bağlantı.",
        );
      }

      setMessage(
        "Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...",
      );

      // Başarılı olunca 3 saniye sonra anasayfaya/girişe yönlendir
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !id) {
    return (
      <div className="text-center p-6">
        <p className="text-red-600 font-medium bg-red-50 p-4 rounded-lg border border-red-200">
          Geçersiz bağlantı. Lütfen e-postanızdaki linke tekrar tıklayın veya
          yeni bir sıfırlama talebinde bulunun.
        </p>
        <div className="mt-4">
          <Link
            href="/auth/forgot-password"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Yeni Bağlantı İste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="new-password"
          className="block text-sm font-medium text-gray-700"
        >
          Yeni Şifre
        </label>
        <div className="mt-1">
          <input
            id="new-password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="confirm-password"
          className="block text-sm font-medium text-gray-700"
        >
          Yeni Şifre (Tekrar)
        </label>
        <div className="mt-1">
          <input
            id="confirm-password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}
      {message && (
        <div className="text-green-700 text-sm bg-green-50 p-3 rounded-md border border-green-200">
          {message}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading || !!message}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors"
        >
          {loading ? "Güncelleniyor..." : "Şifremi Güncelle"}
        </button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Yeni Şifre Belirle
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Lütfen güvenli ve hatırlayabileceğiniz yeni bir şifre girin.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Suspense
            fallback={
              <div className="text-center text-gray-500">Yükleniyor...</div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
