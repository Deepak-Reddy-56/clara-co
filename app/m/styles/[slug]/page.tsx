import { notFound } from "next/navigation";
import { getProductsBySection } from "@/lib/getProductsBySection";
import ProductCard from "@/components/mobile/ProductCard";

export default async function StylePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const valid = ["casual", "formal", "party", "gym"];

  if (!valid.includes(slug)) return notFound();

  const products = await getProductsBySection(slug);

  return (
    <div className="mobile-shop">
      <div className="page-title">
        {slug.charAt(0).toUpperCase() + slug.slice(1)}
      </div>

      <div className="product-grid">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}