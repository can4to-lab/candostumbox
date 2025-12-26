import AdminProductClient from "./AdminProductClient";

// 👇 BURADA DA OLMALI
export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <AdminProductClient />;
}