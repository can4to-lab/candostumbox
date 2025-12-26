import ProductClient from "./ProductClient";

// Sunucu tarafı ayarı burada kalıyor
export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <ProductClient />;
}