export default function BrandStrip() {
  const logos = [...Array(5)];
  return (
    <section className="bg-black py-4 mt-10 marquee-container">
      <div className="marquee-content">
        <div className="flex justify-around min-w-full shrink-0">
          {logos.map((_, i) => (
            <img
              key={`logo-1-${i}`}
              src="/logo.jpg"
              alt="Clara & Co Logo"
              className="h-16 w-16 sm:h-22 sm:w-22 object-contain transition duration-300 hover:scale-105"
            />
          ))}
        </div>
        <div className="flex justify-around min-w-full shrink-0">
          {logos.map((_, i) => (
            <img
              key={`logo-2-${i}`}
              src="/logo.jpg"
              alt="Clara & Co Logo"
              className="h-16 w-16 sm:h-22 sm:w-22 object-contain transition duration-300 hover:scale-105"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

