/**
 * Doadoras Nelore Visual — Safra 2026 (5 doadoras VIS)
 *
 * Fonte primária: Catálogo Nelore Visual Embryo (PDF) + EXTRACAO_DOADORAS.md.
 * Genealogia e avaliação genética ABCZ (corte 2026-1) extraídas das fichas
 * técnicas oficiais em /public/{vis4622,VIS 4632,VIS 4634,VIS4817}.pdf
 * (consulta pública individual ABCZ, impressas em 16/05/2026). VIS 4711
 * segue pendente — sem ficha técnica disponível.
 *
 * Comum às 5: Antonio Martins Araújo Neto · Fazenda Visual · Esmeraldas/MG.
 * Pacote: 12 embriões VIT, 4 prenhezes garantidas, 10× sem juros.
 */

export type PedigreeNode = {
    nome: string;
    rg: string;
    pai?: PedigreeNode;
    mae?: PedigreeNode;
};

export type Pedigree = {
    pai: PedigreeNode;
    mae: PedigreeNode;
};

export type AvalRow = {
    label: string;
    code: string;
    unit: string;
    dep: number;
    ac: number;
    deca: number;
    /** null quando a ABCZ imprime "-" (P% não aplicável à característica). */
    pct: number | null;
};

export type Avaliacao = {
    corte: string;
    iabcz: number;
    deca: number;
    pPct: number;
    fPct: number;
    grupos: {
        crescimento: AvalRow[];
        maternas: AvalRow[];
        reprodutivas: AvalRow[];
        acabamento: AvalRow[];
        crescimentoExtra: AvalRow[];
        reprodutivasExtra: AvalRow[];
        carcaca: AvalRow[];
        morfologicas: AvalRow[];
    };
};

export type Doadora = {
    slug: string;
    rgd: string;
    nomeAbcz: string | null;
    /** Touro do acasalamento. `null` quando ainda não definido. */
    cruzamento: string | null;
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
    pedigree?: Pedigree;
    avaliacao?: Avaliacao;
    /** PDF da ficha técnica oficial ABCZ (servido de /public). */
    fichaTecnica?: string;
    /** Quando a doadora tem múltiplas fichas (ANCP/GenePlus/PMGZ), use este array. Sobrepõe `fichaTecnica`. */
    fichasTecnicas?: Array<{ label: string; href: string }>;
    /** Origem da doadora — sobrepõe DOADORAS_CONDICOES quando a doadora não é da Fazenda Visual. */
    origem?: {
        proprietario: string;
        fazenda: string;
        municipio: string;
    };
    /** Label de origem exibida no card do catálogo. Default: "Safra 2026 · Nelore Visual". */
    originLabel?: string;
};

const AVAL_VIS_4622: Avaliacao = {
    corte: "2026-1",
    iabcz: 27.49,
    deca: 1,
    pPct: 0,
    fPct: 2.73,
    grupos: {
        crescimento: [
            { label: "Peso à desmama — efeito direto", code: "PD-ED", unit: "kg", dep: 19.87, ac: 40, deca: 1, pct: 0 },
            { label: "Peso ao ano — efeito direto", code: "PA-ED", unit: "kg", dep: 32.54, ac: 40, deca: 1, pct: 0 },
            { label: "Peso ao sobreano — efeito direto", code: "PS-ED", unit: "kg", dep: 40.66, ac: 41, deca: 1, pct: 0 },
        ],
        maternas: [
            { label: "Peso à fase materna — efeito materno", code: "PM-EM", unit: "kg", dep: 1.74, ac: 29, deca: 3, pct: null },
        ],
        reprodutivas: [
            { label: "Idade ao primeiro parto", code: "IPP", unit: "dias", dep: -14.96, ac: 22, deca: 2, pct: 15 },
            { label: "Stayability", code: "STAY", unit: "%", dep: 42.84, ac: 15, deca: 3, pct: null },
            { label: "Perímetro escrotal aos 365 dias", code: "PE-365", unit: "cm", dep: 2.067, ac: 36, deca: 1, pct: 0 },
        ],
        acabamento: [
            { label: "Área de olho de lombo", code: "AOL", unit: "cm²", dep: 6.696, ac: 36, deca: 1, pct: 0 },
            { label: "Acabamento de carcaça", code: "ACAB", unit: "mm", dep: 1.225, ac: 28, deca: 2, pct: 18 },
        ],
        crescimentoExtra: [
            { label: "Peso ao nascimento — efeito direto", code: "PN-ED", unit: "kg", dep: 1.42, ac: 39, deca: 10, pct: null },
        ],
        reprodutivasExtra: [
            { label: "Precocidade sexual natural", code: "PSN", unit: "%", dep: 51.91, ac: 14, deca: 1, pct: 0 },
        ],
        carcaca: [
            { label: "Marmoreio", code: "MAR", unit: "%", dep: 0.18, ac: 27, deca: 5, pct: null },
        ],
        morfologicas: [
            { label: "Estrutura corporal", code: "E", unit: "", dep: 4.712, ac: 35, deca: 1, pct: 0 },
            { label: "Precocidade", code: "P", unit: "", dep: 2.531, ac: 35, deca: 2, pct: 18 },
            { label: "Musculosidade", code: "M", unit: "", dep: 3.006, ac: 35, deca: 1, pct: 10 },
        ],
    },
};

