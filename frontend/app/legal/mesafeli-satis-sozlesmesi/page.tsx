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
        <p className="text-gray-400 text-sm mb-8">Son Güncelleme: 26.01.2026</p>

        <div className="prose prose-blue max-w-none text-gray-600 space-y-6 leading-relaxed text-sm">
          {/* 1. TARAFLAR */}
          <section>
            <h3 className="text-base font-black text-gray-900 uppercase">
              1. TARAFLAR
            </h3>
            <p className="mb-2">
              <strong>1.1. SATICI:</strong>
            </p>
            <ul className="list-none pl-0 space-y-1 mb-4">
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
                <strong>Vergi Dairesi / No:</strong> ÇEŞME / 4310063976
              </li>
            </ul>
            <p className="mb-2">
              <strong>1.2. ALICI:</strong>
            </p>
            <p>
              www.candostumbox.com internet sitesine üye olan veya sipariş
              veren, kişisel bilgileri üyelik/sipariş formunda yer alan kişidir.
            </p>
          </section>

          {/* 2. KONU VE KAPSAM */}
          <section>
            <h3 className="text-base font-black text-gray-900 uppercase">
              2. KONU VE KAPSAM
            </h3>
            <p>
              İşbu Sözleşme, Alıcı’nın Satıcı’ya ait internet sitesi üzerinden
              siparişini verdiği "Sürpriz Evcil Hayvan Kutusu" (Can Dostum Box)
              ve abonelik hizmetlerinin satışı, teslimi ve ödeme süreçlerini
              6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli
              Sözleşmeler Yönetmeliği uyarınca düzenler.
            </p>
          </section>

          {/* 3. SÖZLEŞME KONUSU ÜRÜN, BEDEL VE ABONELİK SİSTEMİ */}
          <section>
            <h3 className="text-base font-black text-gray-900 uppercase">
              3. SÖZLEŞME KONUSU ÜRÜN, BEDEL VE ABONELİK SİSTEMİ
            </h3>
            <p>
              <strong>3.1. Ürün Niteliği:</strong> Satıcı, "sürpriz kutu"
              konseptiyle hizmet vermektedir. Alıcı, kutu içeriğindeki ürünlerin
              (oyuncak, ödül maması, aksesuar vb.) tür ve markasının Satıcı
              tarafından seçildiğini, ürünlerin her ay değişkenlik
              gösterebileceğini kabul eder.
            </p>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 my-4">
              <p className="m-0">
                <strong>3.2. Ödeme Altyapısı ve Güvenlik:</strong> Ödemeler{" "}
                <strong>Param (ParamPOS)</strong> altyapısı ile
                gerçekleştirilir. Alıcı; kredi kartı bilgilerinin Satıcı
                tarafından tutulmadığını, güvenliğin ilgili ödeme kuruluşu
                tarafından sağlandığını kabul eder.
              </p>
            </div>
            <p>
              <strong>3.3. Abonelik ve Otomatik Tahsilat:</strong> Alıcı, süreli
              abonelik (3, 6, 12 aylık vb.) veya yenilenen aylık paket seçmesi
              durumunda; seçilen periyotlarda paket bedelinin kayıtlı kredi
              kartından ParamPOS üzerinden otomatik olarak tahsil edilmesini
              peşinen kabul ve beyan eder.
            </p>
          </section>

          {/* 4. GENEL HÜKÜMLER */}
          <section>
            <h3 className="text-base font-black text-gray-900 uppercase">
              4. GENEL HÜKÜMLER
            </h3>
            <p>
              <strong>4.1.</strong> Alıcı, teslimatın yasal 30 günlük süreyi
              aşmayacağını ve kargo ücretinin (aksi belirtilmedikçe) kendisine
              ait olduğunu/sepet tutarına dahil olduğunu bilir.
            </p>
            <p>
              <strong>4.2.</strong> Satıcı, kutu içeriğinde yer alan gıda/mama
              ürünlerinin son kullanma tarihlerinden ve veteriner
              onaylı/sağlıklı içeriklerden oluşmasından sorumludur.
            </p>
          </section>

          {/* 5. CAYMA HAKKI, İPTAL VE İADE KOŞULLARI */}
          <section>
            <h3 className="text-base font-black text-gray-900 uppercase">
              5. CAYMA HAKKI, İPTAL VE İADE KOŞULLARI
            </h3>
            <p>
              <strong>5.1. Cayma Hakkı:</strong> Alıcı, kutunun tesliminden
              itibaren 14 (on dört) gün içinde cayma hakkına sahiptir. Ancak;
              ambalajı açılmış, hijyenik özelliğini yitirmiş ürünler ile son
              kullanma tarihi geçme riski olan gıda maddelerinde (açılmış mama
              paketleri vb.) mevzuat gereği cayma hakkı kullanılamaz.
            </p>
            <p>
              <strong>5.2. Abonelik İptali:</strong> Alıcı, bir sonraki
              periyodun tahsilatı yapılmadan en geç 5 (beş) iş günü öncesine
              kadar aboneliğini kullanıcı paneli üzerinden veya e-posta yoluyla
              iptal edebilir. Bu süreden sonra yapılan iptaller, bir sonraki
              aydan itibaren geçerli olur.
            </p>
          </section>

          {/* 6. KİŞİSEL VERİLERİN KORUNMASI (KVKK) */}
          <section>
            <h3 className="text-base font-black text-gray-900 uppercase">
              6. KİŞİSEL VERİLERİN KORUNMASI (KVKK)
            </h3>
            <p>
              Alıcı; evcil hayvanına ait bilgilerin (isim, yaş, alerji durumu
              vb.) hizmetin kişiselleştirilmesi amacıyla işlenmesine ve ödeme
              süreçlerinin tamamlanması adına finansal verilerin Param ödeme
              kuruluşu ile paylaşılmasına onay verdiğini kabul eder.
            </p>
          </section>

          {/* 7. YETKİLİ MAHKEME */}
          <section>
            <h3 className="text-base font-black text-gray-900 uppercase">
              7. YETKİLİ MAHKEME
            </h3>
            <p>
              İşbu sözleşmenin uygulanmasında, Ticaret Bakanlığınca ilan edilen
              değere kadar Tüketici Hakem Heyetleri ile Alıcı'nın veya
              Satıcı'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
