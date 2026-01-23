import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import FeaturedLots from "@/components/FeaturedLots";
import WhatsappSection from "@/components/WhatsappSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Hero />

      {/* Premium Highlighted Section */}
      <FeaturedLots />



      {/* Standard Listings */}
      <ProductGrid />



      {/* Newsletter Section */}
      <WhatsappSection />

      <Footer />
    </main>
  );
}

