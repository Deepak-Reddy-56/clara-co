"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category?: string;
  inStock?: boolean;
  sizeRange?: string;
  outOfStockSizes?: string;
};

type SortOption = "default" | "price-asc" | "price-desc";
type CategoryFilter = "all" | "clothes" | "goggles" | "perfumes";

function ShopContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const productRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const data: Product[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            name: d.name || "Untitled",
            price: Number(d.price) || 0,
            image: d.image || "",
            images: d.images || [],
            category: (d.category || "clothes").toLowerCase(),
            inStock: d.inStock !== false,
            sizeRange: d.sizeRange || "",
            outOfStockSizes: d.outOfStockSizes || "",
          };
        });
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Scroll to searched product
  useEffect(() => {
    if (!highlightId || products.length === 0) return;
    const el = productRefs.current[highlightId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-4", "ring-black", "rounded-xl");
      setTimeout(() => {
        el.classList.remove("ring-4", "ring-black", "rounded-xl");
      }, 2000);
    }
  }, [highlightId, products]);

  const categories: { key: CategoryFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "clothes", label: "Clothes" },
    { key: "goggles", label: "Goggles" },
    { key: "perfumes", label: "Perfumes" },
  ];

  // Filter
  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  // Section groupings (only used when "all" is active)
  const byCategory = (cat: string) =>
    sorted.filter((p) => p.category === cat);

  return (
    <main className="min-h-screen bg-white text-gray-800">
      <Header />

      <div className="max-w-7xl mx-auto px-6 pt-10">
        <a href="/" className="text-gray-600 hover:text-black mb-6 inline-block">
          ← Back to Home
        </a>

        <h1 className="text-4xl font-bold text-center mb-8">Shop All Products</h1>

        {/* ── Filter + Sort Bar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "36px",
            padding: "16px 20px",
            background: "#f8f8f8",
            borderRadius: "14px",
            border: "1px solid #ebebeb",
          }}
        >
          {/* Category Chips */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "999px",
                  border: "1.5px solid",
                  borderColor: activeCategory === cat.key ? "#111" : "#ddd",
                  background: activeCategory === cat.key ? "#111" : "#fff",
                  color: activeCategory === cat.key ? "#fff" : "#555",
                  fontWeight: activeCategory === cat.key ? 600 : 400,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort By */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", color: "#888", fontWeight: 500 }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1.5px solid #ddd",
                background: "#fff",
                fontSize: "14px",
                color: "#333",
                cursor: "pointer",
                outline: "none",
                fontWeight: 500,
              }}
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20 space-y-16">
        {loading && <p className="text-center">Loading products...</p>}

        {!loading && (
          <>
            {activeCategory === "all" ? (
              // Show sections by category
              <>
                {(["clothes", "goggles", "perfumes"] as const).map((cat) => {
                  const items = byCategory(cat);
                  if (items.length === 0) return null;
                  return (
                    <section key={cat}>
                      <h2 className="text-2xl font-bold mb-6 capitalize">{cat}</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                        {items.map((p) => (
                          <div
                            key={p.id}
                            ref={(el) => { productRefs.current[p.id] = el; }}
                          >
                            <ProductCard {...p} />
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </>
            ) : (
              // Show flat filtered list
              <section>
                <h2 className="text-2xl font-bold mb-6 capitalize">{activeCategory}</h2>
                {sorted.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                    {sorted.map((p) => (
                      <div
                        key={p.id}
                        ref={(el) => { productRefs.current[p.id] = el; }}
                      >
                        <ProductCard {...p} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No products in this category yet.</p>
                )}
              </section>
            )}

            {products.length === 0 && (
              <p className="text-center text-gray-500 mt-10">
                No products found in Firestore.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid items-center justify-center">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
