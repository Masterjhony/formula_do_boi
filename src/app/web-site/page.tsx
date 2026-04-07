import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SemenDestaque from "@/components/SemenDestaque";
import DoadoresDestaque from "@/components/DoadoresDestaque";
import LeiloesSection from "@/components/LeiloesSection";
import WhatsappSection from "@/components/WhatsappSection";
import Footer from "@/components/Footer";
import { getProductsServer } from "@/services/products.server";

export default async function Home() {
    const products = await getProductsServer(true);

    return (
        <main className="min-h-screen bg-[#0a0a0a]">
            <Header />

            {/* 1 — Hero: video bg + 3 modelos de negócio */}
            <Hero />

            {/* 2 — Sêmen Fórmula do Boi */}
            <SemenDestaque products={products} isAuthenticated={true} />

            {/* 3 — Doadoras & Embriões */}
            <DoadoresDestaque products={products} isAuthenticated={true} />

            {/* 4 — Leilões de P.O. */}
            <LeiloesSection />

            {/* 5 — Grupo de WhatsApp */}
            <WhatsappSection />

            <Footer />
        </main>
    );
}
