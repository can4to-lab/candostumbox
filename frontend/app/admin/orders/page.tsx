"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

// --- ICONS ---
const PrinterIcon = () => (
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
      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
    />
  </svg>
);
const TruckIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
    />
  </svg>
);
const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
const EyeIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);
const XCircleIcon = () => (
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
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const CheckCircleIcon = () => (
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
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://candostumbox-api.onrender.com/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        toast.error("Yetkilendirme hatası veya sunucu sorunu.");
      }
    } catch (error) {
      toast.error("Sipariş verileri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. SHIP ORDER (INTEGRATION) ---
  const handleShipOrder = async (orderId: string) => {
    setProcessingId(orderId);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `https://candostumbox-api.onrender.com/orders/${orderId}/ship`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ provider: "Basit Kargo" }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        toast.success(`✅ Sipariş Kargolandı!\nKod: ${data.trackingCode}`);

        const updatedOrders = orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: "SHIPPED",
                cargoTrackingCode: data.trackingCode,
                cargoProvider: data.provider,
                shippedAt: new Date().toISOString(),
              }
            : o,
        );
        setOrders(updatedOrders);

        if (selectedOrder?.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            status: "SHIPPED",
            cargoTrackingCode: data.trackingCode,
            cargoProvider: data.provider,
            shippedAt: new Date().toISOString(),
          });
        }
      } else {
        toast.error(data.message || "Kargo işlemi başarısız.");
      }
    } catch (e) {
      toast.error("Sunucu bağlantı hatası.");
    } finally {
      setProcessingId(null);
    }
  };

  // --- 3. STATUS UPDATE (CANCEL / DELIVER) ---
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (
      !confirm(
        `Siparişi '${newStatus}' olarak güncellemek istediğinize emin misiniz?`,
      )
    )
      return;

    const token = localStorage.getItem("token");
    const loadingToast = toast.loading("Durum güncelleniyor...");

    try {
      const res = await fetch(
        `https://candostumbox-api.onrender.com/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (res.ok) {
        toast.success("Durum güncellendi!", { id: loadingToast });

        // Listeyi güncelle
        const updatedOrders = orders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o,
        );
        setOrders(updatedOrders);

        // Modalı güncelle
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        toast.error("Güncelleme başarısız.", { id: loadingToast });
      }
    } catch (e) {
      toast.error("Sunucu hatası.", { id: loadingToast });
    }
  };

  // --- 4. PRINT LABEL ---
  const handlePrintLabel = (order: any) => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    const customerName = getCustomerName(order);
    const address = order.shippingAddressSnapshot;
    const date = new Date().toLocaleDateString("tr-TR");

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Kargo Etiketi - ${order.id}</title>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; border: 4px solid #333; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
              .logo { font-size: 32px; font-weight: 900; letter-spacing: -1px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 30px; }
              .box { flex: 1; }
              .label { font-size: 10px; color: #666; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
              .value { font-size: 16px; font-weight: bold; line-height: 1.4; }
              .barcode-box { text-align: center; border: 2px dashed #ccc; padding: 20px; margin: 20px 0; background: #f9f9f9; }
              .tracking-code { font-family: 'Courier New', monospace; font-size: 24px; font-weight: 900; letter-spacing: 2px; }
              .footer { font-size: 10px; text-align: center; margin-top: 40px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
              ul { padding-left: 15px; margin: 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">CAN DOSTUM BOX 📦</div>
              <div style="margin-top:5px; font-size: 14px; color: #666;">Mutluluk Taşıyoruz</div>
            </div>
            
            <div class="row">
              <div class="box">
                <div class="label">ALICI (CUSTOMER)</div>
                <div class="value">
                  ${customerName}<br>
                  ${order.user?.phone || "Tel: Belirtilmemiş"}
                </div>
              </div>
              <div class="box" style="text-align: right;">
                <div class="label">TARİH (DATE)</div>
                <div class="value">${date}</div>
              </div>
            </div>

            <div class="row">
              <div class="box">
                <div class="label">TESLİMAT ADRESİ</div>
                <div class="value">
                  ${address?.fullAddress || address?.address}<br>
                  ${address?.district ? address.district + " / " : ""} ${
                    address?.city
                  }<br>
                  <strong>Türkiye</strong>
                </div>
              </div>
            </div>

            <div class="barcode-box">
              <div class="label">KARGO TAKİP NO</div>
              <div class="tracking-code">${
                order.cargoTrackingCode || "MOCK-123456"
              }</div>
              <div style="margin-top: 5px; font-size: 12px; font-weight: bold; color: #555;">${
                order.cargoProvider
              }</div>
            </div>

            <div class="row">
               <div class="box">
                  <div class="label">İÇERİK</div>
                  <div class="value" style="font-size: 12px;">
                    <ul>
                      ${order.items
                        .map(
                          (i: any) =>
                            `<li>${i.productNameSnapshot} (x${i.quantity}) ${
                              i.pet ? "- 🐾 " + i.pet.name : ""
                            }</li>`,
                        )
                        .join("")}
                    </ul>
                  </div>
               </div>
            </div>
            
            <div class="footer">Sipariş ID: #${order.id}</div>
            <script>window.print();</script>
          </body>
        </html>
      `);
    printWindow.document.close();
  };

  const getCustomerName = (order: any) => {
    if (order.user?.firstName)
      return `${order.user.firstName} ${order.user.lastName}`;
    if (order.user?.name) return order.user.name;
    const snap = order.shippingAddressSnapshot;
    if (snap?.contactName) return snap.contactName;
    if (snap?.name) return snap.name;
    if (snap?.firstName) return `${snap.firstName} ${snap.lastName}`;
    return "Misafir Müşteri";
  };

  // --- FILTER ---
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "ALL" || order.status === filterStatus;
    const customerName = getCustomerName(order).toLowerCase();
    const orderId = order.id.toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      orderId.includes(search) || customerName.includes(search);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    totalRevenue: orders.reduce((acc, o) => acc + Number(o.totalPrice), 0),
    pendingCount: orders.filter(
      (o) => o.status === "PAID" || o.status === "PREPARING",
    ).length,
    shippedCount: orders.filter((o) => o.status === "SHIPPED").length,
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">Siparişler Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // --- HELPER: GET PET ICON ---
  const getPetIcon = (type: string) => {
    if (!type) return "🐾";
    const t = type.toLowerCase();
    if (t.includes("kopek") || t.includes("köpek")) return "🐶";
    if (t.includes("kedi")) return "🐱";
    if (t.includes("kus") || t.includes("kuş")) return "🦜";
    if (t.includes("balik") || t.includes("balık")) return "🐟";
    return "🐾";
  };

  // --- HELPER: CALCULATE AGE ---
  const getAge = (birthDate: string) => {
    if (!birthDate) return "Bilinmiyor";
    const birth = new Date(birthDate);
    const now = new Date();
    let months =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth());
    if (months < 12) return `${months} Aylık`;
    const years = Math.floor(months / 12);
    return `${years} Yaşında`;
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-8 font-sans">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/60 relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl">
            💰
          </div>
          <div className="text-gray-400 text-xs font-bold uppercase mb-2 tracking-wider">
            Toplam Ciro
          </div>
          <div className="text-3xl font-black text-gray-900">
            ₺
            {stats.totalRevenue.toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/60 relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl">
            📦
          </div>
          <div className="text-orange-400 text-xs font-bold uppercase mb-2 tracking-wider">
            Bekleyen / Hazırlanan
          </div>
          <div className="text-3xl font-black text-orange-600">
            {stats.pendingCount}{" "}
            <span className="text-sm font-medium text-gray-400">Sipariş</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/60 relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl">
            🚚
          </div>
          <div className="text-blue-400 text-xs font-bold uppercase mb-2 tracking-wider">
            Kargolanan
          </div>
          <div className="text-3xl font-black text-blue-600">
            {stats.shippedCount}{" "}
            <span className="text-sm font-medium text-gray-400">Sipariş</span>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <SearchIcon />
          </div>
          <input
            placeholder="Sipariş No, Müşteri Adı Ara..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {[
            "ALL",
            "PAID",
            "PREPARING",
            "SHIPPED",
            "DELIVERED",
            "COMPLETED",
            "CANCELLED",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition whitespace-nowrap ${
                filterStatus === status
                  ? "bg-gray-900 text-white border-gray-900 shadow-md transform scale-105"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {status === "ALL" ? "Tümü" : status}
            </button>
          ))}
        </div>
      </div>

      {/* ORDER TABLE */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-6">Sipariş Detayı</th>
                <th className="p-6">Müşteri</th>
                <th className="p-6">Durum</th>
                <th className="p-6">Tutar</th>
                <th className="p-6 text-right">Yönet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    Aradığınız kriterlere uygun sipariş bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const name = getCustomerName(order);
                  const isPaid =
                    order.status === "PAID" || order.status === "PREPARING";
                  const isShipped = order.status === "SHIPPED";
                  const isCompleted =
                    order.status === "COMPLETED" ||
                    order.status === "DELIVERED";
                  const isCancelled = order.status === "CANCELLED";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/80 transition group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                            📦
                          </div>
                          <div>
                            <div className="font-mono text-xs text-gray-400 font-bold">
                              #{order.id.slice(0, 8)}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString(
                                "tr-TR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-gray-900 text-sm">
                          {name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {order.shippingAddressSnapshot?.city || "Şehir Yok"} /{" "}
                          {order.shippingAddressSnapshot?.district || "-"}
                        </div>
                      </td>
                      <td className="p-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                            isPaid
                              ? "bg-orange-50 text-orange-600 border-orange-100"
                              : isShipped
                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                : isCompleted
                                  ? "bg-green-50 text-green-600 border-green-100"
                                  : isCancelled
                                    ? "bg-red-50 text-red-600 border-red-100"
                                    : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPaid
                                ? "bg-orange-500"
                                : isShipped
                                  ? "bg-blue-500"
                                  : isCompleted
                                    ? "bg-green-500"
                                    : isCancelled
                                      ? "bg-red-500"
                                      : "bg-gray-400"
                            }`}
                          ></span>
                          {order.status === "PAID"
                            ? "Hazırlanıyor"
                            : order.status === "PREPARING"
                              ? "Hazırlanıyor"
                              : order.status === "CANCELLED"
                                ? "İptal Edildi"
                                : order.status}
                        </span>
                      </td>
                      <td className="p-6 font-bold text-gray-900 text-sm">
                        ₺{Number(order.totalPrice).toFixed(2)}
                      </td>
                      <td className="p-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="bg-white border border-gray-200 text-gray-600 hover:text-green-600 hover:border-green-200 p-2 rounded-lg transition shadow-sm"
                        >
                          <EyeIcon />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl">
                  🧾
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    Sipariş Yönetimi
                  </h2>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    ID: {selectedOrder.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-red-50 hover:text-red-500 transition flex items-center justify-center text-lg font-bold text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: INFO & CARGO */}
                <div className="lg:col-span-7 space-y-6">
                  {/* 1. Customer Info */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">
                      Müşteri & Teslimat
                    </h4>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
                        {getCustomerName(selectedOrder).charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {getCustomerName(selectedOrder)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {selectedOrder.shippingAddressSnapshot?.fullAddress ||
                            selectedOrder.shippingAddressSnapshot?.address}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-bold">
                            {selectedOrder.shippingAddressSnapshot?.district}
                          </span>
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-bold">
                            {selectedOrder.shippingAddressSnapshot?.city}
                          </span>
                        </div>
                        {selectedOrder.user?.phone && (
                          <p className="text-xs text-gray-400 mt-2 font-mono">
                            📞 {selectedOrder.user.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Cargo Management */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider flex items-center gap-2 relative z-10">
                      <TruckIcon /> Kargo Entegrasyonu
                    </h4>

                    {selectedOrder.status === "CANCELLED" ? (
                      <div className="text-center py-6 relative z-10 bg-red-50 rounded-2xl border border-red-100">
                        <div className="text-4xl mb-2">🚫</div>
                        <p className="font-bold text-red-700">
                          Bu Sipariş İptal Edildi
                        </p>
                        <p className="text-xs text-red-500 mt-1">
                          Kargo işlemleri yapılamaz.
                        </p>
                      </div>
                    ) : selectedOrder.cargoTrackingCode ? (
                      <div className="relative z-10">
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center mb-4">
                          <div className="text-xs text-green-600 font-bold uppercase mb-1">
                            Kargo Takip Kodu
                          </div>
                          <div className="text-2xl font-mono font-black text-green-700 tracking-widest">
                            {selectedOrder.cargoTrackingCode}
                          </div>
                          <div className="text-xs font-bold text-green-600 mt-1 opacity-75">
                            {selectedOrder.cargoProvider}
                          </div>
                          <div className="text-[10px] text-green-800 mt-2">
                            Kargolandı:{" "}
                            {new Date(selectedOrder.shippedAt).toLocaleString(
                              "tr-TR",
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handlePrintLabel(selectedOrder)}
                          className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition shadow-lg flex items-center justify-center gap-2"
                        >
                          <PrinterIcon /> Kargo Etiketini Yazdır
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-6 relative z-10">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl grayscale opacity-50">
                          🚚
                        </div>
                        <p className="text-sm font-bold text-gray-900 mb-1">
                          Sipariş Henüz Kargolanmadı
                        </p>
                        <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">
                          "Kargoya Ver" butonuna tıkladığınızda Basit Kargo
                          entegrasyonu çalışır ve otomatik barkod üretilir.
                        </p>
                        <button
                          onClick={() => handleShipOrder(selectedOrder.id)}
                          disabled={processingId === selectedOrder.id}
                          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {processingId === selectedOrder.id ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                              İşleniyor...
                            </>
                          ) : (
                            <>📦 Entegrasyon ile Kargola</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: ITEMS, SUMMARY & ACTIONS */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">
                      Sipariş İçeriği & Pet Bilgileri
                    </h4>

                    <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                      {selectedOrder.items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition"
                        >
                          <div className="flex gap-4">
                            <div className="w-14 h-14 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                              🎁
                            </div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-gray-900 text-base">
                                  {item.productNameSnapshot}
                                </h4>
                                {/* 👇 YENİ EKLENDİ: Eğer paket 1 aydan fazlaysa Mor renkli şık bir etiket basar */}
                                {item.duration > 1 && (
                                  <span className="inline-block mt-1 bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                    {item.duration} Aylık Paket
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-gray-900">
                                ₺{Number(item.priceAtPurchase).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* EKSİKSİZ PET BİLGİSİ - YENİ EKLENEN KISIM */}
                          {item.pet && (
                            <div className="mt-4 bg-white border border-gray-100 rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-50">
                                <span className="text-xl">
                                  {getPetIcon(item.pet.type)}
                                </span>
                                <span className="font-black text-gray-900 text-sm">
                                  {item.pet.name}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase bg-gray-50 px-2 py-0.5 rounded ml-auto">
                                  {item.pet.type}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-gray-50 p-2 rounded-lg">
                                  <div className="text-gray-400 font-bold text-[9px] uppercase">
                                    Irk (Breed)
                                  </div>
                                  <div className="font-bold text-gray-700">
                                    {item.pet.breed || "-"}
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg">
                                  <div className="text-gray-400 font-bold text-[9px] uppercase">
                                    Kilo
                                  </div>
                                  <div className="font-bold text-gray-700">
                                    {item.pet.weight
                                      ? item.pet.weight + " kg"
                                      : "-"}
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg">
                                  <div className="text-gray-400 font-bold text-[9px] uppercase">
                                    Yaş/Doğum
                                  </div>
                                  <div className="font-bold text-gray-700">
                                    {getAge(item.pet.birthDate)}
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2">
                                  {item.pet.isNeutered ? (
                                    <CheckCircleIcon />
                                  ) : (
                                    <XCircleIcon />
                                  )}
                                  <div>
                                    <div className="text-gray-400 font-bold text-[9px] uppercase">
                                      Kısır mı?
                                    </div>
                                    <div
                                      className={`font-bold ${
                                        item.pet.isNeutered
                                          ? "text-green-600"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {item.pet.isNeutered ? "Evet" : "Hayır"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {item.pet.allergies &&
                                item.pet.allergies.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-50">
                                    <div className="text-gray-400 font-bold text-[9px] uppercase mb-1">
                                      Alerjiler
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {item.pet.allergies.map(
                                        (allergy: string, i: number) => (
                                          <span
                                            key={i}
                                            className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold border border-red-100"
                                          >
                                            {allergy}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* SUMMARY */}
                    <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-500 font-medium">
                          Ara Toplam
                        </span>
                        <span className="font-bold text-gray-900">
                          ₺{Number(selectedOrder.totalPrice).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-4">
                        <span className="text-green-600 font-medium">
                          Kargo
                        </span>
                        <span className="font-bold text-green-600">Bedava</span>
                      </div>
                      <div className="bg-gray-900 text-white p-5 rounded-2xl flex justify-between items-center">
                        <span className="text-gray-400 text-xs font-bold uppercase">
                          Genel Toplam
                        </span>
                        <span className="text-2xl font-black">
                          ₺{Number(selectedOrder.totalPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* YENİ EKLENEN İPTAL VE DURUM YÖNETİMİ BUTONLARI */}
                    {selectedOrder.status !== "CANCELLED" && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">
                          Sipariş Durumu Yönetimi
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() =>
                              handleStatusUpdate(selectedOrder.id, "DELIVERED")
                            }
                            className="bg-green-50 text-green-700 py-3 rounded-xl font-bold hover:bg-green-100 transition border border-green-100 text-xs"
                          >
                            ✅ Teslim Edildi
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(selectedOrder.id, "CANCELLED")
                            }
                            className="bg-red-50 text-red-700 py-3 rounded-xl font-bold hover:bg-red-100 transition border border-red-100 text-xs"
                          >
                            🚫 Siparişi İptal Et
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
