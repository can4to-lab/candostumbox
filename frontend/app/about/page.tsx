"use client";
import Link from "next/link";

export default function WhyUsPage() {
  const features = [
    {
      icon: "🩺",
      title: "Veteriner Onaylı Seçimler",
      desc: "Kutularımıza giren her oyuncak ve mama, uzman veteriner hekimlerimiz tarafından sağlık ve güvenlik kontrolünden geçirilir. Dostunun sağlığıyla asla kumar oynamayız.",
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      icon: "🌿",
      title: "%100 Doğal İçerik",
      desc: "Ödül mamalarımızda koruyucu, renklendirici veya katkı maddesi bulunmaz. Sadece gerçek et ve sebzelerden oluşan, besin değeri yüksek atıştırmalıklar seçiyoruz.",
      color: "bg-green-50 text-green-600 border-green-100"
    },
    {
      icon: "💪",
      title: "Dayanıklılık Garantisi",
      desc: "Parçalanan oyuncaklardan sıkıldın mı? CanDostumBox, en güçlü çenelere bile meydan okuyan, test edilmiş dayanıklı oyuncaklar gönderir.",
      color: "bg-orange-50 text-orange-600 border-orange-100"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HERO BÖLÜMÜ --- */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <span className="inline-block py-2 px-4 rounded-full bg-green-100 text-green-700 text-xs font-bold tracking-wider uppercase mb-4 animate-fade-in-up">
            Farkımız Nedir?
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Sıradan Bir Kutudan <br/> <span className="text-green-600">Çok Daha Fazlası</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Biz sadece ürün satmıyoruz; dostunla arandaki bağı güçlendiren, güvenli ve sağlıklı bir deneyim tasarlıyoruz. İşte bizi diğerlerinden ayıran standartlarımız.
          </p>
        </div>

        {/* --- ÖZELLİK KARTLARI --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {features.map((feature, idx) => (
            <div key={idx} className={`p-10 rounded-[2.5rem] border ${feature.color.replace('bg-', 'border-').split(' ')[2]} bg-white shadow-xl shadow-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group`}>
              <div className={`w-20 h-20 ${feature.color} rounded-3xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* --- HİKAYEMİZ / MANİFESTO --- */}
        <div className="bg-gray-900 rounded-[3rem] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-4xl mx-auto">
             <div className="text-6xl mb-6">🤝</div>
             <h2 className="text-3xl md:text-5xl font-black mb-6">Söz Veriyoruz.</h2>
             <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-10 font-light">
               "Kendi evcil hayvanımıza yedirmeyeceğimiz hiçbir mamayı, oynatmayacağımız hiçbir oyuncağı kutularımıza koymuyoruz. Her CanDostumBox, bizim ailemizden sizin ailenize gönderilen bir sevgi paketidir."
             </p>
             
             <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/product" className="px-10 py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-900/50">
                   Paketleri İncele 🎁
                </Link>
                <Link href="/contact" className="px-10 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition backdrop-blur-sm">
                   Bize Ulaş 📞
                </Link>
             </div>
          </div>
          
          {/* Arka Plan Dekorasyonları */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 opacity-20 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-20 blur-[100px] rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        {/* --- İSTATİSTİKLER --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 text-center">
            <div>
                <div className="text-4xl font-black text-gray-900 mb-1">10.000+</div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Mutlu Dost</div>
            </div>
            <div>
                <div className="text-4xl font-black text-gray-900 mb-1">%100</div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Müşteri Memnuniyeti</div>
            </div>
            <div>
                <div className="text-4xl font-black text-gray-900 mb-1">50+</div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Anlaşmalı Marka</div>
            </div>
            <div>
                <div className="text-4xl font-black text-gray-900 mb-1">24/7</div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Veteriner Desteği</div>
            </div>
        </div>

      </div>
    </div>
  );
}