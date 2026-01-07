import { Metadata } from "next";
import ProductClient from "./ProductClient";

// 👇 SEO İÇİN SERVER-SIDE METADATA OLUŞTURMA
// Next.js 15+ için params bir Promise'dir
type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await fetch(`https://candostumbox-api.onrender.com/products/${id}`, { next: { revalidate: 3600 } }).then((res) =>
      res.json()
    );

    if (!product || product.error) {
      return {
        title: "Ürün Bulunamadı | Can Dostum Box",
      };
    }

    return {
      title: `${product.name} | Can Dostum Box`,
      description: product.description ? `${product.description.slice(0, 160)}...` : "Can dostunuz için harika bir kutu.",
      openGraph: {
        title: product.name,
        description: product.description,
        images: [product.image || "/default-box.png"],
      },
    };
  } catch (error) {
    return {
      title: "Can Dostum Box | Evcil Hayvan Abonelik Kutusu",
    };
  }
}

// 👇 ANA SAYFA (SERVER COMPONENT)
export default function ProductPage() {
  return <ProductClient />;
}