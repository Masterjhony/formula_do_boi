import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhatsappSection from "@/components/WhatsappSection";
import SociedadeBulinha from "@/components/SociedadeBulinha";
import SemenDestaque from "@/components/SemenDestaque";
import DoadoresDestaque from "@/components/DoadoresDestaque";
import LeiloesSection from "@/components/LeiloesSection";
import VendaConoscoSection from "@/components/VendaConoscoSection";
import Footer from "@/components/Footer";
import { getProductsServer } from "@/services/products.server";

export default async function Home() {
    const products = await getProductsServer(true);

    return (
        <main className="min-h-screen bg-ink">
            <Header />

            {/* 1 — Hero: video bg + 3 modelos de negócio */}
            <Hero />

            {/* 2 — Grupo Selo Ouro */}
            <WhatsappSection />

            {/* 3 — Sociedade com Bulinha */}
            <SociedadeBulinha />

            {/* 4 — Sêmen Fórmula do Boi */}
            <SemenDestaque products={products} isAuthenticated={true} />

            {/* 5 — Doadoras & Embriões */}
            <DoadoresDestaque products={products} isAuthenticated={true} />

            {/* 6 — Próximos Leilões */}
            <LeiloesSection />

            {/* 7 — Venda Conosco (B2B) */}
            <VendaConoscoSection />

            <Footer />
        </main>
    );
}
