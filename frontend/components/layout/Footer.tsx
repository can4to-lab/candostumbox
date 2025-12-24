export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 border-t border-gray-800 text-center mt-auto">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-left">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-6">
                        <img src="/logo_arka.png" alt="Logo" className="h-10 w-auto opacity-90 invert brightness-0" />
                        <span className="font-bold text-xl">CanDostumBox</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Minik dostlarınız için her ay özenle hazırlanan sürpriz mutluluk kutuları. Sevgiyle paketlendi.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-6">Kurumsal</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-green-400 transition">Hakkımızda</a></li>
                        <li><a href="#" className="hover:text-green-400 transition">Sıkça Sorulan Sorular</a></li>
                        <li><a href="#" className="hover:text-green-400 transition">İletişim</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-6">Yasal</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-green-400 transition">Kullanım Koşulları</a></li>
                        <li><a href="#" className="hover:text-green-400 transition">Gizlilik Politikası</a></li>
                        <li><a href="#" className="hover:text-green-400 transition">Mesafeli Satış Sözleşmesi</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-6">Haberdar Olun</h4>
                    <p className="text-gray-400 text-sm mb-4">Kampanyalardan ilk siz haberdar olun.</p>
                    <div className="flex gap-2">
                        <input type="email" placeholder="E-posta adresiniz" className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm w-full outline-none focus:border-green-500 text-white" />
                        <button className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-green-700 transition">Go</button>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-500 text-sm">© 2025 Can Dostum Box. Tüm hakları saklıdır.</p>
                <div className="flex gap-6 text-gray-400">
                    <span className="cursor-pointer hover:text-white transition">Instagram</span>
                    <span className="cursor-pointer hover:text-white transition">Twitter</span>
                    <span className="cursor-pointer hover:text-white transition">TikTok</span>
                </div>
            </div>
        </div>
    </footer>
  );
}