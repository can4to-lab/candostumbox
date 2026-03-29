"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

// --- ICONS ---
const PlusIcon = () => (
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
      d="M12 4v16m8-8H4"
    />
  </svg>
);
const TrashIcon = () => (
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
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const EditIcon = () => (
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
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);
const FolderIcon = () => (
  <svg
    className="w-6 h-6 text-indigo-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      toast.error("Kategoriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Bu kategoriyi silmek istediğinize emin misiniz? (İçindeki ürünlerin kategorisi boşaltılacaktır)",
      )
    )
      return;
    const token = localStorage.getItem("token");
    const loadingToast = toast.loading("Siliniyor...");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        toast.success("Kategori silindi", { id: loadingToast });
        setCategories(categories.filter((c) => c.id !== id));
      } else {
        toast.error("Silme başarısız", { id: loadingToast });
      }
    } catch (e) {
      toast.error("Hata oluştu", { id: loadingToast });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const loadingToast = toast.loading("Kaydediliyor...");

    try {
      let res;
      if (editingCategory) {
        res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories/${editingCategory.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
          },
        );
      } else {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      }

      if (res.ok) {
        const savedCategory = await res.json();
        toast.success(
          editingCategory ? "Kategori Güncellendi" : "Yeni Kategori Eklendi",
          { id: loadingToast },
        );

        if (editingCategory) {
          setCategories(
            categories.map((c) =>
              c.id === editingCategory.id ? savedCategory : c,
            ),
          );
        } else {
          setCategories([savedCategory, ...categories]);
        }
        closeModal();
      } else {
        toast.error("İşlem başarısız", { id: loadingToast });
      }
    } catch (e) {
      toast.error("Sunucu hatası", { id: loadingToast });
    }
  };

  const openModal = (category: any = null) => {
    setEditingCategory(category);
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
      });
    } else {
      setFormData({ name: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-8 font-sans">
      <Toaster position="top-right" />

      {/* TOOLBAR */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Kategori Yönetimi
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Perakende ürünlerinizi gruplandıracağınız kategorileri buradan
            yönetin.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <PlusIcon /> Yeni Kategori Eklle
        </button>
      </div>

      {/* KATEGORİ KARTLARI (GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                <FolderIcon />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => openModal(category)}
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
              {category.description || "Açıklama girilmemiş."}
            </p>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
            Henüz hiç kategori eklemediniz.
          </div>
        )}
      </div>

      {/* EDIT/CREATE MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900">
                {editingCategory ? "Kategori Düzenle" : "Yeni Kategori Ekle"}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 transition flex items-center justify-center font-bold text-gray-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  Kategori Adı *
                </label>
                <input
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-700"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Örn: Kedi Tasmaları"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 min-h-[100px]"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Bu kategori altında hangi ürünlerin yer aldığını kısaca açıklayın..."
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                  {editingCategory ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
