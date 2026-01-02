"use client";
import Link from "next/link";

export default function DistanceSalesAgreement() {
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

      {/* Sözleşme Kağıdı */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 overflow-hidden relative">
        
        {/* Dekoratif Header */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Mesafeli Satış Sözleşmesi</h1>
        <p className="text-gray-400 text-sm mb-8">Son Güncelleme: 02.01.2026</p>

        <div className="prose prose-green max-w-none text-gray-600 space-y-6 leading-relaxed">
            
            {/* MADDE 1 */}
            <section>
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">MADDE 1 – TARAFLAR</h3>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 text-sm">
                    <p className="mb-2"><strong className="text-gray-900">SATICI:</strong></p>
                    <ul className="list-none pl-0 space-y-1">
                        <li><strong>Ünvanı:</strong> Can Dostum Box (Şirket Ünvanınız)</li>
                        <li><strong>Adresi:</strong> 16 Eylül Mah. 3042 Sokak No:24 Çeşme / İzmir</li>
                        <li><strong>E-posta:</strong> info@candostum.com</li>
                        <li><strong>Telefon:</strong> 0850 123 45 67</li>
                    </ul>
                    <div className="my-4 border-t border-gray-200"></div>
                    <p className="mb-2"><strong className="text-gray-900">ALICI:</strong></p>
                    <p>Can Dostum Box internet sitesine (www.candostumbox.com) üye olan veya sipariş veren müşteri.</p>
                </div>
            </section>

            {/* MADDE 2 */}
            <section>
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">MADDE 2 – KONU</h3>
                <p>İşbu sözleşmenin konusu, ALICI’nın SATICI’ya ait internet sitesinden elektronik ortamda siparişini yaptığı, sözleşmede bahsi geçen nitelikleri haiz ve yine sözleşmede satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>
            </section>

            {/* MADDE 3 */}
            <section>
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">MADDE 3 – SÖZLEŞME KONUSU ÜRÜN</h3>
                <p>Ürünlerin Cinsi ve Türü, Miktarı, Marka/Modeli, Rengi, Satış Bedeli site üzerinde belirtildiği gibidir.</p>
                <p className="mt-2">Ödeme Şekli: Kredi Kartı / Banka Kartı ile Online Ödeme</p>
                <p>Teslimat Adresi: Alıcının sipariş anında belirttiği adrestir.</p>
            </section>

            {/* MADDE 4 */}
            <section>
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">MADDE 4 – GENEL HÜKÜMLER</h3>
                <ul className="list-disc pl-5 space-y-2">
                    <li>ALICI, internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.</li>
                    <li>Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün için ALICI'nın yerleşim yerinin uzaklığına bağlı olarak internet sitesinde ön bilgiler içinde açıklanan süre zarfında ALICI veya gösterdiği adresteki kişi/kuruluşa teslim edilir.</li>
                    <li>Ürün teslimatı anında ürünün kargo yetkilisi tarafından hasarlı olup olmadığı kontrol edilmelidir. Hasarlı paketler teslim alınmamalı ve tutanak tutulmalıdır.</li>
                </ul>
            </section>

            {/* MADDE 5 */}
            <section>
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">MADDE 5 – CAYMA HAKKI</h3>
                <p>ALICI; mal satışına ilişkin mesafeli sözleşmelerde, ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa teslim tarihinden itibaren <strong>14 (on dört) gün</strong> içerisinde hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin malı reddederek sözleşmeden cayma hakkına sahiptir.</p>
            </section>

            {/* MADDE 6 */}
            <section>
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">MADDE 6 – CAYMA HAKKI KULLANILAMAYACAK ÜRÜNLER</h3>
                <p>Yönetmelik gereği aşağıdaki ürünlerde cayma hakkı kullanılamaz:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>a) ALICI’nın istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan ürünler (Örn: Dostunuzun ismine özel hazırlanan etiketler, tasmalar vb.).</li>
                    <li>b) Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler (Açılmış mamalar, ödül mamaları).</li>
                    <li>c) Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan mallardan; iadesi sağlık ve hijyen açısından uygun olmayanlar.</li>
                </ul>
            </section>

            {/* MADDE 7 */}
            <section>
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">MADDE 7 – YETKİLİ MAHKEME</h3>
                <p>İşbu sözleşmenin uygulanmasında, Sanayi ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri ile ALICI'nın veya SATICI'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.</p>
            </section>

        </div>
      </div>
    </main>
  );
}