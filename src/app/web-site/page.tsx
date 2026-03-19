import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import FeaturedLots from "@/components/FeaturedLots";
import WhatsappSection from "@/components/WhatsappSection";
import { getProductsServer } from "@/services/products.server";
import { getIsAuthenticated } from "@/lib/auth-helpers";

export default async function Home() {
  const isAuthenticated = await getIsAuthenticated();
  const products = await getProductsServer(isAuthenticated);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Hero />

      {/* Premium Highlighted Section */}
      <FeaturedLots products={products} isAuthenticated={isAuthenticated} />



      {/* Standard Listings */}
      <ProductGrid products={products} isAuthenticated={isAuthenticated} />



      {/* Newsletter Section */}
      <WhatsappSection />

      <Footer />
    </main>
  );
}

