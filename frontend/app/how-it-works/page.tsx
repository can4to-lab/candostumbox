"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // 👈 Router eklendi
import RegisterModal from "@/components/RegisterModal";
import LoginModal from "@/components/LoginModal";

export default function HowItWorksPage() {
  const router = useRouter(); // 👈 Router kullanımı
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);

  // Başarılı işlem sonrası yönlendirme fonksiyonu
  const handleSuccessRedirect = () => {
    // Kullanıcıyı doğrudan paket seçimine yönlendir
    router.push('/product'); 
  };

  const steps = [
    {
      id: 1,
      title: "Dostunu Tanıt",
      desc: "Kedinin veya köpeğinin ırkını, yaşını, kilosunu ve varsa alerjilerini bize söyle. Ona en uygun kutuyu hazırlayalım.",
      icon: "🐾"
    },
    {
      id: 2,
      title: "Planını Seç",
      desc: "Aylık abonelik veya tek seferlik deneme kutusu seçeneklerinden sana uygun olanı seç. İster her ay, ister tek sefer.",
      icon: "📅"
    },
    {
      id: 3,
      title: "Kutun Hazırlansın",
      desc: "Uzman veterinerler eşliğinde seçilen oyuncaklar, doğal ödül mamaları ve bakım ürünleri özenle paketlenir.",
      icon: "🎁"
    },
    {
      id: 4,
      title: "Mutluluk Kapında",
      desc: "Her ayın belirli günlerinde kargoya verilir. Dostunla kutu açılış heyecanını yaşamak sana kalır!",
      icon: "🚚"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-16">
      
      {/* MODALLAR */}
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setRegisterOpen(false)} 
        onSwitchToLogin={() => { setRegisterOpen(false); setLoginOpen(true); }}
        initialData={null}
        onRegisterSuccess={handleSuccessRedirect} // 👈 Yönlendirme buraya bağlandı
      />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setLoginOpen(false)} 
        onSwitchToRegister={() => { setLoginOpen(false); setRegisterOpen(true); }}
        onLoginSuccess={handleSuccessRedirect} // 👈 Yönlendirme buraya bağlandı
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Başlık */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Mutluluk Nasıl Ulaşır?</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Can dostun için en iyisini seçmek hiç bu kadar kolay olmamıştı. Sadece 4 adımda aboneliğini başlat.
          </p>
        </div>

        {/* Adımlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step) => (
            <div key={step.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center relative hover:shadow-xl transition duration-300 group">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl border-4 border-white shadow-lg">
                {step.id}
              </div>
              <div className="text-6xl mb-6 mt-4 group-hover:scale-110 transition duration-300">{step.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA (Hemen Başla) */}
        <div className="bg-green-600 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-green-200">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-6">Dostunu Şımartmaya Hazır mısın?</h2>
            <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              İlk kutun için özel indirim fırsatını kaçırma. Hemen profili oluştur ve maceraya başla.
            </p>
            
            <button 
                onClick={() => setRegisterOpen(true)}
                className="inline-block bg-white text-green-700 px-10 py-4 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg transform hover:-translate-y-1 cursor-pointer"
            >
              Hemen Başla 👉
            </button>
            
          </div>
          {/* Dekoratif Daireler */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

      </div>
    </div>
  );
}