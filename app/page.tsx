import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BrandStrip from "@/components/BrandStrip";
import NewArrivals from "@/components/NewArrivals";
import TopSelling from "@/components/TopSelling";
import BrowseByStyle from "@/components/BrowseByStyle";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <Header />
      <Hero />
      <BrandStrip />

      {/* 👇 ADD IDs HERE */}
      <section id="new-arrivals">
        <NewArrivals />
      </section>

      <section id="top-selling">
        <TopSelling />
      </section>

      <section id="browse-style">
        <BrowseByStyle />
      </section>

      <Testimonials />
      <Newsletter />
      <Footer />
    </main>
  );
}
