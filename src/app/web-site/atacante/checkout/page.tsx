import type { Metadata } from "next";
import AtacanteCheckout from "./AtacanteCheckout";

export const metadata: Metadata = {
    title: "Reserva — Atacante da Matinha · Fórmula do Boi",
    description: "Reserve doses do Atacante da Matinha (RDM B 3224 MAT., MGTe 42,38 TOP 0,1%). Touro Jovem Nelore PO · Lançamento Aceleradora 2026.",
    robots: { index: false, follow: true },
};

export default function AtacanteCheckoutPage() {
    return <AtacanteCheckout />;
}
