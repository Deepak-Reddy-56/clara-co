"use client";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

export default function NewArrivals() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) =>
        setProducts(
          data.filter(
            (p: any) =>
              p.sections?.includes("new-arrivals") && p.inStock !== false
          )
        )
      );
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
        NEW ARRIVALS
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {products.map((p) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>
    </section>
  );
}
