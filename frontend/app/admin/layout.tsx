"use client";
import "../globals.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Güvenlik State'i
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  // 1. GÜVENLİK KONTROLÜ (AUTH GUARD)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      // Token yoksa direkt Login'e at
      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        // Token var ama geçerli mi ve rolü ne? API'den soralım.
        // Sadece localStorage'a bakmak yetmez, kullanıcı orayı elle değiştirebilir.
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.ok) {
          const user = await res.json();

          // Rol kontrolü (Backend'den gelen veri)
          if (user.role === "ADMIN") {
            setIsAuthorized(true); // Giriş izni ver
          } else {
            toast.error("Bu alana erişim yetkiniz yok!");
            router.push("/"); // Normal kullanıcıyı anasayfaya at
          }
        } else {
          // Token süresi dolmuş veya geçersiz
          localStorage.removeItem("token");
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Auth kontrol hatası", error);
        router.push("/");
      } finally {
        setChecking(false); // Kontrol bitti
      }
    };

    checkAuth();
  }, [router]);

  // Çıkış Fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("candostum_cart");
    toast.success("Çıkış yapıldı");
    router.push("/auth/login");
  };

  // 2. YÜKLENİYOR EKRANI (Kontrol sürerken içeriği gösterme)
  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800">
            Yetki Kontrolü Yapılıyor...
          </h2>
          <p className="text-gray-500 text-sm">Lütfen bekleyin.</p>
        </div>
      </div>
    );
  }

  // 3. YETKİSİZ GİRİŞ (Ekstra güvenlik önlemi, render etme)
  if (!isAuthorized) {
    return null;
  }

  // 4. ADMIN ARAYÜZÜ (Sadece yetkililer görür)
  return (
    <div className="flex min-h-screen bg-[#f4f6f8]">
      <Toaster position="top-right" />

      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-[#0f172a] text-white flex flex-col fixed h-full shadow-2xl z-50">
        <div className="p-8 border-b border-gray-800">
          <h2 className="text-2xl font-black tracking-tighter text-green-400">
            CanDostum<span className="text-white">Admin</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">Yönetim Paneli v1.0</p>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <MenuItem
            href="/admin"
            icon="📊"
            text="Genel Bakış"
            active={pathname === "/admin"}
          />
          <div className="text-xs font-bold text-gray-500 uppercase mt-6 mb-2 px-4">
            Satış & Ürün
          </div>
          <MenuItem
            href="/admin/orders"
            icon="📦"
            text="Siparişler"
            active={pathname.includes("/orders")}
          />
          <MenuItem
            href="/admin/products"
            icon="🎁"
            text="Ürünler & Paketler"
            active={pathname.includes("/products")}
          />
          <MenuItem
            href="/admin/subscriptions"
            icon="🔄"
            text="Abonelikler"
            active={pathname.includes("/subscriptions")}
          />

          <div className="text-xs font-bold text-gray-500 uppercase mt-6 mb-2 px-4">
            Kullanıcılar
          </div>
          <MenuItem
            href="/admin/users"
            icon="👥"
            text="Müşteriler"
            active={pathname.includes("/users")}
          />

          <div className="text-xs font-bold text-gray-500 uppercase mt-6 mb-2 px-4">
            Ayarlar
          </div>
          <MenuItem
            href="/admin/discounts"
            icon="🏷️"
            text="İndirim Yönetimi"
            active={pathname.includes("/discounts")}
          />
          <MenuItem
            href="/admin/promo-codes"
            icon="🎟️"
            text="Kampanya Kodları"
            active={pathname.includes("/promo-codes")}
          />
        </nav>

        <div className="p-6 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-400 hover:text-white transition w-full p-3 hover:bg-white/5 rounded-xl"
          >
            <span>🚪</span>
            <span className="font-bold">Güvenli Çıkış</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-72 p-10 animate-fade-in">
        {/* Üst Header (Opsiyonel Mobil Menü vb. için) */}
        <div className="flex justify-between items-center mb-8">
          <button className="lg:hidden">☰ MENÜ</button>{" "}
          {/* Mobilde sidebar açmak için ilerde eklenebilir */}
          <div></div> {/* Boşluk */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shadow-lg shadow-green-200">
              A
            </div>
          </div>
        </div>

        {/* Sayfa İçeriği */}
        {children}
      </main>
    </div>
  );
}

// Yardımcı Bileşen: Sidebar Menü Öğesi
function MenuItem({ href, icon, text, active }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-bold ${
        active
          ? "bg-green-500 text-white shadow-lg shadow-green-900/20"
          : "text-gray-400 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </Link>
  );
}
