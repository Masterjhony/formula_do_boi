import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import FeaturedLots from "@/components/FeaturedLots";
import WhatsappSection from "@/components/WhatsappSection";
import { getProductsServer } from "@/services/products.server";

export default async function Home() {
  const products = await getProductsServer();

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Hero />

      {/* Premium Highlighted Section */}
      <FeaturedLots products={products} />



      {/* Standard Listings */}
      <ProductGrid products={products} />



      {/* Newsletter Section */}
      <WhatsappSection />

      <Footer />
    </main>
  );
}

