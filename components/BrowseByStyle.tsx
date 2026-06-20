"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BrowseByStyle() {
  const [styles, setStyles] = useState<{ name: string; slug: string; image: string }[]>([]);
  const [sectionName, setSectionName] = useState("BROWSE BY STYLE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const docRef = doc(db, "settings", "styles");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSectionName(data.sectionName || "BROWSE BY STYLE");
          setStyles(data.styles || []);
        } else {
          // Fallback static list
          setStyles([
            { name: "Casual", slug: "casual", image: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1000" },
            { name: "Formal", slug: "formal", image: "https://images.unsplash.com/photo-1516822003754-cca485356ecb?q=80&w=1000" },
            { name: "Party", slug: "party", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000" },
            { name: "Gym", slug: "gym", image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1000" }
          ]);
        }
      } catch (err) {
        console.error("Failed to load homepage styles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStyles();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12 animate-pulse">
          {sectionName.toUpperCase()}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (styles.length === 0) return null;

  // Show first 4 styles in the homepage grid
  const visibleStyles = styles.slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-12 uppercase tracking-wide">
        {sectionName}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {visibleStyles.map((style) => (
          <Link
            key={style.slug}
            href={`/styles/${style.slug}`}
            className="relative rounded-xl overflow-hidden group cursor-pointer block h-64 bg-gray-100"
          >
            <img
              src={style.image}
              alt={style.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition duration-300 flex items-center justify-center">
              <h3 className="text-white text-2xl font-bold tracking-wide drop-shadow-md">{style.name}</h3>
            </div>
          </Link>
        ))}
      </div>

      {styles.length > 4 && (
        <div className="flex justify-center mt-12">
          <Link
            href="/styles"
            className="bg-black hover:bg-gray-900 text-white font-bold text-sm px-8 py-3.5 rounded-full transition shadow-md hover:scale-[1.02] active:scale-[0.98] duration-200"
          >
            View All Styles
          </Link>
        </div>
      )}
    </section>
  );
}
