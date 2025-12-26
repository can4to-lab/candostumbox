import ProductClient from "./ProductClient";

// 👇 Render'ı zorlamak için buraya sahte bir 'test' ID'si ekliyoruz.
// Bu değişiklik Git'i "Hey dosya değişti, bunu tekrar yükle" demeye zorlayacak.
export async function generateStaticParams() {
  return [{ id: 'test-urun' }];
}

export default function Page() {
  return <ProductClient />;
}