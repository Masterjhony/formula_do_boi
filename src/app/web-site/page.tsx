import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TourosDestaque from "@/components/TourosDestaque";
import DoadoresDestaque from "@/components/DoadoresDestaque";
import LeiloesSection from "@/components/LeiloesSection";
import WhatsappSection from "@/components/WhatsappSection";
import Footer from "@/components/Footer";
import { getProductsServer } from "@/services/products.server";
import { getIsAuthenticated } from "@/lib/auth-helpers";

export default async function Home() {
    const isAuthenticated = await getIsAuthenticated();
    const products = await getProductsServer(isAuthenticated);

    return (
        <main className="min-h-screen bg-[#0a0a0a]">
            <Header />

            {/* 1 — Hero: video bg + 3 modelos de negócio */}
            <Hero />

            {/* 2 — Touros Fórmula do Boi */}
            <TourosDestaque products={products} isAuthenticated={isAuthenticated} />

            {/* 3 — Doadoras & Embriões */}
            <DoadoresDestaque products={products} isAuthenticated={isAuthenticated} />

            {/* 4 — Leilões de P.O. */}
            <LeiloesSection />

            {/* 5 — Grupo de WhatsApp */}
            <WhatsappSection />

            <Footer />
        </main>
    );
}
