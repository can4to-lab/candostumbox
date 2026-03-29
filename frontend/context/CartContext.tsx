"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import toast from "react-hot-toast";

export interface CartItem {
  uniqueId: string;
  productId: string | number;
  productName: string; // 👈 ESKİ KODLARLA UYUMLU OLMASI İÇİN GERİ GELDİ (name yerine)
  price: number;
  image?: string;

  // 👇 YENİ HİBRİT SİSTEM ALANLARI (Eski kodlar hata vermesin diye opsiyonel '?')
  type?: "SUBSCRIPTION" | "RETAIL";
  quantity?: number;

  // 👇 ESKİ ABONELİK ALANLARI (Checkout ve Profile sayfalarının çökmemesi için)
  duration?: number;
  petId?: string | null;
  petName?: string;
  paymentType?: string;
  deliveryPeriod?: string;
  subscriptionId?: string;
  upgradeFromSubId?: string;
  deductionAmount?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "uniqueId">) => void;
  removeFromCart: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("candostum_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("candostum_cart", JSON.stringify(items));
  }, [items, isLoaded]);

  const addToCart = (newItem: Omit<CartItem, "uniqueId">) => {
    setItems((prevItems) => {
      // Geriye dönük uyumluluk: Eski sayfalar type göndermezse, onu otomatik ABONELİK say!
      const itemType = newItem.type || "SUBSCRIPTION";
      const itemQuantity = newItem.quantity || 1;

      if (itemType === "SUBSCRIPTION") {
        const withoutOldSub = prevItems.filter(
          (item) => (item.type || "SUBSCRIPTION") !== "SUBSCRIPTION",
        );
        toast.success("Abonelik kutusu sepete eklendi!");
        setIsCartOpen(true);
        return [
          ...withoutOldSub,
          {
            ...newItem,
            type: "SUBSCRIPTION",
            quantity: 1,
            uniqueId: Date.now().toString(),
          },
        ];
      }

      if (itemType === "RETAIL") {
        const existingItemIndex = prevItems.findIndex(
          (item) => item.productId === newItem.productId,
        );
        if (existingItemIndex >= 0) {
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex].quantity =
            (updatedItems[existingItemIndex].quantity || 1) + itemQuantity;
          toast.success(`${newItem.productName} adedi artırıldı!`);
          setIsCartOpen(true);
          return updatedItems;
        } else {
          toast.success(`${newItem.productName} sepete eklendi!`);
          setIsCartOpen(true);
          return [
            ...prevItems,
            {
              ...newItem,
              type: "RETAIL",
              quantity: itemQuantity,
              uniqueId: Date.now().toString(),
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

  const cartTotal = items.reduce(
    (total, item) => total + Number(item.price) * (item.quantity || 1),
    0,
  );
  const cartCount = items.reduce(
    (count, item) => count + (item.quantity || 1),
    0,
  );

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
