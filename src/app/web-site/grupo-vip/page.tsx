import type { Metadata } from "next";
import GrupoVipClient from "./GrupoVipClient";

export const metadata: Metadata = {
    title: "Grupo VIP — Curadoria Fórmula do Boi",
    description:
        "Candidate-se ao grupo VIP da Fórmula do Boi. Acesso antecipado a sêmen top 0,1%, embriões FIV, leilões com curadoria Bula × FdB. Vagas limitadas.",
    openGraph: {
        title: "Grupo VIP — Curadoria Fórmula do Boi",
        description:
            "Acesso antecipado a sêmen, embriões e leilões com curadoria FdB × Bula. Vagas limitadas.",
        type: "website",
        locale: "pt_BR",
    },
    robots: { index: true, follow: true },
};

export default function GrupoVipPage() {
    return <GrupoVipClient />;
}
