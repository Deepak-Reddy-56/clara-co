import Link from "next/link";

function SectionTitle({ title, link }: { title: string; link?: string }) {
  return (
    <div className="section-title">
      <h3>{title}</h3>
      {link && <Link href={link}>View all →</Link>}
    </div>
  );
}

import { getProductsBySection } from "@/lib/getProductsBySection";
import ProductCard from "@/components/mobile/ProductCard";

async function ProductGrid() {
  const products = await getProductsBySection("new-arrivals");

  return (
    <div className="product-grid">
      {products.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function StyleGrid() {
  const styles = [
    { name: "Casual", image: "/styles/casual.jpg", slug: "casual" },
    { name: "Formal", image: "/styles/formal.jpg", slug: "formal" },
    { name: "Party", image: "/styles/party.jpg", slug: "party" },
    { name: "Gym", image: "/styles/gym.jpg", slug: "gym" },
  ];

  return (
    <div className="style-grid">
      {styles.map((style) => (
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
  );
}

async function HorizontalScroll() {
  const products = await getProductsBySection("top-selling");

  return (
    <div className="horizontal-scroll">
      {products.map((product: any) => (
        <div key={product.id} style={{ minWidth: "160px" }}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}

export default async function MobileShopPage() {
  return (
    <div className="mobile-shop">

      {/* HERO */}
      <section className="hero-banner">
        <div className="hero-content">
          <h2>New Season Drop</h2>
          <button>Shop Now</button>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <SectionTitle title="New Arrivals" link="/m/new" />
      <ProductGrid />

      {/* TOP SELLING */}
      <SectionTitle title="Top Selling" link="/m/top" />
      <HorizontalScroll />

      {/* SHOP BY STYLE */}
      <SectionTitle title="Shop by Style" link="/m/styles" />
      <StyleGrid />

    </div>
  );
}
