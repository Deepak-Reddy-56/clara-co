"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/mobile/ProductCard";
import PromoCarousel from "@/components/PromoCarousel";

// ── Types ─────────────────────────────────────────────

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  inStock?: boolean;
  discount?: number;
  sections?: string[];
  createdAt?: number;
  category?: string;
  sizeRange?: string;
  outOfStockSizes?: string;
};

type SortOption = "default" | "price-asc" | "price-desc";
type CategoryFilter = "all" | "clothes" | "goggles" | "perfumes";

// ── SectionTitle helper ────────────────────────────────

function SectionTitle({ title, link }: { title: string; link?: string }) {
  return (
    <div className="section-title">
      <h3>{title}</h3>
      {link && <Link href={link}>View all →</Link>}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────

function MobileShopContent() {
  const searchParams = useSearchParams();
  const initialCat = (searchParams.get("category") || "all") as CategoryFilter;
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [fetched, setFetched]         = useState(false);

  const [stylesList, setStylesList]               = useState<{ name: string; slug: string; image: string }[]>([]);
  const [stylesSectionName, setStylesSectionName] = useState("Shop by Style");

  // Filter/Sort State — initialise from URL param
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(initialCat);
  const [sortBy, setSortBy]                 = useState<SortOption>("default");
  const [showSortSheet, setShowSortSheet]   = useState(false);

  // Keep filter in sync if user navigates back with a different param
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setActiveCategory(cat as CategoryFilter);
      // Smooth-scroll to the Browse All section after a brief paint delay
      setTimeout(() => {
        document.getElementById("browse-all")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    } else {
      setActiveCategory("all");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);


  useEffect(() => {
    const loadStyles = async () => {
      try {
        const docRef  = doc(db, "settings", "styles");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStylesSectionName(data.sectionName || "Shop by Style");
          setStylesList(data.styles || []);
        } else {
          setStylesList([
            { name: "Casual", slug: "casual", image: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=800" },
            { name: "Formal", slug: "formal", image: "https://images.unsplash.com/photo-1516822003754-cca485356ecb?q=80&w=800" },
            { name: "Party",  slug: "party",  image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800" },
            { name: "Gym",    slug: "gym",    image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800" },
          ]);
        }
      } catch (err) {
        console.error("Failed to load styles settings:", err);
      }
    };
    loadStyles();
  }, []);

  // Fetch all products once
  useEffect(() => {
    const load = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const data: Product[] = snapshot.docs.map((doc) => {
          const d = doc.data() as any;
          return {
            id:             doc.id,
            name:           d.name || "",
            price:          Number(d.price) || 0,
            image:          d.image || "",
            images:         d.images || [],
            inStock:        d.inStock !== false,
            discount:       d.discount || 0,
            sections:       d.sections || [],
            createdAt:      d.createdAt?.toMillis?.() || d.createdAt?.seconds * 1000 || 0,
            category:       (d.category || "clothes").toLowerCase(),
            sizeRange:      d.sizeRange || "",
            outOfStockSizes: d.outOfStockSizes || "",
          };
        });
        data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAllProducts(data);
        setFetched(true);
      } catch (err) {
        console.error("Shop fetch failed:", err);
      }
    };
    load();
  }, []);

  // Derived data
  const newArrivals = allProducts.filter((p) => p.sections?.includes("new-arrivals"));
  const topSelling  = allProducts.filter((p) => p.sections?.includes("top-selling"));

  // Category + Sort for "Browse All"
  const filteredProducts = activeCategory === "all"
    ? allProducts
    : allProducts.filter((p) => p.category === activeCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc")  return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  const categories: { key: CategoryFilter; label: string }[] = [
    { key: "all",      label: "All"      },
    { key: "clothes",  label: "Clothes"  },
    { key: "goggles",  label: "Goggles"  },
    { key: "perfumes", label: "Perfumes" },
  ];

  const sortLabels: Record<SortOption, string> = {
    default:      "Featured",
    "price-asc":  "Price: Low to High",
    "price-desc": "Price: High to Low",
  };

  return (
    <div className="mobile-shop">

      {/* ── HERO CAROUSEL ── */}
      <PromoCarousel variant="mobile-hero" />

      {/* ── NEW ARRIVALS ── */}
      <SectionTitle title="New Arrivals" link="/m/new" />
      {fetched && newArrivals.length > 0 ? (
        <div className="horizontal-scroll">
          {newArrivals.slice(0, 10).map((p) => (
            <div key={p.id} style={{ minWidth: "160px" }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      ) : fetched ? (
        <p style={{ padding: "0 16px", color: "#aaa", fontSize: "13px" }}>No new arrivals yet</p>
      ) : (
        <p style={{ padding: "0 16px", color: "#aaa", fontSize: "13px" }}>Loading...</p>
      )}

      {/* ── TOP SELLING ── */}
      <SectionTitle title="Top Selling" link="/m/top" />
      {fetched && topSelling.length > 0 ? (
        <div className="horizontal-scroll">
          {topSelling.slice(0, 10).map((p) => (
            <div key={p.id} style={{ minWidth: "160px" }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      ) : fetched ? (
        <p style={{ padding: "0 16px", color: "#aaa", fontSize: "13px" }}>No top sellers yet</p>
      ) : (
        <p style={{ padding: "0 16px", color: "#aaa", fontSize: "13px" }}>Loading...</p>
      )}

      {/* ── SHOP BY STYLE ── */}
      <SectionTitle title={stylesSectionName} link={stylesList.length > 4 ? "/m/styles" : undefined} />
      <div className="style-grid">
        {stylesList.slice(0, 4).map((style) => (
          <a
            key={style.slug}
            href={`/m/styles/${style.slug}`}
            className="style-card"
            style={{ backgroundImage: `url(${style.image})` }}
          >
            <div className="style-overlay" />
            <span>{style.name}</span>
          </a>
        ))}
      </div>

      {/* ── BROWSE ALL PRODUCTS ── */}
      <div id="browse-all" style={{ padding: "28px 16px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111", margin: 0 }}>Browse All</h3>
          <button
            onClick={() => setShowSortSheet(true)}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "7px 14px",
              borderRadius: "999px",
              border: "1.5px solid",
              borderColor: sortBy !== "default" ? "#111" : "#ddd",
              background: sortBy !== "default" ? "#111" : "#fff",
              color: sortBy !== "default" ? "#fff" : "#555",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <SlidersHorizontal size={13} />
            {sortLabels[sortBy]}
          </button>
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", marginBottom: "16px" }}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                padding: "7px 18px",
                borderRadius: "999px",
                border: "1.5px solid",
                borderColor: activeCategory === cat.key ? "#111" : "#e0e0e0",
                background: activeCategory === cat.key ? "#111" : "#fff",
                color: activeCategory === cat.key ? "#fff" : "#555",
                fontWeight: activeCategory === cat.key ? 600 : 400,
                fontSize: "13px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {fetched ? (
          sortedProducts.length > 0 ? (
            <div className="product-grid">
              {sortedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center", padding: "40px 24px", color: "#aaa", fontSize: "13px" }}>
              No products in this category yet.
            </p>
          )
        ) : (
          <p style={{ textAlign: "center", padding: "40px 24px", color: "#aaa", fontSize: "13px" }}>
            Loading...
          </p>
        )}
      </div>

      {/* ── Sort Bottom Sheet ── */}
      {showSortSheet && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "flex-end",
          }}
          onClick={() => setShowSortSheet(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px 20px 0 0",
              padding: "20px 20px 36px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: "40px", height: "4px", background: "#e0e0e0", borderRadius: "99px", margin: "0 auto 20px" }} />
            <p style={{ fontWeight: 700, fontSize: "16px", color: "#111", marginBottom: "14px" }}>Sort By</p>
            {(["default", "price-asc", "price-desc"] as SortOption[]).map((opt) => (
              <button
                key={opt}
                onClick={() => { setSortBy(opt); setShowSortSheet(false); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "14px 4px",
                  background: "none", border: "none",
                  borderBottom: "1px solid #f5f5f5",
                  fontSize: "15px",
                  color: sortBy === opt ? "#111" : "#666",
                  fontWeight: sortBy === opt ? 700 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {sortLabels[opt]}
                {sortBy === opt && <span style={{ color: "#111", fontSize: "18px" }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MobileShopPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <MobileShopContent />
    </Suspense>
  );
}
