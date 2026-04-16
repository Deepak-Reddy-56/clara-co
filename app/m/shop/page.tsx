"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/mobile/ProductCard";

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
};

// ── Static style data ──────────────────────────────────

const STYLES = [
  { name: "Casual",  slug: "casual", image: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=800" },
  { name: "Formal",  slug: "formal", image: "https://images.unsplash.com/photo-1516822003754-cca485356ecb?q=80&w=800" },
  { name: "Party",   slug: "party",  image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800" },
  { name: "Gym",     slug: "gym",    image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800" },
];

function SectionTitle({ title, link }: { title: string; link?: string }) {
  return (
    <div className="section-title">
      <h3>{title}</h3>
      {link && <Link href={link}>View all →</Link>}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────

export default function MobileShopPage() {
  const [query, setQuery]           = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [fetched, setFetched]       = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fetch all products once
  useEffect(() => {
    const load = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const data: Product[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            name: d.name || "",
            price: Number(d.price) || 0,
            image: d.image || "",
            images: d.images || [],
            inStock: d.inStock !== false,
            discount: d.discount || 0,
            sections: d.sections || [],
          };
        });
        setAllProducts(data);
        setFetched(true);
      } catch (err) {
        console.error("Shop fetch failed:", err);
      }
    };
    load();
  }, []);

  // Derived data from allProducts
  const newArrivals  = allProducts.filter((p) => p.inStock && p.sections?.includes("new-arrivals"));
  const topSelling   = allProducts.filter((p) => p.inStock && p.sections?.includes("top-selling"));

  // Live-search filtered results
  const q = query.trim().toLowerCase();
  const searchResults = q.length > 0
    ? allProducts.filter((p) => p.name.toLowerCase().includes(q))
    : [];

  const isSearching = q.length > 0;

  return (
    <div className="mobile-shop">

      {/* ── Sticky search bar ── */}
      <div style={{
        position: "sticky",
        top: "56px",
        zIndex: 100,
        background: "white",
        padding: "10px 14px",
        borderBottom: isSearching ? "1px solid #f0f0f0" : "none",
      }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{
            position: "absolute", left: "12px", top: "50%",
            transform: "translateY(-50%)", color: "#aaa", pointerEvents: "none",
          }} />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            style={{
              width: "100%",
              padding: "10px 36px 10px 34px",
              borderRadius: "999px",
              border: "1px solid #e8e8e8",
              background: "#f7f7f7",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
              color: "black",
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); searchRef.current?.focus(); }}
              style={{
                position: "absolute", right: "10px", top: "50%",
                transform: "translateY(-50%)", background: "none",
                border: "none", color: "#bbb", fontSize: "18px",
                cursor: "pointer", padding: 0, lineHeight: 1,
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ── Search results (dynamic) ── */}
      {isSearching ? (
        <div style={{ padding: "0 0 16px" }}>
          {!fetched ? (
            <p style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: "13px" }}>
              Loading...
            </p>
          ) : searchResults.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
              <p style={{ fontSize: "28px", marginBottom: "8px" }}>😕</p>
              <p style={{ fontWeight: 600, color: "#333", marginBottom: "4px" }}>
                No results for "{query}"
              </p>
              <p style={{ fontSize: "13px", color: "#999" }}>Try a different keyword</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: "12px", color: "#999", padding: "8px 16px 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
              </p>
              <div className="product-grid">
                {searchResults.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {/* ── HERO ── */}
          <section
            className="hero-banner"
            style={{
              backgroundImage: "url(https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200)",
              backgroundSize: "cover",
              backgroundPosition: "center top",
              position: "relative",
            }}
          >
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.55))",
            }} />
            <div className="hero-content" style={{ position: "relative", zIndex: 1 }}>
              <h2>New Season Drop</h2>
              <Link href="/m/styles" className="hero-btn">Shop Now</Link>
            </div>
          </section>

          {/* ── NEW ARRIVALS ── */}
          <SectionTitle title="New Arrivals" link="/m/new" />
          {fetched && newArrivals.length > 0 ? (
            <div className="product-grid">
              {newArrivals.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
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
              {topSelling.map((p) => (
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
          <SectionTitle title="Shop by Style" link="/m/styles" />
          <div className="style-grid">
            {STYLES.map((style) => (
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
        </>
      )}
    </div>
  );
}
