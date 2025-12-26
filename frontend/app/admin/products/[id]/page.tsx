import AdminProductClient from "./AdminProductClient";

export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <AdminProductClient />;
}