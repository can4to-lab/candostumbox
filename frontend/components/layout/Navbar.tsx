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
      <nav className="bg-white shadow-sm sticky top-0 z-40 h-20 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6 h-full relative flex items-center justify-between">
            
            {/* 1. SOL: HAMBURGER MENÜ */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsSideMenuOpen(true)} 
                    className="group flex flex-col gap-1.5 p-2 cursor-pointer hover:bg-gray-50 rounded-lg transition"
                >
                    <span className="block w-6 h-0.5 bg-gray-900 transition-all group-hover:w-8"></span>
                    <span className="block w-6 h-0.5 bg-gray-900 transition-all group-hover:w-8"></span>
                    <span className="block w-6 h-0.5 bg-gray-900 transition-all group-hover:w-8"></span>
                </button>
                <span className="text-sm font-bold text-gray-600 hidden md:block cursor-pointer tracking-wider" onClick={() => setIsSideMenuOpen(true)}>MENÜ</span>
            </div>

            {/* 2. ORTA: LOGO (GÜNCELLENDİ) */}
            <div 
                className="absolute left-1/2 transform -translate-x-1/2 flex items-center cursor-pointer" 
                onClick={() => router.push('/')}
            >
                {/* Lütfen 'public' klasörüne 'logo-navbar.png' (beyaz zeminli yatay logo) 
                    dosyasını attığından emin ol. 
                */}
                <div className="relative h-12 w-40 md:h-16 md:w-56">
                    <Image
                        src="/logo-navbar.jpg" 
                        alt="Can Dostum Box Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            {/* 3. SAĞ: İKONLAR */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Arama (Süs) - DÜZELTİLDİ: 'flex' silindi, sadece 'hidden sm:flex' kaldı */}
                <button className="w-10 h-10 rounded-full hover:bg-gray-100 items-center justify-center text-gray-900 transition hidden sm:flex">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>

                {/* Profil */}
                <button 
                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-900 transition relative"
                    onClick={() => isLoggedIn ? router.push('/profile') : setLoginOpen(true)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {isLoggedIn && <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>}
                </button>

                {/* Sepet */}
                <button 
                    onClick={toggleCart}
                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-900 transition relative group"
                >
                    <svg className="w-6 h-6 group-hover:text-green-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white transform group-hover:scale-110 transition shadow-sm">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
      </nav>

      {/* --- YANDAN AÇILAN MENÜ --- */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity duration-300 ${isSideMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsSideMenuOpen(false)}
      ></div>

      <div 
        className={`fixed top-0 left-0 h-full w-[85%] md:w-[400px] bg-white z-[70] shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col ${isSideMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <span className="text-lg font-black text-gray-900 tracking-wider">MENÜ</span>
              <button onClick={() => setIsSideMenuOpen(false)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 transition">
                  ✕
              </button>
          </div>

          {/* 👇 GÜNCELLENMİŞ LİNKLER 👇 */}
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