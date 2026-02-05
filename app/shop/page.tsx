"use client";

import { useEffect, useState, useRef } from "react";
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
  category?: string;
  inStock?: boolean;
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
            category: (d.category || "clothes").toLowerCase(),
            inStock: d.inStock !== false,
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

  // 🔥 Scroll to searched product
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

  const clothes = products.filter((p) => p.category === "clothes");
  const phones = products.filter((p) => p.category === "phones");
  const footwear = products.filter((p) => p.category === "footwear");

  return (
    <main className="min-h-screen bg-white text-gray-800">
      <Header />

      <div className="max-w-7xl mx-auto px-6 pt-10">
        <a href="/" className="text-gray-600 hover:text-black mb-6 inline-block">
          ← Back to Home
        </a>

        <h1 className="text-4xl font-bold text-center mb-10">
          Shop All Products
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20 space-y-16">

        {loading && <p className="text-center">Loading products...</p>}

        {!loading && (
          <>
            <section>
              <h2 className="text-2xl font-bold mb-6">Clothes</h2>
              <div className="grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 gap-8">
                {clothes.map((p) => (
                  <div
                    key={p.id}
                    ref={(el) => {(productRefs.current[p.id] = el)}}
                  >
                    <ProductCard {...p} />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">Phones</h2>
              <div className="grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 gap-8">
                {phones.map((p) => (
                  <div
                    key={p.id}
                    ref={(el) => {(productRefs.current[p.id] = el)}}
                  >
                    <ProductCard {...p} />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">Footwear</h2>
              <div className="grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 gap-8">
                {footwear.map((p) => (
                  <div
                    key={p.id}
                    ref={(el) => {(productRefs.current[p.id] = el)}}
                  >
                    <ProductCard {...p} />
                  </div>
                ))}
              </div>
            </section>

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
