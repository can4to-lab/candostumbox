"use client";
import { useState } from "react";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Quiz bitince verileri Ana Sayfaya (ve oradan Register'a) taşıyacak fonksiyon
  onQuizComplete: (data: any) => void;
  // Seçilen paketin adı (Varsa)
  selectedProductName?: string;
  // 👇 YENİ: Fiyatı prop olarak alıyoruz (page.tsx'ten geliyor)
  selectedProductPrice?: number;
}

export default function QuizModal({ 
  isOpen, 
  onClose, 
  onQuizComplete, 
  selectedProductName,
  // 👇 Varsayılan değer ekledik (Veri gelmezse 1299 olsun)
  selectedProductPrice = 1299 
}: QuizModalProps) {
  
  const [step, setStep] = useState(1);
  
  // Quiz Verileri (v2.5 Uyumlu)
  const [quizData, setQuizData] = useState({
    petName: "",
    petType: "kopek",
    petBirthDate: "", // Net tarih
    petWeight: "",    // Net kilo
    petBreed: "",     // Irk
    petNeutered: "false"
  });

  // 👇 PAZARLAMA MATEMATİĞİ:
  // Gelen gerçek fiyatı %25 fazlasıymış gibi gösterip "Liste Fiyatı" yapacağız.
  const fakeListPrice = Math.round(selectedProductPrice * 1.25);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setQuizData({ ...quizData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // SONUÇ EKRANINDAN KAYIT EKRANINA GEÇİŞ
  const handleFinish = () => {
    // 1. Verileri üst bileşene (Home) gönder
    onQuizComplete(quizData);
    // 2. Modalı kapat (Home sayfası Register'ı açacak)
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4 backdrop-blur-md">
      {/* Arka planı tıklayınca kapatmasın, odaklansın diye boş div */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-white rounded-[2rem] w-full max-w-lg relative shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up border-4 border-green-400">
        
        {/* KAPAT BUTONU */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 w-10 h-10 rounded-full flex items-center justify-center transition font-bold text-xl">&times;</button>

        {/* --- ADIM 1: TANIŞMA --- */}
        {step === 1 && (
            <div className="p-8 text-center space-y-6">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-3xl font-black text-gray-900">Merhaba!</h2>
                <p className="text-gray-500 text-lg">Can dostun için en mükemmel kutuyu hazırlamak istiyoruz. Bize onu biraz anlatır mısın?</p>
                
                <div className="space-y-4 text-left">
                    <div>
                        <label className="font-bold text-gray-700 ml-1">Dostunun Adı</label>
                        <input type="text" name="petName" value={quizData.petName} onChange={handleChange} className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none text-lg font-bold" placeholder="Örn: Pamuk" />
                    </div>
                    
                    <div className="flex gap-4">
                        <label className={`flex-1 border-2 rounded-xl p-4 cursor-pointer text-center transition ${quizData.petType==='kopek' ? 'border-green-500 bg-green-50 text-green-700':'border-gray-200 hover:border-gray-300'}`}>
                            <input type="radio" name="petType" value="kopek" checked={quizData.petType==='kopek'} onChange={handleChange} className="hidden"/>
                            <div className="text-3xl">🐶</div>
                            <div className="font-bold">Köpek</div>
                        </label>
                        <label className={`flex-1 border-2 rounded-xl p-4 cursor-pointer text-center transition ${quizData.petType==='kedi' ? 'border-green-500 bg-green-50 text-green-700':'border-gray-200 hover:border-gray-300'}`}>
                            <input type="radio" name="petType" value="kedi" checked={quizData.petType==='kedi'} onChange={handleChange} className="hidden"/>
                            <div className="text-3xl">🐱</div>
                            <div className="font-bold">Kedi</div>
                        </label>
                    </div>
                </div>

                <button onClick={nextStep} disabled={!quizData.petName} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Başlayalım ➜
                </button>
            </div>
        )}

        {/* --- ADIM 2: DETAYLAR (v2.5 Veri Toplama) --- */}
        {step === 2 && (
            <div className="p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-gray-900">📝 {quizData.petName} Hakkında</h2>
                    <p className="text-gray-500 text-sm">Doğru ürünleri seçebilmemiz için önemli.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="font-bold text-gray-700 ml-1 text-sm">Irkı / Cinsi</label>
                        <input type="text" name="petBreed" value={quizData.petBreed} onChange={handleChange} className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none" placeholder="Örn: Golden Retriever, Tekir..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-bold text-gray-700 ml-1 text-sm">Doğum Tarihi</label>
                            <input type="date" name="petBirthDate" value={quizData.petBirthDate} onChange={handleChange} className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none text-gray-600" />
                        </div>
                        <div className="relative">
                            <label className="font-bold text-gray-700 ml-1 text-sm">Kilosu</label>
                            <input type="number" step="0.1" name="petWeight" value={quizData.petWeight} onChange={handleChange} className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none" placeholder="5.5" />
                            <span className="absolute right-4 top-[38px] font-bold text-gray-400 text-sm">kg</span>
                        </div>
                    </div>

                    <div>
                        <label className="font-bold text-gray-700 ml-1 text-sm">Kısırlaştırılmış mı?</label>
                        <select name="petNeutered" value={quizData.petNeutered} onChange={handleChange} className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none bg-white">
                            <option value="false">Hayır</option>
                            <option value="true">Evet</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button onClick={prevStep} className="px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">Geri</button>
                    <button onClick={nextStep} disabled={!quizData.petWeight || !quizData.petBirthDate} className="flex-1 bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition shadow-lg shadow-green-500/30">
                        Analiz Et ✨
                    </button>
                </div>
            </div>
        )}

        {/* --- ADIM 3: SONUÇ VE SATIŞ (HOOK) --- */}
        {step === 3 && (
            <div className="p-8 text-center bg-gradient-to-b from-green-50 to-white h-full flex flex-col justify-center items-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl shadow-xl mb-6 animate-bounce">
                    🎁
                </div>
                
                <h2 className="text-3xl font-black text-gray-900 mb-2">Harika Haber!</h2>
                <p className="text-gray-600 mb-8 max-w-xs mx-auto">
                    <span className="font-bold text-green-600">{quizData.petName}</span> için harika bilgiler aldık! Şimdi seçtiğin paketi tamamlayalım.
                </p>

                <div className="bg-white p-6 rounded-2xl border-2 border-green-100 shadow-lg w-full mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                    
                    {/* 👇 DİNAMİK PAKET İSMİ */}
                    <h3 className="text-xl font-bold text-gray-800">
                        {selectedProductName || "Sürpriz Mutluluk Paketi"} 🎁
                    </h3>
                    
                    <p className="text-sm text-gray-500 mt-1 mb-4">{quizData.petName} buna bayılacak!</p>

                    {/* 👇 FİYAT GÖSTERİMİ (DİNAMİK HALE GETİRİLDİ) */}
                    <div className="flex items-center justify-center gap-3 bg-green-50 py-3 rounded-xl border border-green-100">
                        <div className="flex flex-col items-end leading-tight">
                             {/* Sahte Liste Fiyatı */}
                             <span className="text-gray-400 line-through text-xs font-bold">₺{fakeListPrice}</span>
                             <span className="text-[10px] text-gray-500 font-medium">LİSTE FİYATI</span>
                        </div>
                        {/* Gerçek Veritabanı Fiyatı */}
                        <span className="text-3xl font-black text-green-600">₺{selectedProductPrice}</span>
                    </div>
                </div>

                <button 
                    onClick={handleFinish}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition shadow-xl transform hover:-translate-y-1"
                >
                    Devam Et ve Tamamla ➜
                </button>
                
                <button onClick={onClose} className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline">
                    Teşekkürler, ben sadece bakıyordum
                </button>
            </div>
        )}

      </div>
    </div>
  );
}