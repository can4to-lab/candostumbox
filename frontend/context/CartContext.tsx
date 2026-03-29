"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import toast from "react-hot-toast";

// 1. SEPETTEKİ ÜRÜNÜN TİPİ (Perakende mi Abonelik mi?)
export interface CartItem {
  uniqueId: string; // Sepetteki benzersiz kimliği (Aynı üründen 2 tane eklenirse karışmasın diye)
  productId: string;
  name: string;
  price: number;
  image?: string;
  type: "SUBSCRIPTION" | "RETAIL"; // 👈 KRİTİK: Sistem ürünün ne olduğunu bilecek
  quantity: number; // 👈 KRİTİK: Perakende için adet mantığı

  // Sadece Aboneliğe Özel Alanlar (Perakendede null olacak)
  petName?: string;
  duration?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "uniqueId">) => void;
  removeFromCart: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, quantity: number) => void; // 👈 YENİ: Adet artır/azalt
  clearCart: () => void;
  cartTotal: number;
  cartCount: number; // Sepetteki toplam ürün ASIL adedi
  isCartOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sayfa açıldığında localStorage'dan eski sepeti yükle
  useEffect(() => {
    const savedCart = localStorage.getItem("candostum_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Sepet yüklenemedi", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Sepet her değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("candostum_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // 🚀 SEPETE EKLEME MANTIĞI (Beyin Burası)
  const addToCart = (newItem: Omit<CartItem, "uniqueId">) => {
    setItems((prevItems) => {
      // 1. KURAL: Eğer eklenen ürün ABONELİK ise (Sepette sadece 1 abonelik kutusu olabilir)
      if (newItem.type === "SUBSCRIPTION") {
        const withoutOldSub = prevItems.filter(
          (item) => item.type !== "SUBSCRIPTION",
        );
        toast.success("Abonelik kutusu sepete eklendi!");
        setIsCartOpen(true);
        return [
          ...withoutOldSub,
          { ...newItem, uniqueId: Date.now().toString(), quantity: 1 },
        ];
      }

      // 2. KURAL: Eğer eklenen ürün PERAKENDE ise (Oyunca, Tasma vs.)
      if (newItem.type === "RETAIL") {
        // Sepette bu üründen zaten var mı diye bak
        const existingItemIndex = prevItems.findIndex(
          (item) => item.productId === newItem.productId,
        );

        if (existingItemIndex >= 0) {
          // Varsa adedini (quantity) 1 artır
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex].quantity += newItem.quantity || 1;
          toast.success(`${newItem.name} adedi artırıldı!`);
          setIsCartOpen(true);
          return updatedItems;
        } else {
          // Yoksa yepyeni bir eşya olarak sepete at
          toast.success(`${newItem.name} sepete eklendi!`);
          setIsCartOpen(true);
          return [
            ...prevItems,
            {
              ...newItem,
              uniqueId: Date.now().toString(),
              quantity: newItem.quantity || 1,
            },
          ];
        }
      }

      return prevItems;
    });
  };

  const removeFromCart = (uniqueId: string) => {
    setItems((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
    toast.success("Ürün sepetten çıkarıldı.");
  };

  const updateQuantity = (uniqueId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(uniqueId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.uniqueId === uniqueId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("candostum_cart");
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // Toplam Tutar (Fiyat * Adet)
  const cartTotal = items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );

  // Sepetteki ikon üzerinde yazacak sayı (Ürün sayısı değil, adet sayısı)
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
