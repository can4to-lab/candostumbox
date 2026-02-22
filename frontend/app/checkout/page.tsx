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
  // Promo Kod States
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
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 👈 Giriş durumu kontrolü

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

  // --- YENİ: Ödeme Yöntemi ve Taksit ---
  const [paymentMethod, setPaymentMethod] = useState<
    "credit_card" | "bank_transfer" | "cash_on_delivery"
  >("credit_card");
  const COD_FEE = 89.9; // Kapıda ödeme hizmet bedeli

  // Kart Bilgileri
  const [cardData, setCardData] = useState({
    holderName: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvc: "",
  });

  // Taksit Seçenekleri (ParamPOS API'den gelecek)
  const [installmentOptions, setInstallmentOptions] = useState<
    InstallmentOption[]
  >([]);
  const [isFetchingInstallments, setIsFetchingInstallments] = useState(false);
  const [selectedInstallmentObj, setSelectedInstallmentObj] =
    useState<InstallmentOption | null>(null);

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
      const res = await fetch(
        "https://candostumbox-api.onrender.com/users/pets",
        { headers: { Authorization: `Bearer ${token}` } },
      );
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
      const res = await fetch(
        "https://candostumbox-api.onrender.com/users/addresses",
        { headers: { Authorization: `Bearer ${token}` } },
      );
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
      const res = await fetch(
        "https://candostumbox-api.onrender.com/auth/profile",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- ÖDEME SONUCUNU DİNLEME (IFRAME'DEN GELEN MESAJ) ---
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "PARAM_PAYMENT_RESULT") {
        setIframeToken(null);
        if (event.data.status === "success") {
          toast.success("Ödemeniz başarıyla alındı! 🎉");
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

  // --- HESAPLAMALAR (PROMO KOD DAHİL) ---
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

    // 1. Plan İndirimi
    const rule = discountRules.find(
      (d) => Number(d.durationMonths) === duration,
    );
    const discountRate = rule ? Number(rule.discountPercentage) : 0;
    const subtotalAfterPlan = totalRaw - totalRaw * (discountRate / 100);

    // 2. Promo Kod İndirimi
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

  // Dinamik Olarak Sağ Taraf ve Öde Butonu İçin Gösterilecek Toplam (Taksit Vade Farkı Dahil)
  const displayTotal =
    paymentMethod === "credit_card" && selectedInstallmentObj
      ? selectedInstallmentObj.totalAmount
      : finalTotal;

  // --- TAKSİT SORGULAMA EFFECT (PARAM POS GERÇEK ZAMANLI) ---
  // --- TAKSİT SORGULAMA EFFECT (PARAM POS GERÇEK ZAMANLI) ---
  useEffect(() => {
    const fetchInstallments = async () => {
      const cleanCard = cardData.cardNumber.replace(/\s/g, "");
      if (cleanCard.length >= 6) {
        const bin = cleanCard.substring(0, 6);
        setIsFetchingInstallments(true);
        setInstallmentError(""); // Aramaya başlarken hatayı temizle
        try {
          const res = await fetch(
            "https://candostumbox-api.onrender.com/payment/installments",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bin, amount: finalTotal }),
            },
          );
          const data = await res.json();
          if (data.status === "success" && data.data && data.data.length > 0) {
            setInstallmentOptions(data.data);
            if (data.data.length > 0) {
              const stillExists = selectedInstallmentObj
                ? data.data.find(
                    (o: any) => o.month === selectedInstallmentObj.month,
                  )
                : null;
              setSelectedInstallmentObj(stillExists || data.data[0]);
            }
          } else {
            // ❌ PARAM POS HATA DÖNDÜ (Tabloyu gizle ve hatayı göster)
            setInstallmentOptions([]);
            setSelectedInstallmentObj(null);
            setInstallmentError(
              data.message || "Bu karta ait taksit seçeneği bulunamadı.",
            );
          }
        } catch (error) {
          console.error("Taksit bilgileri alınamadı:", error);
          setInstallmentOptions([]);
          setSelectedInstallmentObj(null);
          setInstallmentError("Sunucuya bağlanılamadı.");
        } finally {
          setIsFetchingInstallments(false);
        }
      } else {
        setInstallmentOptions([]);
        setSelectedInstallmentObj(null);
        setInstallmentError(""); // 6 haneden az ise hatayı gizle
      }
    };

    const timeoutId = setTimeout(() => {
      fetchInstallments();
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardData.cardNumber.replace(/\s/g, "").substring(0, 6), finalTotal]);

  // --- PROMO KOD UYGULAMA ---
  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setIsCheckingPromo(true);
    try {
      const res = await fetch(
        "https://candostumbox-api.onrender.com/promo-codes/validate",
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

  // --- ÖDEME BAŞLATMA ---
  // --- ÖDEME BAŞLATMA ---
  const startPayment = async () => {
    // ... Sözleşme kontrolleri (Aynı kalacak)
    if (!agreementsAccepted) {
      toast.error("Lütfen sözleşmeyi onaylayın.");
      return;
    }
    const token = localStorage.getItem("token");

    if (duration > 1 && !token) {
      toast.error(
        "3, 6, 9 veya 12 aylık avantajlı paketleri satın alabilmek için lütfen ücretsiz kayıt olun veya giriş yapın.",
      );
      setRegisterOpen(true);
      return;
    }

    setIsPaymentLoading(true);

    let finalUserId = null;
    let finalUserData = null;

    if (token) {
      // Token çözme kısmı aynı kalacak...
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

    // 1. DÜZELTME: Adres datasını netleştirdik
    let finalAddressData =
      finalUserId && selectedAddressId
        ? { id: selectedAddressId }
        : {
            fullAddress: guestData.fullAddress,
            city: guestData.city,
            district: guestData.district,
            title: "Ev Adresim", // Misafirler için varsayılan bir başlık ekledik
          };

    // 2. DÜZELTME: Fiyatı item bazında doğru şekilde gönderiyoruz
    const baseOrderItems = [
      {
        productId: product.id,
        productName: product.name,
        price: displayTotal, // 👈 KRİTİK: Komisyon veya kapıda ödeme eklenmiş 'Nihai Toplam' Fiyatı gönderiyoruz!
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

    // 👇 EĞER HAVALE VEYA KAPIDA ÖDEME İSE
    if (paymentMethod !== "credit_card") {
      const directOrderPayload = {
        addressId:
          finalUserId && selectedAddressId ? selectedAddressId : undefined,
        paymentType: paymentMethod,
        isGuest: !finalUserId,
        guestInfo: !finalUserId ? guestData : undefined,
        items: baseOrderItems,
      };

      try {
        const res = await fetch(
          "https://candostumbox-api.onrender.com/orders",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(directOrderPayload),
          },
        );
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

    // 👇 EĞER KREDİ KARTI İSE
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
    <>
      <main className="min-h-screen bg-[#F8F9FA] font-sans pb-24 relative">
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
              <h1 className="font-black text-lg text-gray-900">
                Güvenli Ödeme
              </h1>
            </div>
            <div className="flex items-center gap-2 text-green-600 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <LockIcon /> 256-Bit SSL Secured
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-8">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 relative">
            <div className="lg:col-span-8 space-y-8 order-last lg:order-first">
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
                    const isLocked = m > 1 && !isLoggedIn; // 👈 KİLİT MANTIĞI

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
                                <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-green-500 flex flex-col gap-2">
                                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    🎁 Üyelere Özel Avantaj
                                  </h3>
                                  <p className="text-sm text-gray-600">
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
                        className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md flex items-center justify-between overflow-hidden
                          ${isSelected ? "border-green-500 bg-green-50 ring-1 ring-green-500" : "border-gray-200 hover:border-green-300 bg-white"}
                        `}
                      >
                        {/* Kilit İkonu ve Blur Efekti (Eğer kilitliyse) */}
                        {isLocked && (
                          <div className="absolute top-2 right-2 text-gray-400 bg-gray-100 p-1 rounded-md text-[10px] font-bold flex items-center gap-1 z-10">
                            <LockIcon /> Üyelere Özel
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-lg font-black ${isLocked ? "text-gray-600" : "text-gray-900"}`}
                            >
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

              {/* BÖLÜM 2: DOST BİLGİLERİ */}
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
                      className="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-green-300"
                      onClick={() => setIsAddPetModalOpen(true)}
                    >
                      <div className="text-2xl mb-2">🐾</div>
                      <p>Henüz kayıtlı dostunuz yok.</p>
                    </div>
                  )
                ) : (
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
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
                          <span>▼</span>
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
                                className="w-full text-left px-4 py-3 hover:bg-green-50 hover:text-green-700 font-bold text-gray-600 border-b border-gray-50 last:border-0 flex items-center gap-2 text-sm"
                              >
                                {OTHER_ICONS[t]} {t}
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
                        placeholder="Adı *"
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
                        placeholder="Irkı *"
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
                        placeholder="Kilo (Kg)"
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
                        placeholder="Alerjiler"
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
                  <div className="grid grid-cols-1 gap-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-4 transition-all ${selectedAddressId === addr.id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddressId === addr.id ? "border-green-500" : "border-gray-300"}`}
                        >
                          {selectedAddressId === addr.id && (
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">
                            {addr.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {addr.fullAddress}
                          </div>
                        </div>
                      </div>
                    ))}
                    {addresses.length === 0 && (
                      <div
                        className="text-center py-6 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-green-300"
                        onClick={() => setIsAddressModalOpen(true)}
                      >
                        <div className="text-2xl mb-2">📍</div>
                        <p className="text-sm">
                          Henüz kayıtlı adresiniz yok. Eklemek için tıklayın.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="Ad"
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
                        placeholder="Soyad"
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
                    <input
                      placeholder="E-posta"
                      value={guestData.email}
                      onChange={(e) =>
                        setGuestData({ ...guestData, email: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      placeholder="Telefon"
                      value={guestData.phone}
                      onChange={(e) =>
                        setGuestData({ ...guestData, phone: e.target.value })
                      }
                      className={inputClass}
                    />
                    <div className="grid grid-cols-2 gap-3">
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
                      placeholder="Açık Adres"
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

              {/* BÖLÜM 4: ÖDEME FORMU */}
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

                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-6 relative overflow-hidden">
                  {(isPaymentLoading || iframeToken) && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center"></div>
                  )}

                  {/* ÖDEME SEKMELELRİ */}
                  <div className="flex border-b border-gray-200 mb-6 bg-white rounded-xl shadow-sm p-1">
                    <button
                      onClick={() => setPaymentMethod("credit_card")}
                      className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${paymentMethod === "credit_card" ? "bg-green-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                      💳 Kredi Kartı
                    </button>
                    <button
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${paymentMethod === "bank_transfer" ? "bg-green-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                      🏦 Havale/EFT
                    </button>
                    <button
                      onClick={() => setPaymentMethod("cash_on_delivery")}
                      className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${paymentMethod === "cash_on_delivery" ? "bg-green-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                      📦 Kapıda Ödeme
                    </button>
                  </div>

                  {/* TAB 1: KREDİ KARTI FORMU */}
                  {paymentMethod === "credit_card" && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 relative z-0">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-gray-700 text-sm flex items-center gap-2">
                          <CreditCardIcon /> Kart Bilgileri
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Kart Sahibi"
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

                      <div className="grid grid-cols-3 gap-2 mb-6">
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
                          className={inputClass}
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

                      {/* TAKSİT TABLOSU (Gerçek API Verisi) */}
                      {isFetchingInstallments ? (
                        <div className="text-center text-sm text-gray-500 py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 animate-pulse">
                          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          Bankanızın taksit oranları ParamPOS üzerinden
                          sorgulanıyor...
                        </div>
                      ) : installmentError ? ( // 👈 EKLENEN KISIM BURASI
                        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl flex gap-3 items-center border border-red-100 shadow-sm font-bold">
                          <span className="text-xl">⚠️</span>
                          <p>{installmentError}</p>
                        </div>
                      ) : installmentOptions.length > 0 ? (
                        <div className="space-y-2">
                          {installmentOptions.map((opt) => (
                            <label
                              key={opt.month}
                              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all
                                ${selectedInstallmentObj?.month === opt.month ? "border-green-500 bg-green-50 ring-2 ring-green-500 ring-opacity-20" : "border-gray-200 hover:border-green-300 bg-white"}
                              `}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedInstallmentObj?.month === opt.month ? "border-green-500 bg-white" : "border-gray-300"}`}
                                >
                                  {selectedInstallmentObj?.month ===
                                    opt.month && (
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                                  )}
                                </div>
                                <div>
                                  <span className="font-black text-gray-900 text-base">
                                    {opt.month === 1
                                      ? "Tek Çekim"
                                      : `${opt.month} Taksit`}
                                  </span>
                                  {opt.commissionRate > 0 ? (
                                    <div className="text-[11px] text-gray-500 mt-0.5 font-medium">
                                      Banka Komisyonu:{" "}
                                      <span className="text-red-500 font-bold">
                                        +₺{opt.commissionAmount.toFixed(2)}
                                      </span>{" "}
                                      (%{opt.commissionRate})
                                    </div>
                                  ) : (
                                    <div className="text-[11px] text-green-600 mt-0.5 font-bold">
                                      Komisyonsuz
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-black text-gray-900 text-lg">
                                  ₺{opt.monthlyPayment.toFixed(2)}{" "}
                                  <span className="text-xs font-normal text-gray-500">
                                    /ay
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 font-medium">
                                  Toplam: ₺{opt.totalAmount.toFixed(2)}
                                </div>
                              </div>
                              <input
                                type="radio"
                                name="installment"
                                className="hidden"
                                checked={
                                  selectedInstallmentObj?.month === opt.month
                                }
                                onChange={() => setSelectedInstallmentObj(opt)}
                              />
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl flex gap-3 items-start border border-blue-100 shadow-sm">
                          <span className="text-xl">ℹ️</span>
                          <p>
                            Taksit seçeneklerini ve vade farklarını görmek için
                            lütfen geçerli bir kredi kartı numarasının ilk 6
                            hanesini giriniz.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: HAVALE / EFT BİLGİLERİ */}
                  {paymentMethod === "bank_transfer" && (
                    <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <h4 className="font-bold text-blue-900 flex items-center gap-2">
                        🏦 Banka Hesap Bilgilerimiz
                      </h4>
                      <p className="text-sm text-blue-800">
                        Siparişi tamamladıktan sonra tutarı aşağıdaki hesaba
                        göndermeniz gerekmektedir.{" "}
                        <span className="font-bold">
                          Açıklama kısmına kayıtlı telefon numaranızı yazmayı
                          unutmayın.
                        </span>
                      </p>
                      <div className="bg-white p-4 rounded-lg border border-blue-100 font-mono text-sm mt-2 shadow-sm">
                        <p className="mb-2">
                          <strong className="text-gray-900 font-sans">
                            Banka:
                          </strong>{" "}
                          [TODO: Banka Adı Eklenecek]
                        </p>
                        <p className="mb-2">
                          <strong className="text-gray-900 font-sans">
                            Alıcı:
                          </strong>{" "}
                          [TODO: Firma Adı Eklenecek]
                        </p>
                        <p className="bg-gray-50 p-2 rounded border border-gray-200 tracking-wider font-bold">
                          TR00 0000 0000 0000 0000 0000 00
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: KAPIDA ÖDEME BİLGİLERİ */}
                  {paymentMethod === "cash_on_delivery" && (
                    <div className="p-5 bg-orange-50 border border-orange-100 rounded-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <h4 className="font-bold text-orange-900 flex items-center gap-2">
                        📦 Kapıda Ödeme
                      </h4>
                      <p className="text-sm text-orange-800">
                        Siparişinizi teslim alırken kargo görevlisine nakit veya
                        kredi kartı ile ödeme yapabilirsiniz.
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-orange-100 text-sm mt-2 font-bold text-orange-700 flex justify-between items-center shadow-sm">
                        <span>Kapıda Ödeme Hizmet Bedeli:</span>
                        <span className="text-lg">+ ₺{COD_FEE.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 relative z-0">
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
                          className="font-bold underline cursor-pointer hover:text-green-600"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsAgreementModalOpen(true);
                          }}
                        >
                          Sözleşmeyi
                        </span>{" "}
                        okudum, onaylıyorum.
                      </span>
                    </label>
                    <button
                      onClick={startPayment}
                      disabled={isPaymentLoading || !!iframeToken}
                      className="w-full bg-gray-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-black transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
                    >
                      {isPaymentLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          İşlem Yapılıyor...
                        </>
                      ) : (
                        `Ödemeyi Tamamla ₺${displayTotal.toFixed(2)}`
                      )}
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* SAĞ TARAF: SİPARİŞ ÖZETİ */}
            <div className="lg:col-span-4 order-first lg:order-last">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200 sticky top-24">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl relative overflow-hidden border border-gray-200">
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

                <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block ml-1">
                    İndirim Kodu
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Kodu girin..."
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 uppercase font-bold text-gray-900"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={appliedPromo}
                    />
                    {appliedPromo ? (
                      <button
                        onClick={() => {
                          setAppliedPromo(null);
                          setPromoCode("");
                        }}
                        className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-xs font-bold transition hover:bg-red-100"
                      >
                        Kaldır
                      </button>
                    ) : (
                      <button
                        onClick={handleApplyPromo}
                        disabled={isCheckingPromo || !promoCode}
                        className="bg-gray-900 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-black transition disabled:opacity-50"
                      >
                        {isCheckingPromo ? "..." : "Uygula"}
                      </button>
                    )}
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
                      <span>Plan İndirimi (%{discountRate})</span>
                      <span>-₺{(rawTotal - subtotalAfterPlan).toFixed(2)}</span>
                    </div>
                  )}
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-purple-600 font-bold bg-purple-50 p-2 rounded-lg animate-pulse">
                      <span>Kod: {appliedPromo.code}</span>
                      <span>-₺{promoDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {paymentMethod === "cash_on_delivery" && (
                    <div className="flex justify-between text-sm text-orange-600 font-bold bg-orange-50 p-2 rounded-lg">
                      <span>Kapıda Ödeme Bedeli</span>
                      <span>+₺{COD_FEE.toFixed(2)}</span>
                    </div>
                  )}
                  {paymentMethod === "credit_card" &&
                    (selectedInstallmentObj?.commissionAmount || 0) > 0 && (
                      <div className="flex justify-between text-sm text-red-600 font-bold bg-red-50 p-2 rounded-lg">
                        <span>
                          Vade Farkı ({selectedInstallmentObj?.month} Taksit)
                        </span>
                        <span>
                          +₺
                          {selectedInstallmentObj?.commissionAmount?.toFixed(2)}
                        </span>
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
                      ₺{displayTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {iframeToken && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col h-[650px] animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shadow-sm relative z-20">
              <div className="flex items-center gap-2">
                <LockIcon />
                <h3 className="font-bold text-gray-800 text-sm">
                  3D Secure Güvenli Ödeme Onayı
                </h3>
              </div>
              <button
                onClick={() => {
                  setIframeToken(null);
                  toast.error("Ödeme işlemi iptal edildi.");
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                title="Kapat"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 w-full relative bg-white">
              <div className="absolute inset-0 flex flex-col items-center justify-center z-0 text-gray-400 space-y-3">
                <div className="animate-spin w-8 h-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
                <span className="text-sm font-medium animate-pulse">
                  Banka ekranına bağlanılıyor...
                </span>
              </div>
              <iframe
                src={iframeToken}
                id="paytriframe"
                className="w-full h-full border-none relative z-10 bg-transparent"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
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
