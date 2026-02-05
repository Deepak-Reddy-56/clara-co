"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function NewArrivals() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));

        setProducts(
          data.filter(
            (p) =>
              p.sections?.includes("new-arrivals") &&
              p.inStock !== false
          )
        );
      } catch (err) {
        console.error("Failed to load New Arrivals:", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
        NEW ARRIVALS
      </h2>

      <div className="grid grid-cols-1 sm:grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 gap-8">
        {products.map((p) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-gray-500 mt-6">
          No new arrivals yet.
        </p>
      )}
    </section>
  );
}
