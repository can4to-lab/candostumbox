"use client";
import { Fragment } from 'react';

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void; // İndirimi reddedip devam etme
  onAccept: () => void; // Üye ol butonuna basma
  savingsAmount?: number; // Ne kadar kazancı olacak? (Opsiyonel)
}

export default function UpsellModal({ isOpen, onClose, onAccept, savingsAmount = 150 }: UpsellModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Arka Plan Karartma */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal İçeriği */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-bounce-in">
        
        {/* Üst Dekorasyon */}
        <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-50"></div>
            <div className="relative z-10 text-6xl mb-2">🎁</div>
            <h3 className="relative z-10 text-2xl font-black text-white tracking-tight">
                Dur Yolcu! Fırsatı Kaçırma
            </h3>
        </div>

        <div className="p-8 text-center">
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Uzun dönem paket seçtin ama misafir olarak devam ediyorsun. <br/>
                Şimdi <strong>ÜCRETSİZ</strong> üye olursan, bu pakette anında indirim kazanacaksın!
            </p>

            {/* İndirim Tutarı Vurgusu */}
            <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-4 mb-8">
                <span className="block text-sm text-green-600 font-bold uppercase tracking-wider mb-1">Tahmini Kazancın</span>
                <span className="text-4xl font-black text-green-600 tracking-tighter">₺{savingsAmount}</span>
            </div>

            <div className="space-y-3">
                <button 
                    onClick={onAccept}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black hover:scale-105 transition transform shadow-xl shadow-green-200"
                >
                    🚀 Üye Ol & İndirimi Kap
                </button>
                
                <button 
                    onClick={onClose}
                    className="w-full py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition"
                >
                    İndirimi istemiyorum, devam et
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}