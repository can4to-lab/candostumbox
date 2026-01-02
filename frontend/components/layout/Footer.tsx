"use client";
import Image from "next/image"; 
import Link from "next/link"; 

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 border-t border-gray-800 text-center mt-auto">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-left">
                
                {/* 1. Logo ve Açıklama Bölümü */}
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="relative h-12 w-48"> 
                            <Image 
                                src="/logo-footer.jpg" 
                                alt="Can Dostum Box Logo" 
                                fill
                                className="object-contain" 
                            />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Minik dostlarınız için her ay özenle hazırlanan sürpriz mutluluk kutuları. Sevgiyle paketlendi.
                    </p>
                </div>

                {/* 2. Kurumsal Linkler */}
                <div>
                    <h4 className="font-bold text-white mb-6">Kurumsal</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><Link href="/about" className="hover:text-green-400 transition">Hakkımızda</Link></li>
                        <li><Link href="/faq" className="hover:text-green-400 transition">Sıkça Sorulan Sorular</Link></li>
                        <li><Link href="/contact" className="hover:text-green-400 transition">İletişim</Link></li>
                    </ul>
                </div>

                {/* 3. Yasal Linkler */}
                <div>
                    <h4 className="font-bold text-white mb-6">Yasal</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><Link href="/kullanim-kosullari" className="hover:text-green-400 transition">Kullanım Koşulları</Link></li>
                        <li><Link href="/gizlilik-politikasi" className="hover:text-green-400 transition">Gizlilik Politikası</Link></li>
                        <li><Link href="/mesafeli-satis-sozlesmesi" className="hover:text-green-400 transition">Mesafeli Satış Sözleşmesi</Link></li>
                    </ul>
                </div>

                {/* 4. Bülten Aboneliği */}
                <div>
                    <h4 className="font-bold text-white mb-6">Haberdar Olun</h4>
                    <p className="text-gray-400 text-sm mb-4">Kampanyalardan ilk siz haberdar olun.</p>
                    <div className="flex gap-2">
                        <input type="email" placeholder="E-posta adresiniz" className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm w-full outline-none focus:border-green-500 text-white" />
                        <button className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-green-700 transition">Go</button>
                    </div>
                </div>
            </div>

            {/* Alt Kısım (Copyright & Sosyal Medya) */}
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-500 text-sm">© 2025 Can Dostum Box. Tüm hakları saklıdır.</p>
                
                {/* 👇 GÜNCELLENEN SOSYAL MEDYA LİNKLERİ */}
                <div className="flex gap-6 text-gray-400 font-medium text-sm">
                    <a 
                        href="https://www.facebook.com/profile.php?id=61585193774745" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-green-400 transition"
                    >
                        Facebook
                    </a>
                    <a 
                        href="https://www.instagram.com/candostumbox/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-green-400 transition"
                    >
                        Instagram
                    </a>
                    <a 
                        href="https://www.youtube.com/@CanDostumBox" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-green-400 transition"
                    >
                        YouTube
                    </a>
                    <a 
                        href="https://www.tiktok.com/@candostumbox" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-green-400 transition"
                    >
                        TikTok
                    </a>
                </div>
            </div>
        </div>
    </footer>
  );
}