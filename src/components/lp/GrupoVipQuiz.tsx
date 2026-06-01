"use client";

import { useEffect, useMemo, useState } from "react";
import { trackEvent, identifyLead } from "@/lib/posthog-client";

const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const INK = "#0A0A0A";
const INK_2 = "#141414";
const INK_3 = "#1E1E1E";
const FG = "#F5F0E4";
const FG_MUTED_70 = "rgba(245,240,228,0.70)";
const FG_MUTED_55 = "rgba(245,240,228,0.55)";
const LINE = "rgba(212,168,92,0.14)";
const LINE_STRONG = "rgba(212,168,92,0.28)";
const DANGER = "#E74C3C";
const TECH_GREEN = "#7FD4A0";

const UFs: { value: string; label: string }[] = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
];

const MOMENTO_OPTIONS = [
    {
        value: "nao-trabalho-quero-aprender",
        label: "Não trabalho com pecuária mas quero aprender",
    },
    { value: "pecuaria-de-corte", label: "Trabalho com pecuária de corte" },
    { value: "corte-e-po", label: "Trabalho com corte e P.O." },
    { value: "criador-renomado-po", label: "Já sou criador renomado de P.O." },
];

const CABECAS_OPTIONS = [
    { value: "nenhuma", label: "Nenhuma" },
    { value: "0-50", label: "0–50" },
    { value: "50-100", label: "50–100" },
    { value: "100-300", label: "100–300" },
    { value: "300-500", label: "300–500" },
    { value: "500+", label: "500+" },
];

const INTERESSE_OPTIONS = [
    { value: "embrioes", label: "Embriões" },
    { value: "semen", label: "Sêmen" },
    { value: "touros-po", label: "Touros P.O" },
    { value: "matrizes-po", label: "Matrizes P.O" },
    { value: "bezerras-po", label: "Bezerras P.O" },
    { value: "nao-sei", label: "Não sei ainda" },
];

const MQL_QCABECAS = new Set(["100-300", "300-500", "500+"]);

type Attribution = {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    gclid?: string;
    fbclid?: string;
    referrer?: string | null;
    landing_url?: string | null;
    ts?: number;
};

function captureAttribution() {
    if (typeof window === "undefined") return;
    try {
        const KEY = "lp_attribution";
        const url = new URL(window.location.href);
        const utmKeys = [
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "utm_content",
            "utm_term",
            "gclid",
            "fbclid",
        ];
        const fromUrl: Record<string, string> = {};
        for (const k of utmKeys) {
            const v = url.searchParams.get(k);
            if (v) fromUrl[k] = v;
        }
        let existing: Attribution = {};
        try {
            existing = JSON.parse(sessionStorage.getItem(KEY) || "{}");
        } catch {
            existing = {};
        }
        const merged: Attribution =
            Object.keys(fromUrl).length > 0
                ? {
                    ...fromUrl,
                    referrer: document.referrer || null,
                    landing_url: window.location.href,
                    ts: existing.ts || Date.now(),
                }
                : Object.keys(existing).length > 0
                    ? existing
                    : {
                        referrer: document.referrer || null,
                        landing_url: window.location.href,
                        ts: Date.now(),
                    };
        sessionStorage.setItem(KEY, JSON.stringify(merged));
    } catch {
        // sessionStorage indisponível — segue silencioso
    }
}

function readAttribution(): Attribution {
    if (typeof window === "undefined") return {};
    try {
        return JSON.parse(sessionStorage.getItem("lp_attribution") || "{}");
    } catch {
        return {};
    }
}

function maskPhone(v: string): string {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    if (digits.length > 6) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length > 2) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length) return `(${digits}`;
    return "";
}

type Errors = Partial<Record<
    "nome" | "email" | "tel" | "uf" | "cidade" | "momento" | "cabecas" | "interesse",
    string
>>;