const AVAL_VIS_4632: Avaliacao = {
    corte: "2026-1",
    iabcz: 30.05,
    deca: 1,
    pPct: 0,
    fPct: 2.73,
    grupos: {
        crescimento: [
            { label: "Peso à desmama — efeito direto", code: "PD-ED", unit: "kg", dep: 21.54, ac: 40, deca: 1, pct: 0 },
            { label: "Peso ao ano — efeito direto", code: "PA-ED", unit: "kg", dep: 33.60, ac: 40, deca: 1, pct: 0 },
            { label: "Peso ao sobreano — efeito direto", code: "PS-ED", unit: "kg", dep: 41.67, ac: 41, deca: 1, pct: 0 },
        ],
        maternas: [
            { label: "Peso à fase materna — efeito materno", code: "PM-EM", unit: "kg", dep: 1.96, ac: 29, deca: 2, pct: 18 },
        ],
        reprodutivas: [
            { label: "Idade ao primeiro parto", code: "IPP", unit: "dias", dep: -19.18, ac: 22, deca: 1, pct: 8 },
            { label: "Stayability", code: "STAY", unit: "%", dep: 48.87, ac: 14, deca: 1, pct: 8 },
            { label: "Perímetro escrotal aos 365 dias", code: "PE-365", unit: "cm", dep: 1.610, ac: 36, deca: 1, pct: 0 },
        ],
        acabamento: [
            { label: "Área de olho de lombo", code: "AOL", unit: "cm²", dep: 5.043, ac: 36, deca: 1, pct: 0 },
            { label: "Acabamento de carcaça", code: "ACAB", unit: "mm", dep: 2.194, ac: 28, deca: 1, pct: 5 },
        ],
        crescimentoExtra: [
            { label: "Peso ao nascimento — efeito direto", code: "PN-ED", unit: "kg", dep: 1.81, ac: 39, deca: 10, pct: null },
        ],
        reprodutivasExtra: [
            { label: "Precocidade sexual natural", code: "PSN", unit: "%", dep: 58.65, ac: 14, deca: 1, pct: 0 },
        ],
        carcaca: [
            { label: "Marmoreio", code: "MAR", unit: "%", dep: 0.03, ac: 26, deca: 5, pct: null },
        ],
        morfologicas: [
            { label: "Estrutura corporal", code: "E", unit: "", dep: 7.343, ac: 35, deca: 1, pct: 0 },
            { label: "Precocidade", code: "P", unit: "", dep: 3.197, ac: 35, deca: 2, pct: 11 },
            { label: "Musculosidade", code: "M", unit: "", dep: 4.439, ac: 35, deca: 1, pct: 2 },
        ],
    },
};

