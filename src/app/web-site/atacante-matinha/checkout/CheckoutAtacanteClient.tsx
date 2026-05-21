"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* ── Brandbook · Atacante da Matinha ──────────────────────── */
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

/* Faixas de rebanho que qualificam o lead como MQL (+50 cabeças).
   Mesma lista do form antigo da LP — mudou o critério? edite aqui. */
const MQL_QTD = ["51-200", "201-500", "501-1000", "1000+"];

const PO_OPTIONS = [
    { value: "po-registrado", label: "Sim — plantel PO registrado" },
    { value: "po-sem-registro", label: "Sim — plantel PO em formação" },
    { value: "pretende", label: "Ainda não, pretendo migrar" },
    { value: "comercial", label: "Crio gado comercial" },
];

const QTD_OPTIONS = [
    { value: "1-50", label: "1 a 50" },
    { value: "51-200", label: "51 a 200" },
    { value: "201-500", label: "201 a 500" },
    { value: "501-1000", label: "501 a 1.000" },
    { value: "1000+", label: "Acima de 1.000" },
];

const DOSES_OPTIONS = [
    { value: "1-100", label: "1 a 100 doses" },
    { value: "101-200", label: "101 a 200 doses" },
    { value: "201-500", label: "201 a 500 doses" },
    { value: "500+", label: "Acima de 500 doses" },
    { value: "indef", label: "Quero orientação do curador" },
];

const TIPO_OPTIONS = [
    { value: "convencional", label: "Convencional" },
    { value: "sexado", label: "Sexado" },
    { value: "ambos", label: "Ambos" },
    { value: "indef", label: "Decidir com o curador" },
];

const ESTACAO_OPTIONS = [
    { value: "2026-1", label: "1º semestre 2026" },
    { value: "2026-2", label: "2º semestre 2026" },
    { value: "2027", label: "2027" },
    { value: "indef", label: "A definir" },
];

function maskPhone(v: string): string {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    if (digits.length > 6) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    if (digits.length > 2) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length) return `(${digits}`;
    return "";
}

/* UTMs vêm da própria URL do checkout — a LP repassa a query string
   nos botões "Reservar dose". Defaults espelham o form antigo. */
function getUtmParams() {
    try {
        const p = new URLSearchParams(window.location.search);
        return {
            utm_source: p.get("utm_source") || "site",
            utm_medium: p.get("utm_medium") || "organic",
            utm_campaign: p.get("utm_campaign") || "atacante-matinha",
            utm_content: p.get("utm_content") || "",
            utm_term: p.get("utm_term") || "",
            gclid: p.get("gclid") || "",
            fbclid: p.get("fbclid") || "",
        };
    } catch {
        return {};
    }
}

type Errors = Partial<Record<
    "po" | "qtd" | "doses" | "nome" | "whatsapp" | "email",
    string
>>;

