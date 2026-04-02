"use client";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CartDrawer() {
  const {
    isCartOpen,
    toggleCart,
    items,
    removeFromCart,
    updateQuantity,
    cartTotal,
  } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    toggleCart();
    router.push("/checkout");
  };

  // 👇 YENİ KARGO HESAPLAMA MANTIĞI 👇
  const SHIPPING_THRESHOLD = 500;
  const SHIPPING_FEE = 125;

  // Sadece perakende ürünlerin toplamını bul (Abonelikler zaten ücretsiz kargoludur)
  const retailTotal = items
    .filter((item) => item.type === "RETAIL")
    .reduce(
      (total, item) => total + Number(item.price) * (item.quantity || 1),
      0,
    );

  const hasSubscription = items.some((item) => item.type === "SUBSCRIPTION");
  const amountLeft = Math.max(0, SHIPPING_THRESHOLD - retailTotal);
  const progress = Math.min(100, (retailTotal / SHIPPING_THRESHOLD) * 100);

  // Kargo ücretli mi? (Abonelik yoksa ve perakende toplamı 500'den küçükse, ama sepet de boş değilse)
  const requiresShippingFee =
    !hasSubscription && retailTotal > 0 && retailTotal < SHIPPING_THRESHOLD;
  // 👆 -------------------------------- 👆

  return (
    <Transition.Root show={isCartOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={toggleCart}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-2xl rounded-l-[2.5rem] overflow-hidden">
                    {/* ÇEKMECE BAŞLIĞI */}
                    <div className="px-6 py-6 sm:px-8 bg-orange-50 border-b border-orange-100 flex items-start justify-between">
                      <div>
                        <Dialog.Title className="text-2xl font-black text-gray-900 flex items-center gap-2">
                          Sepetiniz 🛒
                        </Dialog.Title>
                        <p className="text-sm font-medium text-orange-600 mt-1">
                          Can dostunuz için harika seçimler!
                        </p>
                      </div>
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-white rounded-full transition-all"
                        onClick={toggleCart}
                      >
                        <span className="sr-only">Kapat</span>
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* 👇 KARGO İLERLEME ÇUBUĞU 👇 */}
                    {!hasSubscription && retailTotal > 0 && (
                      <div className="bg-white px-6 py-4 border-b border-gray-100">
                        <div className="flex justify-between items-end mb-2">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Kargo Durumu
                          </p>
                          <p
                            className={`text-sm font-black ${amountLeft === 0 ? "text-green-500" : "text-orange-500"}`}
                          >
                            {amountLeft === 0
                              ? "🎉 KARGO BEDAVA"
                              : `${amountLeft.toFixed(2)} TL Kaldı`}
                          </p>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-700 ${amountLeft === 0 ? "bg-green-500" : "bg-orange-500"}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        {amountLeft > 0 && (
                          <p className="text-[10px] font-medium text-gray-400 mt-2 text-center">
                            Sepete biraz daha ürün ekleyin, kargo ücreti
                            ödemeyin!
                          </p>
                        )}
                      </div>
                    )}

                    {/* ÇEKMECE İÇERİĞİ */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 custom-scrollbar">
                      {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center h-full">
                          <div className="text-6xl mb-4 grayscale opacity-50">
                            🦴
                          </div>
                          <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                            Sepetiniz Bomboş
                          </h3>
                          <p className="text-gray-500 font-medium">
                            Dostunuz sürpriz bekliyor olabilir.
                          </p>
                          <button
                            onClick={() => {
                              toggleCart();
                              router.push("/shop");
                            }}
                            className="mt-8 px-8 py-3.5 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200"
                          >
                            Mağazayı Keşfet
                          </button>
                        </div>
                      ) : (
                        <ul role="list" className="divide-y divide-gray-100">
                          {items.map((item) => (
                            <li key={item.uniqueId} className="flex py-6">
                              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-[#F8F9FA] relative">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.productName}
                                    fill
                                    className="object-contain p-2"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-3xl">
                                    🎁
                                  </div>
                                )}
                              </div>

                              <div className="ml-4 flex flex-1 flex-col justify-between">
                                <div>
                                  <div className="flex justify-between text-base font-extrabold text-gray-900">
                                    <h3 className="line-clamp-2 pr-2">
                                      {item.productName}
                                    </h3>
                                    <p className="whitespace-nowrap">
                                      ₺
                                      {(
                                        item.price * (item.quantity || 1)
                                      ).toFixed(2)}
                                    </p>
                                  </div>
                                  <p className="mt-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {item.type === "SUBSCRIPTION"
                                      ? "📦 Abonelik Kutusu"
                                      : "🛍️ Perakende Ürün"}
                                  </p>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm mt-4">
                                  {/* ADET KONTROLÜ (Sadece Perakende ürünler için) */}
                                  {item.type === "RETAIL" ? (
                                    <div className="flex items-center border-2 border-gray-100 rounded-xl bg-white h-9">
                                      <button
                                        onClick={() =>
                                          updateQuantity(
                                            item.uniqueId,
                                            (item.quantity || 1) - 1,
                                          )
                                        }
                                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-orange-500 font-bold"
                                      >
                                        -
                                      </button>
                                      <span className="w-8 text-center font-bold text-gray-900">
                                        {item.quantity || 1}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateQuantity(
                                            item.uniqueId,
                                            (item.quantity || 1) + 1,
                                          )
                                        }
                                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-orange-500 font-bold"
                                      >
                                        +
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-500">
                                      1 Adet
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeFromCart(item.uniqueId)
                                    }
                                    className="font-bold text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors bg-red-50 px-3 py-1.5 rounded-lg"
                                  >
                                    <span className="text-xs uppercase tracking-wider">
                                      Sil
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* ÇEKMECE ALTI (ÖDEMEYE GEÇİŞ) */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-100 px-6 py-6 sm:px-8 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between text-lg font-black text-gray-900 mb-2">
                          <p>Ara Toplam</p>
                          <p className="text-orange-600 text-2xl">
                            ₺{cartTotal.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs font-medium text-gray-500 mb-6 text-center">
                          Kargo ve varsa abonelik indirimleri ödeme adımında
                          hesaplanır.
                        </p>

                        <button
                          onClick={handleCheckout}
                          className="w-full flex items-center justify-center rounded-2xl bg-gray-900 px-6 py-4 text-base font-black text-white shadow-xl shadow-gray-200 hover:bg-black transition-all hover:-translate-y-1 active:scale-95 gap-2"
                        >
                          Güvenli Ödeme Adımına Geç{" "}
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </button>

                        <div className="mt-4 flex justify-center text-center text-sm font-bold">
                          <button
                            type="button"
                            className="text-gray-400 hover:text-orange-500 transition-colors"
                            onClick={toggleCart}
                          >
                            veya Alışverişe Devam Et
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
