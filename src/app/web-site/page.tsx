import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PilaresSection from "@/components/PilaresSection";
import InstitucionalSection from "@/components/InstitucionalSection";
import BulaRematesSection from "@/components/BulaRematesSection";
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
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />

      {/* Hero — novo posicionamento */}
      <Hero />

      {/* Pilares — 5 frentes estratégicas */}
      <PilaresSection />

      {/* Institucional — autoridade, método, diferencial */}
      <InstitucionalSection />

      {/* Parceria Bula Remates */}
      <BulaRematesSection />

      {/* Catálogo em destaque */}
      <FeaturedLots products={products} isAuthenticated={isAuthenticated} />

      {/* Grade de produtos */}
      <ProductGrid products={products} isAuthenticated={isAuthenticated} />

      {/* WhatsApp / Comunidade */}
      <WhatsappSection />

      <Footer />
    </main>
  );
}

