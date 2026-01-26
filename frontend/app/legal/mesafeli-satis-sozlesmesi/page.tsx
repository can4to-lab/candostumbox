"use client";
import Link from "next/link";

export default function DistanceSalesAgreement() {
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
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Mesafeli Satış Sözleşmesi
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Son Güncelleme: {new Date().toLocaleDateString("tr-TR")}
        </p>

        <div className="prose prose-blue max-w-none text-gray-600 space-y-6 leading-relaxed text-sm">
          <section>
            <h3 className="text-base font-black text-gray-900 uppercase">
              1. TARAFLAR
            </h3>
            <p className="mb-2">
              <strong>1.1. SATICI:</strong>
            </p>
            <ul className="list-none pl-0 space-y-1">
              <li>
                <strong>Unvan:</strong> Günen Ticaret İnşaat Yapı Market
              </li>
              <li>
                <strong>Adres:</strong> 16 Eylül Mah. 3042 Sok. No:30/a
                Çeşme/İzmir
              </li>
              <li>
                <strong>Telefon:</strong> 0 533 513 62 60
              </li>
              <li>
                <strong>E-Posta:</strong> destek@candostum.com
              </li>
              <li>
                <strong>Mersis No:</strong> [MERSİS NO]
              </li>
            </ul>
            <p className="mt-4 mb-2">
              <strong>1.2. ALICI:</strong>
            </p>
            <p>
              “Alıcı”, www.candostumbox.com internet sitesine üye olan veya
              sipariş veren kişidir. Üyelik veya sipariş sürecinde kullanılan
              adres ve iletişim bilgileri esas alınır.
            </p>
          </section>

          <section>
            <h3 className="text-base font-black text-gray-900 uppercase">
              2. KONU
            </h3>
            <p>
              İşbu Sözleşme’nin konusu, Alıcı’nın Satıcı’ya ait internet sitesi
              üzerinden elektronik ortamda siparişini verdiği aşağıda
              nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi
              ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun
              ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların
              hak ve yükümlülüklerinin saptanmasıdır.
            </p>
          </section>

          <section>
            <h3 className="text-base font-black text-gray-900 uppercase">
              3. SÖZLEŞME KONUSU ÜRÜN VE BEDELİ
            </h3>
            <p>
              Ürünlerin cinsi, türü, miktarı, marka/modeli, rengi, adedi, satış
              bedeli, ödeme şekli, siparişin sonlandığı andaki bilgilerden
              oluşmaktadır. Bu bilgiler Alıcı'ya e-posta yoluyla da
              iletilmektedir.
            </p>
            <p className="bg-blue-50 p-3 rounded border border-blue-100 mt-2">
              <strong>Ödeme Altyapısı:</strong> Kredi kartı ile yapılan ödemeler{" "}
              <strong>Param (ParamPOS)</strong> güvencesiyle alınmaktadır.
              Satıcı, kredi kartı bilgilerini saklamaz.
            </p>
          </section>

          <section>
            <h3 className="text-base font-black text-gray-900 uppercase">
              4. GENEL HÜKÜMLER
            </h3>
            <p>
              4.1. Alıcı, internet sitesinde sözleşme konusu ürünün temel
              nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön
              bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda
              gerekli teyidi verdiğini beyan eder.
            </p>
            <p>
              4.2. Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu
              ile her bir ürün için Alıcı'nın yerleşim yerinin uzaklığına bağlı
              olarak internet sitesinde ön bilgiler içinde açıklanan süre içinde
              Alıcı veya gösterdiği adresteki kişi/kuruluşa teslim edilir.
            </p>
          </section>

          <section>
            <h3 className="text-base font-black text-gray-900 uppercase">
              5. CAYMA HAKKI
            </h3>
            <p>
              Alıcı; mal teslimine ilişkin sözleşmelerde, malın kendisine veya
              gösterdiği adresteki kişi/kuruluşa teslim tarihinden itibaren 14
              (on dört) gün içerisinde hiçbir hukuki ve cezai sorumluluk
              üstlenmeksizin ve hiçbir gerekçe göstermeksizin malı reddederek
              sözleşmeden cayma hakkına sahiptir. (Bkz: İptal ve İade Koşulları)
            </p>
          </section>

          <section>
            <h3 className="text-base font-black text-gray-900 uppercase">
              6. YETKİLİ MAHKEME
            </h3>
            <p>
              İşbu sözleşmenin uygulanmasında, Sanayi ve Ticaret Bakanlığınca
              ilan edilen değere kadar Tüketici Hakem Heyetleri ile Alıcı'nın
              veya Satıcı'nın yerleşim yerindeki Tüketici Mahkemeleri
              yetkilidir.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
