"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

// --- BİLEŞEN IMPORTLARI ---
import AddPetModal from "../components/modals/AddPetModal";
import EditPetModal from "../components/modals/EditPetModal";
import AddAddressModal from "../components/modals/AddAddressModal";
import EditAddressModal from "../components/modals/EditAddressModal";

// 👇 YENİ BİLEŞENİ BURADAN ÇAĞIRIYORUZ
import MySubscriptions from "../components/profile/MySubscriptions"; 

// Navbar ve Auth Modalları
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Navbar State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);

  // Profil Tab State
  const [activeTab, setActiveTab] = useState("bilgiler"); 

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
        setActiveTab(tab);
    }
  }, [searchParams]);

  // Profil Modalları
  const [isAddPetOpen, setAddPetOpen] = useState(false);
  const [isEditPetOpen, setEditPetOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  
  const [isAddAddressOpen, setAddAddressOpen] = useState(false);
  const [isEditAddressOpen, setEditAddressOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ 
      firstName: "", 
      lastName: "", 
      email: "", 
      phone: "",
      tcIdentity: "",
      birthDate: ""
  });

  const [passData, setPassData] = useState({ current: "", new: "", confirm: "" });

  // --- YARDIMCI FONKSİYON: YAŞ HESAPLAMA ---
  const calculateAge = (dateString: string) => {
      if(!dateString) return "Bilinmiyor";
      const today = new Date();
      const birthDate = new Date(dateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }
      return age;
  }

  // --- VERİ ÇEKME ---
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    
    try {
        const res = await fetch("http://localhost:3000/auth/profile", {
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
                firstName: fName, 
                lastName: lName, 
                email: data.email, 
                phone: data.phone || "",
                tcIdentity: data.tcKimlikNo || data.tcIdentity || "",
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
        const payload = {
            ...formData,
            userBirthDate: formData.birthDate,
            tcKimlikNo: formData.tcIdentity
        };

        const res = await fetch("http://localhost:3000/users/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            toast.success("Bilgilerin güncellendi! ✅", { id: toastId });
            fetchProfile();
        } else {
            const err = await res.json();
            toast.error(err.message || "Güncelleme başarısız.", { id: toastId });
        }
      } catch (error) { toast.error("Hata oluştu.", { id: toastId }); }
  };

  const handleDeleteAddress = async (id: number) => {
    if(!confirm("Bu adresi silmek istediğine emin misin?")) return;
    const token = localStorage.getItem("token");
    try {
        await fetch(`http://localhost:3000/users/addresses/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        toast.success("Adres silindi.");
        fetchProfile();
    } catch (e) { toast.error("Hata oluştu."); }
  };

  const handleDeletePet = async (id: number) => {
    if(!confirm("Dostunu silmek istediğine emin misin?")) return;
    const token = localStorage.getItem("token");
    try {
        await fetch(`http://localhost:3000/users/pets/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        toast.success("Can dostun silindi.");
        fetchProfile();
    } catch (e) { toast.error("Hata oluştu."); }
  };

  const openEditPetModal = (pet: any) => {
      setSelectedPet(pet);
      setEditPetOpen(true);
  };

  const handleLogout = () => {
      localStorage.removeItem("token");
      router.push("/");
  };

  const handleChangePassword = async () => {
      if (!passData.current || !passData.new || !passData.confirm) {
          toast.error("Lütfen tüm alanları doldurun.");
          return;
      }
      if (passData.new !== passData.confirm) {
          toast.error("Şifreler birbiriyle eşleşmiyor!");
          return;
      }
      if (passData.new.length < 6) {
          toast.error("Yeni şifre en az 6 karakter olmalı.");
          return;
      }

      const token = localStorage.getItem("token");
      const toastId = toast.loading("Şifre güncelleniyor...");
      
      try {
          const res = await fetch("http://localhost:3000/users/change-password", {
              method: "PATCH",
              headers: { 
                  "Content-Type": "application/json", 
                  "Authorization": `Bearer ${token}` 
              },
              body: JSON.stringify({ 
                  currentPassword: passData.current, 
                  newPassword: passData.new 
              })
          });

          const data = await res.json();

          if (res.ok) {
              toast.success("Şifreniz başarıyla değiştirildi! 🔒", { id: toastId });
              setPassData({ current: "", new: "", confirm: "" }); 
          } else {
              toast.error(data.message || "Şifre değiştirilemedi.", { id: toastId });
          }
      } catch (e) { 
          toast.error("Sunucu ile bağlantı kurulamadı.", { id: toastId }); 
      }
  };

  const openEditAddressModal = (addr: any) => {
    setSelectedAddress(addr);
    setEditAddressOpen(true);
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

      {/* --- ANA İÇERİK --- */}
      <div className="flex-grow pt-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Hesabım</h1>
                    <p className="text-gray-500 mt-1">Hoş geldin, <span className="font-semibold text-gray-800">{formData.firstName || user?.name}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* SOL SIDEBAR */}
                <div className="lg:col-span-3">
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
                    
                    {/* 1. ABONELİK (GÜNCELLENDİ: ARTIK COMPONENT KULLANIYOR) */}
                    {activeTab === "abonelik" && (
                        <MySubscriptions />
                    )}

                    {/* 2. SİPARİŞLERİM */}
                    {activeTab === "siparisler" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Siparişlerim</h2>
                            {user?.orders?.length > 0 ? (
                                user.orders.map((order: any) => (
                                    <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition overflow-hidden">
                                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sipariş Tarihi</span>
                                                <span className="font-bold text-gray-900">
                                                    {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                                                order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                                order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                order.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-100' :
                                                'bg-gray-50 text-gray-600 border-gray-100'
                                            }`}>
                                                {order.status === 'PENDING' ? 'Hazırlanıyor 📦' : order.status}
                                            </span>
                                        </div>

                                        <div className="space-y-4 mb-4">
                                            {order.items?.map((item: any) => (
                                                <div key={item.id} className="flex gap-4 items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                                                        {item.product?.image ? (
                                                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-lg leading-tight">{item.product?.name}</h4>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {item.quantity} Adet x <span className="font-medium text-gray-900">₺{item.product?.price}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-end bg-gray-50 -mx-6 -mb-6 p-4 px-6 border-t border-gray-100">
                                            <div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sipariş No</div>
                                                <div className="font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}...</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 font-medium">Toplam Tutar</div>
                                                <div className="text-xl font-black text-gray-900">₺{Number(order.totalPrice).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <div className="text-4xl mb-3">📦</div>
                                    <h3 className="font-bold text-gray-900">Henüz siparişin yok</h3>
                                    <p className="text-gray-400 text-sm">Dostun için ilk kutuyu hazırlamaya ne dersin?</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. KULLANICI BİLGİLERİ */}
                    {activeTab === "bilgiler" && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm max-w-3xl">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Kullanıcı Bilgilerim</h2>
                            <p className="text-gray-500 text-sm mb-8">Kişisel bilgilerinizi buradan güncelleyebilirsiniz.</p>
                            
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Ad</label>
                                        <input 
                                            type="text" 
                                            value={formData.firstName} 
                                            onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 font-bold focus:ring-2 focus:ring-green-500 outline-none transition" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Soyad</label>
                                        <input 
                                            type="text" 
                                            value={formData.lastName} 
                                            onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 font-bold focus:ring-2 focus:ring-green-500 outline-none transition" 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">E-posta Adresi</label>
                                    <input 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                        className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 font-bold focus:ring-2 focus:ring-green-500 outline-none transition" 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">TC Kimlik No</label>
                                        <input 
                                            type="text" 
                                            maxLength={11}
                                            value={formData.tcIdentity} 
                                            onChange={(e) => setFormData({...formData, tcIdentity: e.target.value})} 
                                            placeholder="11 Haneli TC"
                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 font-bold focus:ring-2 focus:ring-green-500 outline-none transition" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Doğum Tarihi</label>
                                        <input 
                                            type="date" 
                                            value={formData.birthDate} 
                                            onChange={(e) => setFormData({...formData, birthDate: e.target.value})} 
                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 font-bold focus:ring-2 focus:ring-green-500 outline-none transition" 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Telefon Numarası</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 font-bold text-sm">
                                            +90
                                        </span>
                                        <input 
                                            type="tel" 
                                            value={formData.phone} 
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                            placeholder="555 123 45 67"
                                            className="w-full p-3 bg-white border border-gray-200 rounded-r-lg text-gray-900 font-bold focus:ring-2 focus:ring-green-500 outline-none transition" 
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <button onClick={handleUpdateProfile} className="bg-gray-900 text-white px-10 py-3.5 rounded-xl font-bold hover:bg-black transition w-full md:w-auto shadow-lg shadow-gray-200 active:scale-95 transform duration-200">
                                        Kaydet
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. CAN DOSTLARIM */}
                    {activeTab === "pets" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Can Dostlarım</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user?.pets?.map((pet: any) => (
                                    <div key={pet.id} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex items-start gap-4 relative group hover:border-green-400 transition">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0 ${pet.type === 'kopek' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                                            {pet.type === 'kopek' ? '🐶' : '🐱'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg">{pet.name}</h4>
                                                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-2">{pet.breed || "Bilinmiyor"}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-400 w-16">YAŞ:</span>
                                                    <span className="font-medium">{calculateAge(pet.birthDate)} Yaşında</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-400 w-16">KİLO:</span>
                                                    <span className="font-medium">{pet.weight} kg</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-400 w-16">DURUM:</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pet.isNeutered ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                        {pet.isNeutered ? 'Kısırlaştırılmış' : 'Kısır Değil'}
                                                    </span>
                                                </div>
                                                {pet.allergies && pet.allergies.length > 0 && (
                                                    <div className="flex items-start gap-2 mt-2">
                                                        <span className="text-xs font-bold text-red-400 w-16">ALERJİ:</span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {pet.allergies.map((allergy: string, idx: number) => (
                                                                <span key={idx} className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded font-bold">{allergy}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                                                <button onClick={() => openEditPetModal(pet)} className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition">
                                                    ✏️ Düzenle
                                                </button>
                                                <button onClick={() => handleDeletePet(pet.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition">
                                                    🗑 Sil
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => setAddPetOpen(true)} className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-600 hover:bg-green-50/30 transition min-h-[220px]">
                                    <span className="text-2xl mb-1">+</span>
                                    <span className="text-sm font-bold">Yeni Dost Ekle</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 5. ŞİFRE DEĞİŞTİR */}
                    {activeTab === "sifre" && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm max-w-2xl">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Şifremi Değiştir</h2>
                            <div className="space-y-4">
                                <input 
                                    type="password" 
                                    placeholder="Mevcut Şifre" 
                                    value={passData.current}
                                    onChange={(e) => setPassData({...passData, current: e.target.value})}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-green-500 text-gray-900 font-bold" 
                                />
                                <input 
                                    type="password" 
                                    placeholder="Yeni Şifre" 
                                    value={passData.new}
                                    onChange={(e) => setPassData({...passData, new: e.target.value})}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-green-500 text-gray-900 font-bold" 
                                />
                                <input 
                                    type="password" 
                                    placeholder="Yeni Şifre (Tekrar)" 
                                    value={passData.confirm}
                                    onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-green-500 text-gray-900 font-bold" 
                                />
                                
                                <button 
                                    onClick={handleChangePassword} 
                                    className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-black transition w-full md:w-auto shadow-lg active:scale-95"
                                >
                                    Şifreyi Güncelle
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 6. ADRESLERİM */}
                    {activeTab === "adresler" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Adreslerim</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {user?.addresses?.map((addr: any) => (
                                    <div key={addr.id} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm relative group hover:border-green-400 transition flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-sm">{addr.title}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed mb-1">{addr.fullAddress}</p>
                                            <p className="text-xs text-gray-400">{addr.district} / {addr.city}</p>
                                        </div>

                                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
                                            <button 
                                                onClick={() => openEditAddressModal(addr)} 
                                                className="text-gray-500 text-sm font-bold hover:text-green-600 transition flex items-center gap-1"
                                            >
                                                ✏️ Düzenle
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteAddress(addr.id)} 
                                                className="text-gray-400 text-sm font-bold hover:text-red-500 transition flex items-center gap-1"
                                            >
                                                🗑 Sil
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => setAddAddressOpen(true)} className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-4 text-gray-400 hover:border-green-500 hover:text-green-600 hover:bg-green-50/30 transition text-sm font-bold min-h-[100px] flex items-center justify-center">
                                    + Yeni Adres Ekle
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 7. KAYITLI KARTLAR */}
                    {activeTab === "kartlar" && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">💳</div>
                            <h3 className="font-bold text-gray-900">Kayıtlı Kartın Yok</h3>
                            <p className="text-sm text-gray-500 mt-2 mb-6">Alışverişlerini hızlandırmak için kartını kaydedebilirsin.</p>
                            <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition">Yeni Kart Ekle</button>
                        </div>
                    )}

                    {/* 8. İLETİŞİM */}
                    {activeTab === "iletisim" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-2">Bize Yazın ✉️</h3>
                                <p className="text-sm text-gray-500 mb-4">Her türlü soru ve öneriniz için bize e-posta gönderebilirsiniz.</p>
                                <a href="mailto:destek@candostum.com" className="text-green-600 font-bold hover:underline">destek@candostum.com</a>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-2">WhatsApp Destek 💬</h3>
                                <p className="text-sm text-gray-500 mb-4">Hafta içi 09:00 - 18:00 saatleri arasında bize yazabilirsiniz.</p>
                                <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-200 transition">WhatsApp'a Git</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
      </div>

      {/* --- MODALLAR --- */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} onSwitchToRegister={() => { setLoginOpen(false); setRegisterOpen(true); }} onLoginSuccess={() => router.push('/profile')} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} onSwitchToLogin={() => { setRegisterOpen(false); setLoginOpen(true); }} initialData={null} onRegisterSuccess={() => router.push('/profile')} />
      <AddPetModal isOpen={isAddPetOpen} onClose={() => setAddPetOpen(false)} onSuccess={fetchProfile} />
      <EditPetModal isOpen={isEditPetOpen} onClose={() => setEditPetOpen(false)} onSuccess={fetchProfile} petData={selectedPet} /> 
      <AddAddressModal isOpen={isAddAddressOpen} onClose={() => setAddAddressOpen(false)} onSuccess={fetchProfile} />
      <EditAddressModal isOpen={isEditAddressOpen} onClose={() => setEditAddressOpen(false)} onSuccess={fetchProfile} addressData={selectedAddress} />
    </div>
  );
}