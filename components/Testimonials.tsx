export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-black mb-12">
        OUR HAPPY CUSTOMERS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-800">
        
        {/* Testimonial 1 */}
        <div className="border rounded-xl p-6 shadow-sm">
          <div className="text-yellow-400 text-lg">★★★★★</div>
          <p className="mt-4 text-gray-800">
            "I'm blown away by the quality and style of the clothes I received. Every piece has exceeded my expectations."
          </p>
          <div className="mt-4 font-semibold">Sarah M.</div>
        </div>

        {/* Testimonial 2 */}
        <div className="border rounded-xl p-6 shadow-sm">
          <div className="text-yellow-400 text-lg">★★★★★</div>
          <p className="mt-4 text-gray-800">
            "Finding clothes that align with my personal style used to be a challenge. This store changed everything!"
          </p>
          <div className="mt-4 font-semibold">Alex K.</div>
        </div>

        {/* Testimonial 3 */}
        <div className="border rounded-xl p-6 shadow-sm">
          <div className="text-yellow-400 text-lg">★★★★★</div>
          <p className="mt-4 text-gray-800">
            "As someone who’s always on the lookout for unique fashion pieces, I’m thrilled with my experience here."
          </p>
          <div className="mt-4 font-semibold">James L.</div>
        </div>

      </div>
    </section>
  );
}
