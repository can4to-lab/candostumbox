"use client";
import { useRouter } from "next/navigation";

export default function HeroBanner() {
  const router = useRouter();

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
      
      {/* 1. Arka Plan Resmi */}
      <div 
          className="absolute inset-0 bg-cover bg-center opacity-60 transform scale-105 hover:scale-110 transition-transform duration-[20s]"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=2686&auto=format&fit=crop")' }}
      ></div>
      
      {/* 2. Karartma Efekti */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-black/50"></div>

      {/* 3. İçerik */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
          <span className="inline-block py-1 px-3 rounded-full bg-orange-500/20 border border-orange-400 text-orange-300 text-sm font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">
              🐾 Mutluluk Kutusu
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight mb-6 drop-shadow-2xl">
              Can Dostun İçin <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Sürpriz Dolu</span> Bir Dünya
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              Her ay kapına gelen özenle seçilmiş oyuncaklar, doğal atıştırmalıklar ve bakım ürünleri. 
              Onun kuyruğunu, senin yüzünü güldürmek için buradayız.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <button 
                  onClick={() => router.push('/auth/signup')}
                  className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-full font-bold text-lg transition shadow-lg shadow-green-900/50 transform hover:-translate-y-1 active:scale-95 flex items-center gap-2"
              >
                  Hemen Başla 🚀
              </button>
              <button 
                  onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-full font-bold text-lg transition backdrop-blur-md flex items-center gap-2"
              >
                  Paketleri İncele 📦
              </button>
          </div>
      </div>

      {/* 4. Alt Dekoratif Dalga */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-[calc(100%+1.3px)] h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
          </svg>
      </div>
    </div>
  );
}