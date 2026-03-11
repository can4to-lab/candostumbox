"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[#0B1120] text-gray-400 pt-16 border-t border-gray-800/60 mt-auto font-sans relative overflow-hidden">
      {/* İsteğe bağlı: Arka planda çok hafif, estetik bir parlama efekti */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-green-500/5 blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* ÜST KISIM: 4 Sütunlu Şık Grid Yapısı */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* 1. Marka */}
          <div className="space-y-6">
            <div className="relative h-12 w-48 opacity-90 hover:opacity-100 transition duration-300">
              <Image
                src="/logo-footer.jpg"
                alt="Can Dostum Box"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-gray-500 leading-relaxed text-sm">
              Can Dostum Box, minik dostlarımızın sağlığı ve mutluluğu için
              özenle seçilmiş ürünleri her ay kapınıza getirir.
            </p>
          </div>

          {/* 2. Hızlı Menü */}
          <div>
            <h4 className="text-white font-semibold mb-6 tracking-wide text-sm">
              Keşfet
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/#nasil-calisir"
                  className="hover:text-green-400 transition"
                >
                  Nasıl Çalışır?
                </Link>
              </li>
              <li>
                <Link
                  href="/#paketler"
                  className="hover:text-green-400 transition"
                >
                  Abonelik Paketleri
                </Link>
              </li>
              <li>
                <Link
                  href="/kutu-icerigi"
                  className="hover:text-green-400 transition"
                >
                  Kutuda Ne Var?
                </Link>
              </li>
              <li>
                <Link href="/sss" className="hover:text-green-400 transition">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Kurumsal */}
          <div>
            <h4 className="text-white font-semibold mb-6 tracking-wide text-sm">
              Kurumsal
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/legal/hakkimizda"
                  className="hover:text-green-400 transition"
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/mesafeli-satis"
                  className="hover:text-green-400 transition"
                >
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/gizlilik"
                  className="hover:text-green-400 transition"
                >
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/iptal-iade"
                  className="hover:text-green-400 transition"
                >
                  İptal ve İade Koşulları
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. İletişim */}
          <div>
            <h4 className="text-white font-semibold mb-6 tracking-wide text-sm">
              İletişim
            </h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✉️</span>
                <a
                  href="mailto:info@candostumbox.com"
                  className="hover:text-white transition"
                >
                  info@candostumbox.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">📞</span>
                <a
                  href="tel:+905555555555"
                  className="hover:text-white transition"
                >
                  +90 (555) 555 55 55
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5">📍</span>
                <span>İzmir, Türkiye</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ORTA KISIM: Estetik Güvenli Ödeme Bandı (Tuğlasız, Beyaz Logolu) */}
        <div className="border-t border-gray-800/60 py-10 flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-6">
            GÜVENLİ ÖDEME ALTYAPISI
          </p>

          {/* Logo Konteyneri: Saydam durur, üzerine gelince parlar. Orijinal beyaz logoyu mükemmel gösterir */}
          <div className="w-full max-w-2xl px-4 opacity-40 hover:opacity-100 transition-opacity duration-500 cursor-pointer">
            <img
              src="/param-beyaz.svg"
              alt="Param ile Güvenli Öde"
              className="w-full h-auto object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* ALT KISIM: Copyright & Sosyal Medya */}
        <div className="border-t border-gray-800/60 py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-600">
          <p>
            © {new Date().getFullYear()} Can Dostum Box. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6 font-medium">
            <a
              href="https://www.facebook.com/profile.php?id=61585193774745"
              target="_blank"
              className="hover:text-white transition"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/candostumbox/"
              target="_blank"
              className="hover:text-white transition"
            >
              Instagram
            </a>
            <a
              href="https://www.youtube.com/@CanDostumBox"
              target="_blank"
              className="hover:text-white transition"
            >
              YouTube
            </a>
            <a
              href="https://www.tiktok.com/@candostumbox"
              target="_blank"
              className="hover:text-white transition"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