const AVAL_VIS_4634: Avaliacao = {
    corte: "2026-1",
    iabcz: 25.13,
    deca: 1,
    pPct: 1,
    fPct: 1.37,
    grupos: {
        crescimento: [
            { label: "Peso à desmama — efeito direto", code: "PD-ED", unit: "kg", dep: 12.84, ac: 39, deca: 1, pct: 1 },
            { label: "Peso ao ano — efeito direto", code: "PA-ED", unit: "kg", dep: 20.16, ac: 37, deca: 1, pct: 0 },
            { label: "Peso ao sobreano — efeito direto", code: "PS-ED", unit: "kg", dep: 25.68, ac: 39, deca: 1, pct: 0 },
        ],
        maternas: [
            { label: "Peso à fase materna — efeito materno", code: "PM-EM", unit: "kg", dep: 4.37, ac: 31, deca: 1, pct: 2 },
        ],
        reprodutivas: [
            { label: "Idade ao primeiro parto", code: "IPP", unit: "dias", dep: -18.54, ac: 26, deca: 1, pct: 9 },
            { label: "Stayability", code: "STAY", unit: "%", dep: 47.65, ac: 12, deca: 1, pct: 10 },
            { label: "Perímetro escrotal aos 365 dias", code: "PE-365", unit: "cm", dep: 1.511, ac: 35, deca: 1, pct: 0 },
        ],
        acabamento: [
            { label: "Área de olho de lombo", code: "AOL", unit: "cm²", dep: 6.997, ac: 36, deca: 1, pct: 0 },
            { label: "Acabamento de carcaça", code: "ACAB", unit: "mm", dep: 1.807, ac: 30, deca: 1, pct: 9 },
        ],
        crescimentoExtra: [
            { label: "Peso ao nascimento — efeito direto", code: "PN-ED", unit: "kg", dep: 0.85, ac: 37, deca: 10, pct: null },
        ],
        reprodutivasExtra: [
            { label: "Precocidade sexual natural", code: "PSN", unit: "%", dep: 39.20, ac: 15, deca: 2, pct: 13 },
        ],
        carcaca: [
            { label: "Marmoreio", code: "MAR", unit: "%", dep: -0.61, ac: 29, deca: 8, pct: null },
        ],
        morfologicas: [
            { label: "Estrutura corporal", code: "E", unit: "", dep: 2.419, ac: 36, deca: 1, pct: 4 },
            { label: "Precocidade", code: "P", unit: "", dep: 6.659, ac: 36, deca: 1, pct: 0 },
            { label: "Musculosidade", code: "M", unit: "", dep: 4.782, ac: 36, deca: 1, pct: 1 },
        ],
    },
};

const AVAL_VIS_4817: Avaliacao = {
    corte: "2026-1",
    iabcz: 34.28,
    deca: 1,
    pPct: 0,
    fPct: 3.91,
    grupos: {
        crescimento: [
            { label: "Peso à desmama — efeito direto", code: "PD-ED", unit: "kg", dep: 17.97, ac: 37, deca: 1, pct: 0 },
            { label: "Peso ao ano — efeito direto", code: "PA-ED", unit: "kg", dep: 29.31, ac: 37, deca: 1, pct: 0 },
            { label: "Peso ao sobreano — efeito direto", code: "PS-ED", unit: "kg", dep: 36.14, ac: 38, deca: 1, pct: 0 },
        ],
        maternas: [
            { label: "Peso à fase materna — efeito materno", code: "PM-EM", unit: "kg", dep: 2.65, ac: 26, deca: 1, pct: 9 },
        ],
        reprodutivas: [
            { label: "Idade ao primeiro parto", code: "IPP", unit: "dias", dep: -29.13, ac: 19, deca: 1, pct: 1 },
            { label: "Stayability", code: "STAY", unit: "%", dep: 62.89, ac: 12, deca: 1, pct: 0 },
            { label: "Perímetro escrotal aos 365 dias", code: "PE-365", unit: "cm", dep: 1.877, ac: 34, deca: 1, pct: 0 },
        ],
        acabamento: [
            { label: "Área de olho de lombo", code: "AOL", unit: "cm²", dep: 4.371, ac: 35, deca: 1, pct: 0 },
            { label: "Acabamento de carcaça", code: "ACAB", unit: "mm", dep: 3.039, ac: 29, deca: 1, pct: 1 },
        ],
        crescimentoExtra: [
            { label: "Peso ao nascimento — efeito direto", code: "PN-ED", unit: "kg", dep: 0.01, ac: 37, deca: 4, pct: null },
        ],
        reprodutivasExtra: [
            { label: "Precocidade sexual natural", code: "PSN", unit: "%", dep: 52.04, ac: 12, deca: 1, pct: 0 },
        ],
        carcaca: [
            { label: "Marmoreio", code: "MAR", unit: "%", dep: -0.27, ac: 28, deca: 7, pct: null },
        ],
        morfologicas: [
            { label: "Estrutura corporal", code: "E", unit: "", dep: 3.200, ac: 33, deca: 1, pct: 1 },
            { label: "Precocidade", code: "P", unit: "", dep: 7.214, ac: 33, deca: 1, pct: 0 },
            { label: "Musculosidade", code: "M", unit: "", dep: 7.255, ac: 33, deca: 1, pct: 0 },
        ],
    },
};

