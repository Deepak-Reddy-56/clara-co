"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.filter((p: any) => p.inStock !== false)));
  }, []);

  const clothes = products.filter((p) => p.category === "clothes");
  const phones = products.filter((p) => p.category === "phones");
  const footwear = products.filter((p) => p.category === "footwear");

  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Global Navbar */}
      <Header />

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <a
          href="/"
          className="text-gray-600 hover:text-black mb-6 inline-block"
        >
          ← Back to Home
        </a>

        <h1 className="text-4xl font-bold text-center mb-10">
          Shop All Products
        </h1>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-6 pb-20 space-y-16">

        <section>
          <h2 className="text-2xl font-bold mb-6">Clothes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {clothes.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Phones</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {phones.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Footwear</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {footwear.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
