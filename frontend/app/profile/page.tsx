"use client";
import { useState, useEffect, Suspense } from "react"; 
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

// --- BİLEŞEN IMPORTLARI (Senin Yapın Korundu) ---
import AddPetModal from "../components/modals/AddPetModal";
import EditPetModal from "../components/modals/EditPetModal";
import AddAddressModal from "../components/modals/AddAddressModal";
import EditAddressModal from "../components/modals/EditAddressModal";
import ConfirmationModal from "../components/modals/ConfirmationModal"; // 👈 YENİ EKLENDİ

import MySubscriptions from "../components/profile/MySubscriptions"; 

import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";

const OTHER_ICONS: Record<string, string> = {
    'Kuş': '🦜', 'Hamster': '🐹', 'Tavşan': '🐰', 'Balık': '🐟'
};

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Navbar State
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);

  // Profil Tab State
  const [activeTab, setActiveTab] = useState("bilgiler"); 

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  // Profil Modalları
  const [isAddPetOpen, setAddPetOpen] = useState(false);
  const [isEditPetOpen, setEditPetOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  
  const [isAddAddressOpen, setAddAddressOpen] = useState(false);
  const [isEditAddressOpen, setEditAddressOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // 👇 YENİ: SİLME ONAY MODALI STATE'LERİ
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{ type: 'address' | 'pet', id: number } | null>(null);

  // Form State
  const [formData, setFormData] = useState({ 
      firstName: "", lastName: "", email: "", phone: "", tcIdentity: "", birthDate: ""
  });

  const [passData, setPassData] = useState({ current: "", new: "", confirm: "" });

  const calculateAge = (dateString: string) => {
      if(!dateString) return "Bilinmiyor";
      const today = new Date();
      const birthDate = new Date(dateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age;
  }

  const getPetIcon = (type: string) => {
    if (type === 'kopek') return '🐶';
    if (type === 'kedi') return '🐱';
    return OTHER_ICONS[type] || '🐾';
  };

  const getPetBg = (type: string) => {
    if (type === 'kopek') return 'bg-orange-100 text-orange-600';
    if (type === 'kedi') return 'bg-blue-100 text-blue-600';
    return 'bg-green-100 text-green-600';
  };

  // --- VERİ ÇEKME ---
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    
    try {
        const res = await fetch("https://candostumbox-api.onrender.com/auth/profile", {
            headers: { Authorization: `Bearer ${token}` }
        });
        if(res.ok) {
            const data = await res.json();
            setUser(data);
            
            const rawDate = data.userBirthDate || data.birthDate;
            const formattedDate = rawDate ? new Date(rawDate).toISOString().split('T')[0] : "";

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
                firstName: fName, lastName: lName, email: data.email, 
                phone: data.phone || "", tcIdentity: data.tcKimlikNo || data.tcIdentity || "",
                birthDate: formattedDate
            });
        }
    } catch(e) { console.log(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  // --- İŞLEMLER ---
  const handleUpdateProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const toastId = toast.loading("Güncelleniyor...");
      try {
        let formattedDate = null;
        if (formData.birthDate) formattedDate = new Date(formData.birthDate).toISOString();

        const payload = {
            ...formData, userBirthDate: formattedDate, tcKimlikNo: formData.tcIdentity
        };

        const res = await fetch("https://candostumbox-api.onrender.com/users/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();

        if (res.ok) {
            toast.success("Bilgilerin güncellendi! ✅", { id: toastId });
            fetchProfile();
        } else {
             const errorMessage = data.message || "Güncelleme başarısız.";
             toast.error(errorMessage, { id: toastId });
        }
      } catch (error) { toast.error("Sunucu hatası.", { id: toastId }); }
  };

  // 👇 YENİ SİLME MANTIĞI (CONFIRM MODAL İÇİN)
  const requestDelete = (type: 'address' | 'pet', id: number) => {
      setConfirmData({ type, id });
      setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if(!confirmData) return;
    const token = localStorage.getItem("token");
    const { type, id } = confirmData;
    const url = type === 'address' 
        ? `https://candostumbox-api.onrender.com/users/addresses/${id}`
        : `https://candostumbox-api.onrender.com/users/pets/${id}`; // veya /pets/${id} backend yapına göre

    try {
        const res = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        if(res.ok) {
            toast.success(type === 'address' ? "Adres silindi." : "Dostun silindi.");
            fetchProfile();
        } else {
            toast.error("Silinemedi.");
        }
    } catch (e) { toast.error("Hata oluştu."); }
  };

  const openEditPetModal = (pet: any) => { setSelectedPet(pet); setEditPetOpen(true); };
  const openEditAddressModal = (addr: any) => { setSelectedAddress(addr); setEditAddressOpen(true); };

  const handleLogout = () => {
      localStorage.removeItem("token");
      router.push("/");
  };

  const handleChangePassword = async () => {
      if (!passData.current || !passData.new || !passData.confirm) return toast.error("Alanları doldurun.");
      if (passData.new !== passData.confirm) return toast.error("Şifreler eşleşmiyor!");
      
      const token = localStorage.getItem("token");
      const toastId = toast.loading("Şifre güncelleniyor...");
      try {
          const res = await fetch("https://candostumbox-api.onrender.com/users/change-password", {
              method: "PATCH",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify({ currentPassword: passData.current, newPassword: passData.new })
          });
          const data = await res.json();
          if (res.ok) {
              toast.success("Şifreniz değiştirildi! 🔒", { id: toastId });
              setPassData({ current: "", new: "", confirm: "" }); 
          } else {
              toast.error(data.message || "Hata oluştu.", { id: toastId });
          }
      } catch (e) { toast.error("Bağlantı hatası.", { id: toastId }); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div></div>;

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

      {/* --- SİLME ONAY MODALI (YENİ) --- */}
      <ConfirmationModal 
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Silmek İstediğine Emin misin?"
        message={confirmData?.type === 'address' ? "Bu adresi silersen siparişlerinde kullanamazsın." : "Bu dostunu profilinden kaldırmak üzeresin."}
        isDangerous={true}
        confirmText="Evet, Sil"
      />

      <div className="flex-grow pt-24 pb-20"> {/* Header payı artırıldı */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Hesabım</h1>
                    <p className="text-gray-500 mt-1">Hoş geldin, <span className="font-semibold text-gray-800">{formData.firstName || user?.name}</span></p>
                </div>
            </div>

            {/* --- MOBİL MENÜ (Üstte kaydırmalı) --- */}
            <div className="lg:hidden mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex gap-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold border transition
                                ${activeTab === item.id 
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
                                    ${activeTab === item.id 
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
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                <span className="text-lg">🚪</span> Çıkış Yap
                            </button>
                        </div>
                    </nav>
                </div>

                {/* SAĞ İÇERİK */}
                <div className="lg:col-span-9">
                    
                    {activeTab === "abonelik" && <MySubscriptions />}

                    {activeTab === "siparisler" && (
                        <div className="space-y-6 animate-fade-in">
                             {/* ... Sipariş Listesi (Aynı kaldı) ... */}
                             {user?.orders?.length > 0 ? (
                                user.orders.map((order: any) => (
                                    <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                        {/* Özet ve İçerik */}
                                        <div className="flex flex-col md:flex-row justify-between mb-4 border-b border-gray-50 pb-4">
                                            <span className="font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
                                            <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 font-bold">{order.status}</span>
                                        </div>
                                        {order.items?.map((item: any) => (
                                            <div key={item.id} className="flex gap-4 mb-2">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">📦</div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{item.product?.name}</div>
                                                    <div className="text-sm text-gray-500">{item.quantity} Adet</div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="mt-4 pt-4 border-t border-gray-100 text-right">
                                            <span className="text-xl font-black text-gray-900">₺{Number(order.totalPrice).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-2xl">Henüz siparişin yok.</div>
                            )}
                        </div>
                    )}

                    {activeTab === "bilgiler" && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm animate-fade-in">
                             {/* Form Alanları (Mobil Uyumlu) */}
                             <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">Ad</label><input value={formData.firstName} onChange={e=>setFormData({...formData, firstName: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900" /></div>
                                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">Soyad</label><input value={formData.lastName} onChange={e=>setFormData({...formData, lastName: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900" /></div>
                                </div>
                                <div><label className="text-xs font-bold text-gray-500 mb-1 block">E-Posta</label><input value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900" /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">TC No</label><input value={formData.tcIdentity} onChange={e=>setFormData({...formData, tcIdentity: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900" /></div>
                                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">Doğum Tarihi</label><input type="date" value={formData.birthDate} onChange={e=>setFormData({...formData, birthDate: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900" /></div>
                                </div>
                                <div><label className="text-xs font-bold text-gray-500 mb-1 block">Telefon</label><input value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-900" /></div>
                                <button onClick={handleUpdateProfile} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold">Kaydet</button>
                             </div>
                        </div>
                    )}

                    {activeTab === "pets" && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user?.pets?.map((pet: any) => (
                                    <div key={pet.id} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm relative">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-4 ${getPetBg(pet.type)}`}>{getPetIcon(pet.type)}</div>
                                        <h4 className="font-bold text-gray-900 text-lg">{pet.name}</h4>
                                        <p className="text-sm text-gray-500">{pet.breed || "Bilinmiyor"} • {pet.weight} kg</p>
                                        
                                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                                            <button onClick={() => openEditPetModal(pet)} className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-lg text-xs font-bold">Düzenle</button>
                                            {/* 👇 GÜNCELLEME: requestDelete kullanıldı */}
                                            <button onClick={() => requestDelete('pet', pet.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold">Sil</button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => setAddPetOpen(true)} className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-600 transition min-h-[220px]">
                                    <span className="text-4xl mb-2">+</span>
                                    <span className="font-bold">Yeni Dost Ekle</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "sifre" && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-lg animate-fade-in">
                            {/* Şifre Alanları */}
                            <div className="space-y-4">
                                <input type="password" placeholder="Mevcut Şifre" value={passData.current} onChange={e=>setPassData({...passData, current: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl font-bold" />
                                <input type="password" placeholder="Yeni Şifre" value={passData.new} onChange={e=>setPassData({...passData, new: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl font-bold" />
                                <input type="password" placeholder="Yeni Şifre (Tekrar)" value={passData.confirm} onChange={e=>setPassData({...passData, confirm: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl font-bold" />
                                <button onClick={handleChangePassword} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">Şifreyi Güncelle</button>
                            </div>
                        </div>
                    )}

                    {activeTab === "adresler" && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 gap-4">
                                {user?.addresses?.map((addr: any) => (
                                    <div key={addr.id} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm relative group">
                                        <div className="font-bold text-gray-900 mb-1">{addr.title}</div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{addr.fullAddress}</p>
                                        <div className="text-xs text-gray-400 mt-2">{addr.district} / {addr.city}</div>
                                        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50 justify-end">
                                            <button onClick={() => openEditAddressModal(addr)} className="text-gray-500 text-xs font-bold">DÜZENLE</button>
                                            {/* 👇 GÜNCELLEME: requestDelete kullanıldı */}
                                            <button onClick={() => requestDelete('address', addr.id)} className="text-red-500 text-xs font-bold">SİL</button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => setAddAddressOpen(true)} className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-4 text-gray-400 font-bold min-h-[80px] hover:border-green-500 hover:text-green-600 transition">
                                    + Yeni Adres Ekle
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "kartlar" && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center animate-fade-in">
                            <div className="text-4xl mb-4">💳</div>
                            <h3 className="font-bold text-gray-900">Kayıtlı Kartın Yok</h3>
                            <button className="mt-4 bg-gray-900 text-white px-6 py-2 rounded-xl font-bold text-sm">Kart Ekle</button>
                        </div>
                    )}

                    {activeTab === "iletisim" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-2">E-Posta ✉️</h3>
                                <a href="mailto:destek@candostum.com" className="text-green-600 font-bold">destek@candostum.com</a>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} onSwitchToRegister={() => { setLoginOpen(false); setRegisterOpen(true); }} onLoginSuccess={() => router.push('/profile')} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} onSwitchToLogin={() => { setRegisterOpen(false); setLoginOpen(true); }} initialData={null} onRegisterSuccess={() => router.push('/profile')} />
      <AddPetModal isOpen={isAddPetOpen} onClose={() => setAddPetOpen(false)} onSuccess={fetchProfile} />
      <EditPetModal isOpen={isEditPetOpen} onClose={() => setEditPetOpen(false)} onSuccess={fetchProfile} petData={selectedPet} /> 
      <AddAddressModal isOpen={isAddAddressOpen} onClose={() => setAddAddressOpen(false)} onSuccess={fetchProfile} />
      <EditAddressModal isOpen={isEditAddressOpen} onClose={() => setEditAddressOpen(false)} onSuccess={fetchProfile} addressData={selectedAddress} />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div></div>}>
      <ProfileContent />
    </Suspense>
  );
}