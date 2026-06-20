"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function StylesPage() {
  const [styles, setStyles] = useState<{ name: string; slug: string; image: string; description?: string }[]>([]);
  const [sectionName, setSectionName] = useState("Shop by Style");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const docRef = doc(db, "settings", "styles");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSectionName(data.sectionName || "Shop by Style");
          setStyles(data.styles || []);
        } else {
          // Fallback static list
          setStyles([
            {
              name: "Casual",
              slug: "casual",
              image: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1000",
              description: "Everyday effortless looks",
            },
            {
              name: "Formal",
              slug: "formal",
              image: "https://images.unsplash.com/photo-1516822003754-cca485356ecb?q=80&w=1000",
              description: "Sharp and professional",
            },
            {
              name: "Party",
              slug: "party",
              image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000",
              description: "Stand out every night",
            },
            {
              name: "Gym",
              slug: "gym",
              image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1000",
              description: "Performance meets style",
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load styles settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStyles();
  }, []);

  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 pt-24 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-wide text-gray-800">
            {sectionName}
          </h1>
          <p className="text-sm text-gray-500 mt-3 font-medium uppercase tracking-wider">
            Explore curated looks tailored to you
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : styles.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-5xl block mb-4">👕</span>
            <p className="text-gray-500 font-medium">No styles found. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {styles.map((style) => (
              <Link
                key={style.slug}
                href={`/styles/${style.slug}`}
                className="relative rounded-2xl overflow-hidden group cursor-pointer block h-72 bg-gray-100 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg"
              >
                {/* Image */}
                <img
                  src={style.image}
                  alt={style.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                
                {/* Premium Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10 group-hover:via-black/55 transition duration-300" />
                
                {/* Content */}
                <div className="absolute bottom-6 left-6 right-6 text-left">
                  <h3 className="text-white text-2xl font-bold tracking-wide drop-shadow-sm group-hover:translate-x-1 transition-transform duration-300">
                    {style.name}
                  </h3>
                  {style.description && (
                    <p className="text-gray-300 text-xs mt-2 line-clamp-2 drop-shadow-sm font-medium">
                      {style.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
