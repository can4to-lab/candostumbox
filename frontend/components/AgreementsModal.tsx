"use client";

interface AgreementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgreementsModal({ isOpen, onClose }: AgreementsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
      {/* Modal Kutusu */}
      <div className="bg-white rounded-3xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl animate-fade-in-up relative">
        
        {/* Başlık */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl">
            <h2 className="text-xl font-black text-gray-900">Mesafeli Satış Sözleşmesi</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl font-bold">&times;</button>
        </div>

        {/* Metin Alanı (Scroll Olabilir) */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-grow text-sm text-gray-600 leading-relaxed space-y-4">
            <p><strong>MADDE 1 – TARAFLAR</strong></p>
            <p>
                <strong>SATICI:</strong><br/>
                Ünvanı: Can Dostum Box (Şirket Ünvanınız)<br/>
                Adresi: 16 Eylül Mah. 3042 Sok. No:24 Çeşme/İzmir<br/>
                E-posta: info@candostum.com
            </p>
            <p>
                <strong>ALICI:</strong><br/>
                Sipariş veren müşteri.
            </p>

            <p><strong>MADDE 2 – KONU</strong></p>
            <p>İşbu sözleşmenin konusu, ALICI’nın SATICI’ya ait internet sitesinden elektronik ortamda siparişini yaptığı ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>

            <p><strong>MADDE 3 – ÜRÜN BİLGİLERİ</strong></p>
            <p>Sipariş edilen abonelik paketinin türü, süresi ve satış bedeli ödeme sayfasında belirtildiği gibidir.</p>

            <p><strong>MADDE 4 – CAYMA HAKKI</strong></p>
            <p>ALICI, 14 gün içinde sebep göstermeksizin cayma hakkına sahiptir. Ancak, kişiye özel hazırlanan (pet ismine özel) ürünlerde veya açılmış hijyenik ürünlerde/mamalarda cayma hakkı kullanılamaz.</p>

            <p><strong>MADDE 5 – YETKİLİ MAHKEME</strong></p>
            <p>İşbu sözleşmeden doğan uyuşmazlıklarda Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.</p>
            
            {/* ... Diğer maddeleri buraya ekleyebilirsin ... */}
        </div>

        {/* Alt Buton */}
        <div className="p-6 border-t border-gray-100 bg-white rounded-b-3xl">
            <button 
                onClick={onClose} 
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition"
            >
                Okudum, Anladım
            </button>
        </div>
      </div>
    </div>
  );
}