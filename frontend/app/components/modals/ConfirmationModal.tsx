"use client";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean; // Silme işlemiyse kırmızı, değilse mavi/siyah buton
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Evet, Onaylıyorum",
  cancelText = "Vazgeç",
  isDangerous = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      {/* Arka plan tıklama ile kapatma */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-sm w-full shadow-2xl transform scale-100 transition-all border-4 border-white relative z-10">
        
        {/* İkon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-5 shadow-sm ${
            isDangerous 
            ? 'bg-red-50 text-red-500 border-2 border-red-100' 
            : 'bg-blue-50 text-blue-500 border-2 border-blue-100'
        }`}>
          {isDangerous ? '🗑️' : 'ℹ️'}
        </div>

        {/* Metinler */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">{title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Butonlar */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className={`w-full py-4 font-bold rounded-xl transition shadow-lg text-white flex items-center justify-center gap-2 ${
                isDangerous 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                : 'bg-gray-900 hover:bg-black shadow-gray-200'
            }`}
          >
            <span>{confirmText}</span>
          </button>
          
          <button 
            onClick={onClose} 
            className="w-full py-3 bg-transparent text-gray-400 font-bold rounded-xl hover:text-gray-600 transition text-sm"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}