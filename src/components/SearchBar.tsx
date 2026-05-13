"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X } from "lucide-react";
import SearchDropdown, { type SearchItem } from "./SearchDropdown";
import { getProductsClient, type Product } from "@/services/products";
import { EMBRYOS } from "@/data/embryos";
import { DOADORAS } from "@/data/doadoras";

interface SearchBarProps {
    className?: string;
    placeholder?: string;
    onSearch?: (term: string) => void;
}

type Leilao = {
    id: string;
    nome: string;
    data: string;
    tipo: string | null;
    img: string | null;
    leiloeira: string | null;
    criador: string | null;
};

type SearchProduct = Pick<Product, "id" | "name" | "category" | "image" | "location" | "tag"> & {
    classificacao?: string;
    registro?: string;
    details?: { registro?: string } | null;
};

function isEmbriaoLike(p: SearchProduct) {
    const cat = p.category || "";
    const type = p.classificacao || "";
    return (cat.includes("Embrião") || cat === "DOADORA" || type === "embriao") && !cat.includes("Sêmen");
}

function isSemen(p: SearchProduct) {
    return p.category === "Sêmen";
}

function productHref(p: SearchProduct): string {
    if (isSemen(p)) return "/semen";
    return "/embrioes";
}

function fmtData(iso: string) {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

export default function SearchBar({ className = "", placeholder = "O que você está procurando?" }: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<SearchProduct[]>([]);
    const [leiloes, setLeiloes] = useState<Leilao[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            const [dbProducts, leiloesRes] = await Promise.all([
                getProductsClient(),
                fetch("/api/site/leiloes-publicos", { cache: "no-store" })
                    .then((r) => (r.ok ? r.json() : { leiloes: [] }))
                    .catch(() => ({ leiloes: [] })),
            ]);

            const dbIds = new Set(dbProducts.map((p) => p.id));
            const staticEmbryos = (EMBRYOS as unknown as SearchProduct[]).filter((e) => !dbIds.has(e.id));
            const visRegistros = new Set(DOADORAS.map((d) => d.rgd));

            const scoped = [...(dbProducts as SearchProduct[]), ...staticEmbryos]
                .filter((p) => isSemen(p) || isEmbriaoLike(p))
                .filter((p) => {
                    const reg = p.registro ?? p.details?.registro ?? "";
                    return p.tag !== "SAFRA_VIS_2026" && !visRegistros.has(reg);
                });

            setProducts(scoped);
            setLeiloes((leiloesRes?.leiloes as Leilao[]) ?? []);
        };

        fetchData();
    }, []);

    const doadoraItems = useMemo(() => {
        return DOADORAS.map((d) => ({
            kind: "product" as const,
            id: `doadora-${d.slug}`,
            name: `${d.nomeAbcz ?? d.rgd} — Pacote ${d.quantidadeEmbrioes} Embriões`,
            category: "Embrião FIV",
            image: d.foto ?? "/cattle/vaca_embrioes_og.webp",
            location: "Esmeraldas - MG",
            href: `/embrioes/${d.slug}`,
            haystack: [d.rgd, d.nomeAbcz ?? "", d.cruzamento, d.classificacaoTop, "embriao", "embrião", "doadora"].join(" ").toLowerCase(),
        }));
    }, []);

    const searchResults = useMemo<SearchItem[]>(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return [];

        const productHits: SearchItem[] = products
            .filter((p) => {
                return (
                    (p.name || "").toLowerCase().includes(term) ||
                    (p.category || "").toLowerCase().includes(term) ||
                    (p.details?.registro || "").toLowerCase().includes(term) ||
                    (p.registro || "").toLowerCase().includes(term)
                );
            })
            .map((p) => ({
                kind: "product" as const,
                id: `product-${p.id}`,
                name: p.name,
                category: p.category,
                image: p.image,
                location: p.location ?? "",
                href: productHref(p),
                haystack: "",
            }));

        const doadoraHits = doadoraItems.filter((d) => d.haystack.includes(term));

        const leilaoHits: SearchItem[] = leiloes
            .filter((l) => {
                return (
                    l.nome.toLowerCase().includes(term) ||
                    (l.tipo || "").toLowerCase().includes(term) ||
                    (l.criador || "").toLowerCase().includes(term) ||
                    (l.leiloeira || "").toLowerCase().includes(term)
                );
            })
            .map((l) => ({
                kind: "leilao" as const,
                id: `leilao-${l.id}`,
                name: l.nome,
                subtitle: [l.tipo, l.criador, fmtData(l.data)].filter(Boolean).join(" · "),
                image: l.img,
                href: "/agenda",
            }));

        return [...leilaoHits.slice(0, 4), ...productHits.slice(0, 4), ...doadoraHits.slice(0, 4)].slice(0, 8);
    }, [searchTerm, products, leiloes, doadoraItems]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const clearSearch = () => {
        setSearchTerm("");
    };

    return (
        <div ref={containerRef} className={`relative w-full group ${className}`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-brand-gold/20 p-1.5 rounded-full z-10 pointer-events-none">
                <Search className="w-4 h-4 text-brand-gold" />
            </div>
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                className="w-full pl-14 pr-10 py-3 bg-white/5 border-2 border-brand-gold/30 rounded-full focus:outline-none focus:border-brand-gold focus:bg-white/10 transition-all text-sm text-white placeholder:text-gray-400"
            />

            {searchTerm && (
                <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}

            {isFocused && (searchTerm.trim().length > 0) && (
                <SearchDropdown results={searchResults} onClose={() => setIsFocused(false)} />
            )}
        </div>
    );
}
