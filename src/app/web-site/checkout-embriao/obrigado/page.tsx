import type { Metadata } from "next";
import ObrigadoClient from "./ObrigadoClient";

export const metadata: Metadata = {
    title: "Pré-reserva recebida — Fórmula do Boi",
    description: "Sua pré-reserva foi registrada. Um assessor entrará em contato em breve.",
    robots: { index: false, follow: false },
};

export default function ObrigadoPage() {
    return <ObrigadoClient />;
}
