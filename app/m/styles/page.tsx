import Link from "next/link";

const STYLES = [
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
];

export default function MobileStylesPage() {
  return (
    <div className="mobile-shop">
      <div className="page-title">Shop by Style</div>
      <p style={{ textAlign: "center", color: "#888", fontSize: "13px", marginTop: "-8px", marginBottom: "16px" }}>
        Find your look
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "0 4px" }}>
        {STYLES.map((style) => (
          <Link
            key={style.slug}
            href={`/m/styles/${style.slug}`}
            style={{
              display: "block",
              position: "relative",
              borderRadius: "16px",
              overflow: "hidden",
              height: "140px",
              textDecoration: "none",
            }}
          >
            {/* Background image */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${style.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* Gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 100%)",
              }}
            />
            {/* Text */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "0 20px",
              }}
            >
              <span style={{ color: "white", fontWeight: 700, fontSize: "22px", lineHeight: 1.2 }}>
                {style.name}
              </span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", marginTop: "4px" }}>
                {style.description}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}