"use client";
import Link from "next/link";

export default function TermsOfUse() {
  return (
    <main className="min-h-screen bg-[#F3F4F6] font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <Link
          href="/"
          className="text-gray-500 hover:text-green-600 font-bold transition flex items-center gap-2"
        >
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

        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Kullanım Koşulları
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Site Kullanım Şartları ve Yasal Uyarılar
        </p>

        <div className="prose prose-gray max-w-none text-gray-600 space-y-6 leading-relaxed">
          <section>
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">
              1. GİRİŞ
            </h3>
            <p>
              Bu internet sitesine (www.candostumbox.com) girmeniz veya bu
              internet sitesindeki herhangi bir bilgiyi kullanmanız, aşağıdaki
              koşulları kabul ettiğiniz anlamına gelir.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">
              2. FİKRİ MÜLKİYET HAKLARI
            </h3>
            <p>
              Bu internet sitesinde bulunan bilgiler, yazılar, resimler,
              markalar, sloganlar ve diğer işaretler ile sair sınaî ve fikri
              mülkiyet haklarına ilişkin bilgilerin korunmasına yönelik
              programlarla, sayfa düzeni ve sitenin sunumu{" "}
              <strong>Günen Ticaret İnşaat Yapı Market</strong> mülkiyetindedir.
              Bu sitedeki bilgilerin izinsiz kopyalanması, değiştirilmesi veya
              yayınlanması yasaktır.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">
              3. SORUMLULUK SINIRLARI
            </h3>
            <p>
              Can Dostum Box, site üzerinde yer alan bilgilerin doğruluğunu
              sağlamak için elinden gelen çabayı gösterir ancak bilgilerin
              hatalı olmasından veya güncel olmamasından doğacak zararlardan
              sorumlu tutulamaz. Site yönetimi, dilediği zaman site içeriğini
              değiştirme hakkını saklı tutar.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">
              4. ÜYELİK VE GÜVENLİK
            </h3>
            <p>
              Kullanıcı, siteye üye olurken verdiği bilgilerin doğruluğunu
              taahhüt eder. Kullanıcı, şifresini başka kişi ya da kuruluşlara
              veremez. Kullanıcının şifresini kullanma hakkı bizzat kendisine
              aittir.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">
              5. YÜRÜRLÜK
            </h3>
            <p>
              Kullanıcı, siteyi kullanmaya başladığı andan itibaren bu koşulları
              kabul etmiş sayılır.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
