import PromoCarousel from "@/components/PromoCarousel";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-6 pt-10 sm:pt-12 md:pt-16 pb-16 grid md:grid-cols-2 gap-10 md:gap-12 items-center">

      {/* Image replaced by auto-scrolling promo carousel */}
      <div className="relative order-first md:order-none w-full h-full min-h-[340px] sm:min-h-[450px]">
        <PromoCarousel variant="desktop-hero" />
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

      </div>

    </section>
  );
}
