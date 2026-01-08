"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

// 👇 YENİ: Sepet İşlemleri İçin Import
import { useCart } from "@/context/CartContext";

// --- BİLEŞEN IMPORTLARI ---
import AddPetModal from "../components/modals/AddPetModal";
import EditPetModal from "../components/modals/EditPetModal";
import AddAddressModal from "../components/modals/AddAddressModal";
import EditAddressModal from "../components/modals/EditAddressModal";
import ConfirmationModal from "../components/modals/ConfirmationModal";

import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";

const OTHER_ICONS: Record<string, string> = {
  Kuş: "🦜",
  Hamster: "🐹",
  Tavşan: "🐰",
  Balık: "🐟",
};

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 👇 YENİ: Sepet Hook'unu Başlatıyoruz
  const { addToCart } = useCart();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Navbar State
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);

  // Profil Tab State
  const [activeTab, setActiveTab] = useState("bilgiler");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  // Profil Modalları
  const [isAddPetOpen, setAddPetOpen] = useState(false);
  const [isEditPetOpen, setEditPetOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const [isAddAddressOpen, setAddAddressOpen] = useState(false);
  const [isEditAddressOpen, setEditAddressOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // SİLME ONAY MODALI STATE'LERİ
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    type: "address" | "pet";
    id: number;
  } | null>(null);

  // --- ABONELİK STATE'LERİ ---
  const [subs, setSubs] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tcIdentity: "",
    birthDate: "",
  });

  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // --- 🛠️ YARDIMCI FONKSİYONLAR ---
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const getZodiacSign = (dateString: string) => {
    if (!dateString) return { sign: "Bilinmiyor", icon: "⭐" };
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    if ((month == 1 && day <= 20) || (month == 12 && day >= 22))
      return { sign: "Oğlak", icon: "♑" };
    if ((month == 1 && day >= 21) || (month == 2 && day <= 18))
      return { sign: "Kova", icon: "♒" };
    if ((month == 2 && day >= 19) || (month == 3 && day <= 20))
      return { sign: "Balık", icon: "♓" };
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19))
      return { sign: "Koç", icon: "♈" };
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20))
      return { sign: "Boğa", icon: "♉" };
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20))
      return { sign: "İkizler", icon: "♊" };
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22))
      return { sign: "Yengeç", icon: "♋" };
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22))
      return { sign: "Aslan", icon: "♌" };
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22))
      return { sign: "Başak", icon: "♍" };
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22))
      return { sign: "Terazi", icon: "♎" };
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21))
      return { sign: "Akrep", icon: "♏" };
    if ((month == 11 && day >= 22) || (month == 12 && day >= 21))
      return { sign: "Yay", icon: "♐" };
    return { sign: "Bilinmiyor", icon: "⭐" };
  };

  const getHumanAge = (birthDate: string, type: string) => {
    if (!birthDate) return null;
    const age = calculateAge(birthDate);
    let multiplier = 7;
    if (type === "Kuş") multiplier = 5;
    return age * multiplier;
  };

  const getPetTheme = (type: string) => {
    switch (type) {
      case "kopek":
        return {
          bg: "from-orange-400 to-amber-500",
          light: "bg-orange-50",
          text: "text-orange-600",
          border: "border-orange-100",
          icon: "🐶",
        };
      case "kedi":
        return {
          bg: "from-blue-400 to-indigo-500",
          light: "bg-blue-50",
          text: "text-blue-600",
          border: "border-blue-100",
          icon: "🐱",
        };
      case "Kuş":
        return {
          bg: "from-green-400 to-emerald-500",
          light: "bg-green-50",
          text: "text-green-600",
          border: "border-green-100",
          icon: "🦜",
        };
      default:
        return {
          bg: "from-gray-400 to-gray-500",
          light: "bg-gray-50",
          text: "text-gray-600",
          border: "border-gray-100",
          icon: OTHER_ICONS[type] || "🐾",
        };
    }
  };

  // --- VERİ ÇEKME ---
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const res = await fetch(
        "https://candostumbox-api.onrender.com/auth/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setUser(data);

        const rawDate = data.userBirthDate || data.birthDate;
        const formattedDate = rawDate
          ? new Date(rawDate).toISOString().split("T")[0]
          : "";

        let fName = data.firstName || "";
        let lName = data.lastName || "";

        if (!fName && data.name) {
          const parts = data.name.split(" ");
          if (parts.length > 1) {
            lName = parts.pop();
            fName = parts.join(" ");
          } else {
            fName = data.name;
          }
        }

        setFormData({
          firstName: fName,
          lastName: lName,
          email: data.email,
          phone: data.phone || "",
          tcIdentity: data.tcKimlikNo || data.tcIdentity || "",
          birthDate: formattedDate,
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- ABONELİK VERİLERİNİ ÇEKME ---
  const fetchSubs = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setSubsLoading(true);
    try {
      const res = await fetch(
        "https://candostumbox-api.onrender.com/subscriptions",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setSubs(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "abonelik") {
      fetchSubs();
    }
  }, [activeTab]);

  // --- ABONELİK İŞLEMLERİ (YENİ) ---
  // 1. Süreyi Uzat (+3 Ay)
  const handleExtendSubscription = (sub: any) => {
    if (!sub.product) {
      toast.error("Paket bilgisi bulunamadı.");
      return;
    }

    addToCart({
      productId: sub.product.id,
      productName: sub.product.name,
      price: sub.product.price,
      duration: 3, // Buton +3 Ay dediği için
      petId: sub.pet?.id,
      petName: sub.pet?.name || "Dostum",
      paymentType: "upfront",
      image: sub.pet?.image || "",
      subscriptionId: sub.id, // Backend bunu uzatma olarak algılar
    });

    toast.success(`${sub.pet?.name} için +3 ay paket sepete eklendi! 🚀`);
    router.push("/checkout");
  };

  // 2. Paketi Yükselt
  const handleUpgradeSubscription = (sub: any) => {
    if (!sub.product) return;

    // Kalan Tutarı Hesapla (Tahmini - Kullanıcıya göstermek için)
    const monthlyPrice = sub.product.price / (sub.totalMonths || 1);
    const refundAmount = monthlyPrice * (sub.remainingMonths || 0);

    const params = new URLSearchParams();
    params.set("mode", "upgrade");
    params.set("oldSubId", sub.id);
    params.set("petId", sub.pet?.id || "");
    params.set("refund", refundAmount.toFixed(2));
    params.set("currentPrice", sub.product.price);
    router.push(`/product?${params.toString()}`);

    toast(`🚀 ${sub.pet?.name} için daha üst paketleri listeliyoruz...`);
  };

  // --- ABONELİK İPTAL ---
  const handleCancelSubscription = async () => {
    if (!selectedSubId) return;
    const token = localStorage.getItem("token");
    const toastId = toast.loading("İptal işlemi yapılıyor...");

    try {
      const res = await fetch(
        `https://candostumbox-api.onrender.com/subscriptions/${selectedSubId}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: "Kullanıcı panelinden iptal" }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success(data.info || "Abonelik iptal edildi.", {
          id: toastId,
          duration: 5000,
        });
        setCancelModalOpen(false);
        fetchSubs();
      } else {
        toast.error(data.message || "Hata oluştu.", { id: toastId });
      }
    } catch (e) {
      toast.error("Sunucu hatası.", { id: toastId });
    }
  };

  // --- İŞLEMLER (Profil Güncelleme, Silme vb.) ---
  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const toastId = toast.loading("Güncelleniyor...");
    try {
      let formattedDate = null;
      if (formData.birthDate)
        formattedDate = new Date(formData.birthDate).toISOString();

      const payload = {
        ...formData,
        userBirthDate: formattedDate,
        tcKimlikNo: formData.tcIdentity,
      };

      const res = await fetch(
        "https://candostumbox-api.onrender.com/users/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Bilgilerin güncellendi! ✅", { id: toastId });
        fetchProfile();
      } else {
        toast.error(data.message || "Güncelleme başarısız.", { id: toastId });
      }
    } catch (error) {
      toast.error("Sunucu hatası.", { id: toastId });
    }
  };

  const requestDelete = (type: "address" | "pet", id: number) => {
    setConfirmData({ type, id });
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!confirmData) return;
    const token = localStorage.getItem("token");
    const { type, id } = confirmData;
    const url =
      type === "address"
        ? `https://candostumbox-api.onrender.com/users/addresses/${id}`
        : `https://candostumbox-api.onrender.com/users/pets/${id}`;

    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success(
          type === "address" ? "Adres silindi." : "Dostun silindi."
        );
        fetchProfile();
      } else {
        toast.error("Silinemedi.");
      }
    } catch (e) {
      toast.error("Hata oluştu.");
    }
  };

  const openEditPetModal = (pet: any) => {
    setSelectedPet(pet);
    setEditPetOpen(true);
  };
  const openEditAddressModal = (addr: any) => {
    setSelectedAddress(addr);
    setEditAddressOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleChangePassword = async () => {
    if (!passData.current || !passData.new || !passData.confirm)
      return toast.error("Alanları doldurun.");
    if (passData.new !== passData.confirm)
      return toast.error("Şifreler eşleşmiyor!");

    const token = localStorage.getItem("token");
    const toastId = toast.loading("Şifre güncelleniyor...");
    try {
      const res = await fetch(
        "https://candostumbox-api.onrender.com/users/change-password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passData.current,
            newPassword: passData.new,
          }),
        }
      );
      if (res.ok) {
        toast.success("Şifreniz değiştirildi! 🔒", { id: toastId });
        setPassData({ current: "", new: "", confirm: "" });
      } else {
        toast.error("Hata oluştu.", { id: toastId });
      }
    } catch (e) {
      toast.error("Bağlantı hatası.", { id: toastId });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
      </div>
    );

  const menuItems = [
    { id: "abonelik", label: "Aboneliğim", icon: "📅" },
    { id: "siparisler", label: "Siparişlerim", icon: "📦" },
    { id: "bilgiler", label: "Kullanıcı Bilgilerim", icon: "👤" },
    { id: "pets", label: "Can Dostlarım", icon: "🐾" },
    { id: "sifre", label: "Şifremi Değiştir", icon: "🔒" },
    { id: "adresler", label: "Adreslerim", icon: "📍" },
    { id: "kartlar", label: "Kayıtlı Kartlarım", icon: "💳" },
    { id: "iletisim", label: "İletişim", icon: "✉️" },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans flex flex-col justify-between">
      <Toaster position="top-right" />

      {/* --- SİLME ONAY MODALI --- */}
      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Silmek İstediğine Emin misin?"
        message={
          confirmData?.type === "address"
            ? "Bu adresi silersen siparişlerinde kullanamazsın."
            : "Bu dostunu profilinden kaldırmak üzeresin."
        }
        isDangerous={true}
        confirmText="Evet, Sil"
      />

      <div className="flex-grow pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hesabım</h1>
              <p className="text-gray-500 mt-1">
                Hoş geldin,{" "}
                <span className="font-semibold text-gray-800">
                  {formData.firstName || user?.name}
                </span>
              </p>
            </div>
          </div>

          {/* --- MOBİL MENÜ --- */}
          <div className="lg:hidden mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold border transition
                                ${
                                  activeTab === item.id
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-600 border-gray-200"
                                }
                            `}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* SOL SIDEBAR (Masaüstü) */}
            <div className="hidden lg:block lg:col-span-3">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                                    ${
                                      activeTab === item.id
                                        ? "bg-orange-50 text-orange-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }
                                `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <div className="pt-6 mt-6 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <span className="text-lg">🚪</span> Çıkış Yap
                  </button>
                </div>
              </nav>
            </div>

            {/* SAĞ İÇERİK */}
            <div className="lg:col-span-9">
              {/* --- ABONELİK SEKMESİ --- */}
              {activeTab === "abonelik" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                    <span className="text-2xl">🛡️</span>
                    <div>
                      <h4 className="font-bold text-blue-900 text-sm">
                        Abonelik Güvencesi
                      </h4>
                      <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                        Memnun kalmazsanız dilediğiniz an iptal edebilirsiniz.
                        Kullanmadığınız ayların ücreti,{" "}
                        <span className="font-bold">Cayma Hakkı</span>{" "}
                        kapsamında kartınıza iade edilir.
                      </p>
                    </div>
                  </div>

                  {subsLoading ? (
                    <div className="text-center py-10 text-gray-400">
                      Paketler yükleniyor...
                    </div>
                  ) : subs.length > 0 ? (
                    subs.map((sub) => {
                      const total = sub.totalMonths || 1;
                      const remaining = sub.remainingMonths || 0;
                      const completed = total - remaining;
                      const progressPercent = Math.min(
                        100,
                        Math.max(0, (completed / total) * 100)
                      );

                      // 👇 DURUM KONTROLÜ (YENİ YAPI)
                      // Her durum için renk, metin ve ikon belirliyoruz.
                      const getStatusConfig = (status: string) => {
                        const s = status?.toLowerCase();
                        switch (s) {
                          case "active":
                            return {
                              label: "🟢 Aktif",
                              bg: "bg-green-100",
                              text: "text-green-700",
                              border: "border-green-200",
                              isActive: true,
                            };
                          case "upgraded":
                            return {
                              label: "🚀 Yükseltildi",
                              bg: "bg-blue-100",
                              text: "text-blue-700",
                              border: "border-blue-200",
                              isActive: false,
                            };
                          case "cancelled":
                            return {
                              label: "🔴 İptal Edildi",
                              bg: "bg-red-50",
                              text: "text-red-600",
                              border: "border-red-100",
                              isActive: false,
                            };
                          case "expired":
                            return {
                              label: "⌛ Süresi Doldu",
                              bg: "bg-gray-100",
                              text: "text-gray-600",
                              border: "border-gray-200",
                              isActive: false,
                            };
                          case "paused":
                            return {
                              label: "⏸️ Donduruldu",
                              bg: "bg-yellow-100",
                              text: "text-yellow-700",
                              border: "border-yellow-200",
                              isActive: false,
                            };
                          default:
                            return {
                              label: s,
                              bg: "bg-gray-100",
                              text: "text-gray-500",
                              border: "border-gray-200",
                              isActive: false,
                            };
                        }
                      };

                      const statusConfig = getStatusConfig(sub.status);

                      return (
                        <div
                          key={sub.id}
                          className={`bg-white border ${statusConfig.border} rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
                        >
                          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-full border border-gray-200 flex items-center justify-center text-xl shadow-sm">
                                {sub.pet?.type === "kopek"
                                  ? "🐶"
                                  : sub.pet?.type === "kedi"
                                  ? "🐱"
                                  : "🐦"}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-sm">
                                  {sub.pet?.name
                                    ? `${sub.pet.name} Paketi`
                                    : "Can Dostum Paketi"}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {sub.product?.name}
                                </p>
                              </div>
                            </div>
                            {/* Durum Rozeti */}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                            >
                              {statusConfig.label}
                            </span>
                          </div>

                          <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-8">
                              <div className="flex-1">
                                <div className="flex justify-between items-end mb-2">
                                  <span className="text-base font-bold text-gray-800">
                                    {sub.product?.name}
                                  </span>
                                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                                    {total} Aylık Plan
                                  </span>
                                </div>

                                {/* İlerleme Çubuğu */}
                                <div className="w-full bg-gray-100 rounded-full h-4 mb-2 overflow-hidden border border-gray-200 relative">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                      statusConfig.isActive
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                    }`}
                                    style={{ width: `${progressPercent}%` }}
                                  ></div>
                                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600 drop-shadow-sm uppercase tracking-wider">
                                    %{Math.round(progressPercent)} Tamamlandı
                                  </span>
                                </div>

                                <div className="flex justify-between text-xs text-gray-500 mb-6">
                                  <span>{completed}. Ay Bitti</span>
                                  <span>Kalan: {remaining} Ay</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="block text-xs text-gray-400 font-bold uppercase mb-1">
                                      📦 Sıradaki Kutu
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                      {statusConfig.isActive
                                        ? sub.nextDeliveryDate
                                          ? new Date(
                                              sub.nextDeliveryDate
                                            ).toLocaleDateString("tr-TR")
                                          : "Hesaplanıyor"
                                        : "-"}
                                    </span>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="block text-xs text-gray-400 font-bold uppercase mb-1">
                                      💳 Yenileme Tarihi
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                      {statusConfig.isActive
                                        ? sub.nextDeliveryDate
                                          ? new Date(
                                              sub.nextDeliveryDate
                                            ).toLocaleDateString("tr-TR")
                                          : "Hesaplanıyor"
                                        : "-"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* SAĞ TARAF BUTONLAR */}
                              <div className="md:w-1/3 md:border-l border-gray-100 md:pl-6 flex flex-col justify-center gap-3">
                                {statusConfig.isActive ? (
                                  <>
                                    {/* Yükseltme Butonu (Pasif & Tooltip) */}
                                    <div className="group relative w-full sm:w-auto">
                                      <button
                                        disabled
                                        className="w-full sm:w-auto bg-gray-300 text-gray-500 px-6 py-3 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2 border border-gray-200"
                                      >
                                        <span>🔒</span> Paketi Yükselt
                                      </button>
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 hidden group-hover:block w-max px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-xl z-20 animate-fade-in-up">
                                        🚧 Çok yakında hizmetinizde
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                                      </div>
                                    </div>

                                    <button
                                      onClick={() =>
                                        handleExtendSubscription(sub)
                                      }
                                      className="w-full py-3 px-4 bg-white border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-600 text-sm font-bold rounded-xl transition"
                                    >
                                      Süreyi Uzat (+3 Ay)
                                    </button>

                                    <button
                                      onClick={() => {
                                        setSelectedSubId(sub.id);
                                        setCancelModalOpen(true);
                                      }}
                                      className="w-full py-2 px-4 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl transition mt-2"
                                    >
                                      Aboneliği İptal Et
                                    </button>
                                  </>
                                ) : (
                                  // Aktif olmayan durumlar için (Upgraded, Cancelled vs.)
                                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-sm text-gray-500 mb-3 font-medium">
                                      {sub.status === "upgraded"
                                        ? "Bu paket başarıyla yükseltildi! 🎉"
                                        : "Bu abonelik artık aktif değil."}
                                    </p>
                                    {sub.status !== "upgraded" && (
                                      <button
                                        onClick={() => router.push("/")}
                                        className="text-green-600 font-bold hover:underline text-sm border border-green-200 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition"
                                      >
                                        Tekrar Abone Ol
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
                      <div className="text-6xl mb-4 grayscale opacity-50">
                        📅
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Aktif aboneliğin yok
                      </h3>
                      <p className="text-gray-500 mt-2 mb-6">
                        Her ay kapına mutluluk gelmesini istemez misin?
                      </p>
                      <button
                        onClick={() => router.push("/product")}
                        className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-green-700 transition transform hover:scale-105 inline-block"
                      >
                        Paketleri İncele
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* --- SİPARİŞLER SEKMESİ --- */}
              {activeTab === "siparisler" && (
                <div className="space-y-8 animate-fade-in">
                  {user?.orders?.length > 0 ? (
                    user.orders.map((order: any) => {
                      const orderDate = new Date(order.createdAt);
                      const deliveryDate = new Date(orderDate);
                      deliveryDate.setDate(deliveryDate.getDate() + 3);

                      const isPaid =
                        order.status === "PAID" || order.status === "success";
                      const isShipped = order.status === "SHIPPED";
                      const isDelivered = order.status === "DELIVERED";

                      return (
                        <div
                          key={order.id}
                          className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between gap-4 text-sm">
                            <div className="flex gap-8">
                              <div>
                                <span className="block text-xs font-bold text-gray-500 uppercase">
                                  Sipariş Tarihi
                                </span>
                                <span className="font-medium text-gray-900">
                                  {orderDate.toLocaleDateString("tr-TR")}
                                </span>
                              </div>
                              <div>
                                <span className="block text-xs font-bold text-gray-500 uppercase">
                                  Toplam Tutar
                                </span>
                                <span className="font-bold text-gray-900">
                                  ₺{Number(order.totalPrice).toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="block text-xs font-bold text-gray-500 uppercase">
                                  Alıcı
                                </span>
                                <span className="font-medium text-gray-900">
                                  {user?.name || user?.firstName}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block text-xs font-bold text-gray-500 uppercase">
                                Sipariş No
                              </span>
                              <span className="font-mono text-gray-700">
                                #{order.id.toString().slice(0, 8)}
                              </span>
                            </div>
                          </div>

                          <div className="p-6">
                            <div className="flex flex-col lg:flex-row gap-8">
                              <div className="flex-1 space-y-6">
                                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                  <span className="text-green-600">✓</span>
                                  {isDelivered
                                    ? "Teslim Edildi"
                                    : `Tahmini Teslimat: ${deliveryDate.toLocaleDateString(
                                        "tr-TR"
                                      )}`}
                                </h3>

                                {order.items?.map((item: any) => (
                                  <div
                                    key={item.id}
                                    className="flex gap-4 group"
                                  >
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-2xl group-hover:bg-gray-200 transition">
                                      📦
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex justify-between">
                                        <h4 className="font-bold text-gray-900 text-base">
                                          {item.product?.name}
                                        </h4>
                                        <span className="font-bold text-gray-900">
                                          ₺
                                          {item.priceAtPurchase ||
                                            item.product?.price}
                                        </span>
                                      </div>

                                      {/* 👇 YENİ: Pet İsmi Etiketi */}
                                      {item.pet && (
                                        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-orange-50 border border-orange-100 rounded-md">
                                          <span className="text-xs">
                                            {item.pet.type === "kopek"
                                              ? "🐶"
                                              : item.pet.type === "kedi"
                                              ? "🐱"
                                              : "🦜"}
                                          </span>
                                          <span className="text-xs font-bold text-orange-700">
                                            {item.pet.name} için
                                          </span>
                                        </div>
                                      )}

                                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                        {item.product?.description}
                                      </p>
                                      <div className="mt-2">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold border border-gray-200">
                                          Adet: {item.quantity}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="lg:w-1/3 lg:border-l border-gray-100 lg:pl-8 pt-6 lg:pt-0">
                                <div className="mb-4">
                                  <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg shadow-sm transition transform hover:-translate-y-0.5">
                                    Kargom Nerede?
                                  </button>
                                </div>
                                <div className="relative pl-4 space-y-6 border-l-2 border-gray-200 ml-2">
                                  <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white ring-1 ring-green-500"></div>
                                    <p className="text-sm font-bold text-gray-900">
                                      Sipariş Alındı
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {orderDate.toLocaleDateString("tr-TR")}
                                    </p>
                                  </div>
                                  <div className="relative">
                                    <div
                                      className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white ring-1 ${
                                        isPaid
                                          ? "bg-blue-500 ring-blue-500"
                                          : "bg-gray-300 ring-gray-300"
                                      }`}
                                    ></div>
                                    <p
                                      className={`text-sm font-bold ${
                                        isPaid
                                          ? "text-gray-900"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      Hazırlanıyor
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {isPaid ? "Paketiniz hazırlanıyor" : ""}
                                    </p>
                                  </div>
                                  <div className="relative">
                                    <div
                                      className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white ring-1 ${
                                        isShipped
                                          ? "bg-blue-500 ring-blue-500"
                                          : "bg-gray-300 ring-gray-300"
                                      }`}
                                    ></div>
                                    <p
                                      className={`text-sm font-bold ${
                                        isShipped
                                          ? "text-gray-900"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      Kargoya Verildi
                                    </p>
                                  </div>
                                  <div className="relative">
                                    <div
                                      className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white ring-1 ${
                                        isDelivered
                                          ? "bg-green-500 ring-green-500"
                                          : "bg-gray-300 ring-gray-300"
                                      }`}
                                    ></div>
                                    <p
                                      className={`text-sm font-bold ${
                                        isDelivered
                                          ? "text-green-600"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      Teslim Edildi
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                            <button className="text-xs text-blue-600 hover:underline font-bold">
                              Fatura Görüntüle
                            </button>
                            <span className="mx-2 text-gray-300">|</span>
                            <button className="text-xs text-blue-600 hover:underline font-bold">
                              Sorun Bildir
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
                      <div className="text-6xl mb-4">🛒</div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Henüz sipariş vermedin
                      </h3>
                      <p className="text-gray-500 mt-2 mb-6">
                        Can dostun için ilk sürpriz kutusunu oluşturmaya ne
                        dersin?
                      </p>
                      <button
                        onClick={() => router.push("/product")}
                        className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition"
                      >
                        Hemen Alışverişe Başla
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* --- KULLANICI BİLGİLERİ SEKMESİ --- */}
              {activeTab === "bilgiler" && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm animate-fade-in">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">
                          Ad
                        </label>
                        <input
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">
                          Soyad
                        </label>
                        <input
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">
                        E-Posta
                      </label>
                      <input
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">
                          TC No
                        </label>
                        <input
                          value={formData.tcIdentity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tcIdentity: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">
                          Doğum Tarihi
                        </label>
                        <input
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              birthDate: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">
                        Telefon
                      </label>
                      <input
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900"
                      />
                    </div>
                    <button
                      onClick={handleUpdateProfile}
                      className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              )}

              {/* --- CAN DOSTLARIM SEKMESİ --- */}
              {activeTab === "pets" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user?.pets?.map((pet: any) => {
                      const theme = getPetTheme(pet.type);
                      const zodiac = getZodiacSign(pet.birthDate);
                      const age = calculateAge(pet.birthDate);
                      const humanAge = getHumanAge(pet.birthDate, pet.type);

                      return (
                        <div
                          key={pet.id}
                          className={`group relative bg-white border ${theme.border} rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden`}
                        >
                          <div
                            className={`h-24 bg-gradient-to-r ${theme.bg} relative`}
                          >
                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                              #{pet.id.toString().slice(0, 4)}
                            </div>
                          </div>
                          <div className="absolute top-12 left-6">
                            <div className="w-24 h-24 bg-white p-1.5 rounded-full shadow-lg">
                              <div
                                className={`w-full h-full ${theme.light} rounded-full flex items-center justify-center text-5xl`}
                              >
                                {theme.icon}
                              </div>
                            </div>
                          </div>
                          <div className="pt-16 px-6 pb-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-black text-2xl text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all">
                                  {pet.name}
                                </h4>
                                <span
                                  className={`text-xs font-bold px-2 py-0.5 rounded ${theme.light} ${theme.text} uppercase tracking-wide`}
                                >
                                  {pet.breed || "Bilinmiyor"}
                                </span>
                              </div>
                              <button
                                onClick={() => openEditPetModal(pet)}
                                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"
                                title="Düzenle"
                              >
                                ✏️
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <span className="text-xs text-gray-400 font-bold block mb-1">
                                  YAŞ
                                </span>
                                <div className="font-bold text-gray-800 flex items-center gap-1">
                                  🎂 {age} Yaşında
                                </div>
                                {humanAge && (
                                  <div className="text-[10px] text-gray-500 mt-1">
                                    (İnsan yaşıyla: {humanAge})
                                  </div>
                                )}
                              </div>
                              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <span className="text-xs text-gray-400 font-bold block mb-1">
                                  AĞIRLIK
                                </span>
                                <div className="font-bold text-gray-800">
                                  ⚖️ {pet.weight} kg
                                </div>
                                <div className="text-[10px] text-gray-500 mt-1">
                                  {pet.gender === "male" ? "Erkek ♂" : "Dişi ♀"}
                                </div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 col-span-2 flex items-center justify-between">
                                <div>
                                  <span className="text-xs text-gray-400 font-bold block">
                                    BURCU
                                  </span>
                                  <span className="font-bold text-gray-800">
                                    {zodiac.sign}
                                  </span>
                                </div>
                                <div className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">
                                  {zodiac.icon}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                              <button
                                onClick={() => {
                                  const hasActiveSub = subs.find(
                                    (s) =>
                                      s.pet?.id === pet.id &&
                                      s.status === "active"
                                  );
                                  if (hasActiveSub) {
                                    setActiveTab("abonelik");
                                    toast(
                                      "Abonelik detaylarına yönlendiriliyorsunuz...",
                                      { icon: "🚀" }
                                    );
                                  } else {
                                    toast.success(
                                      `${pet.name} için harika bir kutu seçelim!`
                                    );
                                    router.push("/product");
                                  }
                                }}
                                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition shadow-lg shadow-gray-200"
                              >
                                {subs.find(
                                  (s) =>
                                    s.pet?.id === pet.id &&
                                    s.status === "active"
                                )
                                  ? "⚙️ Paketi Yönet"
                                  : "🎁 Paket Satın Al"}
                              </button>
                              <button
                                onClick={() => requestDelete("pet", pet.id)}
                                className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition"
                              >
                                Sil 🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => setAddPetOpen(true)}
                      className="group relative h-full min-h-[320px] bg-white border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center hover:border-green-400 hover:bg-green-50/30 transition-all duration-300"
                    >
                      <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-4xl mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-green-100 transition-all duration-300">
                        +
                      </div>
                      <h4 className="font-bold text-gray-400 group-hover:text-green-600 text-lg transition-colors">
                        Yeni Dost Ekle
                      </h4>
                    </button>
                  </div>
                </div>
              )}

              {/* --- ŞİFRE DEĞİŞTİRME --- */}
              {activeTab === "sifre" && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-lg animate-fade-in">
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Mevcut Şifre"
                      value={passData.current}
                      onChange={(e) =>
                        setPassData({ ...passData, current: e.target.value })
                      }
                      className="w-full p-3 bg-gray-50 rounded-xl font-bold"
                    />
                    <input
                      type="password"
                      placeholder="Yeni Şifre"
                      value={passData.new}
                      onChange={(e) =>
                        setPassData({ ...passData, new: e.target.value })
                      }
                      className="w-full p-3 bg-gray-50 rounded-xl font-bold"
                    />
                    <input
                      type="password"
                      placeholder="Yeni Şifre (Tekrar)"
                      value={passData.confirm}
                      onChange={(e) =>
                        setPassData({ ...passData, confirm: e.target.value })
                      }
                      className="w-full p-3 bg-gray-50 rounded-xl font-bold"
                    />
                    <button
                      onClick={handleChangePassword}
                      className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold"
                    >
                      Şifreyi Güncelle
                    </button>
                  </div>
                </div>
              )}

              {/* --- ADRESLER --- */}
              {activeTab === "adresler" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 gap-4">
                    {user?.addresses?.map((addr: any) => (
                      <div
                        key={addr.id}
                        className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm relative group"
                      >
                        <div className="font-bold text-gray-900 mb-1">
                          {addr.title}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {addr.fullAddress}
                        </p>
                        <div className="text-xs text-gray-400 mt-2">
                          {addr.district} / {addr.city}
                        </div>
                        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50 justify-end">
                          <button
                            onClick={() => openEditAddressModal(addr)}
                            className="text-gray-500 text-xs font-bold"
                          >
                            DÜZENLE
                          </button>
                          <button
                            onClick={() => requestDelete("address", addr.id)}
                            className="text-red-500 text-xs font-bold"
                          >
                            SİL
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setAddAddressOpen(true)}
                      className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-4 text-gray-400 font-bold min-h-[80px] hover:border-green-500 hover:text-green-600 transition"
                    >
                      + Yeni Adres Ekle
                    </button>
                  </div>
                </div>
              )}

              {/* --- KARTLAR --- */}
              {activeTab === "kartlar" && (
                <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center animate-fade-in">
                  <div className="text-4xl mb-4">💳</div>
                  <h3 className="font-bold text-gray-900">
                    Kayıtlı Kartın Yok
                  </h3>
                  <button className="mt-4 bg-gray-900 text-white px-6 py-2 rounded-xl font-bold text-sm">
                    Kart Ekle
                  </button>
                </div>
              )}

              {/* --- İLETİŞİM --- */}
              {activeTab === "iletisim" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">E-Posta ✉️</h3>
                    <a
                      href="mailto:destek@candostum.com"
                      className="text-green-600 font-bold"
                    >
                      destek@candostum.com
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- TÜM MODALLAR BURADA --- */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
        onLoginSuccess={() => router.push("/profile")}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
        initialData={null}
        onRegisterSuccess={() => router.push("/profile")}
      />
      <AddPetModal
        isOpen={isAddPetOpen}
        onClose={() => setAddPetOpen(false)}
        onSuccess={fetchProfile}
      />
      <EditPetModal
        isOpen={isEditPetOpen}
        onClose={() => setEditPetOpen(false)}
        onSuccess={fetchProfile}
        petData={selectedPet}
      />
      <AddAddressModal
        isOpen={isAddAddressOpen}
        onClose={() => setAddAddressOpen(false)}
        onSuccess={fetchProfile}
      />
      <EditAddressModal
        isOpen={isEditAddressOpen}
        onClose={() => setEditAddressOpen(false)}
        onSuccess={fetchProfile}
        addressData={selectedAddress}
      />

      {/* İptal Modalı */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative transform transition-all scale-100">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition"
            >
              ✕
            </button>
            <div className="text-center mb-6 pt-2">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border-4 border-white shadow-lg">
                💔
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Ayrılıyor muyuz?
              </h3>
              <p className="text-gray-500 mt-2 text-sm px-4">
                Aboneliğini iptal edersen, bir sonraki aydan itibaren kutu
                gönderimi durdurulacaktır.
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6 text-sm text-orange-800 flex gap-3 items-start text-left">
              <span className="text-xl">💰</span>
              <div>
                <strong className="block mb-1">Para İadesi Hakkında:</strong>
                Cayma hakkınız gereği, kullanmadığınız aylara ait tutar
                hesaplanarak 3-7 iş günü içinde kartınıza iade edilecektir.
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              >
                Vazgeçtim
              </button>
              <button
                onClick={handleCancelSubscription}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-red-200 transition transform hover:scale-105 active:scale-95"
              >
                Evet, İptal Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
