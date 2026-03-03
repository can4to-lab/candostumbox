"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    // 🛠️ IFRAME'DEN KURTARMA KODU (Güvenlik Katmanı)
    if (
      typeof window !== "undefined" &&
      window.top &&
      window.self !== window.top
    ) {
      window.top.location.href = window.location.href;
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] relative flex items-center justify-center p-4 font-sans overflow-hidden">
      {/* Arka Plan Glow Efektleri (Premium Hissiyat) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-pulse delay-700"></div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(34,197,94,0.2)] max-w-lg w-full border border-green-100 relative z-10 animate-fade-in-up">
        {/* İkon Alanı */}
        <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative">
          <div className="absolute inset-0 border-4 border-white rounded-full"></div>
          <span className="text-5xl animate-bounce">🎉</span>
        </div>

        {/* Başlık ve Mesaj */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
            Harika Haber!
          </h1>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">
            Ödemen başarıyla onaylandı. Patili dostunun mutluluk kutusu için
            hazırlıklara hemen başlıyoruz! 🐾
          </p>
        </div>

        {/* Sipariş Fişi (Bilet Tasarımı) */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 mb-8 text-center relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r-2 border-dashed border-gray-200"></div>
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l-2 border-dashed border-gray-200"></div>

          <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">
            Sipariş Numaran
          </p>
          <p className="text-2xl font-mono font-black text-gray-900 tracking-wider select-all">
            {orderId || "İşleniyor..."}
          </p>
        </div>

        {/* Sırada Ne Var Adımları (Güven Verir) */}
        <div className="space-y-5 mb-10 text-left bg-green-50/50 p-6 rounded-2xl border border-green-50">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4 border-b border-green-100 pb-2">
            Sırada Ne Var?
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
              1
            </div>
            <p className="text-sm text-gray-700 font-medium">
              Siparişin sistemimize düştü.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
              2
            </div>
            <p className="text-sm text-gray-700 font-medium">
              Uzmanlarımız kutuyu özenle hazırlıyor.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
              3
            </div>
            <p className="text-sm text-gray-700 font-medium">
              Kargoya verildiğinde sana mail atacağız.
            </p>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="space-y-3">
          <Link
            href="/profile?tab=siparisler"
            className="group relative overflow-hidden block w-full bg-green-500 text-white text-center py-4 rounded-xl font-black text-lg transition-all hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/30 active:scale-[0.98]"
          >
            {/* Shimmer (Parlama) Efekti */}
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-25deg] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="relative z-10">📦 SİPARİŞİ TAKİP ET</span>
          </Link>

          <Link
            href="/"
            className="block w-full text-center text-gray-500 py-3 rounded-xl font-bold hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Anasayfaya Dön
          </Link>
        </div>
      </div>

      {/* Animasyonlar */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(250%);
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold animate-pulse tracking-widest uppercase text-sm">
            Sonuç İşleniyor...
          </p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
