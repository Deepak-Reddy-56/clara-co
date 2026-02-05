"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  sections?: string[];
  inStock?: boolean;
};

export default function StylePage() {
  const params = useParams();
  const style = String(params.style || "").toLowerCase();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));

        const allProducts: Product[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }));

        const filtered = allProducts.filter(
          (p) =>
            p.inStock !== false &&
            p.sections?.map((s) => s.toLowerCase()).includes(style)
        );

        setProducts(filtered);
      } catch (err) {
        console.error("Failed to load style products:", err);
      } finally {
        setLoading(false);
      }
    };

    if (style) fetchProducts();
  }, [style]);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-20">
        <h1 className="text-4xl font-bold mb-10 capitalize text-center">
          {style} Style
        </h1>

        {loading ? (
          <p className="text-center">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">
            No products found in this style yet.
          </p>
        ) : (
          <div className="grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 gap-8">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
