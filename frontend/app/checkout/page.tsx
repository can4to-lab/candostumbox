"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Script from "next/script";
import NextImage from "next/image";

// MODALLAR
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";
import AddAddressModal from "../components/modals/AddAddressModal";
import AddPetModal from "../components/modals/AddPetModal";
import AgreementsModal from "@/components/AgreementsModal";

// --- İKONLAR ---
const CheckCircleIcon = () => (
  <svg
    className="w-6 h-6 text-green-500"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);
const LockIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);
const CreditCardIcon = () => (
  <svg
    className="w-6 h-6 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

// --- TİPLER ---
interface Address {
  id: string;
  title: string;
  fullAddress: string;
}
interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
}
interface DiscountRule {
  durationMonths: number;
  discountPercentage: string;
}
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// --- SABİTLER ---
const OTHER_ICONS: Record<string, string> = {
  Kuş: "🦜",
  Hamster: "🐹",
  Tavşan: "🐰",
  Balık: "🐟",
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get("productId");
  const isUpgradeMode = searchParams.get("mode") === "upgrade";
  const oldSubId = searchParams.get("oldSubId");

  // --- STATE ---
  const [product, setProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [duration, setDuration] = useState(1);
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([]);

  // Kullanıcı Verileri
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  // Profil State'i
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Misafir
  const [isGuest, setIsGuest] = useState(true); // Varsayılan true, useEffect'te token varsa false olacak
  const [isOtherOpen, setIsOtherOpen] = useState(false);
  const [guestPetData, setGuestPetData] = useState({
    name: "",
    type: "kopek",
    breed: "",
    birthDate: "",
    weight: "",
    isNeutered: "false",
    allergies: "",
  });
  const [guestData, setGuestData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    fullAddress: "",
    title: "Ev Adresim",
    city: "",
    district: "",
  });

  const getGuestOtherIcon = () => OTHER_ICONS[guestPetData.type] || "🦜";

  // Kart Bilgileri
  const [cardData, setCardData] = useState({
    holderName: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvc: "",
  });

  // Ödeme & Sözleşme
  const [agreementsAccepted, setAgreementsAccepted] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [iframeToken, setIframeToken] = useState<string | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  // Modallar
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const init = async () => {
      if (!productId) {
        toast.error("Ürün seçimi yapılmadı.");
        router.push("/");
        return;
      }

      try {
        const [prodRes, discRes] = await Promise.all([
          fetch(`https://candostumbox-api.onrender.com/products/${productId}`),
          fetch(`https://candostumbox-api.onrender.com/discounts`),
        ]);

        if (prodRes.ok) setProduct(await prodRes.json());
        if (discRes.ok) setDiscountRules(await discRes.json());

        const token = localStorage.getItem("token");
        if (token) {
          setIsGuest(false);
          fetchPets(token);
          fetchAddresses(token);
          fetchProfile(token); // Profili çek
        } else {
          setIsGuest(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingProduct(false);
      }
    };
    init();
  }, [productId, router]);

  // Yardımcı Fetchler
  const fetchPets = async (token: string) => {
    try {
      const res = await fetch(
        "https://candostumbox-api.onrender.com/users/pets",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.pets || [];
        setMyPets(list);
        if (!selectedPetId && list.length > 0) setSelectedPetId(list[0].id);
        if (list.length > 0 && !selectedPetId)
          setSelectedPetId(list[list.length - 1].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAddresses = async (token: string) => {
    try {
      const res = await fetch(
        "https://candostumbox-api.onrender.com/users/addresses",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAddresses(data);
          if (!selectedAddressId && data.length > 0)
            setSelectedAddressId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 🛠️ PROFİL VERİSİNİ ÇEKME VE STATE'E KAYDETME
  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch(
        "https://candostumbox-api.onrender.com/users/profile",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        console.log("🔥 CHECKOUT PROFİL VERİSİ:", data); // Konsolda ID'yi kontrol et
        setUserProfile(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Hesaplamalar
  const calculateTotal = () => {
    if (!product)
      return { total: 0, discountRate: 0, monthlyPrice: 0, rawTotal: 0 };
    const basePrice = Number(product.price);
    const totalRaw = basePrice * duration;
    const rule = discountRules.find(
      (d) => Number(d.durationMonths) === duration,
    );
    const discountRate = rule ? Number(rule.discountPercentage) : 0;
    const total = totalRaw - totalRaw * (discountRate / 100);
    return {
      total,
      discountRate,
      monthlyPrice: total / duration,
      rawTotal: totalRaw,
    };
  };
  const { total, discountRate, rawTotal } = calculateTotal();

  // --- ÖDEME BAŞLATMA ---
  const startPayment = async () => {
    // Validasyonlar
    if (isGuest && (!guestPetData.name || !guestPetData.breed))
      return toast.error("Lütfen dostunuzun bilgilerini girin.");
    if (!isGuest && !selectedPetId)
      return toast.error("Lütfen bir dost seçin veya yeni ekleyin.");
    if (
      isGuest &&
      (!guestData.firstName || !guestData.email || !guestData.fullAddress)
    )
      return toast.error("İletişim bilgilerini doldurun.");
    if (!isGuest && !selectedAddressId)
      return toast.error("Teslimat adresi seçin.");
    if (
      !cardData.holderName ||
      !cardData.cardNumber ||
      !cardData.expMonth ||
      !cardData.expYear ||
      !cardData.cvc
    )
      return toast.error("Kart bilgileri eksik.");
    if (!agreementsAccepted) return toast.error("Lütfen sözleşmeyi onaylayın.");

    setIsPaymentLoading(true);
    const token = localStorage.getItem("token");

    // 👇 Kullanıcı ve Adres Bilgilerini Hazırla
    let userDataToSend = null;
    let addressDataToSend = null;

    if (isGuest) {
      userDataToSend = {
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        email: guestData.email,
        phone: guestData.phone,
      };
      addressDataToSend = {
        fullAddress: guestData.fullAddress,
        city: guestData.city,
        district: guestData.district,
      };
    } else {
      // KAYITLI KULLANICI İÇİN
      // Eğer userProfile boşsa (internet yavaşsa vb.), localStorage'dan kurtarmayı dene
      if (!userProfile?.id && token) {
        // Acil durum: Token var ama profil state'i boş. FetchProfile'ı bekle.
        try {
          const res = await fetch(
            "https://candostumbox-api.onrender.com/users/profile",
            { headers: { Authorization: `Bearer ${token}` } },
          );
          const data = await res.json();
          userDataToSend = {
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          };
        } catch (e) {
          console.error("Acil profil çekme hatası", e);
        }
      } else {
        // Normal durum: State dolu
        userDataToSend = {
          id: userProfile?.id,
          firstName: userProfile?.firstName,
          lastName: userProfile?.lastName,
          email: userProfile?.email,
          phone: userProfile?.phone,
        };
      }

      // Seçili adresi bul
      const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
      addressDataToSend = {
        id: selectedAddressId,
        fullAddress: selectedAddr?.fullAddress || "Adres Bulunamadı",
      };
    }

    const payload = {
      price: total,
      items: [
        {
          productId: product.id,
          productName: product.name,
          price: total,
          quantity: 1,
          duration: duration,
          petId: !isGuest ? selectedPetId : undefined,
          petName: isGuest
            ? guestPetData.name
            : myPets.find((p) => p.id === selectedPetId)?.name,
          petBreed: isGuest ? guestPetData.breed : undefined,
          upgradeFromSubId: isUpgradeMode ? oldSubId : undefined,
        },
      ],
      user: userDataToSend, // Hazırladığımız veriyi gönderiyoruz
      address: addressDataToSend, // Hazırladığımız veriyi gönderiyoruz
      card: {
        cardHolder: cardData.holderName,
        cardNumber: cardData.cardNumber.replace(/\s/g, ""),
        expireMonth: cardData.expMonth,
        expireYear: cardData.expYear,
        cvc: cardData.cvc,
      },
    };

    console.log("📤 GÖNDERİLEN PAYLOAD:", payload); // Konsoldan kontrol et

    try {
      const res = await fetch(
        "https://candostumbox-api.onrender.com/payment/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (data.status === "success" && data.token) {
        setIframeToken(data.token);
        toast.success("3D Secure ekranına yönlendiriliyorsunuz! 🔒");
        setTimeout(() => {
          document
            .getElementById("payment-area")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 500);
      } else {
        toast.error("Hata: " + (data.message || "Bilinmeyen hata"));
      }
    } catch (error) {
      toast.error("Sunucu hatası.");
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    val = val
      .substring(0, 16)
      .replace(/(\d{4})/g, "$1 ")
      .trim();
    setCardData({ ...cardData, cardNumber: val });
  };

  const handleAddressAdded = () => {
    const t = localStorage.getItem("token");
    if (t) fetchAddresses(t);
    setIsAddressModalOpen(false);
  };
  const handlePetAdded = () => {
    const t = localStorage.getItem("token");
    if (t) fetchPets(t);
    setIsAddPetModalOpen(false);
  };

  if (loadingProduct)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-green-500 rounded-full border-t-transparent"></div>
      </div>
    );

  const inputClass =
    "w-full p-3 rounded-xl border border-gray-200 font-bold text-gray-900 outline-none focus:border-green-500 focus:bg-white transition placeholder:text-gray-400 bg-gray-50 text-sm";

  return (
    <main className="min-h-screen bg-[#F8F9FA] font-sans pb-24">
      <Toaster position="top-right" />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
        onLoginSuccess={() => window.location.reload()}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
        initialData={null}
        onRegisterSuccess={() => window.location.reload()}
      />
      <AddAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSuccess={handleAddressAdded}
      />
      <AddPetModal
        isOpen={isAddPetModalOpen}
        onClose={() => setIsAddPetModalOpen(false)}
        onSuccess={handlePetAdded}
      />
      <AgreementsModal
        isOpen={isAgreementModalOpen}
        onClose={() => setIsAgreementModalOpen(false)}
      />

      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-black font-bold"
            >
              ← Geri
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="font-black text-lg text-gray-900">Güvenli Ödeme</h1>
          </div>
          <div className="flex items-center gap-2 text-green-600 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <LockIcon /> 256-Bit SSL Secured
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          <div className="lg:col-span-8 space-y-8">
            {/* BÖLÜM 1: PLAN */}
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200/60">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
                  1
                </span>
                Abonelik Planını Seçiniz
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 3, 6, 12].map((m) => {
                  const rule = discountRules.find(
                    (d) => Number(d.durationMonths) === m,
                  );
                  const discount = rule ? rule.discountPercentage : 0;
                  const isSelected = duration === m;
                  const cost =
                    (Number(product.price) * m * (1 - Number(discount) / 100)) /
                    m;
                  return (
                    <div
                      key={m}
                      onClick={() => setDuration(m)}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md flex items-center justify-between ${isSelected ? "border-green-500 bg-green-50 ring-1 ring-green-500" : "border-gray-200 hover:border-green-300 bg-white"}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-gray-900">
                            {m} Aylık
                          </span>
                          {Number(discount) > 0 && (
                            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded">
                              %{discount} İndirim
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 font-medium">
                          Aylık Sadece{" "}
                          <span className="text-gray-900 font-bold">
                            ₺{cost.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-green-500 bg-green-500" : "border-gray-300"}`}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* BÖLÜM 2: PET */}
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200/60">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
                    2
                  </span>
                  Paket Kimin İçin?
                </h2>
                {!isGuest && (
                  <button
                    onClick={() => setIsAddPetModalOpen(true)}
                    className="text-sm font-bold text-green-600 hover:text-green-700 bg-green-50 px-4 py-2 rounded-lg transition border border-green-100"
                  >
                    + Yeni Dost Ekle
                  </button>
                )}
              </div>
              {!isGuest ? (
                myPets.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {myPets.map((pet) => (
                      <button
                        key={pet.id}
                        onClick={() => setSelectedPetId(pet.id)}
                        className={`px-6 py-4 rounded-2xl border-2 font-bold text-sm whitespace-nowrap transition-all flex flex-col items-center gap-1 min-w-[120px] ${selectedPetId === pet.id ? "border-green-500 bg-green-50 text-green-700 shadow-sm" : "border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50"}`}
                      >
                        <span className="text-2xl">
                          {pet.type === "kopek"
                            ? "🐶"
                            : pet.type === "kedi"
                              ? "🐱"
                              : "🐾"}
                        </span>
                        <span>{pet.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div
                    className="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-green-300 transition"
                    onClick={() => setIsAddPetModalOpen(true)}
                  >
                    <div className="text-2xl mb-2">🐾</div>
                    <p>Henüz kayıtlı dostunuz yok.</p>
                  </div>
                )
              ) : (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-4">
                    MİSAFİR GİRİŞİ - DOST BİLGİLERİ
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-4 font-bold">
                    {["kopek", "kedi"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setGuestPetData({ ...guestPetData, type: t });
                          setIsOtherOpen(false);
                        }}
                        className={`w-full h-12 rounded-xl border-2 transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-xs md:text-sm ${guestPetData.type === t ? "border-green-500 bg-white text-green-700 shadow-sm" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100"}`}
                      >
                        <span className="text-lg">
                          {t === "kopek" ? "🐶" : "🐱"}
                        </span>
                        <span>{t === "kopek" ? "Köpek" : "Kedi"}</span>
                      </button>
                    ))}
                    <div className="relative w-full">
                      <button
                        type="button"
                        onClick={() => setIsOtherOpen(!isOtherOpen)}
                        className={`w-full h-12 px-2 rounded-xl border-2 transition flex items-center justify-between text-xs md:text-sm ${!["kopek", "kedi"].includes(guestPetData.type) ? "border-green-500 bg-white text-green-700" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100"}`}
                      >
                        <div className="flex items-center gap-1 truncate">
                          <span className="text-lg">
                            {!["kopek", "kedi"].includes(guestPetData.type)
                              ? getGuestOtherIcon()
                              : "🦜"}
                          </span>
                          <span className="truncate">
                            {!["kopek", "kedi"].includes(guestPetData.type)
                              ? guestPetData.type
                              : "Diğer"}
                          </span>
                        </div>
                        <span className="text-[10px]">▼</span>
                      </button>
                      {isOtherOpen && (
                        <div className="absolute top-full right-0 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl z-20 overflow-hidden min-w-[120px]">
                          {Object.keys(OTHER_ICONS).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setGuestPetData({ ...guestPetData, type: t });
                                setIsOtherOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-green-50 hover:text-green-700 font-bold text-gray-600 border-b border-gray-50 last:border-0 flex items-center gap-2 text-sm transition"
                            >
                              <span className="text-xl">{OTHER_ICONS[t]}</span>{" "}
                              {t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={guestPetData.name}
                      onChange={(e) =>
                        setGuestPetData({
                          ...guestPetData,
                          name: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="Adı (Örn: Pamuk) *"
                    />
                    <input
                      type="text"
                      value={guestPetData.breed}
                      onChange={(e) =>
                        setGuestPetData({
                          ...guestPetData,
                          breed: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="Irkı (Örn: Golden) *"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">
                        Doğum Tarihi
                      </label>
                      <input
                        type="date"
                        value={guestPetData.birthDate}
                        onChange={(e) =>
                          setGuestPetData({
                            ...guestPetData,
                            birthDate: e.target.value,
                          })
                        }
                        className={`${inputClass} text-gray-500`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block">
                        Kilo (Kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={guestPetData.weight}
                        onChange={(e) =>
                          setGuestPetData({
                            ...guestPetData,
                            weight: e.target.value,
                          })
                        }
                        className={inputClass}
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={guestPetData.isNeutered}
                      onChange={(e) =>
                        setGuestPetData({
                          ...guestPetData,
                          isNeutered: e.target.value,
                        })
                      }
                      className={`${inputClass} bg-white`}
                    >
                      <option value="false">Kısır Değil</option>
                      <option value="true">Kısırlaştırılmış</option>
                    </select>
                    <input
                      type="text"
                      value={guestPetData.allergies}
                      onChange={(e) =>
                        setGuestPetData({
                          ...guestPetData,
                          allergies: e.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="Alerjiler (Örn: Tavuk)"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* BÖLÜM 3: ADRES */}
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200/60">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
                    3
                  </span>
                  Teslimat Adresi
                </h2>
                {!isGuest && (
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-sm font-bold text-green-600 hover:text-green-700 bg-green-50 px-4 py-2 rounded-lg transition border border-green-100"
                  >
                    + Yeni Adres
                  </button>
                )}
              </div>
              {!isGuest ? (
                addresses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-4 transition-all ${selectedAddressId === addr.id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedAddressId === addr.id ? "border-green-500" : "border-gray-300"}`}
                        >
                          {selectedAddressId === addr.id && (
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">
                            {addr.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {addr.fullAddress}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm italic">
                    Henüz kayıtlı adres yok.
                  </div>
                )
              ) : (
                <div className="space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      name="firstName"
                      placeholder="Adınız"
                      value={guestData.firstName}
                      onChange={(e) =>
                        setGuestData({
                          ...guestData,
                          firstName: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                    <input
                      name="lastName"
                      placeholder="Soyadınız"
                      value={guestData.lastName}
                      onChange={(e) =>
                        setGuestData({ ...guestData, lastName: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <input
                    name="email"
                    placeholder="E-posta"
                    value={guestData.email}
                    onChange={(e) =>
                      setGuestData({ ...guestData, email: e.target.value })
                    }
                    className={inputClass}
                  />
                  <input
                    name="phone"
                    placeholder="Telefon (5XX...)"
                    value={guestData.phone}
                    onChange={(e) =>
                      setGuestData({ ...guestData, phone: e.target.value })
                    }
                    className={inputClass}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      name="city"
                      placeholder="İl"
                      value={guestData.city}
                      onChange={(e) =>
                        setGuestData({ ...guestData, city: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      name="district"
                      placeholder="İlçe"
                      value={guestData.district}
                      onChange={(e) =>
                        setGuestData({ ...guestData, district: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <textarea
                    name="fullAddress"
                    placeholder="Açık Adres (Mahalle, Sokak, No...)"
                    value={guestData.fullAddress}
                    onChange={(e) =>
                      setGuestData({
                        ...guestData,
                        fullAddress: e.target.value,
                      })
                    }
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              )}
            </section>

            {/* BÖLÜM 4: ÖDEME */}
            <section
              className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200/60"
              id="payment-area"
            >
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
                  4
                </span>
                Güvenli Ödeme
              </h2>
              {!iframeToken ? (
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-gray-700 text-sm flex items-center gap-2">
                        <CreditCardIcon /> Kart Bilgileri
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                          Kart Sahibi
                        </label>
                        <input
                          type="text"
                          placeholder="Ad Soyad"
                          value={cardData.holderName}
                          onChange={(e) =>
                            setCardData({
                              ...cardData,
                              holderName: e.target.value,
                            })
                          }
                          className="w-full p-3 rounded-xl border border-gray-300 font-bold text-gray-900 outline-none focus:border-green-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                          Kart Numarası
                        </label>
                        <input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          value={cardData.cardNumber}
                          onChange={handleCardNumberChange}
                          maxLength={19}
                          className="w-full p-3 rounded-xl border border-gray-300 font-bold text-gray-900 outline-none focus:border-green-500 bg-white tracking-widest"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                            Son Kullanma
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={cardData.expMonth}
                              onChange={(e) =>
                                setCardData({
                                  ...cardData,
                                  expMonth: e.target.value,
                                })
                              }
                              className="w-full p-3 rounded-xl border border-gray-300 font-bold text-gray-900 outline-none focus:border-green-500 bg-white"
                            >
                              <option value="">Ay</option>
                              {Array.from({ length: 12 }, (_, i) =>
                                String(i + 1).padStart(2, "0"),
                              ).map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                            <select
                              value={cardData.expYear}
                              onChange={(e) =>
                                setCardData({
                                  ...cardData,
                                  expYear: e.target.value,
                                })
                              }
                              className="w-full p-3 rounded-xl border border-gray-300 font-bold text-gray-900 outline-none focus:border-green-500 bg-white"
                            >
                              <option value="">Yıl</option>
                              {Array.from({ length: 15 }, (_, i) =>
                                String(new Date().getFullYear() + i).slice(-2),
                              ).map((y) => (
                                <option key={y} value={y}>
                                  {y}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                            CVC / CVV
                          </label>
                          <input
                            type="text"
                            placeholder="123"
                            maxLength={3}
                            value={cardData.cvc}
                            onChange={(e) =>
                              setCardData({
                                ...cardData,
                                cvc: e.target.value.replace(/\D/g, ""),
                              })
                            }
                            className="w-full p-3 rounded-xl border border-gray-300 font-bold text-gray-900 outline-none focus:border-green-500 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <label className="flex items-center justify-center gap-2 cursor-pointer mb-6 select-none">
                      <input
                        type="checkbox"
                        checked={agreementsAccepted}
                        onChange={(e) =>
                          setAgreementsAccepted(e.target.checked)
                        }
                        className="w-5 h-5 accent-green-600 rounded"
                      />
                      <span className="text-xs text-gray-600">
                        <span
                          className="font-bold underline hover:text-green-600"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsAgreementModalOpen(true);
                          }}
                        >
                          Mesafeli Satış Sözleşmesi
                        </span>
                        'ni okudum, onaylıyorum.
                      </span>
                    </label>
                    <button
                      onClick={startPayment}
                      disabled={isPaymentLoading}
                      className="w-full bg-gray-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                    >
                      {isPaymentLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          İşlem Yapılıyor...
                        </>
                      ) : (
                        "Ödemeyi Tamamla 💳"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-[600px] border border-gray-200 rounded-2xl overflow-hidden bg-white">
                  <iframe
                    src={iframeToken || ""}
                    id="paytriframe"
                    style={{ width: "100%", height: "100%", border: "none" }}
                  ></iframe>
                </div>
              )}
            </section>
          </div>

          {/* SAĞ TARA: ÖZET */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200 sticky top-24">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-xl relative overflow-hidden flex-shrink-0 border border-gray-200">
                  {product?.image ? (
                    <NextImage
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-2xl">
                      🎁
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">
                    {product?.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {duration} Aylık Plan
                  </p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Paket Tutarı</span>
                  <span className="font-bold text-gray-900">
                    ₺{rawTotal.toFixed(2)}
                  </span>
                </div>
                {Number(discountRate) > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-bold bg-green-50 p-2 rounded-lg">
                    <span>Kazancınız</span>
                    <span>-₺{(rawTotal - total).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Kargo</span>
                  <span className="font-bold text-green-600">Bedava</span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-400 uppercase">
                    Toplam
                  </span>
                  <span className="text-3xl font-black text-gray-900 tracking-tighter">
                    ₺{total.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 text-right mt-1">
                  KDV Dahildir
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircleIcon /> %100 İade Garantisi
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircleIcon /> Kolay İptal
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircleIcon /> Güvenli Ödeme
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-white">
          <div className="animate-spin w-10 h-10 border-4 border-green-500 rounded-full border-t-transparent"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
