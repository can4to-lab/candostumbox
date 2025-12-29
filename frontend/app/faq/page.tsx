"use client";
import { useState } from "react";
import Link from "next/link";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Kutunun içinden tam olarak neler çıkıyor?",
      answer: "Her ay değişen bir tema çerçevesinde; en az 2 adet dayanıklı ve zeka geliştirici oyuncak, 2 paket %100 doğal içerikli ödül maması ve dostunun bakımına yardımcı olacak sürpriz bir ürün (şampuan, tarak, bandana vb.) gönderiyoruz."
    },
    {
      question: "Aboneliğimi istediğim zaman iptal edebilir miyim?",
      answer: "Elbette! CanDostumBox'ta taahhüt veya cayma bedeli yoktur. Profil sayfandaki 'Aboneliğim' sekmesinden dilediğin zaman tek tıkla iptal edebilir veya bir süreliğine dondurabilirsin."
    },
    {
      question: "Köpeğimin/Kedimin alerjisi var, ürünleri seçebiliyor muyuz?",
      answer: "Evet, kayıt olurken veya profil ayarlarından dostunun alerjilerini (tavuk, tahıl, balık vb.) belirtebilirsin. Paketini hazırlarken bu ürünleri hassasiyetle eliyor ve yerine alternatif sağlıklı ürünler koyuyoruz."
    },
    {
      question: "Kargo ücreti ödüyor muyum?",
      answer: "Hayır! Tüm Türkiye'ye kargo bizden. Dostun için hazırladığımız mutluluk kutusu kapına kadar ücretsiz gelir."
    },
    {
      question: "Kutular ne zaman kargolanıyor?",
      answer: "Abonelik kutuları her ayın 15'i ile 20'si arasında toplu olarak kargoya verilir. Ancak ilk kez sipariş veriyorsan, seni bekletmemek için kutun siparişini takip eden ilk iş gününde yola çıkar."
    },
    {
      question: "Paketimden memnun kalmazsam iade edebilir miyim?",
      answer: "Müşteri memnuniyeti bizim için her şeyden önemli. Eğer kutudaki bir üründen veya genel hizmetten memnun kalmazsan, 14 gün içinde koşulsuz iade veya değişim talep edebilirsin."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans py-16">
      
      {/* --- HERO HEADER --- */}
      <div className="max-w-4xl mx-auto px-4 text-center mb-16">
         <span className="text-green-600 font-bold tracking-widest uppercase text-xs mb-3 block animate-fade-in-up">Yardım Merkezi</span>
         <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 animate-fade-in-up delay-100">
           Aklına Takılanlar
         </h1>
         <p className="text-gray-500 text-lg animate-fade-in-up delay-200">
           Sıkça sorulan soruları senin için derledik. Cevabını bulamadığın bir sorun varsa bize her zaman yazabilirsin.
         </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* --- SORU LİSTESİ --- */}
        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <div 
              key={idx} 
              className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${openIndex === idx ? 'border-green-200 shadow-lg shadow-green-100' : 'border-gray-100 shadow-sm hover:border-green-100'}`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex justify-between items-center p-6 md:p-8 text-left focus:outline-none"
              >
                <span className={`font-bold text-lg md:text-xl pr-8 ${openIndex === idx ? 'text-green-700' : 'text-gray-800'}`}>
                  {item.question}
                </span>
                <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${openIndex === idx ? 'bg-green-100 text-green-600 rotate-180' : 'bg-gray-50 text-gray-400'}`}>
                  ▼
                </span>
              </button>
              
              <div 
                className={`grid transition-all duration-300 ease-in-out ${openIndex === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 md:px-8 pb-8 text-gray-500 leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- HALA SORUN MU VAR? --- */}
        <div className="mt-16 bg-gray-900 rounded-[2.5rem] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Aradığın Cevabı Bulamadın mı?</h3>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                    Ekibimiz sana yardımcı olmak için hazır. Bize mesaj at, en kısa sürede dönüş yapalım.
                </p>
                <Link href="/contact" className="inline-block bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-900/50 transform hover:-translate-y-1">
                    Bize Ulaşın 📞
                </Link>
            </div>
            
            {/* Dekoratif */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-500 opacity-10 blur-3xl rounded-full"></div>
        </div>

      </div>
    </div>
  );
}