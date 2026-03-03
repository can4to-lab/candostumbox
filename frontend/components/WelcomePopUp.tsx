"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Animasyon için (Yoksa npm install framer-motion)
import toast from "react-hot-toast";

export default function WelcomePopUp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Daha önce görüp görmediğini kontrol et
    const hasSeen = localStorage.getItem("hasSeenWelcomePopUp");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500); // 1.5 saniye sonra açılsın
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenWelcomePopUp", "true");
  };

  const copyCode = () => {
    navigator.clipboard.writeText("HOSGELDIN10");
    toast.success("İndirim kodu kopyalandı! 🐾", {
      style: { borderRadius: "10px", background: "#333", color: "#fff" },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop (Arkaplan Karartma) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Kutusu */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* Kapatma Butonu */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition z-10"
            >
              ✕
            </button>

            <div className="flex flex-col">
              {/* Üst Kısım: Görsel (Emoji veya Varsa Fotoğraf) */}
              <div className="bg-green-500 py-12 flex justify-center items-center relative overflow-hidden">
                <span className="text-8xl animate-bounce">🎁</span>
                {/* Dekoratif Balonlar/Patiler */}
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-green-400 rounded-full opacity-50"></div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-600 rounded-full opacity-50"></div>
              </div>

              {/* Alt Kısım: İçerik */}
              <div className="p-8 md:p-12 text-center">
                <h2 className="text-3xl font-black text-gray-900 mb-4">
                  Ailemize Hoş Geldin! 🐾
                </h2>
                <p className="text-gray-600 leading-relaxed mb-8 font-medium">
                  Can Dostum Box ile her ay dostuna en sağlıklı
                  atıştırmalıkları, en eğlenceli oyuncakları ve sürpriz
                  aksesuarları ulaştırıyoruz. Dostun mutluysa, biz de mutluyuz!
                </p>

                {/* Kupon Alanı */}
                <div
                  className="bg-gray-50 border-2 border-dashed border-green-500 p-6 rounded-3xl relative group cursor-pointer transition hover:bg-green-50"
                  onClick={copyCode}
                >
                  <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">
                    İlk Kutuna Özel %10 İNDİRİM
                  </p>
                  <div className="text-3xl font-black text-gray-900 tracking-tighter flex items-center justify-center gap-2">
                    HOSGELDIN10
                    <span className="text-sm bg-black text-white px-2 py-1 rounded-lg font-bold group-hover:scale-110 transition">
                      KOPYALA
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="mt-8 w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-black transition shadow-xl transform active:scale-95"
                >
                  Hemen Keşfetmeye Başla 🚀
                </button>

                <p className="mt-4 text-xs text-gray-400 font-medium">
                  Sadece lansmana özel sınırlı sayıdaki kutuları kaçırma!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
