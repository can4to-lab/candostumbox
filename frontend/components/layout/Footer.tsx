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
    <footer className="bg-[#111827] text-gray-400 py-16 border-t border-gray-800/50 text-sm mt-auto font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* ÜST KISIM: Grid Yapısı */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* 1. MARKA & HAKKIMIZDA (Sol Taraf - 4 Sütun) */}
          <div className="md:col-span-4 space-y-6">
            <div className="relative h-12 w-48 opacity-90 hover:opacity-100 transition duration-300">
              <Image
                src="/logo-footer.jpg"
                alt="Can Dostum Box"
                fill
                className="object-contain object-left"
              />
            </div>

            <p className="text-gray-500 leading-relaxed text-sm pr-4">
              Can Dostum Box,{" "}
              <strong className="text-gray-300">
                Günen Ticaret İnşaat Yapı Market
              </strong>{" "}
              iştirakidir. Minik dostlarınız için en güvenilir ürünleri kapınıza
              getiriyoruz.
            </p>
          </div>

          {/* 2. KURUMSAL LİNKLER (2 Sütun) */}
          <div className="md:col-span-2">
            <h4 className="text-white font-semibold mb-6 tracking-wide text-base">
              Kurumsal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/product"
                  className="hover:text-green-400 transition block py-1"
                >
                  Paketlerimiz
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="hover:text-green-400 transition block py-1"
                >
                  Nasıl Çalışır?
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-green-400 transition block py-1"
                >
                  S.S.S.
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-green-400 transition block py-1"
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. YASAL BİLGİLER (3 Sütun) */}
          <div className="md:col-span-3">
            <h4 className="text-white font-semibold mb-6 tracking-wide text-base">
              Yasal Bilgiler
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/legal/mesafeli-satis-sozlesmesi"
                  className="hover:text-green-400 transition block py-1"
                >
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/iptal-iade-kosullari"
                  className="hover:text-green-400 transition block py-1"
                >
                  İptal ve İade Koşulları
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/gizlilik-politikasi"
                  className="hover:text-green-400 transition block py-1"
                >
                  Gizlilik ve KVKK
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/kullanim-kosullari"
                  className="hover:text-green-400 transition block py-1"
                >
                  Kullanım Koşulları
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. İLETİŞİM BİLGİLERİ (Sağ Taraf - 3 Sütun) */}
          <div className="md:col-span-3">
            <h4 className="text-white font-semibold mb-6 tracking-wide text-base">
              İletişim Bilgileri
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <span className="text-gray-600 group-hover:text-green-500 transition">
                  📍
                </span>
                <span className="group-hover:text-gray-300 transition leading-relaxed">
                  16 Eylül Mah. 3042 Sok. No:30/a Çeşme/İzmir
                </span>
              </div>
              <div className="flex items-center gap-3 group">
                <span className="text-gray-600 group-hover:text-green-500 transition">
                  📞
                </span>
                <span className="group-hover:text-gray-300 transition">
                  0 533 513 62 60
                </span>
              </div>
              <div className="flex items-center gap-3 group">
                <span className="text-gray-600 group-hover:text-green-500 transition">
                  ✉️
                </span>
                <a
                  href="mailto:destek@candostumbox.com"
                  className="hover:text-white transition decoration-green-500/30 hover:decoration-green-500 underline underline-offset-4"
                >
                  destek@candostumbox.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ALT KISIM: Param */}
        <div className="w-full border-t border-gray-800/60 py-10 flex flex-col items-center justify-center text-center mt-4">
          <p className="text-[11px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-6">
            GÜVENLİ ÖDEME ALTYAPISI
          </p>
          <div className="w-full max-w-2xl px-4 opacity-40 hover:opacity-100 transition-opacity duration-500 cursor-default">
            <img
              src="/param-beyaz.svg"
              alt="Param ile Güvenli Öde"
              className="w-full h-auto object-contain drop-shadow-lg"
            />
          </div>
        </div>

        {/* ALT KISIM: Copyright & Sosyal */}
        <div className="border-t border-gray-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-600">
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
