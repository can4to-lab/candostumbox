import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// 👇 IMPORTLAR (Zaten vardı)
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({subsets:["latin"]})

export const metadata: Metadata = {
    title: "Can Dostum Box | Sürpriz Mutluluk", 
    description: "Can dostunuz için aylık sürpriz kutular.",
    icons:{icon: '/logo_arka.png', }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        
        {/* TÜM SİTEYİ CART PROVIDER İLE SARIYORUZ */}
        <CartProvider>
            
            <Toaster 
                position="top-right" 
                toastOptions={{ duration: 3000 }}
                containerStyle={{zIndex:99999}}
            />

            {/* 👇 EKLENEN KISIM: Sepet Çekmecesi (Burada gizli bekler) */}
            <CartDrawer />

            <Navbar />

            {/* İçerik Alanı */}
            <div className="flex-grow pt-0"> 
                {children}
            </div>

            <Footer />
            
        </CartProvider>
      </body>
    </html>
  );
}