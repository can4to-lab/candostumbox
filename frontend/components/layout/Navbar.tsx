"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  // --- STATE ---
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const { cartCount, toggleCart } = useCart(); 
  
  // --- AUTH KONTROLÜ ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  // --- FONKSİYONLAR ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsSideMenuOpen(false);
  };

  return (
    <>
      {/* --- MODALLAR --- */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} onSwitchToRegister={() => {setLoginOpen(false); setRegisterOpen(true);}} onLoginSuccess={() => window.location.reload()} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} onSwitchToLogin={() => {setRegisterOpen(false); setLoginOpen(true);}} initialData={null} onRegisterSuccess={() => window.location.reload()} />

      {/* --- NAVBAR --- */}
      {/* GÜNCELLEME: bg-white yerine logonun tahmini arka plan rengi (#F5F5F5) verildi. 
          Eğer ton farkı olursa burayı logonuzun tam hex kodu ile değiştirin (Örn: bg-[#eaeaea]) */}
      <nav className="bg-[#F5F5F5] shadow-sm sticky top-0 z-40 h-24 border-b border-gray-200/50">
        <div className="container mx-auto px-4 md:px-8 h-full relative flex items-center justify-between">
            
            {/* 1. SOL TARAFA İÇERİK YERLEŞİMİ */}
            <div className="flex items-center">
                
                {/* A) MOBİL İÇİN HAMBURGER MENÜ (Sadece mobilde görünür: md:hidden) */}
                <div className="flex items-center gap-2 md:hidden">
                    <button 
                        onClick={() => setIsSideMenuOpen(true)} 
                        className="group flex flex-col gap-1.5 p-2 cursor-pointer hover:bg-black/5 rounded-lg transition"
                    >
                        <span className="block w-6 h-0.5 bg-gray-900 transition-all group-hover:w-8"></span>
                        <span className="block w-6 h-0.5 bg-gray-900 transition-all group-hover:w-8"></span>
                        <span className="block w-6 h-0.5 bg-gray-900 transition-all group-hover:w-8"></span>
                    </button>
                    <span className="text-xs font-bold text-gray-600 tracking-wider" onClick={() => setIsSideMenuOpen(true)}>MENÜ</span>
                </div>

                {/* B) MASAÜSTÜ MENÜ LİNKLERİ (Sadece masaüstünde görünür: hidden md:flex) */}
                <div className="hidden md:flex items-center gap-6 lg:gap-8">
                    <button onClick={() => router.push('/')} className="text-sm font-bold text-gray-700 hover:text-green-600 transition tracking-wide py-2 border-b-2 border-transparent hover:border-green-600">
                        ANA SAYFA
                    </button>
                    <button onClick={() => router.push('/product')} className="text-sm font-bold text-gray-700 hover:text-green-600 transition tracking-wide py-2 border-b-2 border-transparent hover:border-green-600">
                        PAKETLER
                    </button>
                    <button onClick={() => router.push('/how-it-works')} className="text-sm font-bold text-gray-700 hover:text-green-600 transition tracking-wide py-2 border-b-2 border-transparent hover:border-green-600 whitespace-nowrap">
                        NASIL ÇALIŞIR?
                    </button>
                    <button onClick={() => router.push('/about')} className="text-sm font-bold text-gray-700 hover:text-green-600 transition tracking-wide py-2 border-b-2 border-transparent hover:border-green-600 whitespace-nowrap">
                        BİZ KİMİZ?
                    </button>
                </div>

            </div>

            {/* 2. ORTA: LOGO (Absolute ile ortalandı) */}
            <div 
                className="absolute left-1/2 transform -translate-x-1/2 flex items-center cursor-pointer h-full" 
                onClick={() => router.push('/')}
            >
                <div className="relative h-16 w-32 md:h-20 md:w-48 lg:w-56">
                    <Image
                        src="/logo_navbar.png" 
                        alt="Can Dostum Box Logo"
                        fill
                        className="object-contain" 
                        priority
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                </div>
            </div>

            {/* 3. SAĞ: İKONLAR (Sepet & Profil) */}
            <div className="flex items-center gap-3 md:gap-5">
                {/* Profil */}
                <button 
                    className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center text-gray-800 transition relative"
                    onClick={() => isLoggedIn ? router.push('/profile') : setLoginOpen(true)}
                    title={isLoggedIn ? "Hesabım" : "Giriş Yap"}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {isLoggedIn && <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#F5F5F5]"></span>}
                </button>

                {/* Sepet */}
                <button 
                    onClick={toggleCart}
                    className="w-10 h-10 rounded-full hover:bg-white/50 flex items-center justify-center text-gray-800 transition relative group"
                    title="Sepetim"
                >
                    <svg className="w-6 h-6 group-hover:text-green-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#F5F5F5] transform group-hover:scale-110 transition shadow-sm">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
      </nav>

      {/* --- YANDAN AÇILAN MENÜ (Sadece Mobilde Kullanılacak) --- */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity duration-300 md:hidden ${isSideMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsSideMenuOpen(false)}
      ></div>

      <div 
        className={`fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-[70] shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col md:hidden ${isSideMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F5F5F5]">
              <span className="text-lg font-black text-gray-900 tracking-wider">MENÜ</span>
              <button onClick={() => setIsSideMenuOpen(false)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 transition">
                  ✕
              </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-6 space-y-2">
              <button onClick={() => handleNavigation('/')} className="block w-full text-left p-4 rounded-xl font-bold text-gray-900 hover:bg-gray-50 transition text-lg">🏠 Ana Sayfa</button>
              <button onClick={() => handleNavigation('/product')} className="block w-full text-left p-4 rounded-xl font-bold text-gray-900 hover:bg-gray-50 transition text-lg">📦 Paketler</button>
              <button onClick={() => handleNavigation('/how-it-works')} className="block w-full text-left p-4 rounded-xl font-bold text-gray-900 hover:bg-gray-50 transition text-lg">🤔 Nasıl Çalışır?</button>
              <button onClick={() => handleNavigation('/about')} className="block w-full text-left p-4 rounded-xl font-bold text-gray-900 hover:bg-gray-50 transition text-lg">👋 Biz Kimiz?</button>
          </nav>

          <div className="p-6 border-t border-gray-100 bg-gray-50">
              {isLoggedIn ? (
                  <div className="space-y-3">
                      <button onClick={() => handleNavigation('/profile')} className="w-full py-4 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 hover:border-green-500 hover:text-green-600 transition shadow-sm">👤 Hesabım</button>
                      <button onClick={handleLogout} className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition">🚪 Çıkış Yap</button>
                  </div>
              ) : (
                  <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => {setLoginOpen(true); setIsSideMenuOpen(false);}} className="py-4 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 hover:bg-gray-50 transition shadow-sm">Giriş Yap</button>
                      <button onClick={() => {setRegisterOpen(true); setIsSideMenuOpen(false);}} className="py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-green-200 shadow-lg">Kayıt Ol</button>
                  </div>
              )}
          </div>
      </div>
    </>
  );
}