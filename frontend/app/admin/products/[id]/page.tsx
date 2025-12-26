import AdminProductClient from "./AdminProductClient";

// 👇 Render'ın yeni takıntısı bu fonksiyon. Buraya da ekliyoruz.
export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <AdminProductClient />;
}