// VIS 4622 e VIS 4632 são FIV irmãs inteiras (mesmo pai e mãe).
const PEDIGREE_VIS_GURUPI_GODIVA: Pedigree = {
    pai: {
        nome: "GURUPI MAT.",
        rg: "RDMA5492",
        pai: {
            nome: "REM HORUS GENETICA ADITIVA",
            rg: "REMP602",
            pai: { nome: "REM EMBAIXADOR", rg: "REMA149" },
            mae: { nome: "REM EMBOSKADA", rg: "REMC9118" },
        },
        mae: {
            nome: "ENDROMINA MAT.",
            rg: "RDMA3418",
            pai: { nome: "REM DANUT", rg: "REMC8053" },
            mae: { nome: "BARREIRA MAT.", rg: "RDM8994" },
        },
    },
    mae: {
        nome: "GODIVA FIV VISUAL",
        rg: "VIS3218",
        pai: {
            nome: "REM VOKOLO",
            rg: "REM6447",
            pai: { nome: "REM RICKET", rg: "REM4237" },
            mae: { nome: "REM TAKAKA", rg: "REM5009" },
        },
        mae: {
            nome: "VALDERA MAT.",
            rg: "RDM7961",
            pai: { nome: "BACKUP", rg: "AAAP1653" },
            mae: { nome: "PADA MAT.", rg: "RDM4644" },
        },
    },
};

const PEDIGREE_VIS_4634: Pedigree = {
    pai: {
        nome: "ESTORIL MAT.",
        rg: "RDMA3064",
        pai: {
            nome: "QUARUP BONS",
            rg: "BONS3108",
            pai: { nome: "REM VOKOLO", rg: "REM6447" },
            mae: { nome: "MAYA BONS", rg: "BONS2636" },
        },
        mae: {
            nome: "BARAVAH MAT.",
            rg: "RDM9089",
            pai: { nome: "TORNADO MAT.", rg: "RDM7142" },
            mae: { nome: "SAIHA MAT.", rg: "RDM5804" },
        },
    },
    mae: {
        nome: "GULZARA MAT.",
        rg: "RDMA6305",
        pai: {
            nome: "REM HORUS GENETICA ADITIVA",
            rg: "REMP602",
            pai: { nome: "REM EMBAIXADOR", rg: "REMA149" },
            mae: { nome: "REM EMBOSKADA", rg: "REMC9118" },
        },
        mae: {
            nome: "DHANERA MAT.",
            rg: "RDMA1524",
            pai: { nome: "REM ARMADOR", rg: "REMC5326" },
            mae: { nome: "PEDRITA MAT.", rg: "RDM4817" },
        },
    },
};

const PEDIGREE_VIS_4817: Pedigree = {
    pai: {
        nome: "REM1416L FIV GENETICA ADITIVA",
        rg: "REMP1416",
        pai: {
            nome: "REM GRINGO GENETICA ADITIVA",
            rg: "REMA2239",
            pai: { nome: "REM DITADO", rg: "REM9852" },
            mae: { nome: "REM DAKITAH", rg: "REMC8331" },
        },
        mae: {
            nome: "REM GUAIAMA",
            rg: "REMA2369",
            pai: { nome: "REM ARMADOR", rg: "REMC5326" },
            mae: { nome: "REM DHYVHA", rg: "REM9441" },
        },
    },
    mae: {
        nome: "A2852 MAT.",
        rg: "RDMA2852",
        pai: {
            nome: "QUARUP BONS",
            rg: "BONS3108",
            pai: { nome: "REM VOKOLO", rg: "REM6447" },
            mae: { nome: "MAYA BONS", rg: "BONS2636" },
        },
        mae: {
            nome: "ARANDELA MAT.",
            rg: "RDM8362",
            pai: { nome: "REM TORIXOREU", rg: "REMC3462" },
            mae: { nome: "SABHA MAT.", rg: "RDM5824" },
        },
    },
};

/* ──────────────────────────────────────────────────────────────
 * FCCH 3955 — Cachoeirão (José Rodrigues Pereira, Bandeirantes-MS)
 * Fontes: ANCP (1ª AG ABR/2026), GenePlus (Abril/2026), PMGZ 2026-2.
 * Genealogia 3 gerações extraída da PMGZ ABCZ (genômica).
 * ────────────────────────────────────────────────────────────── */
