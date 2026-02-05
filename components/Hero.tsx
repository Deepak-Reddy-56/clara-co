export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 pt-10 sm:pt-12 md:pt-16 pb-16 grid md:grid-cols-2 gap-10 md:gap-12 items-center">

      {/* Image FIRST on mobile */}
      <div className="relative order-first md:order-none">
        <img
          src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1000"
          alt="Fashion Model"
          className="rounded-xl w-full object-cover max-h-[340px] sm:max-h-[450px] md:max-h-none"
        />
      </div>

      {/* Text */}
      <div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-black">
          FIND CLOTHES THAT MATCHES YOUR STYLE
        </h2>

        <p className="mt-5 sm:mt-6 text-gray-600 text-sm sm:text-base md:text-lg max-w-md">
          Browse through our diverse range of meticulously crafted garments designed to bring out your individuality and cater to your sense of style.
        </p>

        <button className="mt-6 sm:mt-8 bg-black text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-sm sm:text-base hover:opacity-80 transition">
          Shop Now
        </button>

        <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-10 sm:mt-12 text-black text-center">
          <div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold">200+</p>
            <p className="text-gray-600 text-[11px] sm:text-sm">International Brands</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold">2,000+</p>
            <p className="text-gray-600 text-[11px] sm:text-sm">High-Quality Products</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold">30,000+</p>
            <p className="text-gray-600 text-[11px] sm:text-sm">Happy Customers</p>
          </div>
        </div>
      </div>

    </section>
  );
}
