export default function Newsletter() {
  return (
    <section className="bg-black text-white py-16 mt-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        
        <h2 className="text-3xl font-bold">
          STAY UP TO DATE ABOUT OUR LATEST OFFERS
        </h2>

        <div className="flex w-full md:w-auto gap-4">
          <input
            type="email"
            placeholder="Enter your email address"
            className="px-4 py-3 rounded-full w-full md:w-80 text-gray-800"
          />
          <button className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:opacity-80 transition">
            Subscribe
          </button>
        </div>

      </div>
    </section>
  );
}
