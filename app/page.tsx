import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BrandStrip from "@/components/BrandStrip";
import NewArrivals from "@/components/NewArrivals";
import TopSelling from "@/components/TopSelling";
import BrowseByStyle from "@/components/BrowseByStyle";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ desktop?: string }>;
}) {
  const params = await searchParams; // 🔥 FIX

  const forceDesktop = params?.desktop === "true";

  // ✅ Get user-agent
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);

  // ✅ Redirect ONLY if mobile AND not forced desktop
  if (isMobile && !forceDesktop) {
    redirect("/m/shop");
  }

  return (
    <main className="min-h-screen bg-white text-gray-800">
      <Header />
      <Hero />
      <BrandStrip />

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