"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const INK = "#0A0A0A";
const INK_2 = "#141414";
const FG = "#F5F0E4";

const UFS = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

type FormState = {
    nome: string;
    email: string;
    whatsapp: string;
    estado: string;
    cidade: string;
    perfil_pecuarista: string;
    nelore_po: string;
    quantidade_animais: string;
    faixa_investimento: string;
    interesses: string[];
    como_conheceu: string;
    lgpd: boolean;
    _hp: string;
};

const INITIAL: FormState = {
    nome: "",
    email: "",
    whatsapp: "",
    estado: "",
    cidade: "",
    perfil_pecuarista: "",
    nelore_po: "",
    quantidade_animais: "",
    faixa_investimento: "",
    interesses: [],
    como_conheceu: "",
    lgpd: false,
    _hp: "",
};

function maskPhone(v: string): string {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 3) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
}

export default function GrupoVipClient() {
    const [step, setStep] = useState<1 | 2 | "done">(1);
    const [form, setForm] = useState<FormState>(INITIAL);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
    const [redirectIsPlaceholder, setRedirectIsPlaceholder] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        const utm: Record<string, string> = {};
        ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(
            (k) => {
                const v = params.get(k);
                if (v) utm[k] = v;
            },
        );
        if (Object.keys(utm).length > 0) {
            sessionStorage.setItem("fdb_grupo_vip_utm", JSON.stringify(utm));
        }
    }, []);

    const step1Valid = useMemo(() => {
        const phoneDigits = form.whatsapp.replace(/\D/g, "");
        return (
            form.nome.trim().length >= 2 &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
            phoneDigits.length >= 10 &&
            phoneDigits.length <= 11 &&
            form.estado.length === 2 &&
            form.cidade.trim().length > 0
        );
    }, [form]);

    const step2Valid = useMemo(() => {
        return (
            !!form.perfil_pecuarista &&
            !!form.nelore_po &&
            !!form.quantidade_animais &&
            !!form.faixa_investimento &&
            form.interesses.length > 0 &&
            form.lgpd
        );
    }, [form]);

    function update<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((s) => ({ ...s, [key]: value }));
    }

    function toggleInteresse(value: string) {
        setForm((s) => {
            const has = s.interesses.includes(value);
            return {
                ...s,
                interesses: has
                    ? s.interesses.filter((i) => i !== value)
                    : [...s.interesses, value],
            };
        });
    }

    async function handleSubmit() {
        if (!step2Valid) return;
        setSubmitting(true);
        setError(null);

        let utm: Record<string, string> = {};
        try {
            const raw = sessionStorage.getItem("fdb_grupo_vip_utm");
            if (raw) utm = JSON.parse(raw);
        } catch {
            // ignore
        }

        const payload = {
            nome: form.nome,
            email: form.email,
            whatsapp: form.whatsapp.replace(/\D/g, ""),
            estado: form.estado,
            cidade: form.cidade,
            perfil_pecuarista: form.perfil_pecuarista,
            nelore_po: form.nelore_po,
            quantidade_animais: form.quantidade_animais,
            faixa_investimento: form.faixa_investimento,
            interesses: form.interesses,
            como_conheceu: form.como_conheceu,
            lgpd: form.lgpd,
            landing_url: typeof window !== "undefined" ? window.location.href : null,
            referrer: typeof document !== "undefined" ? document.referrer : null,
            utm_source: utm.utm_source,
            utm_medium: utm.utm_medium,
            utm_campaign: utm.utm_campaign,
            utm_content: utm.utm_content,
            utm_term: utm.utm_term,
            _hp: form._hp,
        };

        try {
            const res = await fetch("/api/leads/grupo-vip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Não foi possível enviar. Tente novamente.");
                setSubmitting(false);
                return;
            }
            setRedirectUrl(data.redirect || null);
            setRedirectIsPlaceholder(!!data.placeholder);
            setStep("done");
        } catch (e) {
            const err = e as Error;
            setError(err.message || "Erro de rede.");
            setSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen" style={{ background: INK }}>
            <Header />

            <section
                className="relative overflow-hidden"
                style={{
                    background: INK,
                    borderBottom: "1px solid rgba(212,168,92,0.18)",
                }}
            >
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse at 50% 0%, rgba(212,168,92,0.18) 0%, transparent 60%)",
                    }}
                />
                <div className="container mx-auto px-4 pt-20 pb-12 relative" style={{ maxWidth: 1080 }}>
                    <div
                        className="inline-flex items-center gap-3 mb-6"
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            letterSpacing: "0.24em",
                            textTransform: "uppercase",
                            color: BRONZE_LIGHT,
                            fontWeight: 500,
                        }}
                    >
                        <span style={{ width: 6, height: 6, background: BRONZE, borderRadius: "50%" }} />
                        Grupo VIP · Vagas limitadas
                    </div>
                    <h1
                        className="font-display"
                        style={{
                            fontSize: "clamp(40px, 7vw, 80px)",
                            fontWeight: 500,
                            lineHeight: 0.98,
                            letterSpacing: "-0.03em",
                            color: FG,
                            marginBottom: 22,
                            maxWidth: "18ch",
                        }}
                    >
                        Entre no grupo de criadores <span style={{ color: BRONZE_LIGHT }}>Fórmula do Boi.</span>
                    </h1>
                    <p
                        style={{
                            color: "rgba(245,240,228,0.78)",
                            fontSize: 18,
                            lineHeight: 1.55,
                            maxWidth: "62ch",
                            letterSpacing: "-0.005em",
                        }}
                    >
                        Curadoria de Nelore PO direto no seu WhatsApp. Sêmen top 0,1%, embriões FIV
                        selecionados e lotes de leilão antes do catálogo público — apenas para perfis
                        validados pela curadoria FdB × Bula.
                    </p>
                </div>
            </section>

            <section className="py-12 md:py-16" style={{ background: INK }}>
                <div className="container mx-auto px-4" style={{ maxWidth: 760 }}>
                    {step !== "done" && (
                        <div className="flex items-center gap-3 mb-10" aria-label="Progresso do formulário">
                            <StepBadge n={1} active={step === 1} done={step === 2} label="Identificação" />
                            <span style={{ flex: 1, height: 1, background: "rgba(212,168,92,0.22)" }} />
                            <StepBadge n={2} active={step === 2} done={false} label="Qualificação" />
                        </div>
                    )}

                    {step === 1 && (
                        <div
                            className="card-engraved"
                            style={{
                                background: INK_2,
                                padding: "32px 28px",
                                border: "1px solid rgba(212,168,92,0.18)",
                            }}
                        >
                            <SectionLabel>01 · Identificação</SectionLabel>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                                <Field label="Nome completo" required>
                                    <input
                                        type="text"
                                        value={form.nome}
                                        onChange={(e) => update("nome", e.target.value)}
                                        autoComplete="name"
                                        required
                                        className="fdb-input"
                                    />
                                </Field>
                                <Field label="E-mail" required>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => update("email", e.target.value)}
                                        autoComplete="email"
                                        required
                                        className="fdb-input"
                                    />
                                </Field>
                                <Field label="WhatsApp (com DDD)" required>
                                    <input
                                        type="tel"
                                        value={form.whatsapp}
                                        onChange={(e) => update("whatsapp", maskPhone(e.target.value))}
                                        placeholder="(11) 9 9999-9999"
                                        autoComplete="tel"
                                        required
                                        className="fdb-input"
                                    />
                                </Field>
                                <Field label="Estado (UF)" required>
                                    <select
                                        value={form.estado}
                                        onChange={(e) => update("estado", e.target.value)}
                                        required
                                        className="fdb-input"
                                    >
                                        <option value="">Selecione</option>
                                        {UFS.map((uf) => (
                                            <option key={uf} value={uf}>
                                                {uf}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <div className="md:col-span-2">
                                    <Field label="Cidade" required>
                                        <input
                                            type="text"
                                            value={form.cidade}
                                            onChange={(e) => update("cidade", e.target.value)}
                                            autoComplete="address-level2"
                                            required
                                            className="fdb-input"
                                        />
                                    </Field>
                                </div>
                            </div>

                            <input
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                                value={form._hp}
                                onChange={(e) => update("_hp", e.target.value)}
                                aria-hidden="true"
                                style={{
                                    position: "absolute",
                                    left: "-9999px",
                                    width: 1,
                                    height: 1,
                                    opacity: 0,
                                }}
                            />

                            <div className="flex justify-end mt-8">
                                <button
                                    type="button"
                                    onClick={() => step1Valid && setStep(2)}
                                    disabled={!step1Valid}
                                    className="fdb-btn-primary"
                                >
                                    Próximo passo
                                    <span aria-hidden style={{ marginLeft: 6 }}>→</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div
                            className="card-engraved"
                            style={{
                                background: INK_2,
                                padding: "32px 28px",
                                border: "1px solid rgba(212,168,92,0.18)",
                            }}
                        >
                            <SectionLabel>02 · Qualificação</SectionLabel>

                            <div className="mt-6 space-y-7">
                                <RadioBlock
                                    legend="Você já é criador de gado?"
                                    name="perfil_pecuarista"
                                    value={form.perfil_pecuarista}
                                    onChange={(v) => update("perfil_pecuarista", v)}
                                    options={[
                                        { value: "pecuarista_ativo", label: "Sim — pecuarista ativo" },
                                        { value: "investidor_terceirizado", label: "Sim — investidor (terceirizo manejo)" },
                                        { value: "iniciante", label: "Ainda não — quero começar" },
                                    ]}
                                />

                                <RadioBlock
                                    legend="Já trabalha com Nelore PO?"
                                    name="nelore_po"
                                    value={form.nelore_po}
                                    onChange={(v) => update("nelore_po", v)}
                                    options={[
                                        { value: "po_registrado", label: "Sim, tenho rebanho PO registrado" },
                                        { value: "comercial", label: "Sim, mas só comercial" },
                                        { value: "pretendo", label: "Não, mas pretendo começar" },
                                        { value: "sem_gado", label: "Não tenho gado ainda" },
                                    ]}
                                />

                                <RadioBlock
                                    legend="Quantos animais pretende adquirir/iniciar?"
                                    name="quantidade_animais"
                                    value={form.quantidade_animais}
                                    onChange={(v) => update("quantidade_animais", v)}
                                    options={[
                                        { value: "ate_10", label: "Até 10" },
                                        { value: "11_30", label: "11 a 30" },
                                        { value: "31_100", label: "31 a 100" },
                                        { value: "100_mais", label: "100+" },
                                    ]}
                                />

                                <RadioBlock
                                    legend="Faixa de investimento prevista"
                                    name="faixa_investimento"
                                    value={form.faixa_investimento}
                                    onChange={(v) => update("faixa_investimento", v)}
                                    options={[
                                        { value: "ate_50k", label: "Até R$ 50 mil" },
                                        { value: "50_200k", label: "R$ 50 mil a R$ 200 mil" },
                                        { value: "200_500k", label: "R$ 200 mil a R$ 500 mil" },
                                        { value: "500k_1m", label: "R$ 500 mil a R$ 1 milhão" },
                                        { value: "acima_1m", label: "Acima de R$ 1 milhão" },
                                    ]}
                                />

                                <fieldset>
                                    <legend className="mono-sm" style={{ color: BRONZE_LIGHT, marginBottom: 12 }}>
                                        Interesse principal · pode marcar mais de um *
                                    </legend>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                                        {[
                                            { v: "semen", l: "Sêmen" },
                                            { v: "embrioes", l: "Embriões" },
                                            { v: "leiloes", l: "Leilões" },
                                            { v: "curadoria", l: "Curadoria/consultoria" },
                                            { v: "investir_socio", l: "Investir como sócio" },
                                        ].map((opt) => {
                                            const active = form.interesses.includes(opt.v);
                                            return (
                                                <button
                                                    type="button"
                                                    key={opt.v}
                                                    onClick={() => toggleInteresse(opt.v)}
                                                    className="fdb-chip"
                                                    aria-pressed={active}
                                                    data-active={active}
                                                >
                                                    {opt.l}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </fieldset>

                                <Field label="Como nos conheceu? (opcional)">
                                    <input
                                        type="text"
                                        value={form.como_conheceu}
                                        onChange={(e) => update("como_conheceu", e.target.value)}
                                        placeholder="Indicação, Instagram, leilão…"
                                        className="fdb-input"
                                    />
                                </Field>

                                <label
                                    className="flex items-start gap-3 cursor-pointer"
                                    style={{
                                        padding: "14px 16px",
                                        border: "1px solid rgba(212,168,92,0.22)",
                                        borderRadius: 4,
                                        background: "rgba(212,168,92,0.04)",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.lgpd}
                                        onChange={(e) => update("lgpd", e.target.checked)}
                                        required
                                        style={{ marginTop: 4, accentColor: BRONZE }}
                                    />
                                    <span style={{ color: "rgba(245,240,228,0.85)", fontSize: 14, lineHeight: 1.5 }}>
                                        Aceito receber comunicações da Fórmula do Boi sobre genética Nelore PO,
                                        leilões e ofertas exclusivas. Posso revogar a qualquer momento. (LGPD)
                                    </span>
                                </label>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    style={{
                                        marginTop: 16,
                                        padding: "12px 14px",
                                        background: "rgba(180,40,40,0.10)",
                                        border: "1px solid rgba(220,80,80,0.40)",
                                        color: "#FFB4B4",
                                        fontSize: 14,
                                        borderRadius: 4,
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="fdb-btn-ghost"
                                >
                                    ← Voltar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!step2Valid || submitting}
                                    className="fdb-btn-primary"
                                >
                                    {submitting ? "Enviando…" : "Candidatar-me ao grupo VIP"}
                                    {!submitting && <span aria-hidden style={{ marginLeft: 6 }}>→</span>}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "done" && (
                        <div
                            className="card-engraved"
                            style={{
                                background: INK_2,
                                padding: "40px 28px",
                                border: "1px solid rgba(212,168,92,0.28)",
                                textAlign: "center",
                            }}
                        >
                            <div
                                aria-hidden
                                style={{
                                    width: 56, height: 56,
                                    margin: "0 auto 22px",
                                    border: `1px solid ${BRONZE_LIGHT}`,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: BRONZE_LIGHT,
                                }}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12l5 5L20 7" />
                                </svg>
                            </div>
                            <h2
                                className="font-display"
                                style={{
                                    fontSize: 32,
                                    fontWeight: 500,
                                    color: FG,
                                    letterSpacing: "-0.02em",
                                    marginBottom: 14,
                                }}
                            >
                                Recebido. Estamos validando seu perfil.
                            </h2>
                            <p style={{
                                color: "rgba(245,240,228,0.72)",
                                fontSize: 16,
                                maxWidth: "52ch",
                                margin: "0 auto 24px",
                                lineHeight: 1.55,
                            }}>
                                Em até 24h você recebe o convite no WhatsApp. Você também pode entrar agora —
                                a curadoria libera o acesso após validar.
                            </p>
                            {redirectUrl && (
                                <a
                                    href={redirectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="fdb-btn-primary"
                                >
                                    Entrar no grupo agora
                                    <span aria-hidden style={{ marginLeft: 6 }}>→</span>
                                </a>
                            )}
                            {redirectIsPlaceholder && (
                                <p style={{
                                    marginTop: 18,
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 11,
                                    letterSpacing: "0.12em",
                                    color: "rgba(245,240,228,0.45)",
                                    textTransform: "uppercase",
                                }}>
                                    ⚠ Link do grupo ainda não configurado · TODO: definir NEXT_PUBLIC_GRUPO_VIP_URL
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <Footer />

            <style jsx global>{`
                .fdb-input {
                    width: 100%;
                    background: ${INK};
                    border: 1px solid rgba(212,168,92,0.22);
                    color: ${FG};
                    padding: 12px 14px;
                    font-size: 15px;
                    font-family: var(--font-sans);
                    border-radius: 4px;
                    outline: none;
                    transition: border-color 150ms ease, box-shadow 150ms ease;
                }
                .fdb-input:hover { border-color: rgba(212,168,92,0.40); }
                .fdb-input:focus {
                    border-color: ${BRONZE_LIGHT};
                    box-shadow: 0 0 0 3px rgba(212,168,92,0.12);
                }
                .fdb-input::placeholder { color: rgba(245,240,228,0.36); }

                .fdb-btn-primary {
                    display: inline-flex; align-items: center; justify-content: center;
                    background: ${BRONZE};
                    color: ${INK};
                    padding: 14px 26px;
                    border: none;
                    border-radius: 2px;
                    font-family: var(--font-mono);
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease;
                    box-shadow: 0 0 0 1px rgba(212,168,92,0.35), 0 0 60px rgba(212,168,92,0.18);
                }
                .fdb-btn-primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    background: ${BRONZE_LIGHT};
                }
                .fdb-btn-primary:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .fdb-btn-ghost {
                    display: inline-flex; align-items: center; justify-content: center;
                    background: transparent;
                    color: ${BRONZE_LIGHT};
                    padding: 14px 26px;
                    border: 1px solid rgba(212,168,92,0.40);
                    border-radius: 2px;
                    font-family: var(--font-mono);
                    font-size: 12px;
                    font-weight: 500;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: border-color 150ms ease, color 150ms ease;
                }
                .fdb-btn-ghost:hover {
                    border-color: ${BRONZE_LIGHT};
                    color: ${FG};
                }

                .fdb-chip {
                    background: transparent;
                    border: 1px solid rgba(212,168,92,0.30);
                    color: rgba(245,240,228,0.82);
                    padding: 11px 14px;
                    font-family: var(--font-sans);
                    font-size: 14px;
                    border-radius: 2px;
                    cursor: pointer;
                    text-align: left;
                    transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
                }
                .fdb-chip:hover { border-color: ${BRONZE_LIGHT}; }
                .fdb-chip[data-active="true"] {
                    background: ${BRONZE};
                    color: ${INK};
                    border-color: ${BRONZE};
                    font-weight: 600;
                }

                .fdb-radio {
                    display: flex; align-items: flex-start; gap: 10px;
                    padding: 12px 14px;
                    border: 1px solid rgba(212,168,92,0.22);
                    border-radius: 4px;
                    cursor: pointer;
                    transition: border-color 120ms ease, background 120ms ease;
                }
                .fdb-radio:hover { border-color: rgba(212,168,92,0.45); }
                .fdb-radio input[type="radio"] {
                    margin-top: 4px;
                    accent-color: ${BRONZE};
                }
                .fdb-radio[data-active="true"] {
                    border-color: ${BRONZE_LIGHT};
                    background: rgba(212,168,92,0.06);
                }
            `}</style>
        </main>
    );
}

function StepBadge({
    n, active, done, label,
}: { n: number; active: boolean; done: boolean; label: string }) {
    const color = active ? BRONZE_LIGHT : done ? BRONZE : "rgba(245,240,228,0.40)";
    return (
        <div className="flex items-center gap-2.5">
            <span
                aria-current={active ? "step" : undefined}
                style={{
                    width: 28, height: 28,
                    border: `1px solid ${color}`,
                    color,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 500,
                    background: active ? "rgba(212,168,92,0.10)" : "transparent",
                }}
            >
                {n}
            </span>
            <span
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color,
                    fontWeight: 500,
                }}
            >
                {label}
            </span>
        </div>
    );
}

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
            <span style={{ width: 24, height: 1, background: BRONZE }} />
            {children}
        </div>
    );
}

function Field({
    label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <label className="flex flex-col gap-2">
            <span
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: BRONZE_LIGHT,
                    fontWeight: 500,
                }}
            >
                {label}{required && " *"}
            </span>
            {children}
        </label>
    );
}

function RadioBlock({
    legend, name, value, onChange, options,
}: {
    legend: string;
    name: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <fieldset>
            <legend className="mono-sm" style={{ color: BRONZE_LIGHT, marginBottom: 12 }}>
                {legend} *
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {options.map((opt) => {
                    const active = value === opt.value;
                    return (
                        <label
                            key={opt.value}
                            className="fdb-radio"
                            data-active={active}
                        >
                            <input
                                type="radio"
                                name={name}
                                value={opt.value}
                                checked={active}
                                onChange={() => onChange(opt.value)}
                            />
                            <span style={{ color: FG, fontSize: 14, lineHeight: 1.4 }}>
                                {opt.label}
                            </span>
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}
