import Link from "next/link";

function SectionTitle({ title, link }: { title: string; link?: string }) {
  return (
    <div className="section-title">
      <h3>{title}</h3>
      {link && <Link href={link}>View all →</Link>}
    </div>
  );
}

function ProductGrid() {
  return (
    <div className="product-grid">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="product-card-grid" />
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


function HorizontalScroll() {
  return (
    <div className="horizontal-scroll">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="product-card" />
      ))}
    </div>
  );
}

export default function MobileShopPage() {
  return (
    <div className="mobile-shop">

      {/* HERO */}
      <section className="hero-banner">
        <div className="hero-content">
          <h2>New Season Drop</h2>
          <button>Shop Now</button>
        </div>
      </section>

      {/* SHOP BY STYLE */}
      <SectionTitle title="Shop by Style" link="/m/styles" />
      <StyleGrid />

      {/* NEW ARRIVALS */}
      <SectionTitle title="New Arrivals" link="/m/new" />
      <ProductGrid />

      {/* TOP SELLING */}
      <SectionTitle title="Top Selling" link="/m/top" />
      <HorizontalScroll />

    </div>
  );
}
