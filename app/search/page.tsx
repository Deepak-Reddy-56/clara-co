"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
const router = useRouter();


type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock?: boolean;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase().trim() || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));

        const allProducts: Product[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            name: d.name || "",
            price: Number(d.price) || 0,
            image: d.image || "",
            inStock: d.inStock !== false,
          };
        });

        const filtered = allProducts.filter(
          (p) =>
            p.inStock &&
            p.name.toLowerCase().includes(query)
        );

        setProducts(filtered);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <main className="min-h-screen bg-white text-gray-800">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">
          Search results for "{query}"
        </h1>

        {loading ? (
          <p>Searching products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 gap-8">
            {products.map((product) => (
              <div onClick={() => router.push(`/shop?highlight=${product.id}`)} className="cursor-pointer">
                <ProductCard {...product} />
            </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
