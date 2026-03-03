"use client";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] font-sans text-gray-800 selection:bg-green-200 overflow-hidden">
      {/* ================================================================== */}
      {/* 1. HERO BÖLÜMÜ: Biz Kimiz? */}
      {/* ================================================================== */}
      <section className="relative py-24 md:py-32">
        {/* Dekoratif Arka Plan Glow Efektleri */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-400/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-300/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 animate-pulse delay-1000"></div>

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl animate-fade-in-up">
          <span className="inline-block py-2 px-5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 font-black text-xs tracking-widest uppercase mb-6 shadow-sm">
            BİZ KİMİZ?
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight">
            Bir Kutudan Çok Daha Fazlası: <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-600">
              Can Dostum Box Hikayesi
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto delay-100">
            Her şey, can dostlarımızın hayatımıza kattığı o saf sevgiye nasıl
            teşekkür edebileceğimizi düşünmemizle başladı. Biz sadece bir mama
            veya oyuncak kutusu hazırlamak istemedik; biz, her ay kapınız
            çalındığında hem sizin hem de dostunuzun kalbini hızlandıracak bir
            deneyim tasarlamak istedik.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 2. GÖRSEL VE ÇEKMECELİ KUTU VURGUSU */}
      {/* ================================================================== */}
      <section className="py-12 relative z-20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="relative rounded-[3rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-white/50 h-[400px] md:h-[600px] group ring-8 ring-white">
            {/* 👇 BURAYA ÇEKMECELİ KUTU FOTOĞRAFIN GELECEK */}
            <Image
              src="https://images.unsplash.com/photo-1512909481869-0eaa1e9817ba?q=80&w=2070&auto=format&fit=crop"
              alt="Can Dostum Box Çekmeceli Kutu Tasarımı"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8 md:p-16">
              <div className="text-white max-w-2xl transform transition-transform duration-500 group-hover:translate-y-[-10px]">
                <span className="bg-green-500 text-white text-xs font-black px-3 py-1.5 rounded-full mb-4 inline-block uppercase tracking-widest shadow-lg">
                  Türkiye'de Bir İlk
                </span>
                <h3 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                  Sürprizler Çekmecede Saklı
                </h3>
                <p className="text-lg md:text-xl opacity-90 font-medium">
                  Evinizin şık bir parçası olacak özel modüler tasarımımızla
                  tanışın.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 3. NEDEN FARKLIYIZ? (PREMIUM GRID KARTLAR) */}
      {/* ================================================================== */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
              Neden Farklıyız?
            </h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-green-400 to-teal-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Kutu 1 */}
            <div className="flex flex-col sm:flex-row gap-6 items-start bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center text-3xl flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
                📦
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                  Özel Çekmeceli Tasarım
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Sıradan kutular açılır ve atılır. Can Dostum Box ise özel{" "}
                  <span className="text-green-600 font-bold">
                    çekmeceli yapısıyla
                  </span>{" "}
                  evinizin bir parçası olur. Dostunuzun ödüllerini veya
                  karnesini saklayabileceğiniz modüler bir yaşam alanına
                  dönüşür.
                </p>
              </div>
            </div>

            {/* Kutu 2 */}
            <div className="flex flex-col sm:flex-row gap-6 items-start bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-teal-100 rounded-full flex items-center justify-center text-3xl flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
                🌿
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                  Doğa ve Can Dostu
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Premium tasarımımızı sürdürülebilirlikle birleştirdik. Doğaya
                  zarar vermeyen, geri dönüştürülebilir malzemelerimizle
                  dünyamızı paylaştığımız tüm canlılara saygı duyuyoruz.
                </p>
              </div>
            </div>

            {/* Kutu 3 */}
            <div className="flex flex-col sm:flex-row gap-6 items-start bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full flex items-center justify-center text-3xl flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
                🦜
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                  Tüm Canlara Dokunuyoruz
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Sadece kedi ve köpeklerin değil; kanatlı dostlarımızın ve tüm
                  küçük yol arkadaşlarımızın markasıyız. Her kutuyu, o türün{" "}
                  <span className="text-orange-500 font-bold">
                    spesifik ihtiyaçlarına
                  </span>{" "}
                  göre uzman ekiplerle tasarlıyoruz.
                </p>
              </div>
            </div>

            {/* Kutu 4 */}
            <div className="flex flex-col sm:flex-row gap-6 items-start bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-50 to-pink-100 rounded-full flex items-center justify-center text-3xl flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
                🎂
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                  Onun Özel Günü, Bizim Görevimiz
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  <span className="text-pink-500 font-bold">
                    "Dostumun Günü"
                  </span>{" "}
                  konseptimizle, tüylü veya tüysüz arkadaşınızın yaş gününü
                  unutmuyoruz. O ayki çekmecenizi tamamen kutlama odaklı dev
                  sürprizlerle dolduruyoruz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 4. VİZYON BLOĞU */}
      {/* ================================================================== */}
      <section className="py-24 bg-gradient-to-b from-green-50 to-[#F9FAFB]">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <div className="text-6xl mb-6 text-green-300 opacity-50 font-serif">
            "
          </div>
          <h3 className="text-2xl md:text-4xl font-black text-gray-900 mb-8 leading-snug tracking-tight">
            Amacımız; evcil hayvan sahipliğini bir sorumluluktan öte, her ay
            kapınızda beliren yeni bir keşif ve{" "}
            <span className="text-green-600">mutluluk yolculuğuna</span>{" "}
            dönüştürmek.
          </h3>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-gray-300"></div>
            <div className="text-sm font-black text-gray-400 tracking-[0.3em] uppercase">
              VİZYONUMUZ
            </div>
            <div className="h-px w-12 bg-gray-300"></div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 5. CTA (HAREKETE GEÇİRİCİ MESAJ) */}
      {/* ================================================================== */}
      <section className="py-24 md:py-32 bg-[#111827] text-white text-center relative overflow-hidden">
        {/* Dekor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500 rounded-full blur-[150px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500 rounded-full blur-[150px] opacity-20 -translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10 px-6 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight leading-tight">
            Dostunu hemen ailemize <br className="hidden md:block" />
            <span className="text-green-400">katmak ister misin?</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl font-medium mb-12">
            Uzman veterinerler eşliğinde hazırlanan kutularımızla tanışma vakti.
          </p>

          <Link
            href="/product"
            className="group relative overflow-hidden inline-flex items-center justify-center gap-3 bg-green-500 text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-green-600 transition-all duration-300 shadow-[0_20px_50px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95"
          >
            {/* Shimmer (Parlama) Efekti */}
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-25deg] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

            <span className="relative z-10">PAKETLERİ İNCELE</span>
            <span className="relative z-10 text-2xl group-hover:translate-x-2 transition-transform duration-300">
              🐾
            </span>
          </Link>
        </div>
      </section>

      {/* Global Animasyonlar (Eğer global.css'de yoksa diye burada da garantiye alıyoruz) */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(250%);
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
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          opacity: 0;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </main>
  );
}
