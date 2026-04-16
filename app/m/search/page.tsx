"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/mobile/ProductCard";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  inStock?: boolean;
};

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase().trim() || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      return;
    }

    setLoading(true);

    const fetch_ = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const all: Product[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            name: d.name || "",
            price: Number(d.price) || 0,
            image: d.image || "",
            images: d.images || [],
            inStock: d.inStock !== false,
          };
        });

        const filtered = all.filter(
          (p) => p.inStock && p.name.toLowerCase().includes(query)
        );

        setProducts(filtered);
      } catch (err) {
        console.error("Mobile search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch_();
  }, [query]);

  if (!query) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px", color: "#aaa" }}>
        <p style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</p>
        <p style={{ fontSize: "14px" }}>Type something to search products</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px", color: "#aaa" }}>
        <p style={{ fontSize: "13px" }}>Searching...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <p style={{ fontSize: "32px", marginBottom: "8px" }}>😕</p>
        <p style={{ fontWeight: 600, color: "#333", marginBottom: "4px" }}>
          No results for "{query}"
        </p>
        <p style={{ fontSize: "13px", color: "#999" }}>
          Try a different keyword
        </p>
      </div>
    );
  }

  return (
    <>
      <p style={{ fontSize: "12px", color: "#888", padding: "0 16px 8px", marginTop: "-4px" }}>
        {products.length} result{products.length !== 1 ? "s" : ""} for "{query}"
      </p>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}

export default function MobileSearchPage() {
  return (
    <div className="mobile-shop">
      <div className="page-title" style={{ paddingBottom: "4px" }}>Search</div>
      <Suspense fallback={
        <div style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: "13px" }}>
          Loading...
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}
