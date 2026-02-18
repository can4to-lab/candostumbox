"use client";
import Link from "next/link";

export default function PrivacyPolicy() {
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
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-teal-600"></div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Gizlilik Politikası
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni
        </p>

        <div className="prose prose-green max-w-none text-gray-600 space-y-6 leading-relaxed">
          <section>
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">
              1. VERİ SORUMLUSU
            </h3>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca,
              kişisel verileriniz; veri sorumlusu olarak{" "}
              <strong>Can Dostum Box (Günen Ticaret İnşaat Yapı Market)</strong>{" "}
              tarafından aşağıda açıklanan kapsamda işlenebilecektir.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">
              2. HANGİ VERİLERİ TOPLUYORUZ?
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Kimlik Bilgileri:</strong> Ad, soyad, TC kimlik numarası
                (fatura kesimi için yasal zorunluluk).
              </li>
              <li>
                <strong>İletişim Bilgileri:</strong> Adres, telefon numarası,
                e-posta adresi.
              </li>
              <li>
                <strong>Evcil Hayvan Bilgileri:</strong> Dostunuzun adı, türü,
                ırkı, kilosu, doğum tarihi.
              </li>
              <li>
                <strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, şifre
                bilgileri.
              </li>
            </ul>
            <p className="text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-100 mt-3 text-yellow-800">
              <strong>Önemli Not:</strong> Kredi kartı bilgileriniz
              sunucularımızda <u>saklanmamaktadır</u>. Ödeme işlemleri BDDK
              lisanslı ödeme kuruluşu <strong>Param (ParamPOS)</strong>{" "}
              altyapısı üzerinden güvenle gerçekleştirilir.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">
              3. VERİLERİNİZİ NEDEN İŞLİYORUZ?
            </h3>
            <p>
              Toplanan kişisel verileriniz; siparişlerinizi teslim etmek, ödeme
              işlemlerini gerçekleştirmek, size özel kampanyalar sunmak ve yasal
              yükümlülüklerimizi yerine getirmek amacıyla işlenmektedir.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">
              4. VERİ AKTARIMI
            </h3>
            <p>
              Kişisel verileriniz; siparişin size ulaşması için kargo şirketleri
              ile, ödemenin alınması için <strong>ParamPOS</strong> ile ve
              kanunen yetkili kamu kurumları ile paylaşılmaktadır.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2 mb-3">
              5. HAKLARINIZ
            </h3>
            <p>
              KVKK’nın 11. maddesi uyarınca, verilerinizin işlenip işlenmediğini
              öğrenme, yanlışsa düzeltilmesini isteme, silinmesini talep etme
              hakkına sahipsiniz. Taleplerinizi{" "}
              <strong>destek@candostumbox.com</strong> adresine iletebilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