const AVAL_FCCH_3955: Avaliacao = {
    corte: "2026-2",
    iabcz: 33.44,
    deca: 1,
    pPct: 0.1,
    fPct: 0.98,
    grupos: {
        crescimento: [
            { label: "Peso à desmama — efeito direto", code: "PD-EDg", unit: "kg", dep: 15.27, ac: 41, deca: 1, pct: 0.1 },
            { label: "Peso ao ano — efeito direto", code: "PA-EDg", unit: "kg", dep: 25.99, ac: 40, deca: 1, pct: 0.1 },
            { label: "Peso ao sobreano — efeito direto", code: "PS-EDg", unit: "kg", dep: 33.83, ac: 41, deca: 1, pct: 0.1 },
        ],
        maternas: [
            { label: "Peso à fase materna — efeito materno", code: "PM-EMg", unit: "kg", dep: 1.72, ac: 30, deca: 3, pct: null },
        ],
        reprodutivas: [
            { label: "Idade ao primeiro parto", code: "IPPg", unit: "dias", dep: -40.89, ac: 23, deca: 1, pct: 0.1 },
            { label: "Stayability", code: "STAYg", unit: "%", dep: 64.89, ac: 15, deca: 1, pct: 0.5 },
            { label: "Perímetro escrotal aos 365 dias", code: "PE-365g", unit: "cm", dep: 1.409, ac: 37, deca: 1, pct: 0.5 },
        ],
        acabamento: [
            { label: "Área de olho de lombo", code: "AOLg", unit: "cm²", dep: 4.774, ac: 37, deca: 1, pct: 0.5 },
            { label: "Acabamento de carcaça", code: "ACABg", unit: "mm", dep: 2.725, ac: 29, deca: 1, pct: 2 },
        ],
        crescimentoExtra: [
            { label: "Peso ao nascimento — efeito direto", code: "PN-EDg", unit: "kg", dep: 0.14, ac: 41, deca: 6, pct: null },
        ],
        reprodutivasExtra: [
            { label: "Precocidade sexual natural", code: "PSNg", unit: "%", dep: 53.56, ac: 17, deca: 1, pct: 0.5 },
        ],
        carcaca: [
            { label: "Marmoreio", code: "MARg", unit: "%", dep: 1.85, ac: 28, deca: 1, pct: 0.1 },
        ],
        morfologicas: [
            { label: "Estrutura corporal", code: "Eg", unit: "", dep: 1.838, ac: 36, deca: 1, pct: null },
            { label: "Precocidade", code: "Pg", unit: "", dep: 7.588, ac: 36, deca: 1, pct: 0.5 },
            { label: "Musculosidade", code: "Mg", unit: "", dep: 5.830, ac: 36, deca: 1, pct: null },
        ],
    },
};

const PEDIGREE_FCCH_3955: Pedigree = {
    pai: {
        nome: "CASANOVA BONS",
        rg: "BONS4404",
        pai: { nome: "QUARUP BONS", rg: "BONS3108" },
        mae: { nome: "TAPIRANA BONS", rg: "BONN2668" },
    },
    mae: {
        nome: "3027 FC CACHOEIRAO",
        rg: "FCCH3027",
        pai: { nome: "REM HERMOSO FIV GENETICA ADITIVA", rg: "REMP816" },
        mae: { nome: "FCCH 1002", rg: "FCCH1002" },
    },
};

