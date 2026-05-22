'use client';

import { useEffect, useState } from 'react';
import { X, Check, ShieldCheck, Phone, MapPin as MapPinIcon } from 'lucide-react';

interface ReservaModalProps {
    open: boolean;
    onClose: () => void;
    product: {
        id: number;
        name: string;
        category: string;
        kind: 'semen' | 'embriao';
        central?: string | null;
        unit_price?: number | null;
    };
}

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const PAYMENT_OPTIONS = [
    { id: 'avista',     label: 'À vista' },
    { id: '3x_pix',     label: '3x no PIX' },
    { id: '8x_boleto',  label: '8x no boleto' },
    { id: '12x_cartao', label: '12x no cartão' },
    { id: 'outro',      label: 'Outra (combinar)' },
];

export default function ReservaModal({ open, onClose, product }: ReservaModalProps) {
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState<{ code: string } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [form, setForm] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        customer_doc: '',
        customer_fazenda: '',
        customer_city: '',
        customer_uf: '',
        quantity: product.kind === 'semen' ? '10' : '1',
        payment_method: 'avista',
        notes: '',
        website: '', // honeypot
    });

    useEffect(() => {
        if (!open) {
            // reset state quando fecha
            setTimeout(() => {
                setSending(false);
                setSuccess(null);
                setErrorMsg(null);
            }, 300);
        }
    }, [open]);

    function update<K extends keyof typeof form>(key: K, value: string) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (sending) return;
        setErrorMsg(null);

        const phoneDigits = form.customer_phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            setErrorMsg('Telefone inválido. Inclua DDD + número.');
            return;
        }

        setSending(true);
        try {
            const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
            const payload = {
                product_id: product.id,
                product_name: product.name,
                product_category: product.category,
                product_kind: product.kind,
                central: product.central ?? null,

                customer_name: form.customer_name.trim(),
                customer_phone: phoneDigits,
                customer_email: form.customer_email.trim() || null,
                customer_doc: form.customer_doc.trim() || null,
                customer_fazenda: form.customer_fazenda.trim() || null,
                customer_city: form.customer_city.trim() || null,
                customer_uf: form.customer_uf || null,

                quantity: Number(form.quantity) || 1,
                unit_price: product.unit_price ?? null,
                total_value: product.unit_price ? product.unit_price * (Number(form.quantity) || 1) : null,
                payment_method: form.payment_method,
                notes: form.notes.trim() || null,
                website: form.website,

                utm_source:   params.get('utm_source'),
                utm_medium:   params.get('utm_medium'),
                utm_campaign: params.get('utm_campaign'),
                utm_content:  params.get('utm_content'),
                utm_term:     params.get('utm_term'),
                gclid:        params.get('gclid'),
                fbclid:       params.get('fbclid'),
                referrer:     typeof document !== 'undefined' ? document.referrer || null : null,
                landing_url:  typeof window !== 'undefined' ? window.location.href : null,
            };

            const res = await fetch('/api/reservas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data?.ok) {
                setErrorMsg(data?.error || 'Erro ao enviar a solicitação.');
                setSending(false);
                return;
            }

            setSuccess({ code: data.code || 'RSV-—' });
        } catch (err) {
            console.error(err);
            setErrorMsg('Não foi possível enviar agora. Tente novamente em instantes.');
        } finally {
            setSending(false);
        }
    }

    if (!open) return null;

    const isSemen = product.kind === 'semen';
    const itemLabel = isSemen ? 'doses' : 'embriões';

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto" onClick={onClose}>
            <div
                className="relative w-full sm:max-w-2xl bg-[#161616] border border-[rgba(232,203,133,0.28)] sm:rounded-[4px] shadow-2xl shadow-black/60"
                onClick={(e) => e.stopPropagation()}
                style={{ borderRadius: 4 }}
            >
                {/* Top bracket accent */}
                <span aria-hidden className="absolute top-0 left-0 block" style={{ width: 48, height: 1, background: '#A0792E' }} />
                <span aria-hidden className="absolute top-0 right-0 block" style={{ width: 48, height: 1, background: '#A0792E' }} />

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-[#F5F0E4]/60 hover:text-[#D4A85C] transition-colors"
                    aria-label="Fechar"
                >
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-[rgba(232,203,133,0.14)]">
                    <p
                        className="mb-2"
                        style={{
                            fontFamily: 'var(--font-mono), monospace',
                            fontSize: 11,
                            color: '#D4A85C',
                            letterSpacing: '0.24em',
                            textTransform: 'uppercase',
                            fontWeight: 500,
                        }}
                    >
                        Solicitar reserva
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-medium text-[#F5F0E4] tracking-tight leading-tight">
                        {product.name}
                    </h2>
                    <p className="text-[#F5F0E4]/60 text-sm mt-2">
                        {isSemen
                            ? 'Reservamos as doses junto à Central Bela Vista e te chamamos para confirmar valor e logística.'
                            : 'Bloqueamos o lote de embriões e te chamamos para confirmar condições e envio.'}
                    </p>
                </div>

                {success ? (
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#A0792E]/15 border border-[#A0792E]/40 mb-4">
                            <Check className="w-7 h-7 text-[#D4A85C]" />
                        </div>
                        <h3 className="text-xl font-medium text-[#F5F0E4] mb-2">Reserva registrada</h3>
                        <p className="text-[#F5F0E4]/70 text-sm mb-3">
                            Recebemos sua solicitação e nossa equipe entra em contato pelo WhatsApp em instantes.
                        </p>
                        <p
                            className="inline-block px-3 py-1.5 mb-6 border border-[rgba(232,203,133,0.28)]"
                            style={{
                                fontFamily: 'var(--font-mono), monospace',
                                fontSize: 12,
                                letterSpacing: '0.18em',
                                color: '#D4A85C',
                                borderRadius: 3,
                            }}
                        >
                            {success.code}
                        </p>
                        <div>
                            <button
                                onClick={onClose}
                                className="inline-flex items-center justify-center px-6 py-3 bg-[#A0792E] hover:bg-[#D4A85C] text-[#161616] font-bold text-sm uppercase tracking-wider transition-colors"
                                style={{ borderRadius: 3 }}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                        {/* honeypot — invisível */}
                        <input
                            type="text"
                            name="website"
                            value={form.website}
                            onChange={(e) => update('website', e.target.value)}
                            tabIndex={-1}
                            autoComplete="off"
                            className="absolute -left-[9999px] w-1 h-1 opacity-0"
                            aria-hidden
                        />

                        {/* Cliente */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Nome completo *">
                                <input
                                    required
                                    type="text"
                                    value={form.customer_name}
                                    onChange={(e) => update('customer_name', e.target.value)}
                                    className={inputCls}
                                    placeholder="Como você gostaria de ser chamado"
                                />
                            </Field>
                            <Field label="WhatsApp *">
                                <input
                                    required
                                    type="tel"
                                    value={form.customer_phone}
                                    onChange={(e) => update('customer_phone', e.target.value)}
                                    className={inputCls}
                                    placeholder="(00) 00000-0000"
                                />
                            </Field>
                            <Field label="E-mail">
                                <input
                                    type="email"
                                    value={form.customer_email}
                                    onChange={(e) => update('customer_email', e.target.value)}
                                    className={inputCls}
                                    placeholder="seu@email.com"
                                />
                            </Field>
                            <Field label="CPF / CNPJ">
                                <input
                                    type="text"
                                    value={form.customer_doc}
                                    onChange={(e) => update('customer_doc', e.target.value)}
                                    className={inputCls}
                                    placeholder="Opcional"
                                />
                            </Field>
                            <Field label="Fazenda / Empresa">
                                <input
                                    type="text"
                                    value={form.customer_fazenda}
                                    onChange={(e) => update('customer_fazenda', e.target.value)}
                                    className={inputCls}
                                    placeholder="Nome da propriedade"
                                />
                            </Field>
                            <div className="grid grid-cols-3 gap-3">
                                <Field label="Cidade" className="col-span-2">
                                    <input
                                        type="text"
                                        value={form.customer_city}
                                        onChange={(e) => update('customer_city', e.target.value)}
                                        className={inputCls}
                                        placeholder="Cidade"
                                    />
                                </Field>
                                <Field label="UF">
                                    <select
                                        value={form.customer_uf}
                                        onChange={(e) => update('customer_uf', e.target.value)}
                                        className={inputCls}
                                    >
                                        <option value="">—</option>
                                        {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                    </select>
                                </Field>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-[rgba(232,203,133,0.14)]" />

                        {/* Pedido */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label={`Quantidade de ${itemLabel} *`}>
                                <input
                                    required
                                    type="number"
                                    min={1}
                                    value={form.quantity}
                                    onChange={(e) => update('quantity', e.target.value)}
                                    className={inputCls}
                                />
                            </Field>
                            <Field label="Forma de pagamento">
                                <select
                                    value={form.payment_method}
                                    onChange={(e) => update('payment_method', e.target.value)}
                                    className={inputCls}
                                >
                                    {PAYMENT_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                </select>
                            </Field>
                        </div>

                        <Field label="Observações">
                            <textarea
                                rows={3}
                                value={form.notes}
                                onChange={(e) => update('notes', e.target.value)}
                                className={inputCls}
                                placeholder="Algo que você gostaria que a nossa equipe soubesse"
                            />
                        </Field>

                        {/* Confiança */}
                        <div className="flex items-start gap-3 p-3 border border-[rgba(232,203,133,0.14)]" style={{ borderRadius: 3 }}>
                            <ShieldCheck className="w-4 h-4 text-[#D4A85C] mt-0.5 shrink-0" />
                            <p className="text-xs text-[#F5F0E4]/60 leading-relaxed">
                                Você não está pagando agora. Esta é uma <strong className="text-[#F5F0E4]">solicitação de reserva</strong> —
                                vamos confirmar com você antes de qualquer compromisso financeiro.
                            </p>
                        </div>

                        {errorMsg && (
                            <p className="text-sm text-red-400 px-3 py-2 border border-red-500/30 bg-red-500/5" style={{ borderRadius: 3 }}>
                                {errorMsg}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-[#A0792E] hover:bg-[#D4A85C] disabled:opacity-50 text-[#161616] font-bold text-sm uppercase tracking-wider transition-colors shadow-lg shadow-[#A0792E]/20"
                            style={{ borderRadius: 3, letterSpacing: '0.18em' }}
                        >
                            {sending ? 'Enviando…' : 'Solicitar reserva'}
                        </button>

                        <div className="flex items-center justify-center gap-4 text-[10px] text-[#F5F0E4]/40 pt-1">
                            <span className="flex items-center gap-1.5"><Phone size={11} /> Retorno em até 1h útil</span>
                            <span className="flex items-center gap-1.5"><MapPinIcon size={11} /> Brasil inteiro</span>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

const inputCls = "w-full px-3 py-2.5 bg-[#1f1f1f] border border-[rgba(232,203,133,0.18)] focus:border-[#D4A85C] focus:outline-none text-[#F5F0E4] text-sm placeholder-[#F5F0E4]/30 transition-colors";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <label className={`block ${className ?? ''}`}>
            <span
                className="block mb-1.5 text-[#F5F0E4]/60"
                style={{
                    fontFamily: 'var(--font-mono), monospace',
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                }}
            >
                {label}
            </span>
            {children}
        </label>
    );
}
