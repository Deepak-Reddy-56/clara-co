export default function MobileStylesPage() {
  const styles = [
    { name: "Casual", image: "/styles/casual.jpg", slug: "casual" },
    { name: "Formal", image: "/styles/formal.jpg", slug: "formal" },
    { name: "Party", image: "/styles/party.jpg", slug: "party" },
    { name: "Gym", image: "/styles/gym.jpg", slug: "gym" },
  ];

  return (
    <div className="mobile-shop">
      <div className="page-title">Shop by Style</div>

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
    </div>
  );
}