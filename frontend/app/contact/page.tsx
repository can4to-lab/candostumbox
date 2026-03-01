"use client";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend'deki mail gönderme rotamıza (API) verileri yolluyoruz
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/mail/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        throw new Error("Sunucu hatası");
      }

      toast.success("Mesajın bize ulaştı! En kısa sürede dönüş yapacağız. 🚀");
      setFormData({ name: "", email: "", subject: "", message: "" }); // Formu temizle
    } catch (error) {
      toast.error("Mesaj gönderilemedi. Lütfen daha sonra tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans">
      <Toaster position="top-right" />

      {/* --- HERO HEADER --- */}
      <div className="bg-gray-900 text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="text-green-400 font-bold tracking-widest uppercase text-xs mb-2 block animate-fade-in-up">
            Bize Ulaşın
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 animate-fade-in-up delay-100">
            Bir Mesaj <br /> Uzağındayız
          </h1>
          <p className="text-gray-400 text-lg animate-fade-in-up delay-200">
            Aklına takılan bir soru mu var? Ya da sadece dostunun fotoğrafını mı
            paylaşmak istiyorsun? Seni dinlemek için buradayız.
          </p>
        </div>
        {/* Dekoratif Arka Plan */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-500 opacity-10 blur-[80px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500 opacity-10 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* SOL TARAFI: İLETİŞİM BİLGİLERİ */}
          <div className="lg:col-span-4 space-y-6">
            {/* E-Posta Kartı */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-4">
                📧
              </div>
              <h3 className="font-bold text-gray-900 text-lg">E-Posta</h3>
              <p className="text-gray-500 text-sm mb-4">
                Genellikle 24 saat içinde yanıtlıyoruz.
              </p>
              <a
                href="mailto:destek@candostumbox.com"
                className="text-blue-600 font-bold hover:underline"
              >
                destek@candostumbox.com
              </a>
            </div>

            {/* Adres Kartı */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-3xl mb-4">
                📍
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Merkez Ofis</h3>
              <p className="text-gray-500 text-sm mb-4">
                Gelin bir kahvemizi için, dostunuzla tanışalım.
              </p>
              <p className="font-medium text-gray-800">
                16 Eylül Mah. 3042 Sokak <br /> No:24 Çeşme / İzmir
              </p>
            </div>

            {/* SSS Yönlendirme */}
            <div className="bg-green-600 p-8 rounded-3xl shadow-xl text-white text-center flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">🤔</div>
              <h3 className="font-bold text-xl mb-2">Hızlı Cevap mı Lazım?</h3>
              <p className="text-green-100 text-sm mb-6">
                Belki de sorunun cevabı Sıkça Sorulan Sorular sayfamızda
                hazırdır.
              </p>
              <Link
                href="/faq"
                className="inline-block bg-white text-green-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-green-50 transition"
              >
                S.S.S'e Git 👉
              </Link>
            </div>
          </div>

          {/* SAĞ TARAF: İLETİŞİM FORMU */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                ✍️ Bize Yazın
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                      Adınız Soyadınız
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50 transition font-bold text-gray-800"
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                      E-posta Adresiniz
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50 transition font-bold text-gray-800"
                      placeholder="ornek@mail.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    Konu
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50 transition font-bold text-gray-800"
                    placeholder="Örn: Kargo Durumu Hakkında"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    Mesajınız
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-50 transition font-medium text-gray-800 resize-none"
                    placeholder="Size nasıl yardımcı olabiliriz? Lütfen detayları buraya yazın..."
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-black transition shadow-xl shadow-gray-200 transform active:scale-95 flex items-center justify-center gap-3"
                  >
                    {loading ? "Gönderiliyor..." : "Mesajı Gönder 🚀"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
