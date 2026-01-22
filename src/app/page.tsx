import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import FeaturedLots from "@/components/FeaturedLots";
import AdBanner from "@/components/AdBanner";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Hero />

      {/* Premium Highlighted Section */}
      <FeaturedLots />

      {/* Main Advertisement */}
      <AdBanner position="leaderboard" />

      {/* Standard Listings */}
      <ProductGrid />

      {/* Secondary Advertisement */}
      <AdBanner position="leaderboard" className="my-0 mb-12" />

      {/* Newsletter Section */}
      <section className="py-20 bg-brand-gold relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 pattern-grid-lg"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-black mb-4 uppercase tracking-tight">
            Não Perca Nenhum Leilão
          </h2>
          <p className="text-brand-black/80 max-w-2xl mx-auto mb-8 font-medium">
            Cadastre-se para receber notificações sobre novos lotes, agenda de leilões e oportunidades exclusivas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-6 py-4 rounded-lg border-2 border-brand-black/10 focus:border-brand-black focus:outline-none bg-white/90 placeholder:text-gray-500 text-brand-black"
            />
            <button className="px-8 py-4 bg-brand-black text-white font-bold rounded-lg hover:bg-gray-900 transition-colors uppercase tracking-wide">
              Cadastrar
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

