/**
 * Doadoras Nelore Visual — Safra 2026 (5 doadoras VIS)
 *
 * Fonte primária: Catálogo Nelore Visual Embryo (PDF) + EXTRACAO_DOADORAS.md.
 * Genealogia / DEPs detalhados / nomes ABCZ pendentes para 4/5 doadoras —
 * bloqueados por reCAPTCHA da consulta pública ABCZ na extração inicial.
 * Onde houver lacuna, o campo é null e a UI renderiza "⚠ a confirmar".
 *
 * Comum às 5: Antonio Martins Araújo Neto · Fazenda Visual · Esmeraldas/MG.
 * Pacote: 12 embriões VIT, 4 prenhezes garantidas, 10× sem juros.
 */

export type Doadora = {
    slug: string;
    rgd: string;
    nomeAbcz: string | null;
    cruzamento: string;
    classificacaoTop: string;
    iabcz: { valor: number; percentil: string };
    iqg: { valor: number; top: string };
    mgte: { valor: number; top: string };
    precoEmbriao: number;
    pacoteTotal: number;
    quantidadeEmbrioes: number;
    nascimento: string | null;
    idAbcz: string | null;
    foto: string | null;
    video: string | null;
    pendencias: string[];
};

export const DOADORAS: Doadora[] = [
    {
        slug: "vis-4622",
        rgd: "VIS 4622",
        nomeAbcz: "MILA FIV VISUAL",
        cruzamento: "REM CH LIDER",
        classificacaoTop: "TOP 0,1%",
        iabcz: { valor: 26.78, percentil: "P 0,5%" },
        iqg: { valor: 33.29, top: "TOP 1%" },
        mgte: { valor: 31.83, top: "TOP 0,5%" },
        precoEmbriao: 1100,
        pacoteTotal: 13200,
        quantidadeEmbrioes: 12,
        nascimento: "22/06/2024",
        idAbcz: "21034225",
        foto: null,
        video: null,
        pendencias: [
            "Pais (RGN/nome) e 4 avós",
            "Reprodução: filhos, partos, IPP, IDUP",
            "DEPs detalhados: PD-ED, PA-ED, PS-ED, AOL, ACAB, PN-ED, MAR",
            "Foto oficial em alta resolução",
        ],
    },
    {
        slug: "vis-4711",
        rgd: "VIS 4711",
        nomeAbcz: null,
        cruzamento: "REM NOCAUTE",
        classificacaoTop: "TOP 0,1%",
        iabcz: { valor: 36.51, percentil: "P 0,1%" },
        iqg: { valor: 43.62, top: "TOP 0,1%" },
        mgte: { valor: 33.33, top: "TOP 0,5%" },
        precoEmbriao: 1100,
        pacoteTotal: 13200,
        quantidadeEmbrioes: 12,
        nascimento: null,
        idAbcz: null,
        foto: null,
        video: null,
        pendencias: [
            "Nome ABCZ",
            "Data de nascimento e ID ABCZ",
            "Genealogia 3 gerações",
            "Reprodução e DEPs detalhados",
            "Foto oficial em alta resolução",
        ],
    },
    {
        slug: "vis-4817",
        rgd: "VIS 4817",
        nomeAbcz: null,
        cruzamento: "GANADEIRO EAO",
        classificacaoTop: "TOP 0,5%",
        iabcz: { valor: 36.76, percentil: "P 0,1%" },
        iqg: { valor: 45.25, top: "TOP 0,1%" },
        mgte: { valor: 31.83, top: "TOP 0,5%" },
        precoEmbriao: 900,
        pacoteTotal: 10800,
        quantidadeEmbrioes: 12,
        nascimento: null,
        idAbcz: null,
        foto: null,
        video: null,
        pendencias: [
            "Nome ABCZ",
            "Data de nascimento e ID ABCZ",
            "Genealogia 3 gerações",
            "Reprodução e DEPs detalhados",
            "Foto oficial em alta resolução",
        ],
    },
    {
        slug: "vis-4632",
        rgd: "VIS 4632",
        nomeAbcz: null,
        cruzamento: "REM NOCAUTE",
        classificacaoTop: "TOP 1%",
        iabcz: { valor: 32.61, percentil: "P 0,1%" },
        iqg: { valor: 38.19, top: "TOP 0,5%" },
        mgte: { valor: 33.02, top: "TOP 0,5%" },
        precoEmbriao: 650,
        pacoteTotal: 7800,
        quantidadeEmbrioes: 12,
        nascimento: null,
        idAbcz: null,
        foto: null,
        video: null,
        pendencias: [
            "Nome ABCZ",
            "Data de nascimento e ID ABCZ",
            "Genealogia 3 gerações",
            "Reprodução e DEPs detalhados",
            "Foto oficial em alta resolução",
        ],
    },
    {
        slug: "vis-4634",
        rgd: "VIS 4634",
        nomeAbcz: null,
        cruzamento: "IVANOV ARZ",
        classificacaoTop: "TOP 2%",
        iabcz: { valor: 31.31, percentil: "P 0,1%" },
        iqg: { valor: 38.85, top: "TOP 0,5%" },
        mgte: { valor: 32.41, top: "TOP 0,5%" },
        precoEmbriao: 650,
        pacoteTotal: 7800,
        quantidadeEmbrioes: 12,
        nascimento: null,
        idAbcz: null,
        foto: null,
        video: null,
        pendencias: [
            "Nome ABCZ",
            "Data de nascimento e ID ABCZ",
            "Genealogia 3 gerações",
            "Reprodução e DEPs detalhados",
            "Foto oficial em alta resolução",
        ],
    },
];

export const DOADORAS_CONDICOES = {
    proprietario: "Antonio Martins Araújo Neto",
    fazenda: "Fazenda Visual",
    municipio: "Esmeraldas/MG",
    raca: "Nelore PO Fêmea",
    tipoEmbriao: "VIT (vitrificado)",
    pacoteMinimo: 12,
    prenhezesGarantidas: 4,
    parcelamento: "10× sem juros (1 entrada + 9 parcelas)",
    laboratorio: "Gene Embriões — rastreabilidade completa",
    avaliacoesGeneticas: ["PMGZ jan/26", "GenePlus out/25", "ANCP dez/25"],
    argumentos: [
        "Rusticidade comprovada (35+ anos de seleção a pasto)",
        "Habilidade materna elevada",
        "Precocidade sexual e produtiva",
        "Padronização funcional (uniformidade morfológica)",
    ],
};

export function getDoadora(slug: string): Doadora | undefined {
    return DOADORAS.find((d) => d.slug === slug);
}
