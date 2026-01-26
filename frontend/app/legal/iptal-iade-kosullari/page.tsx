"use client";
import Link from "next/link";

export default function CancellationRefundPolicy() {
  return (
    <main className="min-h-screen bg-[#F3F4F6] font-sans py-12 px-4 sm:px-6 lg:px-8">
      {/* Üst Navigasyon */}
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
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">
          İptal ve İade Koşulları
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Cayma Hakkı ve Ürün İade Prosedürleri
        </p>

        <div className="prose prose-red max-w-none text-gray-600 space-y-6 leading-relaxed">
          <section>
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">
              1. CAYMA HAKKI
            </h3>
            <p>
              6502 sayılı Tüketicinin Korunması Hakkında Kanun gereğince, alıcı;
              mal satışına ilişkin mesafeli sözleşmelerde, ürünün kendisine veya
              gösterdiği adresteki kişi/kuruluşa teslim tarihinden itibaren{" "}
              <strong>14 (on dört) gün</strong> içerisinde, hiçbir hukuki ve
              cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin
              malı reddederek sözleşmeden cayma hakkına sahiptir.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">
              2. CAYMA HAKKI KULLANILAMAYACAK ÜRÜNLER
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Paketi açılmış, koruma bandı yırtılmış kedi/köpek mamaları
                (sağlık ve hijyen açısından uygun olmadığı için).
              </li>
              <li>
                Çabuk bozulma tehlikesi olan veya son kullanma tarihi geçme
                ihtimali olan ürünler.
              </li>
              <li>
                Alıcının isteği veya kişisel ihtiyaçları doğrultusunda
                hazırlanan özel ürünler (Örn: İsim yazılı tasmalar).
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">
              3. ABONELİK İPTALİ
            </h3>
            <p>
              Abonelik sistemimizde dilediğiniz zaman iptal işlemi
              gerçekleştirebilirsiniz. Eğer o ayın kutusu henüz kargoya
              verilmediyse, ücret iadeniz kesintisiz yapılır. Kargo süreci
              başladıysa iptal işlemi bir sonraki ay için geçerli olur.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">
              4. İADE PROSEDÜRÜ
            </h3>
            <p>
              İade etmek istediğiniz ürünler için lütfen önce{" "}
              <strong>destek@candostum.com</strong> adresine e-posta göndererek
              talep oluşturunuz. Onaylanan iadeler, anlaşmalı olduğumuz kargo
              firması aracılığıyla, "Karşı Ödemeli" olarak gönderilebilir.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2 text-sm">
              <strong>İade Adresi:</strong> 16 Eylül Mah. 3042 Sok. No:30/a
              Çeşme/İzmir
            </div>
          </section>

          <section>
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">
              5. ÜCRET İADESİ
            </h3>
            <p>
              İade edilen ürünün depomuza ulaşması ve şartlara uygunluğunun
              kontrol edilmesinin ardından, ürün bedeli{" "}
              <strong>3 ile 7 iş günü</strong> içerisinde ödeme yaptığınız karta
              iade edilir. Bankanızın süreçlerine bağlı olarak iadenin
              hesabınıza yansıması birkaç gün sürebilir.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
