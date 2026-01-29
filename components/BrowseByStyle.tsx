import Link from "next/link";
export default function BrowseByStyle() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
        BROWSE BY STYLE
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Casual */}
        <Link href="/shop#clothes" className="relative rounded-xl overflow-hidden group cursor-pointer block">
          <img
            src="https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1000"
            alt="Casual"
            className="w-full h-64 object-cover group-hover:scale-105 transition"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h3 className="text-white text-2xl font-bold">Casual</h3>
          </div>
        </Link>

        {/* Formal */}
        <Link href="/shop#clothes" className="relative rounded-xl overflow-hidden group cursor-pointer block">
          <img
            src="https://images.unsplash.com/photo-1516822003754-cca485356ecb?q=80&w=1000"
            alt="Formal"
            className="w-full h-64 object-cover group-hover:scale-105 transition"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h3 className="text-white text-2xl font-bold">Formal</h3>
          </div>
        </Link>

        {/* Party */}
        <Link href="/shop#clothes" className="relative rounded-xl overflow-hidden group cursor-pointer block">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000"
            alt="Party"
            className="w-full h-64 object-cover group-hover:scale-105 transition"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h3 className="text-white text-2xl font-bold">Party</h3>
          </div>
        </Link>

        {/* Gym */}
        <Link href="/shop#footwear" className="relative rounded-xl overflow-hidden group cursor-pointer block">
          <img
            src="https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1000"
            alt="Gym"
            className="w-full h-64 object-cover group-hover:scale-105 transition"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h3 className="text-white text-2xl font-bold">Gym</h3>
          </div>
        </Link>

      </div>
    </section>
  );
}
