"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    // 🛠️ IFRAME'DEN KURTARMA KODU (DÜZELTİLDİ)
    // TypeScript hatasını önlemek için window.top'ın varlığını kontrol et
    if (
      typeof window !== "undefined" &&
      window.top &&
      window.self !== window.top
    ) {
      window.top.location.href = window.location.href;
    }
  }, []);

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-green-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🎉</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Ödeme Başarılı!
        </h1>
        <p className="text-gray-500 mb-6">
          Harika! Dostunun kutusu için hazırlıklara hemen başlıyoruz.
          {orderId && (
            <span className="block mt-4 font-mono text-sm bg-gray-100 p-2 rounded text-gray-700">
              Sipariş No: <strong>{orderId}</strong>
            </span>
          )}
        </p>

        <div className="space-y-3">
          <Link
            href="/profile?tab=orders"
            className="block w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition"
          >
            📦 Siparişlerime Git
          </Link>
          <Link
            href="/"
            className="block w-full text-gray-500 font-bold hover:text-gray-900 transition"
          >
            Anasayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          Yükleniyor...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
