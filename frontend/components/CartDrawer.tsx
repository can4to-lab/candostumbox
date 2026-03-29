"use client";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
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
    toggleCart(); // Önce çekmeceyi kapat
    router.push("/checkout"); // Sonra ödeme sayfasına uç! 🚀
  };

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
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity" />
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
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl rounded-l-[2rem]">
                    <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-2xl font-black text-gray-900">
                          Alışveriş Sepeti
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500 transition-colors"
                            onClick={toggleCart}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Paneli kapat</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-10">
                        <div className="flow-root">
                          {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <div className="text-6xl mb-4">🛒</div>
                              <h3 className="text-lg font-bold text-gray-900">
                                Sepetiniz Boş
                              </h3>
                              <p className="text-gray-500 mt-2 text-sm">
                                Hemen dostunuz için harika ürünler keşfedin!
                              </p>
                              <button
                                onClick={() => {
                                  toggleCart();
                                  router.push("/shop");
                                }}
                                className="mt-6 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition"
                              >
                                Mağazaya Git
                              </button>
                            </div>
                          ) : (
                            <ul
                              role="list"
                              className="-my-6 divide-y divide-gray-100"
                            >
                              {items.map((item) => (
                                <li key={item.uniqueId} className="flex py-6">
                                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 relative">
                                    {item.image ? (
                                      <Image
                                        src={item.image}
                                        alt={item.productName}
                                        fill
                                        className="object-cover object-center"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-2xl">
                                        🎁
                                      </div>
                                    )}
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-bold text-gray-900">
                                        <h3 className="line-clamp-2">
                                          {item.productName}
                                        </h3>
                                        <p className="ml-4 whitespace-nowrap text-indigo-600">
                                          ₺
                                          {(
                                            item.price * (item.quantity || 1)
                                          ).toFixed(2)}
                                        </p>
                                      </div>
                                      <p className="mt-1 text-xs text-gray-500">
                                        {item.type === "SUBSCRIPTION"
                                          ? "📦 Abonelik Kutusu"
                                          : "🛍️ Perakende Ürün"}
                                      </p>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      {/* 👇 YENİ EKLENEN ADET KONTROLLERİ (+ / -) 👇 */}
                                      {item.type === "RETAIL" ? (
                                        <div className="flex items-center border border-gray-200 rounded-lg">
                                          <button
                                            onClick={() =>
                                              updateQuantity(
                                                item.uniqueId,
                                                (item.quantity || 1) - 1,
                                              )
                                            }
                                            className="p-2 text-gray-500 hover:text-indigo-600 transition"
                                          >
                                            <MinusIcon className="h-4 w-4" />
                                          </button>
                                          <span className="px-3 font-bold text-gray-900">
                                            {item.quantity || 1}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateQuantity(
                                                item.uniqueId,
                                                (item.quantity || 1) + 1,
                                              )
                                            }
                                            className="p-2 text-gray-500 hover:text-indigo-600 transition"
                                          >
                                            <PlusIcon className="h-4 w-4" />
                                          </button>
                                        </div>
                                      ) : (
                                        <p className="text-gray-500">Adet: 1</p>
                                      )}

                                      <div className="flex">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeFromCart(item.uniqueId)
                                          }
                                          className="font-medium text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                                        >
                                          <TrashIcon className="h-4 w-4" />
                                          <span className="text-xs">Sil</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 👇 YENİ EKLENEN ÖDEME BUTONU YÖNLENDİRMESİ 👇 */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-100 px-6 py-6 sm:px-8 bg-gray-50">
                        <div className="flex justify-between text-lg font-black text-gray-900 mb-4">
                          <p>Ara Toplam</p>
                          <p className="text-indigo-600">
                            ₺{cartTotal.toFixed(2)}
                          </p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500 mb-6">
                          Kargo ve vergiler ödeme adımında hesaplanır.
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={handleCheckout}
                            className="w-full flex items-center justify-center rounded-2xl border border-transparent bg-indigo-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-1"
                          >
                            Güvenli Ödeme Adımına Geç
                          </button>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <p>
                            veya{" "}
                            <button
                              type="button"
                              className="font-bold text-indigo-600 hover:text-indigo-500"
                              onClick={toggleCart}
                            >
                              Alışverişe Devam Et
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </p>
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
