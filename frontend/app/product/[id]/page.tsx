import ProductClient from "./ProductClient";

// 👇 İŞTE NEXT.JS BU FONKSİYONU ARIYOR!
export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <ProductClient />;
}