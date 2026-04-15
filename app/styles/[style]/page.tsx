"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  sections?: string[];
  inStock?: boolean;
};

const STYLE_META: Record<string, { label: string; image: string; description: string }> = {
  casual: {
    label: "Casual",
    image: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1600",
    description: "Everyday effortless looks — comfort meets cool.",
  },
  formal: {
    label: "Formal",
    image: "https://images.unsplash.com/photo-1516822003754-cca485356ecb?q=80&w=1600",
    description: "Sharp, polished, and professional.",
  },
  party: {
    label: "Party",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600",
    description: "Make every night unforgettable.",
  },
  gym: {
    label: "Gym",
    image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1600",
    description: "Train harder, look better.",
  },
};

export default function StylePage() {
  const params = useParams();
  const router = useRouter();
  const style = String(params.style || "").toLowerCase();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const meta = STYLE_META[style];

  useEffect(() => {
    if (!style) return;

    const fetchProducts = async () => {
      try {
        // Efficient: only fetch products in this style
        const q = query(
          collection(db, "products"),
          where("sections", "array-contains", style)
        );
        const snapshot = await getDocs(q);

        const data: Product[] = snapshot.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Product, "id">) }))
          .filter((p) => p.inStock !== false);

        setProducts(data);
      } catch (err) {
        console.error("Failed to load style products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [style]);

  if (!meta) {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-6 pt-24 text-center">
          <p className="text-gray-500">Style not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Header />

      {/* ── Hero banner ── */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={meta.image}
          alt={meta.label}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-5 left-6 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-white/30 transition"
        >
          ← Back
        </button>

        {/* Title block */}
        <div className="absolute bottom-8 left-6">
          <h1 className="text-white text-5xl font-extrabold capitalize leading-tight">
            {meta.label}
          </h1>
          <p className="text-white/80 text-sm mt-2">{meta.description}</p>
        </div>
      </div>

      {/* ── Products ── */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-20">

        {/* Product count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-6">
            {products.length === 0
              ? "No products in this style yet."
              : `${products.length} product${products.length !== 1 ? "s" : ""} in ${meta.label}`}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-gray-400 text-sm animate-pulse">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">🛍</span>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Nothing here yet</h2>
            <p className="text-gray-400 text-sm max-w-sm">
              The admin hasn't assigned any products to the <strong>{meta.label}</strong> style yet.
              Check back soon!
            </p>
            <button
              onClick={() => router.back()}
              className="mt-6 text-sm font-semibold text-gray-700 underline hover:text-black"
            >
              ← Go back
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
