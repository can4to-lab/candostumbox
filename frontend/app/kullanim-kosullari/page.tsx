"use client";
import Link from "next/link";

export default function TermsOfUse() {
  return (
    <main className="min-h-screen bg-[#F3F4F6] font-sans py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Üst Navigasyon */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <Link href="/" className="text-gray-500 hover:text-green-600 font-bold transition flex items-center gap-2">
          ← Anasayfaya Dön
        </Link>
        <button 
            onClick={() => window.print()} 
            className="bg-white text-gray-900 px-4 py-2 rounded-lg border border-gray-200 font-bold hover:bg-gray-50 transition shadow-sm text-sm"
        >
            🖨️ Yazdır
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-700 to-gray-900"></div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Kullanım Koşulları</h1>
        <p className="text-gray-400 text-sm mb-8">Son Güncelleme: 02.01.2026</p>

        <div className="prose prose-gray max-w-none text-gray-600 space-y-6 leading-relaxed">
            
            <section>
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">1. GİRİŞ</h3>
                <p>Bu internet sitesini (www.candostumbox.com) ziyaret ederek veya kullanarak, aşağıda yazılı kullanım koşullarını kabul etmiş sayılırsınız. Can Dostum Box, bu koşulları dilediği zaman değiştirme hakkını saklı tutar.</p>
            </section>

            <section>
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">2. FİKRİ MÜLKİYET HAKLARI</h3>
                <p>İşbu sitede yer alan unvan, işletme adı, marka, patent, logo, tasarım, bilgi ve yöntem gibi tescilli veya tescilsiz tüm fikri mülkiyet hakları site işleteni ve sahibi firmaya veya belirtilen ilgilisine ait olup, ulusal ve uluslararası hukukun koruması altındadır. İşbu sitenin ziyaret edilmesi veya bu sitedeki hizmetlerden yararlanılması söz konusu fikri mülkiyet hakları konusunda hiçbir hak vermez.</p>
            </section>

            <section>
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">3. KULLANIM KURALLARI</h3>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Kullanıcı, siteyi kullanırken yasalara, genel ahlak kurallarına ve üçüncü kişilerin haklarına saygılı olmayı kabul eder.</li>
                    <li>Siteye zarar verecek, işleyişini aksatacak (spam, virüs, trojan vb.) yazılımların kullanılması yasaktır.</li>
                    <li>Kullanıcı, siteye üye olurken verdiği bilgilerin doğruluğundan sorumludur. Yanlış bilgi verilmesi durumunda doğacak zararlardan site sorumlu tutulamaz.</li>
                </ul>
            </section>

            <section>
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">4. HİZMET SÜREKLİLİĞİ</h3>
                <p>Can Dostum Box, taahhüt ettiği hizmetlerin sürekliliğini sağlamak için gerekli çabayı gösterecektir. Ancak teknik arızalar, siber saldırılar veya mücbir sebeplerden dolayı hizmetin kesintiye uğramasından sorumlu tutulamaz.</p>
            </section>

            <section>
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">5. YETKİLİ MAHKEME</h3>
                <p>İşbu kullanım koşullarından doğacak uyuşmazlıklarda İzmir Mahkemeleri ve İcra Daireleri yetkilidir.</p>
            </section>

        </div>
      </div>
    </main>
  );
}