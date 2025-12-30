"use client";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CartDrawer() {
  const { items, removeFromCart, isCartOpen, toggleCart, cartTotal } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    toggleCart(); 
    router.push("/checkout"); 
  };

  return (
    <>
      {/* KARARTMA PERDESİ (Backdrop) */}
      {isCartOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm transition-opacity"
            onClick={toggleCart}
        ></div>
      )}

      {/* ÇEKMECE (Drawer) */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[101] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* BAŞLIK */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                🛍️ Sepetim <span className="text-sm font-bold text-gray-500">({items.length} ürün)</span>
            </h2>
            <button onClick={toggleCart} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 transition">
                ✕
            </button>
        </div>

        {/* ÜRÜNLER LİSTESİ */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <div className="text-6xl">🛒</div>
                    <p className="font-bold text-gray-400">Sepetin şimdilik boş.</p>
                    {/* 👇 DÜZELTME 1: Yeşil link yerine Şık Siyah Buton */}
                    <button 
                        onClick={toggleCart} 
                        className="mt-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black hover:scale-105 transition flex items-center gap-2"
                    >
                        Alışverişe Başla ➔
                    </button>
                </div>
            ) : (
                items.map((item) => (
                    <div key={item.uniqueId} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-green-200 transition">
                        {/* Resim */}
                        <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden relative border border-gray-200">
                             {/* İleride gerçek resim eklenecek */}
                             <div className="w-full h-full flex items-center justify-center text-3xl">🎁</div>
                        </div>

                        {/* Bilgi */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{item.productName}</h3>
                                <p className="text-xs text-gray-500 mb-1">Dostun: <span className="font-bold text-green-600">{item.petName}</span></p>
                                
                                {/* 👇 DÜZELTME 2: 1 Aylık ise "Peşin/Her Ay" yazısını gizle */}
                                <p className="text-xs text-gray-400 font-medium">
                                    {item.duration} Aylık
                                    {Number(item.duration) > 1 && (
                                        <span> • {item.paymentType === 'monthly' ? 'Her Ay' : 'Peşin'}</span>
                                    )}
                                </p>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <div className="font-black text-gray-900 text-lg">₺{item.price}</div>
                                <button onClick={() => removeFromCart(item.uniqueId)} className="text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition">
                                    Kaldır
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* ALT KISIM (Toplam & Buton) */}
        {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-gray-500 font-bold text-sm">Ara Toplam</span>
                    <span className="text-2xl font-black text-gray-900">₺{cartTotal.toFixed(2)}</span>
                </div>
                {/* 👇 DÜZELTME 3: Roket yerine Kart ikonu ve metin değişikliği */}
                <button 
                    onClick={handleCheckout}
                    className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition active:scale-95 flex items-center justify-center gap-2 text-lg"
                >
                    Ödemeye Geç 💳
                </button>
            </div>
        )}
      </div>
    </>
  );
}