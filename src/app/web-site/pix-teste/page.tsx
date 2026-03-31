"use client";

import { useState } from "react";

interface PixResult {
    paymentId: string;
    status: string;
    valor: number;
    qrCodeImage: string;
    pixCopiaECola: string;
    expirationDate: string;
}

export default function PixTestePage() {
    const [form, setForm] = useState({ nome: "", cpf: "", email: "", valor: "" });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PixResult | null>(null);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const handleCpf = (v: string) => {
        v = v.replace(/\D/g, "").slice(0, 11);
        if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
        else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
        else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
        setForm(f => ({ ...f, cpf: v }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);
        setCopied(false);

        try {
            const res = await fetch("/api/asaas-pix-test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const text = await res.text();
            let data: PixResult & { error?: string };
            try { data = JSON.parse(text); }
            catch { throw new Error(`Servidor retornou [${res.status}]: ${text.slice(0, 300)}`); }
            if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
            setResult(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setLoading(false);
        }
    };

    const copy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.pixCopiaECola);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px", fontFamily: "system-ui, sans-serif" }}>
            <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", padding: "40px", maxWidth: "480px", width: "100%" }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{ fontSize: "48px", marginBottom: "8px" }}>🧪</div>
                    <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#1a1a1a" }}>Teste PIX — Asaas</h1>
                    <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#888" }}>
                        Página de teste isolada. Não aparece em nenhum menu.
                    </p>
                </div>

                {!result ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "16px" }}>
                            <label style={labelStyle}>Nome completo</label>
                            <input
                                style={inputStyle}
                                type="text"
                                placeholder="João da Silva"
                                value={form.nome}
                                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                            <label style={labelStyle}>CPF</label>
                            <input
                                style={inputStyle}
                                type="text"
                                placeholder="000.000.000-00"
                                value={form.cpf}
                                onChange={e => handleCpf(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                            <label style={labelStyle}>E-mail</label>
                            <input
                                style={inputStyle}
                                type="email"
                                placeholder="joao@email.com"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: "24px" }}>
                            <label style={labelStyle}>Valor (R$)</label>
                            <input
                                style={inputStyle}
                                type="number"
                                placeholder="10.00"
                                min="1"
                                step="0.01"
                                value={form.valor}
                                onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                                required
                            />
                        </div>

                        {error && (
                            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "#b91c1c", fontSize: "14px" }}>
                                ❌ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ width: "100%", padding: "14px", background: loading ? "#94a3b8" : "#16a34a", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s" }}
                        >
                            {loading ? "⏳ Gerando PIX..." : "Gerar QR Code PIX"}
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: "center" }}>
                        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
                            <div style={{ fontSize: "13px", color: "#15803d", fontWeight: 600 }}>✅ Cobrança criada com sucesso</div>
                            <div style={{ fontSize: "20px", fontWeight: 800, color: "#14532d", marginTop: "4px" }}>
                                R$ {Number(result.valor).toFixed(2).replace(".", ",")}
                            </div>
                            <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>ID: {result.paymentId}</div>
                        </div>

                        {result.qrCodeImage && (
                            <img
                                src={`data:image/png;base64,${result.qrCodeImage}`}
                                alt="QR Code PIX"
                                style={{ width: "220px", height: "220px", border: "1px solid #e5e7eb", borderRadius: "12px", marginBottom: "16px" }}
                            />
                        )}

                        <button
                            onClick={copy}
                            style={{ width: "100%", padding: "12px", background: copied ? "#15803d" : "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginBottom: "12px" }}
                        >
                            {copied ? "✅ Copiado!" : "📋 Copiar código Pix Copia e Cola"}
                        </button>

                        <button
                            onClick={() => { setResult(null); setForm({ nome: "", cpf: "", email: "", valor: "" }); }}
                            style={{ width: "100%", padding: "12px", background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", cursor: "pointer" }}
                        >
                            Novo teste
                        </button>

                        {result.expirationDate && (
                            <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "12px" }}>
                                Expira em: {new Date(result.expirationDate).toLocaleString("pt-BR")}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
};
