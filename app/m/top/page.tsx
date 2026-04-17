import { getProductsBySection } from "@/lib/getProductsBySection";
import ProductCard from "@/components/mobile/ProductCard";

export const dynamic = "force-dynamic";

export default async function MobileTopPage() {
  const products = await getProductsBySection("top-selling");

  return (
    <div className="mobile-shop">
      <div className="page-title">Top Selling</div>

      <div className="product-grid">
        {products.length === 0 ? (
          <p style={{ padding: "16px" }}>No products found</p>
        ) : (
          products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
}