"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";

// Sayfa İçeriği
function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL'den "oid" (Order ID) parametresini al (PayTR gönderir)
  const orderId = searchParams.get("oid") || searchParams.get("merchant_oid"); 

  useEffect(() => {
    // 1. Sayfa açılınca Konfeti Patlat! 🎉
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    // 2. Sepeti Temizle (Opsiyonel: Context'ten temizleme fonksiyonun varsa buraya eklersin)
    // clearCart(); 

  }, []);

  return (
    <div className="bg-white rounded-3xl p-10 md:p-16 shadow-2xl text-center max-w-lg mx-auto relative overflow-hidden animate-fade-in-up">
        {/* Arka Plan Efekti */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-green-400 to-teal-500"></div>

        {/* Hareketli Yeşil Tik İkonu */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Ödeme Başarılı! 🥳</h1>
        <p className="text-gray-500 font-medium mb-8">
            Harika! Dostunun kutusu için hazırlıklara hemen başlıyoruz. Seni ve patili dostunu mutlu etmek için sabırsızlanıyoruz.
        </p>

        {/* Sipariş No Alanı */}
        {orderId && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Sipariş Numaran</p>
                <p className="text-xl font-black text-gray-900 font-mono tracking-wide">{orderId}</p>
            </div>
        )}

        <div className="space-y-3">
            <Link 
                href="/profile?tab=siparisler" 
                className="block w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition shadow-lg transform hover:-translate-y-1"
            >
                📦 Siparişimi Görüntüle
            </Link>
            
            <Link 
                href="/" 
                className="block w-full py-3 text-gray-500 font-bold hover:text-gray-900 transition"
            >
                Anasayfaya Dön
            </Link>
        </div>
    </div>
  );
}

// Ana Sayfa Bileşeni
export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        {/* Suspense: useSearchParams kullanıldığı için Next.js build hatası vermesin diye */}
        <Suspense fallback={<div className="text-center">Yükleniyor...</div>}>
            <SuccessContent />
        </Suspense>
    </main>
  );
}