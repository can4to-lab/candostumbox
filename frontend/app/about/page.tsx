"use client";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fcfcfc] font-sans text-gray-800">
      
      {/* 1. HERO BÖLÜMÜ: Biz Kimiz? */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
            <span className="text-teal-500 font-bold tracking-widest text-sm uppercase mb-4 block animate-fade-in-up">
                BİZ KİMİZ?
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight animate-fade-in-up delay-100">
                Bir Kutudan Çok Daha Fazlası: <br/>
                <span className="text-green-600">Can Dostum Box Hikayesi</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed animate-fade-in-up delay-200">
                Her şey, can dostlarımızın hayatımıza kattığı o saf sevgiye nasıl teşekkür edebileceğimizi düşünmemizle başladı. 
                Biz sadece bir mama veya oyuncak kutusu hazırlamak istemedik; biz, her ay kapınız çalındığında hem sizin hem de 
                dostunuzun kalbini hızlandıracak bir deneyim tasarlamak istedik.
            </p>
        </div>
        
        {/* Dekoratif Arka Plan */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-30 translate-x-1/3 translate-y-1/3"></div>
      </section>

      {/* 2. GÖRSEL VE ÇEKMECELİ KUTU VURGUSU */}
      <section className="py-12">
        <div className="container mx-auto px-6">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[400px] md:h-[600px] group">
                {/* 👇 BURAYA ÇEKMECELİ KUTU FOTOĞRAFIN GELECEK */}
                {/* Şimdilik placeholder koydum, kendi görselinle değiştir */}
                <Image 
                    src="https://images.unsplash.com/photo-1512909481869-0eaa1e9817ba?q=80&w=2070&auto=format&fit=crop" 
                    alt="Can Dostum Box Çekmeceli Kutu Tasarımı" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-8 md:p-16">
                    <div className="text-white max-w-2xl">
                        <h3 className="text-3xl font-bold mb-2">🎁 Sürprizler Çekmecede Saklı</h3>
                        <p className="text-lg opacity-90">Evinizin şık bir parçası olacak modüler tasarım.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 3. NEDEN FARKLIYIZ? (GRID) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Neden Farklıyız?</h2>
                <div className="h-1 w-24 bg-green-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* Kutu 1: Çekmeceli Tasarım */}
                <div className="flex gap-6 items-start p-6 rounded-3xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 text-green-600">
                        📦
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Türkiye’nin İlk Çekmeceli Kutusu</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Sıradan kutular açılır ve atılır. Can Dostum Box ise özel <span className="text-teal-600 font-bold">çekmeceli tasarımıyla</span> evinizin bir parçası olur. 
                            Dostunuzun ödül mamalarını veya sağlık karnesini saklayabileceğiniz şık bir modüler kutu olarak hayatınıza devam eder.
                        </p>
                    </div>
                </div>

                {/* Kutu 2: Doğa Dostu */}
                <div className="flex gap-6 items-start p-6 rounded-3xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                    <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 text-teal-600">
                        🌿
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Doğa ve Can Dostu</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Premium tasarımımızı sürdürülebilirlikle birleştirdik. Doğaya zarar vermeyen malzemelerimizle, dünyamızı paylaştığımız tüm canlılara saygı duyuyoruz.
                        </p>
                    </div>
                </div>

                {/* Kutu 3: Tüm Canlar */}
                <div className="flex gap-6 items-start p-6 rounded-3xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 text-orange-600">
                        🦜
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Tüm Canlara Dokunuyoruz</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Sadece kedi ve köpeklerin değil; kanatlı dostlarımızın, kemirgenlerimizin ve tüm küçük yol arkadaşlarımızın markasıyız. 
                            Her kutuyu, o türün <span className="text-teal-600 font-bold">spesifik ihtiyaçlarına</span> göre uzman ekiplerle kürate ediyoruz.
                        </p>
                    </div>
                </div>

                {/* Kutu 4: Özel Gün */}
                <div className="flex gap-6 items-start p-6 rounded-3xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                    <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 text-pink-600">
                        🎂
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Onun En Özel Günü, Bizim Görevimiz</h3>
                        <p className="text-gray-600 leading-relaxed">
                            <span className="text-teal-600 font-bold">"Dostumun Günü"</span> konseptimizle, tüylü (veya tüysüz!) arkadaşınızın doğum günlerini unutmuyoruz. 
                            O ayki çekmecenizi tamamen kutlama odaklı sürprizlerle dolduruyoruz.
                        </p>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* 4. VİZYON BLOĞU */}
      <section className="py-20 bg-green-50">
        <div className="container mx-auto px-6 text-center max-w-4xl">
            <div className="text-4xl mb-6 text-green-600">❝</div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 italic leading-normal">
                Can Dostum Box olarak amacımız; evcil hayvan sahipliğini bir sorumluluktan öte, her ay yeni bir keşif ve mutluluk yolculuğuna dönüştürmek.
            </h3>
            <div className="text-sm font-bold text-gray-500 tracking-widest uppercase">- VİZYONUMUZ</div>
        </div>
      </section>

      {/* 5. CTA (HAREKETE GEÇİRİCİ MESAJ) */}
      <section className="py-24 bg-gray-900 text-white text-center relative overflow-hidden">
         <div className="relative z-10 px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-8">Dostunu hemen ailemize katmak ister misin?</h2>
            <Link 
                href="/product" 
                className="inline-block bg-green-600 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-green-700 transition transform hover:scale-105 shadow-xl shadow-green-900/50"
            >
                Paketleri İncele 👉
            </Link>
         </div>
         {/* Dekor */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full blur-[100px] opacity-20"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20"></div>
      </section>

    </main>
  );
}