"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Admin Kontrolü (Her sayfa için merkezi koruma)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        // Eğer login sayfasındaysak yönlendirme yapma
        if (!pathname.includes("/login")) router.push("/admin/login");
    }
  }, [router, pathname]);

  // Login sayfasında sidebar gösterme
  if (pathname.includes("/login")) {
    return <>{children}</>;
  }

  const menuItems = [
    { name: "Genel Bakış", path: "/admin", icon: "📊" },
    { name: "Siparişler", path: "/admin/orders", icon: "📦" },
    { name: "Ürünler & Paketler", path: "/admin/products", icon: "🎁" },
    { name: "Abonelikler", path: "/admin/subscriptions", icon: "🔄" },
    { name: "Müşteriler", path: "/admin/users", icon: "👥" },
    { name: "İndirim Yönetimi", path: "/admin/discounts", icon: "🏷️" }, // 👈 Yeni Eklendi
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex">
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col fixed h-full z-20`}>
        <div className="p-6 flex items-center justify-between border-b border-gray-800">
            {isSidebarOpen && <h2 className="text-xl font-black text-green-500 tracking-tight">CanDostum<span className="text-white">Admin</span></h2>}
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-white">
                {isSidebarOpen ? '◀' : '▶'}
            </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                    <Link 
                        key={item.path} 
                        href={item.path}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        {isSidebarOpen && <span className="font-bold text-sm">{item.name}</span>}
                    </Link>
                )
            })}
        </nav>

        <div className="p-4 border-t border-gray-800">
            <button onClick={handleLogout} className={`flex items-center gap-4 px-4 py-3 rounded-xl w-full text-left transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300`}>
                <span className="text-xl">🚪</span>
                {isSidebarOpen && <span className="font-bold text-sm">Çıkış Yap</span>}
            </button>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-8`}>
        {children}
      </main>
    </div>
  );
}