export default function CheckoutAtacanteClient() {
    const [po, setPo] = useState("");
    const [qtd, setQtd] = useState("");
    const [doses, setDoses] = useState("");
    const [tipo, setTipo] = useState("convencional");
    const [estacao, setEstacao] = useState("");
    const [nome, setNome] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [email, setEmail] = useState("");
    const [cidade, setCidade] = useState("");
    const [fazenda, setFazenda] = useState("");

    const [errors, setErrors] = useState<Errors>({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const dosesLabel = DOSES_OPTIONS.find((o) => o.value === doses)?.label ?? "—";
    const tipoLabel = TIPO_OPTIONS.find((o) => o.value === tipo)?.label ?? "—";

    function validate(): boolean {
        const e: Errors = {};
        if (!po) e.po = "Selecione seu perfil de criação.";
        if (!qtd) e.qtd = "Selecione o tamanho do rebanho.";
        if (!doses) e.doses = "Selecione a faixa de doses.";
        if (!nome.trim() || nome.trim().length < 3) e.nome = "Preencha seu nome completo.";
        if (!whatsapp.trim() || whatsapp.replace(/\D/g, "").length < 10) e.whatsapp = "Informe um WhatsApp válido.";
        if (!email.trim() || !email.includes("@") || !email.includes(".")) e.email = "Informe um e-mail válido.";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function submit(ev: React.FormEvent) {
        ev.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        setServerError(null);

        const payload = {
            nome: nome.trim(),
            whatsapp,
            email: email.trim(),
            cidade: cidade.trim(),
            fazenda: fazenda.trim(),
            po,
            qtd,
            doses,
            tipo,
            estacao,
            ...getUtmParams(),
            referrer: typeof document !== "undefined" ? document.referrer || "" : "",
            landing_url: typeof window !== "undefined" ? window.location.href : "",
        };

        // Critério MQL: +50 cabeças → /obrigado-mql (pixel dispara lá).
        const redirectTo = MQL_QTD.includes(qtd)
            ? "/atacante-matinha/obrigado-mql"
            : "/atacante-matinha/obrigado";

        try {
            const res = await fetch("/api/lead-atacante", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("server");
            window.location.href = redirectTo;
        } catch {
            setServerError("Não foi possível enviar a pré-reserva. Tente novamente em instantes.");
            setSubmitting(false);
        }
    }

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
                        href="/atacante-matinha"
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
                        ← Voltar ao Atacante da Matinha
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
                        Pré-reserva · Sêmen · Aceleradora 2026
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
                        <span style={{ color: BRONZE_LIGHT }}>Atacante da Matinha.</span>
                    </h1>

                    <p
                        style={{
                            color: FG_MUTED_70,
                            fontSize: 16,
                            lineHeight: 1.55,
                            maxWidth: "60ch",
                        }}
                    >
                        Queremos entender seu rebanho. Preencha os campos abaixo — o curador
                        retorna em até 24h com proposta técnica e cronograma para a sua
                        estação reprodutiva. Pré-reserva sem custo.
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
                            <SectionLabel>01 · Seu perfil</SectionLabel>

                            <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                <Field label="Já é criador de Nelore PO? *" error={errors.po}>
                                    <select
                                        value={po}
                                        onChange={(e) => setPo(e.target.value)}
                                        style={selectStyle(!!errors.po)}
                                    >
                                        <option value="">Selecione…</option>
                                        {PO_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Quantos animais cria hoje? *" error={errors.qtd}>
                                    <select
                                        value={qtd}
                                        onChange={(e) => setQtd(e.target.value)}
                                        style={selectStyle(!!errors.qtd)}
                                    >
                                        <option value="">Selecione…</option>
                                        {QTD_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            <div style={{ marginTop: 36 }}>
                                <SectionLabel>02 · Reserva</SectionLabel>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                <Field label="Doses que pretende reservar *" error={errors.doses} fullWidth>
                                    <select
                                        value={doses}
                                        onChange={(e) => setDoses(e.target.value)}
                                        style={selectStyle(!!errors.doses)}
                                    >
                                        <option value="">Selecione…</option>
                                        {DOSES_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Tipo de sêmen">
                                    <select
                                        value={tipo}
                                        onChange={(e) => setTipo(e.target.value)}
                                        style={selectStyle(false)}
                                    >
                                        {TIPO_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Estação reprodutiva">
                                    <select
                                        value={estacao}
                                        onChange={(e) => setEstacao(e.target.value)}
                                        style={selectStyle(false)}
                                    >
                                        <option value="">Selecione…</option>
                                        {ESTACAO_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            <div style={{ marginTop: 36 }}>
                                <SectionLabel>03 · Contato</SectionLabel>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                <Field label="Nome completo *" error={errors.nome} fullWidth>
                                    <input
                                        type="text"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        placeholder="Seu nome completo"
                                        style={inputStyle(!!errors.nome)}
                                    />
                                </Field>

                                <Field label="WhatsApp *" error={errors.whatsapp}>
                                    <input
                                        type="tel"
                                        inputMode="tel"
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
                                        placeholder="(31) 99999-9999"
                                        style={inputStyle(!!errors.whatsapp)}
                                    />
                                </Field>

                                <Field label="E-mail *" error={errors.email}>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="voce@exemplo.com"
                                        style={inputStyle(!!errors.email)}
                                    />
                                </Field>

                                <Field label="Cidade / Estado" hint="Opcional">
                                    <input
                                        type="text"
                                        value={cidade}
                                        onChange={(e) => setCidade(e.target.value)}
                                        placeholder="Cidade · UF"
                                        style={inputStyle(false)}
                                    />
                                </Field>

                                <Field label="Nome da fazenda" hint="Opcional" fullWidth>
                                    <input
                                        type="text"
                                        value={fazenda}
                                        onChange={(e) => setFazenda(e.target.value)}
                                        placeholder="Nome da propriedade"
                                        style={inputStyle(false)}
                                    />
                                </Field>
                            </div>

                            <p
                                style={{
                                    marginTop: 24,
                                    fontSize: 12.5,
                                    color: FG_MUTED_55,
                                    lineHeight: 1.5,
                                }}
                            >
                                Ao enviar você autoriza o contato do time Fórmula do Boi via
                                WhatsApp ou e-mail. Não compartilhamos seus dados.
                            </p>

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
                            <div
                                style={{
                                    aspectRatio: "16/10",
                                    background: `linear-gradient(135deg, ${INK} 0%, #1F1A0E 100%)`,
                                    borderBottom: `1px solid ${LINE_STRONG}`,
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                <img
                                    src="/atacante-matinha/assets/photos/atacante-04.jpeg"
                                    alt="Atacante da Matinha"
                                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                                />
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
                                    TOP 0,1%
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
                                    Atacante da Matinha
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
                                    RDM B 3224 MAT. · Nelore PO
                                </div>

                                <SummaryRow label="MGTe" value="42,38" />
                                <SummaryRow label="iABCZ" value="40,4" />
                                <SummaryRow label="IQG" value="50,32" />
                                <SummaryRow label="Central" value="Bela Vista" />
                                <SummaryRow label="Doses pretendidas" value={dosesLabel} small />
                                <SummaryRow label="Tipo de sêmen" value={tipoLabel} small />

                                <div
                                    style={{
                                        marginTop: 16,
                                        padding: "14px 16px",
                                        border: `1px solid ${LINE_STRONG}`,
                                        borderTop: `1px solid ${BRONZE}`,
                                        borderRadius: 3,
                                        background: "linear-gradient(180deg, rgba(212,168,92,0.07) 0%, rgba(212,168,92,0.02) 100%)",
                                    }}
                                >
                                    <div
                                        className="flex items-baseline justify-between gap-3"
                                    >
                                        <span
                                            className="font-display"
                                            style={{
                                                fontSize: 16,
                                                fontWeight: 500,
                                                color: FG,
                                                letterSpacing: "-0.01em",
                                            }}
                                        >
                                            Frete grátis
                                        </span>
                                        <span
                                            style={{
                                                fontFamily: "var(--font-mono)",
                                                fontSize: 10,
                                                letterSpacing: "0.16em",
                                                textTransform: "uppercase",
                                                color: BRONZE_LIGHT,
                                            }}
                                        >
                                            Incluso
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 10,
                                            letterSpacing: "0.14em",
                                            textTransform: "uppercase",
                                            color: FG_MUTED_70,
                                            marginTop: 6,
                                        }}
                                    >
                                        Entrega das doses sem custo
                                    </div>
                                </div>

                                <p
                                    style={{
                                        marginTop: 16,
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 10,
                                        letterSpacing: "0.12em",
                                        color: FG_MUTED_55,
                                        lineHeight: 1.5,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Pré-reserva sem custo. Valores e condições confirmados pelo
                                    curador conforme volume e estação.
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
