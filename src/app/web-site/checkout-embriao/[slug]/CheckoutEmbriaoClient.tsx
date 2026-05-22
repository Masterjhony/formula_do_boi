"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { type Doadora, DOADORAS_CONDICOES } from "@/data/doadoras";

const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const INK = "#161616";
const INK_2 = "#1f1f1f";
const INK_3 = "#2a2a2a";
const FG = "#F5F0E4";
const FG_MUTED_70 = "rgba(245,240,228,0.70)";
const FG_MUTED_55 = "rgba(245,240,228,0.55)";
const LINE = "rgba(212,168,92,0.14)";
const LINE_STRONG = "rgba(212,168,92,0.28)";
const DANGER = "#E74C3C";

const UFs = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const PAGAMENTO_OPTIONS = [
    "Pix à vista (com desconto)",
    "10× sem juros (boleto/cartão)",
    "Combinar com o curador",
];

function fmtBRL(n: number) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function maskPhone(v: string): string {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    if (digits.length > 6) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    if (digits.length > 2) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length) return `(${digits}`;
    return "";
}

function maskDoc(v: string): string {
    const d = v.replace(/\D/g, "").slice(0, 14);
    if (d.length <= 11) {
        // CPF
        return d
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    // CNPJ
    return d
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

type Errors = Partial<Record<
    "nome" | "tel" | "email" | "doc" | "fazenda" | "uf" | "cidade" | "quantidade" | "pagamento",
    string
>>;

export default function CheckoutEmbriaoClient({ doadora }: { doadora: Doadora }) {
    const nome = doadora.nomeAbcz ?? doadora.rgd;

    const [customerName, setCustomerName] = useState("");
    const [tel, setTel] = useState("");
    const [email, setEmail] = useState("");
    const [doc, setDoc] = useState("");
    const [fazenda, setFazenda] = useState("");
    const [uf, setUf] = useState("");
    const [cidade, setCidade] = useState("");
    const [quantidade, setQuantidade] = useState<number>(doadora.quantidadeEmbrioes);
    const [pagamento, setPagamento] = useState("");
    const [notes, setNotes] = useState("");
    const [honeypot, setHoneypot] = useState("");

    const [errors, setErrors] = useState<Errors>({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const totalValue = quantidade * doadora.precoEmbriao;

    function validate(): boolean {
        const e: Errors = {};
        if (!customerName.trim() || customerName.trim().length < 3) e.nome = "Preencha seu nome completo.";
        if (!tel.trim() || tel.replace(/\D/g, "").length < 10) e.tel = "Informe um WhatsApp válido.";
        if (email && (!email.includes("@") || !email.includes("."))) e.email = "E-mail inválido.";
        if (!uf) e.uf = "Selecione o estado.";
        if (!cidade.trim()) e.cidade = "Informe a cidade.";
        if (!Number.isInteger(quantidade) || quantidade < doadora.quantidadeEmbrioes) {
            e.quantidade = `Pacote mínimo: ${doadora.quantidadeEmbrioes} embriões.`;
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function submit(ev: React.FormEvent) {
        ev.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        setServerError(null);

        // attribution from sessionStorage (mesma chave do GrupoVipQuiz)
        let attr: Record<string, string | null | undefined> = {};
        try {
            attr = JSON.parse(sessionStorage.getItem("lp_attribution") || "{}");
        } catch {
            attr = {};
        }

        const payload = {
            product_name: `${nome} × ${doadora.cruzamento}`,
            product_category: "Embrião",
            product_kind: "embriao" as const,
            central: DOADORAS_CONDICOES.fazenda,
            customer_name: customerName.trim(),
            customer_phone: tel,
            customer_email: email.trim() || null,
            customer_doc: doc || null,
            customer_fazenda: fazenda.trim() || null,
            customer_city: cidade.trim(),
            customer_uf: uf,
            quantity: quantidade,
            unit_price: doadora.precoEmbriao,
            total_value: totalValue,
            payment_method: pagamento || null,
            notes: [
                `Doadora: ${nome} (RGD ${doadora.rgd})`,
                `Cruzamento: × ${doadora.cruzamento}`,
                `Origem: site /embrioes/${doadora.slug}`,
                notes.trim() ? `\nObservação do cliente:\n${notes.trim()}` : "",
            ].filter(Boolean).join("\n"),
            website: honeypot,
            utm_source: attr.utm_source ?? null,
            utm_medium: attr.utm_medium ?? null,
            utm_campaign: attr.utm_campaign ?? null,
            utm_content: attr.utm_content ?? null,
            utm_term: attr.utm_term ?? null,
            gclid: attr.gclid ?? null,
            fbclid: attr.fbclid ?? null,
            referrer: attr.referrer ?? (typeof document !== "undefined" ? document.referrer || null : null),
            landing_url: typeof window !== "undefined" ? window.location.href : null,
        };

        try {
            const res = await fetch("/api/reservas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data?.error) {
                setServerError(data?.error || "Não foi possível enviar sua pré-reserva. Tente novamente.");
                setSubmitting(false);
                return;
            }
            // Persiste o resumo no sessionStorage pra página /obrigado mostrar o card.
            try {
                sessionStorage.setItem(
                    "checkout_embriao_last",
                    JSON.stringify({
                        code: data.code ?? null,
                        doadora: nome,
                        cruzamento: doadora.cruzamento,
                        quantidade,
                        total: totalValue,
                    }),
                );
            } catch {
                // ignora
            }
            window.location.href = "/checkout-embriao/obrigado";
        } catch (err) {
            console.error(err);
            setServerError("Falha de rede. Verifique sua conexão e tente novamente.");
            setSubmitting(false);
        }
    }

    useEffect(() => {
        if (typeof window === "undefined") return;
        // captura UTMs novos da URL (caso o cliente chegue direto no checkout com tag)
        try {
            const KEY = "lp_attribution";
            const url = new URL(window.location.href);
            const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];
            const fromUrl: Record<string, string> = {};
            for (const k of utmKeys) {
                const v = url.searchParams.get(k);
                if (v) fromUrl[k] = v;
            }
            if (Object.keys(fromUrl).length > 0) {
                sessionStorage.setItem(KEY, JSON.stringify({
                    ...fromUrl,
                    referrer: document.referrer || null,
                    landing_url: window.location.href,
                    ts: Date.now(),
                }));
            }
        } catch {
            // ignora
        }
    }, []);

    return (
        <main className="min-h-screen" style={{ background: INK }}>
            <Header />

            {/* HERO ─────────────────────────────────────── */}
            <section
                className="relative overflow-hidden"
                style={{ background: INK, borderBottom: `1px solid ${LINE_STRONG}` }}
            >
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at 50% 0%, rgba(212,168,92,0.14) 0%, transparent 60%)",
                    }}
                />
                <div className="container mx-auto px-4 pt-14 pb-10 relative" style={{ maxWidth: 1100 }}>
                    <Link
                        href={`/embrioes/${doadora.slug}`}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: FG_MUTED_70,
                            marginBottom: 22,
                            textDecoration: "none",
                        }}
                    >
                        ← Voltar à ficha
                    </Link>

                    <div
                        className="inline-flex items-center gap-3 mb-5"
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            letterSpacing: "0.24em",
                            textTransform: "uppercase",
                            color: BRONZE_LIGHT,
                            fontWeight: 500,
                        }}
                    >
                        <span style={{ width: 24, height: 1, background: BRONZE }} />
                        Pré-reserva · Embrião FIV · Curadoria FdB × Bula
                    </div>

                    <h1
                        className="font-display"
                        style={{
                            fontSize: "clamp(34px, 5.6vw, 64px)",
                            fontWeight: 500,
                            lineHeight: 1.02,
                            letterSpacing: "-0.025em",
                            color: FG,
                            marginBottom: 16,
                            maxWidth: "20ch",
                        }}
                    >
                        Pré-reserva{" "}
                        <span style={{ color: BRONZE_LIGHT }}>
                            {nome} × {doadora.cruzamento}.
                        </span>
                    </h1>

                    <p
                        style={{
                            color: FG_MUTED_70,
                            fontSize: 16,
                            lineHeight: 1.55,
                            maxWidth: "60ch",
                        }}
                    >
                        Preencha seus dados — um assessor da curadoria entra em contato em
                        até 24h para confirmar o pacote, condições e prazos. Vagas
                        limitadas por safra.
                    </p>
                </div>
            </section>

            {/* FORM + SUMMARY ────────────────────────── */}
            <section style={{ background: INK_2, borderBottom: `1px solid ${LINE}` }}>
                <div className="container mx-auto px-4 py-14 md:py-20" style={{ maxWidth: 1100 }}>
                    <div className="grid lg:grid-cols-[1fr_0.65fr] gap-8 lg:gap-12 items-start">

                        {/* ── FORM ────────────────────────────────── */}
                        <form
                            onSubmit={submit}
                            className="card-engraved"
                            style={{
                                background: INK,
                                border: `1px solid ${LINE_STRONG}`,
                                padding: "clamp(24px, 4vw, 40px)",
                                borderRadius: 4,
                            }}
                        >
                            <SectionLabel>01 · Seus dados</SectionLabel>

                            <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                <Field label="Nome completo *" error={errors.nome} fullWidth>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Seu nome completo"
                                        style={inputStyle(!!errors.nome)}
                                    />
                                </Field>

                                <Field label="WhatsApp *" error={errors.tel}>
                                    <input
                                        type="tel"
                                        inputMode="tel"
                                        value={tel}
                                        onChange={(e) => setTel(maskPhone(e.target.value))}
                                        placeholder="(31) 99999-9999"
                                        style={inputStyle(!!errors.tel)}
                                    />
                                </Field>

                                <Field label="E-mail" error={errors.email} hint="Opcional — usamos para enviar a proposta">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        style={inputStyle(!!errors.email)}
                                    />
                                </Field>

                                <Field label="CPF ou CNPJ">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={doc}
                                        onChange={(e) => setDoc(maskDoc(e.target.value))}
                                        placeholder="000.000.000-00"
                                        style={inputStyle(false)}
                                    />
                                </Field>

                                <Field label="Fazenda / Haras">
                                    <input
                                        type="text"
                                        value={fazenda}
                                        onChange={(e) => setFazenda(e.target.value)}
                                        placeholder="Nome da propriedade"
                                        style={inputStyle(false)}
                                    />
                                </Field>

                                <Field label="Estado *" error={errors.uf}>
                                    <select
                                        value={uf}
                                        onChange={(e) => setUf(e.target.value)}
                                        style={selectStyle(!!errors.uf)}
                                    >
                                        <option value="">Selecione…</option>
                                        {UFs.map((u) => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Cidade *" error={errors.cidade}>
                                    <input
                                        type="text"
                                        value={cidade}
                                        onChange={(e) => setCidade(e.target.value)}
                                        placeholder="Cidade onde recebe os embriões"
                                        style={inputStyle(!!errors.cidade)}
                                    />
                                </Field>
                            </div>

                            <div style={{ marginTop: 36 }}>
                                <SectionLabel>02 · Pacote</SectionLabel>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                <Field
                                    label={`Quantidade de embriões *`}
                                    error={errors.quantidade}
                                    hint={`Mínimo ${doadora.quantidadeEmbrioes} unidades`}
                                >
                                    <input
                                        type="number"
                                        min={doadora.quantidadeEmbrioes}
                                        step={1}
                                        value={quantidade}
                                        onChange={(e) => setQuantidade(Math.max(0, parseInt(e.target.value || "0", 10)))}
                                        style={inputStyle(!!errors.quantidade)}
                                    />
                                </Field>

                                <Field label="Forma de pagamento preferida">
                                    <select
                                        value={pagamento}
                                        onChange={(e) => setPagamento(e.target.value)}
                                        style={selectStyle(false)}
                                    >
                                        <option value="">Combinar com o curador</option>
                                        {PAGAMENTO_OPTIONS.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            <Field label="Observações" hint="Prazo desejado, dúvidas, exigências de cruzamento, etc.">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Conte qualquer detalhe que ajude o curador a montar a proposta."
                                    rows={4}
                                    style={{ ...inputStyle(false), resize: "vertical", minHeight: 100 }}
                                />
                            </Field>

                            {/* honeypot — escondido */}
                            <input
                                type="text"
                                value={honeypot}
                                onChange={(e) => setHoneypot(e.target.value)}
                                tabIndex={-1}
                                autoComplete="off"
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    left: "-9999px",
                                    width: 1,
                                    height: 1,
                                    opacity: 0,
                                }}
                            />

                            {serverError && (
                                <div
                                    style={{
                                        marginTop: 20,
                                        padding: "12px 14px",
                                        border: `1px solid ${DANGER}`,
                                        color: DANGER,
                                        fontSize: 13.5,
                                        borderRadius: 2,
                                        background: "rgba(231,76,60,0.06)",
                                    }}
                                >
                                    {serverError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center justify-center gap-2.5 transition-all"
                                style={{
                                    width: "100%",
                                    marginTop: 28,
                                    background: BRONZE,
                                    color: INK,
                                    border: `1px solid ${BRONZE}`,
                                    padding: "16px 24px",
                                    borderRadius: 2,
                                    fontFamily: "var(--font-mono)",
                                    fontWeight: 600,
                                    fontSize: 13,
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                    cursor: submitting ? "wait" : "pointer",
                                    opacity: submitting ? 0.7 : 1,
                                    boxShadow: "0 0 0 1px rgba(212,168,92,0.35), 0 0 60px rgba(212,168,92,0.18)",
                                }}
                            >
                                {submitting ? "Enviando…" : "Enviar pré-reserva"}
                                {!submitting && <span aria-hidden style={{ marginLeft: 4 }}>→</span>}
                            </button>

                            <p
                                style={{
                                    marginTop: 14,
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 10.5,
                                    letterSpacing: "0.14em",
                                    color: FG_MUTED_55,
                                    textTransform: "uppercase",
                                    textAlign: "center",
                                }}
                            >
                                Pré-reserva sem custo · Confirmação por WhatsApp
                            </p>
                        </form>

                        {/* ── SUMMARY ─────────────────────────────── */}
                        <aside
                            className="card-engraved"
                            style={{
                                background: INK,
                                border: `1px solid ${LINE_STRONG}`,
                                borderRadius: 4,
                                overflow: "hidden",
                                position: "sticky",
                                top: 24,
                            }}
                        >
                            {/* Imagem ou placeholder */}
                            <div
                                style={{
                                    aspectRatio: "16/10",
                                    background: `linear-gradient(135deg, ${INK} 0%, #1F1A0E 100%)`,
                                    borderBottom: `1px solid ${LINE_STRONG}`,
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                {doadora.foto ? (
                                    <img
                                        src={doadora.foto}
                                        alt={nome}
                                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : doadora.video ? (
                                    <video
                                        src={doadora.video}
                                        autoPlay muted loop playsInline preload="metadata"
                                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 26,
                                            color: BRONZE_LIGHT,
                                            letterSpacing: "0.12em",
                                        }}
                                    >
                                        {doadora.rgd}
                                    </div>
                                )}
                                <span
                                    style={{
                                        position: "absolute",
                                        top: 12, left: 12,
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 10,
                                        letterSpacing: "0.18em",
                                        textTransform: "uppercase",
                                        color: INK,
                                        background: BRONZE,
                                        padding: "4px 8px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {doadora.classificacaoTop}
                                </span>
                            </div>

                            <div className="p-6">
                                <div
                                    className="font-display"
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 500,
                                        color: FG,
                                        letterSpacing: "-0.015em",
                                        lineHeight: 1.15,
                                        marginBottom: 4,
                                    }}
                                >
                                    {nome}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 11,
                                        letterSpacing: "0.16em",
                                        textTransform: "uppercase",
                                        color: FG_MUTED_55,
                                        marginBottom: 18,
                                    }}
                                >
                                    × {doadora.cruzamento} · RGD {doadora.rgd}
                                </div>

                                <SummaryRow label="Embrião VIT (unidade)" value={fmtBRL(doadora.precoEmbriao)} />
                                <SummaryRow label="Quantidade" value={`${quantidade || 0} embriões`} />
                                <SummaryRow label="Garantia" value={`${DOADORAS_CONDICOES.prenhezesGarantidas} prenhezes`} />
                                <SummaryRow label="Pagamento" value={DOADORAS_CONDICOES.parcelamento} small />

                                <div
                                    style={{
                                        marginTop: 18,
                                        paddingTop: 16,
                                        borderTop: `1px solid ${LINE_STRONG}`,
                                        display: "flex",
                                        alignItems: "baseline",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 11,
                                            letterSpacing: "0.20em",
                                            textTransform: "uppercase",
                                            color: BRONZE_LIGHT,
                                        }}
                                    >
                                        Total estimado
                                    </span>
                                    <span
                                        className="font-display"
                                        style={{
                                            fontSize: 26,
                                            color: BRONZE_LIGHT,
                                            fontWeight: 500,
                                            letterSpacing: "-0.015em",
                                        }}
                                    >
                                        {fmtBRL(totalValue)}
                                    </span>
                                </div>

                                <p
                                    style={{
                                        marginTop: 14,
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 10,
                                        letterSpacing: "0.12em",
                                        color: FG_MUTED_55,
                                        lineHeight: 1.5,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Valor sujeito à confirmação pelo curador conforme cruzamento e prazo.
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

/* ───────────────────────────────────────────────── *
 *  Sub-components                                   *
 * ───────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="inline-flex items-center gap-3"
            style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: BRONZE_LIGHT,
                fontWeight: 500,
            }}
        >
            <span style={{ width: 22, height: 1, background: BRONZE }} />
            {children}
        </div>
    );
}

function Field({
    label, error, hint, fullWidth, children,
}: {
    label: string;
    error?: string;
    hint?: string;
    fullWidth?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div style={{ marginBottom: 4, gridColumn: fullWidth ? "1 / -1" : undefined }}>
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
                <div style={{ fontSize: 12, color: FG_MUTED_55, marginTop: 6 }}>{hint}</div>
            )}
            {error && (
                <div style={{ fontSize: 12.5, color: DANGER, marginTop: 6 }}>{error}</div>
            )}
        </div>
    );
}

function SummaryRow({ label, value, small }: { label: string; value: string; small?: boolean }) {
    return (
        <div
            className="flex items-baseline justify-between gap-3"
            style={{ padding: "8px 0", borderBottom: `1px solid ${LINE}` }}
        >
            <span
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: FG_MUTED_55,
                }}
            >
                {label}
            </span>
            <span
                style={{
                    color: FG,
                    fontSize: small ? 12.5 : 14,
                    fontWeight: small ? 400 : 500,
                    textAlign: "right",
                }}
            >
                {value}
            </span>
        </div>
    );
}

function inputStyle(hasError: boolean): React.CSSProperties {
    return {
        width: "100%",
        background: INK_3,
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
