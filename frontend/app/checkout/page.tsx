"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import NextImage from "next/image";

// MODALLAR
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";
import AddAddressModal from "../components/modals/AddAddressModal";
import AddPetModal from "../components/modals/AddPetModal";
import AgreementsModal from "@/components/AgreementsModal";

// --- İKONLAR ---
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
      strokeWidth={2.5}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);
const CreditCardIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500"
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
interface InstallmentOption {
  month: number;
  commissionRate: number;
  commissionAmount: number;
  totalAmount: number;
  monthlyPayment: number;
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
  const extendSubId = searchParams.get("extendSubId");

  // --- STATE ---
  const [product, setProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [duration, setDuration] = useState(1);
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([]);
  const [installmentError, setInstallmentError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);

  // Kullanıcı Verileri
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Misafir
  const [isGuest, setIsGuest] = useState(true);
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

  // --- Ödeme Yöntemi ve Taksit ---
  const [paymentMethod, setPaymentMethod] = useState<
    "credit_card" | "bank_transfer" | "cash_on_delivery"
  >("credit_card");
  const COD_FEE = 159.9;
  const [cardData, setCardData] = useState({
    holderName: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvc: "",
  });
  const [installmentOptions, setInstallmentOptions] = useState<
    InstallmentOption[]
  >([]);
  const [isFetchingInstallments, setIsFetchingInstallments] = useState(false);
  const [selectedInstallmentObj, setSelectedInstallmentObj] =
    useState<InstallmentOption | null>(null);

  const [agreementsAccepted, setAgreementsAccepted] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
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
          fetch(`https://api.candostumbox.com/products/${productId}`),
          fetch(`https://api.candostumbox.com/discounts`),
        ]);
        if (prodRes.ok) setProduct(await prodRes.json());
        if (discRes.ok) setDiscountRules(await discRes.json());

        const token = localStorage.getItem("token");
        if (token) {
          setIsGuest(false);
          setIsLoggedIn(true);
          fetchPets(token);
          fetchAddresses(token);
          fetchProfile(token);
        } else {
          setIsGuest(true);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingProduct(false);
      }
    };
    init();
  }, [productId, router]);

  const fetchPets = async (token: string) => {
    try {
      const res = await fetch("https://api.candostumbox.com/users/pets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.pets || [];
        setMyPets(list);
        if (list.length > 0 && !selectedPetId) setSelectedPetId(list[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAddresses = async (token: string) => {
    try {
      const res = await fetch("https://api.candostumbox.com/users/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAddresses(data);
          if (data.length > 0 && !selectedAddressId)
            setSelectedAddressId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch("https://api.candostumbox.com/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUserProfile(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "PARAM_PAYMENT_RESULT") {
        if (event.data.status === "success") {
          router.push(`/payment/success?orderId=${event.data.orderId}`);
        } else {
          toast.error(
            "Ödeme başarısız oldu: " + (event.data.message || "Hata"),
          );
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  const calculateTotal = () => {
    if (!product)
      return {
        total: 0,
        discountRate: 0,
        monthlyPrice: 0,
        rawTotal: 0,
        subtotalAfterPlan: 0,
        promoDiscountAmount: 0,
        finalTotal: 0,
      };
    const basePrice = Number(product.price);
    const totalRaw = basePrice * duration;
    const rule = discountRules.find(
      (d) => Number(d.durationMonths) === duration,
    );
    const discountRate = rule ? Number(rule.discountPercentage) : 0;
    const subtotalAfterPlan = totalRaw - totalRaw * (discountRate / 100);
    let promoDiscountAmount = 0;
    if (appliedPromo) {
      if (appliedPromo.discountType === "percentage") {
        promoDiscountAmount =
          (subtotalAfterPlan * Number(appliedPromo.discountValue)) / 100;
      } else {
        promoDiscountAmount = Number(appliedPromo.discountValue);
      }
    }
    const finalTotal =
      subtotalAfterPlan -
      promoDiscountAmount +
      (paymentMethod === "cash_on_delivery" ? COD_FEE : 0);
    return {
      rawTotal: totalRaw,
      discountRate,
      subtotalAfterPlan,
      promoDiscountAmount,
      finalTotal,
      monthlyPrice: finalTotal / duration,
    };
  };

  const {
    rawTotal,
    discountRate,
    subtotalAfterPlan,
    promoDiscountAmount,
    finalTotal,
  } = calculateTotal();
  const displayTotal =
    paymentMethod === "credit_card" && selectedInstallmentObj
      ? selectedInstallmentObj.totalAmount
      : finalTotal;

  useEffect(() => {
    const fetchInstallments = async () => {
      const cleanCard = cardData.cardNumber.replace(/\s/g, "");
      if (cleanCard.length >= 6) {
        const bin = cleanCard.substring(0, 6);
        setIsFetchingInstallments(true);
        setInstallmentError("");
        try {
          const res = await fetch(
            "https://api.candostumbox.com/payment/installments",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bin, amount: finalTotal }),
            },
          );
          const data = await res.json();
          if (data.status === "success" && data.data && data.data.length > 0) {
            const modifiedData = data.data.map((opt: InstallmentOption) => {
              if (opt.month === 1) {
                return {
                  ...opt,
                  commissionRate: 0,
                  commissionAmount: 0,
                  totalAmount: finalTotal,
                  monthlyPayment: finalTotal,
                };
              }
              return opt;
            });
            setInstallmentOptions(modifiedData);
            if (modifiedData.length > 0) {
              const stillExists = selectedInstallmentObj
                ? modifiedData.find(
                    (o: any) => o.month === selectedInstallmentObj.month,
                  )
                : null;
              setSelectedInstallmentObj(stillExists || modifiedData[0]);
            }
          } else {
            setInstallmentOptions([]);
            setSelectedInstallmentObj(null);
            setInstallmentError(
              data.message || "Bu karta ait taksit seçeneği bulunamadı.",
            );
          }
        } catch (error) {
          setInstallmentOptions([]);
          setSelectedInstallmentObj(null);
          setInstallmentError("Sunucuya bağlanılamadı.");
        } finally {
          setIsFetchingInstallments(false);
        }
      } else {
        setInstallmentOptions([]);
        setSelectedInstallmentObj(null);
        setInstallmentError("");
      }
    };
    const timeoutId = setTimeout(() => {
      fetchInstallments();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [cardData.cardNumber.replace(/\s/g, "").substring(0, 6), finalTotal]);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setIsCheckingPromo(true);
    try {
      const res = await fetch(
        "https://api.candostumbox.com/promo-codes/validate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: promoCode,
            basketAmount: subtotalAfterPlan,
          }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setAppliedPromo(data);
        toast.success(`${data.code} kodu uygulandı!`);
      } else {
        toast.error(data.message || "Kod uygulanamadı.");
        setAppliedPromo(null);
      }
    } catch (err) {
      toast.error("Bir hata oluştu.");
    } finally {
      setIsCheckingPromo(false);
    }
  };

  const startPayment = async () => {
    if (!displayTotal || displayTotal <= 0) {
      toast.error(
        "Geçerli bir paket seçilmedi veya tutar hesaplanamadı. Lütfen sayfayı yenileyin.",
      );
      return;
    }
    if (!agreementsAccepted) {
      toast.error("Lütfen sözleşmeyi onaylayın.");
      return;
    }
    if (isGuest) {
      if (
        !guestData.firstName ||
        !guestData.lastName ||
        !guestData.email ||
        !guestData.phone ||
        !guestData.fullAddress ||
        !guestData.city
      ) {
        toast.error(
          "Lütfen e-posta dahil tüm iletişim ve adres bilgilerinizi eksiksiz doldurun.",
        );
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestData.email)) {
        toast.error("Lütfen geçerli bir e-posta adresi giriniz.");
        return;
      }
      if (!guestPetData.name || !guestPetData.breed) {
        toast.error("Lütfen dostunuzun adını ve ırkını giriniz.");
        return;
      }
    } else {
      if (!selectedAddressId) {
        toast.error(
          "Lütfen bir teslimat adresi seçin veya yeni adres ekleyin.",
        );
        return;
      }
      if (!selectedPetId) {
        toast.error("Lütfen bir dost seçin veya yeni dost ekleyin.");
        return;
      }
    }
    const token = localStorage.getItem("token");
    if (duration > 1 && !token) {
      toast.error(
        "Avantajlı paketleri satın alabilmek için lütfen ücretsiz kayıt olun veya giriş yapın.",
      );
      setRegisterOpen(true);
      return;
    }

    setIsPaymentLoading(true);
    let finalUserId = null;
    let finalUserData = null;
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );
        const decoded = JSON.parse(jsonPayload);
        finalUserId = decoded.sub || decoded.userId || decoded.id;
      } catch (e) {
        console.error(e);
      }
    }
    if (!finalUserId && userProfile?.id) finalUserId = userProfile.id;

    if (finalUserId) {
      finalUserData = {
        id: finalUserId,
        firstName: userProfile?.firstName || "",
        lastName: userProfile?.lastName || "",
        email: userProfile?.email || "",
        phone: userProfile?.phone || "",
      };
    } else {
      finalUserData = {
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        email: guestData.email,
        phone: guestData.phone,
      };
    }

    let finalAddressData =
      finalUserId && selectedAddressId
        ? { id: selectedAddressId }
        : {
            fullAddress: guestData.fullAddress,
            city: guestData.city,
            district: guestData.district,
            title: "Ev Adresim",
          };

    const baseOrderItems = [
      {
        productId: product.id,
        price: displayTotal,
        quantity: 1,
        duration: duration,
        petId: !isGuest ? selectedPetId : undefined,
        petName: isGuest
          ? guestPetData.name
          : myPets.find((p) => p.id === selectedPetId)?.name,
        petBreed: isGuest ? guestPetData.breed : undefined,
        petType: isGuest ? guestPetData.type : undefined,
        petBirthDate: isGuest ? guestPetData.birthDate : undefined,
        petWeight: isGuest ? guestPetData.weight : undefined,
        petIsNeutered: isGuest ? guestPetData.isNeutered === "true" : undefined,
        petAllergies: isGuest ? guestPetData.allergies : undefined,
        upgradeFromSubId: isUpgradeMode ? oldSubId : undefined,
        subscriptionId: extendSubId || undefined,
      },
    ];

    if (paymentMethod !== "credit_card") {
      const directOrderPayload = {
        addressId:
          finalUserId && selectedAddressId ? selectedAddressId : undefined,
        paymentType: paymentMethod,
        isGuest: !finalUserId,
        guestInfo: !finalUserId ? guestData : undefined,
        items: baseOrderItems,
        promoCode: appliedPromo?.code || undefined,
      };
      try {
        const res = await fetch("https://api.candostumbox.com/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(directOrderPayload),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Siparişiniz başarıyla alındı! 🎉");
          router.push(
            `/payment/success?orderId=${data.orderId || data.id || "basarili"}`,
          );
        } else {
          toast.error("Hata: " + (data.message || "Sipariş oluşturulamadı."));
        }
      } catch (error) {
        toast.error("Sunucu hatası.");
      } finally {
        setIsPaymentLoading(false);
      }
      return;
    }

    const payload = {
      price: displayTotal,
      installment: selectedInstallmentObj
        ? String(selectedInstallmentObj.month)
        : "1",
      promoCode: appliedPromo?.code || undefined,
      items: baseOrderItems,
      user: finalUserData,
      address: finalAddressData,
      card: {
        cardHolder: cardData.holderName,
        cardNumber: cardData.cardNumber.replace(/\s/g, ""),
        expireMonth: cardData.expMonth,
        expireYear: cardData.expYear,
        cvc: cardData.cvc,
      },
    };

    try {
      const res = await fetch("https://api.candostumbox.com/payment/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === "success" && data.token) {
        toast.success("3D Secure ekranına yönlendiriliyorsunuz! 🔒");
        window.location.href = data.token;
      } else {
        toast.error("Hata: " + (data.message || "Bilinmeyen hata"));
        setIsPaymentLoading(false);
      }
    } catch (error) {
      toast.error("Sunucu hatası.");
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

  // PREMIUM SKELETON LOADER
  if (loadingProduct)
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse tracking-widest uppercase text-sm">
          Güvenli Ödeme Hazırlanıyor...
        </p>
      </div>
    );

  const inputClass =
    "w-full p-3.5 rounded-xl border border-gray-200 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all bg-gray-50/80 text-sm placeholder:font-medium placeholder:text-gray-400";
  const StepBadge = ({ num, title }: { num: string; title: string }) => (
    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 text-white flex items-center justify-center text-sm shadow-md ring-4 ring-gray-100">
        {num}
      </div>
      {title}
    </h2>
  );

  return (
    <>
      <main className="min-h-screen bg-[#F9FAFB] font-sans pb-24 relative selection:bg-green-200">
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

        {/* HEADER */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-[72px] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-900 font-bold flex items-center gap-2 transition-colors"
              >
                <span className="text-lg">←</span> Geri Dön
              </button>
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
              <h1 className="font-black text-lg text-gray-900 hidden sm:block tracking-tight">
                Güvenli Ödeme Noktası
              </h1>
            </div>
            <div className="flex items-center gap-2 text-green-700 text-xs font-black bg-green-50 px-4 py-2 rounded-full border border-green-100 shadow-sm uppercase tracking-wider">
              <LockIcon /> 256-Bit SSL
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-10">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 relative">
            {/* SOL TARAF: FORMLAR */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8 order-last lg:order-first">
              {/* BÖLÜM 1: PLAN */}
              <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-fade-in-up">
                <StepBadge num="1" title="Abonelik Planı" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 3, 6, 12].map((m) => {
                    const rule = discountRules.find(
                      (d) => Number(d.durationMonths) === m,
                    );
                    const discount = rule ? rule.discountPercentage : 0;
                    const isSelected = duration === m;
                    const isLocked = m > 1 && !isLoggedIn;
                    const cost =
                      (Number(product.price) *
                        m *
                        (1 - Number(discount) / 100)) /
                      m;

                    return (
                      <div
                        key={m}
                        onClick={() => {
                          if (isLocked) {
                            toast.custom(
                              (t) => (
                                <div className="bg-white p-4 rounded-2xl shadow-xl border-l-4 border-blue-500 flex flex-col gap-2">
                                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    🎁 Üyelere Özel Fırsat
                                  </h3>
                                  <p className="text-sm text-gray-500 font-medium">
                                    Bu avantajlı planı seçmek için lütfen
                                    ücretsiz kayıt olun.
                                  </p>
                                </div>
                              ),
                              { duration: 4000 },
                            );
                            setRegisterOpen(true);
                          } else {
                            setDuration(m);
                          }
                        }}
                        className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between overflow-hidden group
                          ${isSelected ? "border-green-500 bg-green-50/50 shadow-md ring-4 ring-green-500/10" : "border-gray-100 hover:border-green-300 hover:bg-gray-50"}
                        `}
                      >
                        {isLocked && (
                          <div className="absolute top-3 right-3 text-gray-400 bg-gray-100 p-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 uppercase tracking-widest">
                            <LockIcon /> Kilitli
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xl font-black ${isLocked ? "text-gray-400" : "text-gray-900"}`}
                            >
                              {m} Aylık
                            </span>
                            {Number(discount) > 0 && (
                              <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider">
                                %{discount} Kar
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 font-medium">
                            Aylık Sadece{" "}
                            <span
                              className={`font-black text-lg ${isSelected ? "text-green-600" : "text-gray-900"}`}
                            >
                              ₺{cost.toFixed(0)}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-[3px] flex items-center justify-center transition-colors ${isSelected ? "border-green-500 bg-white" : "border-gray-200 group-hover:border-green-300"}`}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-fade-in"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* BÖLÜM 2: DOST BİLGİLERİ */}
              <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-fade-in-up delay-75">
                <div className="flex justify-between items-center mb-6">
                  <StepBadge num="2" title="Paket Kimin İçin?" />
                  {!isGuest && (
                    <button
                      onClick={() => setIsAddPetModalOpen(true)}
                      className="text-xs font-black text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 px-4 py-2.5 rounded-xl transition-all border border-blue-100 uppercase tracking-widest"
                    >
                      + Yeni Dost
                    </button>
                  )}
                </div>

                {!isGuest ? (
                  myPets.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                      {myPets.map((pet) => (
                        <button
                          key={pet.id}
                          onClick={() => setSelectedPetId(pet.id)}
                          className={`px-8 py-5 rounded-2xl border-2 font-bold text-sm whitespace-nowrap transition-all duration-300 flex flex-col items-center gap-2 min-w-[130px] 
                            ${selectedPetId === pet.id ? "border-green-500 bg-green-50 text-green-700 shadow-md ring-4 ring-green-500/10 scale-105" : "border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50"}
                          `}
                        >
                          <span className="text-3xl">
                            {pet.type === "kopek"
                              ? "🐶"
                              : pet.type === "kedi"
                                ? "🐱"
                                : "🐾"}
                          </span>
                          <span className="tracking-wide">{pet.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all group"
                      onClick={() => setIsAddPetModalOpen(true)}
                    >
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                        🐾
                      </div>
                      <p className="font-bold text-gray-600">
                        Sistemde kayıtlı dostunuz yok.
                      </p>
                      <p className="text-sm text-gray-400 font-medium mt-1">
                        Hemen eklemek için tıklayın.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <div className="grid grid-cols-3 gap-3 mb-5 font-bold">
                      {["kopek", "kedi"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setGuestPetData({ ...guestPetData, type: t });
                            setIsOtherOpen(false);
                          }}
                          className={`w-full py-3 rounded-xl border-2 transition-all flex flex-col md:flex-row items-center justify-center gap-2 text-sm
                            ${guestPetData.type === t ? "border-green-500 bg-white text-green-700 shadow-sm" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
                        >
                          <span className="text-xl">
                            {t === "kopek" ? "🐶" : "🐱"}
                          </span>
                          <span className="capitalize">
                            {t === "kopek" ? "Köpek" : "Kedi"}
                          </span>
                        </button>
                      ))}
                      <div className="relative w-full">
                        <button
                          type="button"
                          onClick={() => setIsOtherOpen(!isOtherOpen)}
                          className={`w-full h-full px-4 rounded-xl border-2 transition-all flex items-center justify-between text-sm
                            ${!["kopek", "kedi"].includes(guestPetData.type) ? "border-green-500 bg-white text-green-700 shadow-sm" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-xl">
                              {!["kopek", "kedi"].includes(guestPetData.type)
                                ? getGuestOtherIcon()
                                : "🦜"}
                            </span>
                            <span className="truncate capitalize">
                              {!["kopek", "kedi"].includes(guestPetData.type)
                                ? guestPetData.type
                                : "Diğer"}
                            </span>
                          </div>
                          <span className="text-[10px]">▼</span>
                        </button>
                        {isOtherOpen && (
                          <div className="absolute top-full right-0 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl z-20 overflow-hidden min-w-[120px] animate-fade-in">
                            {Object.keys(OTHER_ICONS).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => {
                                  setGuestPetData({ ...guestPetData, type: t });
                                  setIsOtherOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-green-50 hover:text-green-700 font-bold text-gray-600 border-b border-gray-50 last:border-0 flex items-center gap-3 text-sm transition-colors"
                              >
                                <span className="text-lg">
                                  {OTHER_ICONS[t]}
                                </span>{" "}
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
                        placeholder="Dostunun Adı"
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
                        placeholder="Irkı"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input
                        type="date"
                        value={guestPetData.birthDate}
                        onChange={(e) =>
                          setGuestPetData({
                            ...guestPetData,
                            birthDate: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
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
                        placeholder="Kilosu (Kg)"
                      />
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
                        className={inputClass}
                      >
                        <option value="false">Kısırlaştırılmadı</option>
                        <option value="true">Kısırlaştırıldı</option>
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
                        placeholder="Varsa Alerjileri"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* BÖLÜM 3: ADRES */}
              <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-fade-in-up delay-150">
                <div className="flex justify-between items-center mb-6">
                  <StepBadge num="3" title="Teslimat Bilgileri" />
                  {!isGuest && (
                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-xs font-black text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 px-4 py-2.5 rounded-xl transition-all border border-blue-100 uppercase tracking-widest"
                    >
                      + Yeni Adres
                    </button>
                  )}
                </div>
                {!isGuest ? (
                  <div className="grid grid-cols-1 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer flex items-start gap-4 transition-all duration-300 group
                          ${selectedAddressId === addr.id ? "border-green-500 bg-green-50/30 shadow-sm" : "border-gray-100 hover:border-green-300 hover:bg-gray-50"}
                        `}
                      >
                        <div
                          className={`mt-1 w-5 h-5 rounded-full border-[3px] flex items-center justify-center transition-colors ${selectedAddressId === addr.id ? "border-green-500 bg-white" : "border-gray-200 group-hover:border-green-300"}`}
                        >
                          {selectedAddressId === addr.id && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-black text-gray-900 text-sm mb-1">
                            {addr.title}
                          </div>
                          <div className="text-sm text-gray-500 font-medium leading-relaxed">
                            {addr.fullAddress}
                          </div>
                        </div>
                      </div>
                    ))}
                    {addresses.length === 0 && (
                      <div
                        className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-green-400 transition-all"
                        onClick={() => setIsAddressModalOpen(true)}
                      >
                        <div className="text-3xl mb-2">📍</div>
                        <p className="font-bold text-gray-600">
                          Kayıtlı adresiniz bulunmuyor.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <input
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
                        placeholder="Soyadınız"
                        value={guestData.lastName}
                        onChange={(e) =>
                          setGuestData({
                            ...guestData,
                            lastName: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        placeholder="E-posta Adresi"
                        value={guestData.email}
                        onChange={(e) =>
                          setGuestData({ ...guestData, email: e.target.value })
                        }
                        className={inputClass}
                      />
                      <input
                        placeholder="Telefon Numarası"
                        value={guestData.phone}
                        onChange={(e) =>
                          setGuestData({ ...guestData, phone: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        placeholder="İl"
                        value={guestData.city}
                        onChange={(e) =>
                          setGuestData({ ...guestData, city: e.target.value })
                        }
                        className={inputClass}
                      />
                      <input
                        placeholder="İlçe"
                        value={guestData.district}
                        onChange={(e) =>
                          setGuestData({
                            ...guestData,
                            district: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                    <textarea
                      placeholder="Açık Adresiniz (Mahalle, Sokak, Kapı No vs.)"
                      value={guestData.fullAddress}
                      onChange={(e) =>
                        setGuestData({
                          ...guestData,
                          fullAddress: e.target.value,
                        })
                      }
                      rows={3}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                )}
              </section>

              {/* BÖLÜM 4: ÖDEME FORMU */}
              <section
                className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-fade-in-up delay-200"
                id="payment-area"
              >
                <StepBadge num="4" title="Ödeme Bilgileri" />

                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 space-y-6 relative overflow-hidden">
                  {isPaymentLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mb-3"></div>
                      <span className="font-black text-gray-900 animate-pulse tracking-widest uppercase text-xs">
                        Güvenli Bağlantı Kuruluyor...
                      </span>
                    </div>
                  )}

                  {/* ÖDEME SEKMELERİ (Modern Hap Tasarım) */}
                  <div className="bg-gray-200/50 p-1.5 rounded-xl flex overflow-x-auto scrollbar-hide">
                    <button
                      onClick={() => setPaymentMethod("credit_card")}
                      className={`flex-1 py-3 px-4 text-xs sm:text-sm font-black rounded-lg transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap uppercase tracking-wider
                        ${paymentMethod === "credit_card" ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"}`}
                    >
                      <span className="text-lg">💳</span> Kartla Öde
                    </button>
                    <button
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className={`flex-1 py-3 px-4 text-xs sm:text-sm font-black rounded-lg transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap uppercase tracking-wider
                        ${paymentMethod === "bank_transfer" ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"}`}
                    >
                      <span className="text-lg">🏦</span> Havale / EFT
                    </button>
                    <button
                      onClick={() => setPaymentMethod("cash_on_delivery")}
                      className={`flex-1 py-3 px-4 text-xs sm:text-sm font-black rounded-lg transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap uppercase tracking-wider
                        ${paymentMethod === "cash_on_delivery" ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"}`}
                    >
                      <span className="text-lg">📦</span> Kapıda Ödeme
                    </button>
                  </div>

                  {/* TAB 1: KREDİ KARTI FORMU */}
                  {paymentMethod === "credit_card" && (
                    <div className="space-y-4 animate-fade-in relative z-0 mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCardIcon />
                        <span className="font-bold text-gray-600 text-sm">
                          Kart Bilgilerini Girin
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Kart Üzerindeki İsim"
                        value={cardData.holderName}
                        onChange={(e) =>
                          setCardData({
                            ...cardData,
                            holderName: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Kart Numarası"
                        value={cardData.cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        className={inputClass}
                      />

                      <div className="grid grid-cols-3 gap-3">
                        <select
                          value={cardData.expMonth}
                          onChange={(e) =>
                            setCardData({
                              ...cardData,
                              expMonth: e.target.value,
                            })
                          }
                          className={inputClass}
                        >
                          <option value="" disabled>
                            Ay
                          </option>
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
                          className={inputClass}
                        >
                          <option value="" disabled>
                            Yıl
                          </option>
                          {Array.from({ length: 15 }, (_, i) =>
                            String(new Date().getFullYear() + i).slice(-2),
                          ).map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="CVC"
                          maxLength={3}
                          value={cardData.cvc}
                          onChange={(e) =>
                            setCardData({
                              ...cardData,
                              cvc: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          className={inputClass}
                        />
                      </div>

                      {/* TAKSİT TABLOSU */}
                      <div className="mt-6">
                        {isFetchingInstallments ? (
                          <div className="text-center py-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#ff6000] rounded-full animate-spin mx-auto mb-2"></div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                              Taksitler Yükleniyor...
                            </span>
                          </div>
                        ) : installmentError ? (
                          <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl flex gap-3 items-center border border-red-100 font-bold">
                            <span className="text-xl">⚠️</span>{" "}
                            <p>{installmentError}</p>
                          </div>
                        ) : installmentOptions.length > 0 ? (
                          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-black text-gray-500 uppercase tracking-widest">
                              Taksit Seçenekleri
                            </div>
                            {installmentOptions.map((opt, index) => (
                              <label
                                key={opt.month}
                                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${index !== installmentOptions.length - 1 ? "border-b border-gray-100" : ""} ${selectedInstallmentObj?.month === opt.month ? "bg-orange-50/30" : "hover:bg-gray-50"}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-5 h-5 rounded-full border-[3px] flex items-center justify-center transition-colors ${selectedInstallmentObj?.month === opt.month ? "border-[#ff6000] bg-white" : "border-gray-300 bg-white"}`}
                                  >
                                    {selectedInstallmentObj?.month ===
                                      opt.month && (
                                      <div className="w-2 h-2 bg-[#ff6000] rounded-full"></div>
                                    )}
                                  </div>
                                  <span className="font-bold text-gray-800 text-sm">
                                    {opt.month === 1
                                      ? "Tek Çekim"
                                      : `${opt.month} Taksit`}
                                    {opt.month > 1 && (
                                      <span className="block text-[10px] text-gray-500 font-medium">
                                        {opt.monthlyPayment.toFixed(2)} TL / Ay
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <div className="text-right font-black text-gray-900 text-sm">
                                  {opt.totalAmount.toFixed(2)} TL
                                </div>
                                <input
                                  type="radio"
                                  name="installment"
                                  className="hidden"
                                  checked={
                                    selectedInstallmentObj?.month === opt.month
                                  }
                                  onChange={() =>
                                    setSelectedInstallmentObj(opt)
                                  }
                                />
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-blue-50 text-blue-700 text-sm p-4 rounded-xl flex gap-3 items-start border border-blue-100 font-medium">
                            <span className="text-xl">ℹ️</span>
                            <p>
                              Taksit seçeneklerini görmek için lütfen kart
                              numaranızı girmeye başlayın.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: HAVALE */}
                  {paymentMethod === "bank_transfer" && (
                    <div className="p-6 bg-white border border-blue-100 rounded-xl space-y-4 animate-fade-in shadow-sm">
                      <div className="flex items-center gap-3 text-blue-800">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-xl">
                          🏦
                        </div>
                        <h4 className="font-black text-lg">
                          Banka Hesap Bilgileri
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 font-medium leading-relaxed">
                        Siparişi onayladıktan sonra toplam tutarı aşağıdaki
                        hesaba aktarmanız gerekmektedir.
                        <strong className="block text-gray-900 mt-2">
                          Lütfen açıklama kısmına telefon numaranızı yazmayı
                          unutmayın.
                        </strong>
                      </p>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-sm space-y-2">
                        <p>
                          <strong className="text-gray-500 font-sans text-xs uppercase tracking-widest">
                            Banka:
                          </strong>{" "}
                          <span className="font-bold text-gray-900">
                            Enpara (QNB Finansbank)
                          </span>
                        </p>
                        <p>
                          <strong className="text-gray-500 font-sans text-xs uppercase tracking-widest">
                            Alıcı:
                          </strong>{" "}
                          <span className="font-bold text-gray-900">
                            Mehmet Günen
                          </span>
                        </p>
                        <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200 text-center">
                          <p className="tracking-widest font-black text-gray-900 text-sm sm:text-base select-all">
                            TR68 0015 7000 0000 0038 3554 10
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: KAPIDA ÖDEME */}
                  {paymentMethod === "cash_on_delivery" && (
                    <div className="p-6 bg-white border border-orange-100 rounded-xl space-y-4 animate-fade-in shadow-sm">
                      <div className="flex items-center gap-3 text-orange-800">
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-xl">
                          📦
                        </div>
                        <h4 className="font-black text-lg">Kapıda Ödeme</h4>
                      </div>
                      <p className="text-sm text-gray-600 font-medium leading-relaxed">
                        Siparişinizi teslim alırken kargo görevlisine{" "}
                        <strong className="text-gray-900">Nakit</strong> veya{" "}
                        <strong className="text-gray-900">Kredi Kartı</strong>{" "}
                        ile ödeme yapabilirsiniz.
                      </p>
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 flex justify-between items-center">
                        <span className="font-bold text-orange-900 text-sm">
                          Hizmet Bedeli:
                        </span>
                        <span className="text-lg font-black text-orange-700">
                          + ₺{COD_FEE.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* SÖZLEŞME VE ONAY BUTONU */}
              <div className="pt-4 relative z-0 animate-fade-in-up delay-300">
                <label className="flex items-center justify-center gap-3 cursor-pointer mb-8 select-none bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={agreementsAccepted}
                      onChange={(e) => setAgreementsAccepted(e.target.checked)}
                      className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-lg checked:bg-green-500 checked:border-green-500 transition-all cursor-pointer"
                    />
                    <svg
                      className="absolute w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    <span
                      className="font-bold text-blue-600 underline cursor-pointer hover:text-blue-800"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsAgreementModalOpen(true);
                      }}
                    >
                      Mesafeli Satış Sözleşmesini
                    </span>{" "}
                    okudum ve onaylıyorum.
                  </span>
                </label>

                <button
                  onClick={startPayment}
                  disabled={isPaymentLoading}
                  className="group relative overflow-hidden w-full bg-gradient-to-r from-[#ff6000] to-[#ff8533] text-white px-8 py-5 rounded-2xl font-black shadow-[0_15px_35px_-10px_rgba(255,96,0,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(255,96,0,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {!isPaymentLoading && (
                    <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-25deg] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  )}

                  <span className="relative z-10 flex items-center gap-3 uppercase tracking-widest">
                    {isPaymentLoading ? (
                      <>
                        {" "}
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                        İşleminiz Yapılıyor...{" "}
                      </>
                    ) : (
                      <> Güvenle Öde ve Tamamla 🔒 </>
                    )}
                  </span>
                </button>
                <div className="text-center mt-4 flex items-center justify-center gap-2 text-gray-400">
                  <LockIcon />{" "}
                  <span className="text-xs font-bold uppercase tracking-widest">
                    256-Bit Uçtan Uca Şifreleme
                  </span>
                </div>
              </div>
            </div>

            {/* SAĞ TARAF: SİPARİŞ ÖZETİ (Yüzen Kutu) */}
            <div className="lg:col-span-5 xl:col-span-4 order-first lg:order-last">
              <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-100 sticky top-28 overflow-hidden animate-fade-in-up">
                <div className="p-6 md:p-8 bg-gray-50/50 border-b border-gray-100">
                  <h3 className="font-black text-gray-900 text-lg uppercase tracking-widest mb-6">
                    Sipariş Özeti
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden p-2">
                      {product?.image ? (
                        <NextImage
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-3xl">
                          🎁
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-base leading-tight mb-1">
                        {product?.name}
                      </h4>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-200/50 inline-block px-2 py-1 rounded-md">
                        {duration} Aylık Plan
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  {/* İndirim Kodu Alanı */}
                  <div className="mb-6">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">
                      İndirim Kuponu
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="KOD GİRİN"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={appliedPromo}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ff6000]/20 focus:border-[#ff6000] uppercase font-black text-gray-900 placeholder:font-medium placeholder:normal-case"
                      />
                      {appliedPromo ? (
                        <button
                          onClick={() => {
                            setAppliedPromo(null);
                            setPromoCode("");
                          }}
                          className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition hover:bg-red-100"
                        >
                          İptal
                        </button>
                      ) : (
                        <button
                          onClick={handleApplyPromo}
                          disabled={isCheckingPromo || !promoCode}
                          className="bg-gray-900 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition disabled:opacity-50"
                        >
                          {isCheckingPromo ? "..." : "Ekle"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Fiyat Satırları */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm font-medium text-gray-500">
                      <span>Ara Toplam ({duration} Ay)</span>
                      <span className="font-bold text-gray-900">
                        ₺{rawTotal.toFixed(2)}
                      </span>
                    </div>
                    {Number(discountRate) > 0 && (
                      <div className="flex justify-between text-sm font-bold text-green-600 bg-green-50 p-3 rounded-xl">
                        <span>Abonelik İndirimi (%{discountRate})</span>
                        <span>
                          -₺{(rawTotal - subtotalAfterPlan).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {appliedPromo && (
                      <div className="flex justify-between text-sm font-bold text-purple-600 bg-purple-50 p-3 rounded-xl animate-pulse">
                        <span>Kupon İndirimi ({appliedPromo.code})</span>
                        <span>-₺{promoDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {paymentMethod === "cash_on_delivery" && (
                      <div className="flex justify-between text-sm font-bold text-orange-600 bg-orange-50 p-3 rounded-xl">
                        <span>Kapıda Ödeme Bedeli</span>
                        <span>+₺{COD_FEE.toFixed(2)}</span>
                      </div>
                    )}
                    {paymentMethod === "credit_card" &&
                      (selectedInstallmentObj?.commissionAmount || 0) > 0 && (
                        <div className="flex justify-between text-sm font-bold text-[#ff6000] bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                          <span>Banka Vade Farkı</span>
                          <span>
                            +₺
                            {selectedInstallmentObj?.commissionAmount?.toFixed(
                              2,
                            )}
                          </span>
                        </div>
                      )}
                    <div className="flex justify-between text-sm font-medium text-gray-500">
                      <span>Kargo Ücreti</span>
                      <span className="font-black text-green-600 uppercase tracking-wider">
                        Bedava
                      </span>
                    </div>
                  </div>

                  {/* Toplam Tutar */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8 text-white">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        Ödenecek Tutar
                      </span>
                      <span className="text-4xl font-black text-[#ff6000] tracking-tighter">
                        {displayTotal.toFixed(2)}{" "}
                        <span className="text-2xl text-white">TL</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Animations */}
        <style jsx global>{`
          @keyframes shimmer {
            100% {
              transform: translateX(250%);
            }
          }
          @keyframes fade-in-up {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in-up 0.4s ease-out forwards;
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
          }
          .delay-75 {
            animation-delay: 75ms;
          }
          .delay-150 {
            animation-delay: 150ms;
          }
          .delay-200 {
            animation-delay: 200ms;
          }
          .delay-300 {
            animation-delay: 300ms;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </main>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#ff6000] rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold animate-pulse tracking-widest uppercase text-sm">
            Ödeme Sayfası Hazırlanıyor...
          </p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
