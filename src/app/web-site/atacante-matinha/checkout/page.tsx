import type { Metadata } from "next";
import CheckoutAtacanteClient from "./CheckoutAtacanteClient";

export const metadata: Metadata = {
    title: "Pré-reserva · Atacante da Matinha — Fórmula do Boi",
    description:
        "Solicite a pré-reserva de sêmen do Atacante da Matinha — touro Nelore PO, MGTe 42,38, TOP 0,1% da raça. Aceleradora 2026.",
    robots: { index: false, follow: false },
};

export default function CheckoutAtacantePage() {
    return <CheckoutAtacanteClient />;
}