export default function GrupoVipQuiz({ waGroupLink }: { waGroupLink: string }) {
    const [step, setStep] = useState<1 | 2 | 3 | "done">(1);
    const [submitting, setSubmitting] = useState(false);

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [tel, setTel] = useState("");
    const [uf, setUf] = useState("");
    const [cidade, setCidade] = useState("");
    const [cidades, setCidades] = useState<string[]>([]);
    const [loadingCidades, setLoadingCidades] = useState(false);
    const [momento, setMomento] = useState("");
    const [cabecas, setCabecas] = useState("");
    const [interesse, setInteresse] = useState("");

    const [errors, setErrors] = useState<Errors>({});

    // Capture attribution on mount
    useEffect(() => {
        captureAttribution();
    }, []);

    // Load cities when UF changes. Loading flag and cidades/cidade reset
    // are handled in handleUfChange below to keep this effect free of
    // synchronous setState calls (react-hooks/set-state-in-effect).
    useEffect(() => {
        if (!uf) return;
        let cancelled = false;
        fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
        )
            .then((r) => r.json())
            .then((data: Array<{ nome: string }>) => {
                if (cancelled) return;
                setCidades(data.map((c) => c.nome));
            })
            .catch(() => {
                if (cancelled) return;
                setCidades([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingCidades(false);
            });
        return () => {
            cancelled = true;
        };
    }, [uf]);

    function handleUfChange(next: string) {
        setUf(next);
        setCidade("");
        setCidades([]);
        setLoadingCidades(!!next);
    }

    const progressPct = useMemo(() => {
        if (step === "done") return 100;
        return { 1: 33, 2: 66, 3: 90 }[step];
    }, [step]);

    function validateStep1(): boolean {
        const e: Errors = {};
        if (!nome.trim() || nome.trim().length < 3)
            e.nome = "Preencha seu nome completo (mín. 3 caracteres).";
        if (!email.trim() || !email.includes("@") || !email.includes("."))
            e.email = "Informe um e-mail válido.";
        if (!tel.trim() || tel.replace(/\D/g, "").length < 10)
            e.tel = "Informe seu WhatsApp (mín. 10 dígitos).";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function validateStep2(): boolean {
        const e: Errors = {};
        if (!uf) e.uf = "Selecione seu estado.";
        if (!cidade) e.cidade = "Selecione sua cidade.";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function validateStep3(): boolean {
        const e: Errors = {};
        if (!momento) e.momento = "Selecione seu momento na pecuária.";
        if (!cabecas) e.cabecas = "Selecione a quantidade de cabeças.";
        if (!interesse) e.interesse = "Selecione seu interesse.";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function goNext() {
        if (step === 1 && validateStep1()) {
            setErrors({});
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setErrors({});
            setStep(3);
        }
    }
    function goBack() {
        if (step === 2) setStep(1);
        else if (step === 3) setStep(2);
    }

    async function submit() {
        if (!validateStep3()) return;
        setSubmitting(true);

        const attr = readAttribution();
        const lead = {
            nome: nome.trim(),
            email: email.trim(),
            tel: tel.trim(),
            uf,
            cidade,
            momento_pecuaria: momento,
            quantidade_cabecas: cabecas,
            // Envia o rótulo legível ("Touros P.O") — vai pra coluna `interesse`
            // do CRM, lida por humanos na tela de Qualificação.
            interesse: INTERESSE_OPTIONS.find((o) => o.value === interesse)?.label || interesse,
            utm_source: attr.utm_source || null,
            utm_medium: attr.utm_medium || null,
            utm_campaign: attr.utm_campaign || null,
            utm_content: attr.utm_content || null,
            utm_term: attr.utm_term || null,
            gclid: attr.gclid || null,
            fbclid: attr.fbclid || null,
            referrer: attr.referrer || null,
            landing_url: attr.landing_url || null,
        };

        try {
            await fetch("/api/lp/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(lead),
            });
        } catch (err) {
            // não-crítico — o redirect deve acontecer mesmo se a chamada falhar
            console.warn("Falha ao enviar lead (não-crítico):", err);
        }

        const isMql = MQL_QCABECAS.has(lead.quantidade_cabecas);

        // PostHog — identifica o lead pelo telefone (mesma chave do CRM) e marca conversão
        if (lead.tel) {
            identifyLead(lead.tel, {
                email: lead.email,
                name: lead.nome,
                uf: lead.uf,
                cidade: lead.cidade,
                momento_pecuaria: lead.momento_pecuaria,
                quantidade_cabecas: lead.quantidade_cabecas,
                interesse: lead.interesse,
                utm_source: lead.utm_source,
                utm_medium: lead.utm_medium,
                utm_campaign: lead.utm_campaign,
            });
        }
        trackEvent('lp_form_submit', {
            mql: isMql,
            quantidade_cabecas: lead.quantidade_cabecas,
            interesse: lead.interesse,
            uf: lead.uf,
            momento_pecuaria: lead.momento_pecuaria,
            utm_source: lead.utm_source,
            utm_campaign: lead.utm_campaign,
        });

        const basePath = window.location.pathname.replace(/\/+$/, "");
        const isUnderGrupoVip =
            basePath === "/grupo-vip" || basePath.startsWith("/grupo-vip/");
        const dest = isMql
            ? isUnderGrupoVip
                ? "/grupo-vip/obrigado-mql"
                : "/obrigado-mql"
            : isUnderGrupoVip
                ? "/grupo-vip/obrigado"
                : "/obrigado";
        window.location.href = dest;
    }

    return (
        <div
            className="mx-auto"
            style={{
                background: INK_2,
                border: `1px solid ${LINE}`,
                borderRadius: 4,
                overflow: "hidden",
                maxWidth: 680,
            }}
        >
            {/* Progress */}
            <div
                style={{
                    height: 3,
                    background: INK_3,
                    position: "relative",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${progressPct}%`,
                        background: `linear-gradient(90deg, ${BRONZE} 0%, ${BRONZE_LIGHT} 100%)`,
                        transition: "width .45s ease",
                    }}
                />
            </div>

            <div style={{ padding: "40px clamp(20px, 4vw, 48px)" }}>
                {step !== "done" && (
                    <div
                        className="font-mono"
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            letterSpacing: "0.24em",
                            textTransform: "uppercase",
                            color: BRONZE_LIGHT,
                            fontWeight: 500,
                            marginBottom: 14,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <span
                            style={{
                                width: 22,
                                height: 1,
                                background: BRONZE,
                                display: "inline-block",
                            }}
                        />
                        Passo {step} de 3
                    </div>
                )}

                {step === 1 && (
                    <>
                        <StepTitle>
                            Seus{" "}
                            <span style={{ color: BRONZE_LIGHT }}>
                                dados de contato
                            </span>
                        </StepTitle>
                        <StepSub>
                            Preencha para receber o acesso ao grupo e conteúdos
                            exclusivos.
                        </StepSub>

                        <FormField
                            label="Nome completo *"
                            error={errors.nome}
                        >
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Seu nome completo"
                                style={inputStyle(!!errors.nome)}
                            />
                        </FormField>

                        <FormField
                            label="E-mail *"
                            error={errors.email}
                        >
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                style={inputStyle(!!errors.email)}
                            />
                        </FormField>

                        <FormField
                            label="WhatsApp *"
                            error={errors.tel}
                            hint="Usaremos para enviar o link do grupo"
                        >
                            <input
                                type="tel"
                                inputMode="tel"
                                value={tel}
                                onChange={(e) =>
                                    setTel(maskPhone(e.target.value))
                                }
                                placeholder="(31) 99999-9999"
                                style={inputStyle(!!errors.tel)}
                            />
                        </FormField>

                        <Nav
                            onNext={goNext}
                            nextLabel="Próximo"
                            backHidden
                        />
                    </>
                )}

                {step === 2 && (
                    <>
                        <StepTitle>
                            Sua{" "}
                            <span style={{ color: BRONZE_LIGHT }}>
                                localização
                            </span>
                        </StepTitle>
                        <StepSub>
                            Isso nos ajuda a conectar você com oportunidades na
                            sua região.
                        </StepSub>

                        <FormField
                            label="Estado (UF) *"
                            error={errors.uf}
                        >
                            <select
                                value={uf}
                                onChange={(e) => handleUfChange(e.target.value)}
                                style={selectStyle(!!errors.uf)}
                            >
                                <option value="">Selecione o estado...</option>
                                {UFs.map((u) => (
                                    <option key={u.value} value={u.value}>
                                        {u.label}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField
                            label="Cidade *"
                            error={errors.cidade}
                        >
                            <select
                                value={cidade}
                                onChange={(e) => setCidade(e.target.value)}
                                disabled={!uf || loadingCidades}
                                style={selectStyle(!!errors.cidade)}
                            >
                                <option value="">
                                    {!uf
                                        ? "Selecione o estado primeiro..."
                                        : loadingCidades
                                            ? "Carregando cidades..."
                                            : "Selecione sua cidade..."}
                                </option>
                                {cidades.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <Nav onBack={goBack} onNext={goNext} nextLabel="Próximo" />
                    </>
                )}

                {step === 3 && (
                    <>
                        <StepTitle>
                            Seu{" "}
                            <span style={{ color: BRONZE_LIGHT }}>
                                perfil no campo
                            </span>
                        </StepTitle>
                        <StepSub>
                            Conte um pouco sobre seu momento na pecuária.
                        </StepSub>

                        <FormField
                            label="Momento na pecuária *"
                            error={errors.momento}
                        >
                            <select
                                value={momento}
                                onChange={(e) => setMomento(e.target.value)}
                                style={selectStyle(!!errors.momento)}
                            >
                                <option value="">Selecione...</option>
                                {MOMENTO_OPTIONS.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField
                            label="Quantidade de cabeças *"
                            error={errors.cabecas}
                        >
                            <select
                                value={cabecas}
                                onChange={(e) => setCabecas(e.target.value)}
                                style={selectStyle(!!errors.cabecas)}
                            >
                                <option value="">Selecione...</option>
                                {CABECAS_OPTIONS.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField
                            label="Qual seu interesse? *"
                            error={errors.interesse}
                        >
                            <select
                                value={interesse}
                                onChange={(e) => setInteresse(e.target.value)}
                                style={selectStyle(!!errors.interesse)}
                            >
                                <option value="">Selecione...</option>
                                {INTERESSE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <Nav
                            onBack={goBack}
                            onNext={submit}
                            nextLabel={
                                submitting ? "Enviando..." : "Quero entrar no grupo"
                            }
                            nextDisabled={submitting}
                        />
                    </>
                )}

                {step === "done" && (
                    <div className="text-center">
                        <div
                            className="mx-auto mb-5 inline-flex items-center justify-center"
                            style={{
                                width: 64,
                                height: 64,
                                border: `1px solid ${TECH_GREEN}`,
                                background: "rgba(127,212,160,0.10)",
                                borderRadius: 2,
                            }}
                        >
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={TECH_GREEN}
                                strokeWidth="2.5"
                            >
                                <path d="M5 12l5 5 9-9" />
                            </svg>
                        </div>
                        <StepTitle>
                            Cadastro{" "}
                            <span style={{ color: BRONZE_LIGHT }}>realizado!</span>
                        </StepTitle>
                        <StepSub>
                            Você está a um passo de entrar no grupo mais exclusivo
                            de Nelore PO do Brasil. Clique abaixo para acessar.
                        </StepSub>
                        <a
                            href={waGroupLink}
                            className="inline-flex items-center justify-center gap-2.5"
                            style={{
                                background: BRONZE,
                                color: INK,
                                padding: "16px 28px",
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: 14,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                width: "100%",
                                border: `1px solid ${BRONZE}`,
                            }}
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Entrar no grupo do WhatsApp
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ──────────────────────────── Field / Step primitives ──────────────────────────── */
function StepTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3
            className="font-display"
            style={{
                fontWeight: 500,
                fontSize: "clamp(22px, 2.6vw, 30px)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: FG,
                marginBottom: 8,
                textWrap: "balance",
            }}
        >
            {children}
        </h3>
    );
}

function StepSub({ children }: { children: React.ReactNode }) {
    return (
        <p
            style={{
                color: FG_MUTED_70,
                fontSize: 14.5,
                lineHeight: 1.6,
                marginBottom: 28,
            }}
        >
            {children}
        </p>
    );
}

function FormField({
    label,
    error,
    hint,
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div style={{ marginBottom: 18 }}>
            <label
                style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: BRONZE_LIGHT,
                    marginBottom: 8,
                    fontWeight: 500,
                }}
            >
                {label}
            </label>
            {children}
            {hint && !error && (
                <div
                    style={{
                        fontSize: 12.5,
                        color: FG_MUTED_55,
                        marginTop: 6,
                    }}
                >
                    {hint}
                </div>
            )}
            {error && (
                <div
                    style={{
                        fontSize: 12.5,
                        color: DANGER,
                        marginTop: 6,
                    }}
                >
                    {error}
                </div>
            )}
        </div>
    );
}

function inputStyle(hasError: boolean): React.CSSProperties {
    return {
        width: "100%",
        background: INK,
        border: `1px solid ${hasError ? DANGER : LINE_STRONG}`,
        borderRadius: 2,
        color: FG,
        fontFamily: "var(--font-sans, inherit)",
        fontSize: 15,
        padding: "13px 16px",
        outline: "none",
        transition: "border-color .25s ease, background .25s ease",
    };
}

function selectStyle(hasError: boolean): React.CSSProperties {
    return {
        ...inputStyle(hasError),
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
        backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23D4A85C' stroke-width='2' fill='none'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 16px center",
        paddingRight: 40,
    };
}

function Nav({
    onBack,
    onNext,
    nextLabel,
    nextDisabled,
    backHidden,
}: {
    onBack?: () => void;
    onNext: () => void;
    nextLabel: string;
    nextDisabled?: boolean;
    backHidden?: boolean;
}) {
    return (
        <div
            className="flex items-center gap-3 flex-wrap"
            style={{
                marginTop: 28,
                justifyContent: backHidden ? "flex-end" : "space-between",
            }}
        >
            {!backHidden && (
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 transition-colors"
                    style={{
                        background: "transparent",
                        border: `1px solid ${LINE_STRONG}`,
                        color: FG_MUTED_70,
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        padding: "12px 18px",
                        borderRadius: 2,
                        cursor: "pointer",
                        fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color =
                            BRONZE_LIGHT;
                        (e.currentTarget as HTMLElement).style.borderColor =
                            BRONZE_LIGHT;
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color =
                            FG_MUTED_70;
                        (e.currentTarget as HTMLElement).style.borderColor =
                            LINE_STRONG;
                    }}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Voltar
                </button>
            )}
            <button
                type="button"
                onClick={onNext}
                disabled={nextDisabled}
                className="inline-flex items-center justify-center gap-2.5 transition-all"
                style={{
                    flex: 1,
                    background: BRONZE,
                    color: INK,
                    border: `1px solid ${BRONZE}`,
                    padding: "14px 24px",
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 13.5,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: nextDisabled ? "not-allowed" : "pointer",
                    opacity: nextDisabled ? 0.6 : 1,
                    boxShadow:
                        "0 0 0 1px rgba(212,168,92,0.35), 0 0 40px rgba(212,168,92,0.18)",
                }}
            >
                {nextLabel}
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
            </button>
        </div>
    );
}
