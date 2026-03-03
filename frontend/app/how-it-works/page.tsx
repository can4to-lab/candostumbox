"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RegisterModal from "@/components/RegisterModal";
import LoginModal from "@/components/LoginModal";
import { Toaster } from "react-hot-toast";

export default function HowItWorksPage() {
  const router = useRouter();
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);

  const handleSuccessRedirect = () => {
    router.push("/product");
  };

  const steps = [
    {
      id: 1,
      title: "Dostunu Tanıt",
      desc: "Kedinin veya köpeğinin ırkını, yaşını ve varsa özel ihtiyaçlarını bize söyle. Ona en uygun kutuyu hazırlayalım.",
      icon: "🐾",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      id: 2,
      title: "Planını Seç",
      desc: "Aylık abonelik veya tek seferlik deneme kutusu seçeneklerinden sana uygun olanı seç. Kontrol tamamen sende.",
      icon: "📅",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      id: 3,
      title: "Kutun Hazırlansın",
      desc: "Uzman veterinerler eşliğinde seçilen sağlıklı ürünler ve dayanıklı oyuncaklar dostun için özenle paketlenir.",
      icon: "🎁",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      id: 4,
      title: "Mutluluk Kapında",
      desc: "Her ay aynı gün kapındayız! Dostunla kutu açılış heyecanını yaşamak ve o anları ölümsüzleştirmek sana kalır.",
      icon: "🚚",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-green-100">
      <Toaster position="top-right" />

      {/* MODALLAR */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
        initialData={null}
        onRegisterSuccess={handleSuccessRedirect}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
        onLoginSuccess={handleSuccessRedirect}
      />

      {/* ================================================================== */}
      {/* 🦸‍♂️ HERO BÖLÜMÜ */}
      {/* ================================================================== */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white">
        {/* Dekoratif Glow Arkaplan */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/50 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-block py-2 px-5 rounded-full bg-green-50 border border-green-100 text-green-700 font-black text-xs tracking-widest uppercase mb-6 shadow-sm animate-fade-in">
            ✨ Mutluluğun Yolculuğu
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">
            Kutun Kapına <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
              Nasıl Ulaşır?
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed animate-fade-in delay-100">
            Dostunu şımartmak hiç bu kadar sistemli ve kolay olmamıştı. Sadece 4
            adımda aboneliğini başlat, sürprizlerin tadını çıkar.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 🧩 ADIMLAR BÖLÜMÜ */}
      {/* ================================================================== */}
      <section className="py-10 relative">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Adımları Bağlayan Çizgi (Sadece Masaüstü) */}
            <div className="hidden lg:block absolute top-24 left-0 w-full h-0.5 border-t-2 border-dashed border-gray-100 -z-0"></div>

            {steps.map((step, index) => (
              <div
                key={step.id}
                className="relative z-10 group animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Numara Rozeti */}
                <div className="mb-8 flex justify-center lg:justify-start">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-xl border border-gray-100 flex items-center justify-center font-black text-xl text-gray-900 group-hover:scale-110 group-hover:bg-gray-900 group-hover:text-white transition-all duration-500 ring-8 ring-gray-50">
                    {step.id}
                  </div>
                </div>

                {/* Kart İçeriği */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all duration-500 text-center lg:text-left h-full flex flex-col items-center lg:items-start group-hover:-translate-y-2">
                  <div
                    className={`w-20 h-20 ${step.bgColor} ${step.iconColor} rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-inner transform group-hover:rotate-6 transition-transform duration-500`}
                  >
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 🚀 CTA BÖLÜMÜ (Premium Lansman Görünümü) */}
      {/* ================================================================== */}
      <section className="py-24 container mx-auto px-4">
        <div className="bg-[#111827] rounded-[3.5rem] p-10 md:p-20 text-center text-white relative overflow-hidden shadow-3xl">
          {/* Arkaplan Efektleri */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500 rounded-full blur-[150px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500 rounded-full blur-[150px] opacity-20"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter">
              Dostunu Şımartmaya <br />{" "}
              <span className="text-green-400">Hazır mısın?</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl mb-12 font-medium">
              Lansmana özel ilk kutunda geçerli indirim fırsatını kaçırma. Hemen
              profilini oluştur ve mutluluk yolculuğuna bugün katıl.
            </p>

            <button
              onClick={() => setRegisterOpen(true)}
              className="group relative overflow-hidden inline-flex items-center gap-3 bg-green-500 text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-green-600 transition-all shadow-[0_20px_50px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95"
            >
              {/* Shimmer (Parlama) Efekti */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-25deg] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

              <span className="relative z-10">HEMEN BAŞLA</span>
              <span className="relative z-10 group-hover:translate-x-2 transition-transform">
                🐾
              </span>
            </button>

            <p className="mt-8 text-sm text-gray-500 font-bold uppercase tracking-[0.2em]">
              Taahhüt Yok • İstediğin An İptal Et
            </p>
          </div>
        </div>
      </section>

      {/* Animasyonlar */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(250%);
          }
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          opacity: 0;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
