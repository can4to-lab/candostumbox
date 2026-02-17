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
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Can Dostum Box ailesi olarak, minik dostlarımızın mutluluğu bizim
          önceliğimizdir. Ancak aldığınız hizmetten vazgeçmek veya ürünü iade
          etmek isterseniz, aşağıdaki süreçler geçerlidir:
        </p>

        <div className="prose prose-red max-w-none text-gray-600 space-y-6 leading-relaxed text-sm">
          <section>
            <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-2 mb-3 uppercase">
              1. Sipariş İptali (Tahsilat Öncesi ve Sonrası)
            </h3>
            <p className="mb-2">
              <strong>Tek Seferlik Siparişler:</strong> Siparişiniz kargoya
              verilmeden önce <strong>destek@candostum.com</strong> adresine
              yazarak veya <strong>0 533 513 62 60</strong> numaralı hattımızdan
              bize ulaşarak siparişinizi tamamen iptal edebilirsiniz. Ücret
              iadesi, ödeme yaptığınız karta 1-3 iş günü içinde yansıtılır.
            </p>
            <p>
              <strong>Abonelik İptali:</strong> Aboneliğinizi dilediğiniz zaman
              sonlandırabilirsiniz. Bir sonraki ayın kutusunun gönderilmemesi ve
              otomatik ödemenin alınmaması için, yenileme tarihinden en geç 5 iş
              günü önce iptal işlemini gerçekleştirmeniz gerekmektedir.
            </p>
          </section>

          <section>
            <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-2 mb-3 uppercase">
              2. İade Koşulları (Cayma Hakkı)
            </h3>
            <p className="mb-2">
              6502 sayılı Tüketicinin Korunması Hakkında Kanun gereği, ürünü
              teslim aldığınız tarihten itibaren 14 gün içinde iade etme
              hakkınız bulunmaktadır. Ancak iadenin kabul edilmesi için şu
              şartlar aranır:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Kutu Bütünlüğü:</strong> Sürpriz kutu konsepti
                nedeniyle, kutu içeriğindeki ürünlerin (oyuncak, aksesuar vb.)
                orijinal ambalajlarının açılmamış, kullanılmamış ve hasar
                görmemiş olması gerekmektedir.
              </li>
              <li>
                <strong>Hijyen ve Gıda İstisnası:</strong> Ambalajı açılmış
                mamalar, ödül gıdaları ve hijyenik özelliği olan bakım ürünleri
                (şampuan, tarak vb.) sağlık ve hijyen kuralları gereği iade
                kapsamı dışındadır.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-2 mb-3 uppercase">
              3. Hasarlı veya Kusurlu Ürünler
            </h3>
            <p>
              Kutunuz size ulaştığında kargo paketinde belirgin bir hasar varsa,
              lütfen kargo görevlisine "Hasar Tespit Tutanağı" tutturunuz. Kutu
              içindeki bir üründe üretim hatası veya kusur olması durumunda,
              kusurlu ürünün fotoğrafını çekerek bize ilettiğinizde, ek bir
              ücret talep etmeden yeni ürün gönderimi sağlanacaktır.
            </p>
          </section>

          <section>
            <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-2 mb-3 uppercase">
              4. Geri Ödeme Süreci
            </h3>
            <p className="mb-2">
              İadeniz onaylandıktan sonra, ödenen tutarın iadesi{" "}
              <strong>ParamPOS</strong> altyapısı üzerinden gerçekleştirilir.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Kredi kartı ile yapılan ödemelerde iade, bankanızın
                prosedürlerine bağlı olarak <strong>2-10 iş günü</strong> içinde
                kartınıza yansır.
              </li>
              <li>
                Taksitli yapılan alışverişlerde iadeler, banka kuralları gereği
                karta taksitli şekilde iade edilebilir.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
