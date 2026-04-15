import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductsBySection } from "@/lib/getProductsBySection";
import ProductCard from "@/components/mobile/ProductCard";

const STYLE_META: Record<string, { label: string; image: string; description: string }> = {
  casual: {
    label: "Casual",
    image: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1000",
    description: "Everyday effortless looks",
  },
  formal: {
    label: "Formal",
    image: "https://images.unsplash.com/photo-1516822003754-cca485356ecb?q=80&w=1000",
    description: "Sharp and professional",
  },
  party: {
    label: "Party",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000",
    description: "Stand out every night",
  },
  gym: {
    label: "Gym",
    image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1000",
    description: "Performance meets style",
  },
};

const VALID = Object.keys(STYLE_META);

export default async function StylePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!VALID.includes(slug)) return notFound();

  const meta = STYLE_META[slug];
  const products = await getProductsBySection(slug);

  return (
    <div className="mobile-shop">

      {/* ── Hero banner ── */}
      <div style={{ position: "relative", height: "180px", marginBottom: "16px", borderRadius: "0 0 20px 20px", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${meta.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.6))" }} />

        {/* Back button */}
        <Link
          href="/m/styles"
          style={{
            position: "absolute",
            top: "14px",
            left: "14px",
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(4px)",
            color: "white",
            padding: "6px 12px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          ← Styles
        </Link>

        {/* Title */}
        <div style={{ position: "absolute", bottom: "16px", left: "16px" }}>
          <h1 style={{ color: "white", fontSize: "28px", fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
            {meta.label}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", margin: "4px 0 0" }}>
            {meta.description}
          </p>
        </div>
      </div>

      {/* ── Product count ── */}
      <p style={{ fontSize: "12px", color: "#888", marginBottom: "12px", paddingLeft: "4px" }}>
        {products.length === 0
          ? "No products yet"
          : `${products.length} product${products.length !== 1 ? "s" : ""}`}
      </p>

      {/* ── Products ── */}
      {products.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "48px 24px",
          border: "1px dashed #ddd",
          borderRadius: "16px",
          color: "#aaa",
        }}>
          <p style={{ fontSize: "32px", marginBottom: "8px" }}>🛍</p>
          <p style={{ fontWeight: 600, color: "#555", marginBottom: "4px" }}>
            No products here yet
          </p>
          <Link
            href="/m/styles"
            style={{ display: "inline-block", marginTop: "16px", fontSize: "13px", color: "#2563eb", fontWeight: 600, textDecoration: "none" }}
          >
            ← Browse other styles
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}