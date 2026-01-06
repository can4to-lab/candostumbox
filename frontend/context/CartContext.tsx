"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  duration: number;
  petId: number | null;
  petName: string;
  paymentType: 'monthly' | 'upfront';
  image?: string;
  uniqueId: string;
  deliveryPeriod?: string; 
  subscriptionId?: string; 
  // 👇 YENİ EKLENEN ALAN: Paket Yükseltme ID'si
  upgradeFromSubId?: string; 
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'uniqueId'>) => void;
  removeFromCart: (uniqueId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<Omit<CartItem, 'uniqueId'> | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem("candostum_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Sepet yüklenemedi", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("candostum_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((newItem: Omit<CartItem, 'uniqueId'>) => {
    if (items.length > 0) {
        setPendingItem(newItem);
        setIsReplaceModalOpen(true);
        return;
    }

    const uniqueId = `${newItem.productId}-${newItem.petId}-${Date.now()}`;
    setItems([{ ...newItem, uniqueId }]);
    setIsCartOpen(true);
    toast.success("Sepete eklendi! 🎒");
  }, [items]);

  const confirmReplace = () => {
    if (pendingItem) {
        const uniqueId = `${pendingItem.productId}-${pendingItem.petId}-${Date.now()}`;
        setItems([{ ...pendingItem, uniqueId }]);
        setPendingItem(null);
        setIsReplaceModalOpen(false);
        setIsCartOpen(true);
        toast.success("Sepet güncellendi! ✨");
    }
  };

  const goToCheckout = () => {
      setIsReplaceModalOpen(false);
      setPendingItem(null);
      router.push('/checkout');
  };

  const cancelReplace = () => {
      setIsReplaceModalOpen(false);
      setPendingItem(null);
  };

  const removeFromCart = useCallback((uniqueId: string) => {
    setItems((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
    toast.error("Ürün çıkarıldı.");
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const rawTotal = items.reduce((total, item) => total + Number(item.price), 0);
  const cartTotal = Number(rawTotal.toFixed(2));

  return (
    <CartContext.Provider value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        clearCart, 
        cartTotal, 
        cartCount: items.length,
        isCartOpen,
        toggleCart 
    }}>
      {children}

      {isReplaceModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform scale-100 transition-all border border-gray-100">
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
                      <h3 className="text-2xl font-black text-gray-900 mb-2">Sepetinde Ürün Var</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                          Abonelik kutuları tek tek satılmaktadır. Sepetindeki mevcut ürünü silip yenisini eklemek ister misin?
                      </p>
                  </div>
                  <div className="space-y-3">
                      <button onClick={confirmReplace} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                          <span>🔄</span> Evet, Yeni Ürünü Ekle
                      </button>
                      <button onClick={goToCheckout} className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2">
                          <span>💳</span> Mevcut Ürünle Öde
                      </button>
                      <button onClick={cancelReplace} className="w-full py-3 text-gray-400 font-bold hover:text-gray-600 hover:bg-gray-50 rounded-xl transition">
                          Vazgeç
                      </button>
                  </div>
              </div>
          </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}