export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 pt-12 pb-18 grid md:grid-cols-2 gap-12 items-center">
      
      {/* Left Side */}
      <div>
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight text-black">
          FIND CLOTHES THAT MATCHES YOUR STYLE
        </h2>

        <p className="mt-6 text-gray-600 text-lg">
          Browse through our diverse range of meticulously crafted garments designed to bring out your individuality and cater to your sense of style.
        </p>

        <button className="mt-8 bg-black text-white px-8 py-4 rounded-full font-semibold hover:opacity-80 transition">
          Shop Now
        </button>

        {/* Stats */}
        <div className="flex gap-12 mt-12 text-black">
          <div>
            <p className="text-3xl font-bold">200+</p>
            <p className="text-gray-600 text-sm">International Brands</p>
          </div>
          <div>
            <p className="text-3xl font-bold">2,000+</p>
            <p className="text-gray-600 text-sm">High-Quality Products</p>
          </div>
          <div>
            <p className="text-3xl font-bold">30,000+</p>
            <p className="text-gray-600 text-sm">Happy Customers</p>
          </div>
        </div>
      </div> {/* ✅ LEFT SIDE DIV CLOSED PROPERLY */}

  {/* Right Side Image */}
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1000"
          alt="Fashion Model"
          className="rounded-xl w-full object-cover"
        />
      </div>

    </section>
  );
}