export const DOADORAS: Doadora[] = [
    {
        slug: "fcch-3955",
        rgd: "FCCH 3955",
        nomeAbcz: "3955 FIV FC CACHOEIRAO",
        cruzamento: null,
        classificacaoTop: "TOP 0,1%",
        iabcz: { valor: 33.44, percentil: "P 0,1%" },
        iqg: { valor: 37.86, top: "TOP 0,5%" },
        mgte: { valor: 28.65, top: "TOP 4%" },
        precoEmbriao: 1100,
        pacoteTotal: 13200,
        quantidadeEmbrioes: 12,
        nascimento: "15/07/2025",
        idAbcz: null,
        foto: null,
        video: "https://res.cloudinary.com/dny0ibgbn/video/upload/v1779738203/LOTE_09_-_FCCH_3955_1_1_wlfdau.mp4",
        pendencias: ["Foto oficial em alta resolução"],
        pedigree: PEDIGREE_FCCH_3955,
        avaliacao: AVAL_FCCH_3955,
        fichasTecnicas: [
            { label: "PMGZ · ABCZ — iABCZg 33,44 · DECA 1", href: "/FCCH-3955-PMGZ.pdf" },
            { label: "GenePlus · Embrapa — IQGg 37,86 · Classe E", href: "/FCCH-3955-GENEPLUS.pdf" },
            { label: "ANCP — MGTe 28,65 · TOP 4%", href: "/FCCH-3955-ANCP.pdf" },
        ],
        origem: {
            proprietario: "José Rodrigues Pereira",
            fazenda: "Fazenda Cachoeirão",
            municipio: "Bandeirantes/MS",
        },
        originLabel: "Cachoeirão · Nelore PO",
    },
    {
        slug: "vis-4622",
        rgd: "VIS 4622",
        nomeAbcz: "MILA FIV VISUAL",
        cruzamento: "REM CH LIDER",
        classificacaoTop: "TOP 0,1%",
        iabcz: { valor: 27.49, percentil: "DECA 1" },
        iqg: { valor: 33.29, top: "TOP 1%" },
        mgte: { valor: 31.83, top: "TOP 0,5%" },
        precoEmbriao: 1100,
        pacoteTotal: 13200,
        quantidadeEmbrioes: 12,
        nascimento: "22/06/2024",
        idAbcz: "21034225",
        foto: null,
        video: "https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177233/vis4622_lg0dc2.mp4",
        pendencias: ["Foto oficial em alta resolução"],
        pedigree: PEDIGREE_VIS_GURUPI_GODIVA,
        avaliacao: AVAL_VIS_4622,
        fichaTecnica: "/vis4622.pdf",
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
            "Avaliação genética ABCZ detalhada",
            "Foto oficial em alta resolução",
        ],
    },
    {
        slug: "vis-4817",
        rgd: "VIS 4817",
        nomeAbcz: "NEVOA FIV VISUAL",
        cruzamento: "GANADEIRO EAO",
        classificacaoTop: "TOP 0,5%",
        iabcz: { valor: 34.28, percentil: "DECA 1" },
        iqg: { valor: 45.25, top: "TOP 0,1%" },
        mgte: { valor: 31.83, top: "TOP 0,5%" },
        precoEmbriao: 900,
        pacoteTotal: 10800,
        quantidadeEmbrioes: 12,
        nascimento: "08/10/2024",
        idAbcz: null,
        foto: null,
        video: "https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177432/vis4817_abo2in.mp4",
        pendencias: ["Foto oficial em alta resolução"],
        pedigree: PEDIGREE_VIS_4817,
        avaliacao: AVAL_VIS_4817,
        fichaTecnica: "/VIS4817.pdf",
    },
    {
        slug: "vis-4632",
        rgd: "VIS 4632",
        nomeAbcz: "MINEIRA FIV VISUAL",
        cruzamento: "REM NOCAUTE",
        classificacaoTop: "TOP 1%",
        iabcz: { valor: 30.05, percentil: "DECA 1" },
        iqg: { valor: 38.19, top: "TOP 0,5%" },
        mgte: { valor: 33.02, top: "TOP 0,5%" },
        precoEmbriao: 650,
        pacoteTotal: 7800,
        quantidadeEmbrioes: 12,
        nascimento: "29/06/2024",
        idAbcz: null,
        foto: null,
        video: "https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177460/vis4632_bsphoi.mp4",
        pendencias: ["Foto oficial em alta resolução"],
        pedigree: PEDIGREE_VIS_GURUPI_GODIVA,
        avaliacao: AVAL_VIS_4632,
        fichaTecnica: "/VIS%204632.pdf",
    },
    {
        slug: "vis-4634",
        rgd: "VIS 4634",
        nomeAbcz: "MINERVA VISUAL",
        cruzamento: "IVANOV ARZ",
        classificacaoTop: "TOP 2%",
        iabcz: { valor: 25.13, percentil: "DECA 1" },
        iqg: { valor: 38.85, top: "TOP 0,5%" },
        mgte: { valor: 32.41, top: "TOP 0,5%" },
        precoEmbriao: 650,
        pacoteTotal: 7800,
        quantidadeEmbrioes: 12,
        nascimento: "02/07/2024",
        idAbcz: null,
        foto: null,
        video: "https://res.cloudinary.com/dny0ibgbn/video/upload/v1778177484/vis4634_wxd4ms.mp4",
        pendencias: ["Foto oficial em alta resolução"],
        pedigree: PEDIGREE_VIS_4634,
        avaliacao: AVAL_VIS_4634,
        fichaTecnica: "/VIS%204634.pdf",
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
