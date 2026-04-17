import { getProductsBySection } from "@/lib/getProductsBySection";
import ProductCard from "@/components/mobile/ProductCard";

export const dynamic = "force-dynamic";

export default async function MobileNewPage() {
  const products = await getProductsBySection("new-arrivals");

  return (
    <div className="mobile-shop">
      <div className="page-title">New Arrivals</div>

      <div className="product-grid">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}