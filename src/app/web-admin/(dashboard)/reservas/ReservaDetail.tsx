'use client';

import { useEffect, useState } from 'react';
import {
    X, Archive, User, Building2, FileText,
    Truck, Receipt, History, Wallet, Clock, Save,
    ExternalLink, Send,
} from 'lucide-react';
import {
    ProductReservation,
    RESERVA_STAGES,
    RESERVA_SPECIAL_STAGES,
    RESERVA_PRIORITY,
    PAYMENT_METHODS,
} from '@/lib/reservations';
import {
    updateReservation,
    archiveReservation,
    appendHistory,
    ReservaColumn as ReservaColumnRow,
} from '@/app/web-admin/actions/reservations';

interface Props {
    reservation: ProductReservation;
    columns?: ReservaColumnRow[];
    onClose: () => void;
    onPatch: (updates: Partial<ProductReservation>) => void;
    onArchive: () => void;
}

export default function ReservaDetail({ reservation, columns, onClose, onPatch, onArchive }: Props) {
    const [r, setR] = useState<ProductReservation>(reservation);
    const [saving, setSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState<string | null>(null);

    useEffect(() => { setR(reservation); }, [reservation.id]);

    function set<K extends keyof ProductReservation>(key: K, value: ProductReservation[K]) {
        setR(prev => ({ ...prev, [key]: value } as ProductReservation));
    }

    async function save() {
        setSaving(true);
        setSavedMsg(null);
        try {
            const updated = await updateReservation(r.id, {
                customer_name: r.customer_name,
                customer_phone: r.customer_phone,
                customer_email: r.customer_email,
                customer_doc: r.customer_doc,
                customer_fazenda: r.customer_fazenda,
                customer_city: r.customer_city,
                customer_uf: r.customer_uf,
                product_name: r.product_name,
                central: r.central,
                quantity: r.quantity,
                unit_price: r.unit_price,
                total_value: r.total_value,
                payment_method: r.payment_method,
                payment_status: r.payment_status,
                payment_proof_url: r.payment_proof_url,
                down_payment: r.down_payment,
                priority: r.priority,
                status: r.status,
                assigned_to: r.assigned_to,
                expires_at: r.expires_at,
                invoice_status: r.invoice_status,
                invoice_number: r.invoice_number,
                invoice_issued_at: r.invoice_issued_at,
                fiscal_notes: r.fiscal_notes,
                logistics_type: r.logistics_type,
                expected_ship_at: r.expected_ship_at,
                shipped_at: r.shipped_at,
                delivered_at: r.delivered_at,
                tracking_code: r.tracking_code,
                logistics_responsible: r.logistics_responsible,
                notes: r.notes,
            });
            onPatch(updated);
            setSavedMsg('Salvo');
            setTimeout(() => setSavedMsg(null), 2000);
        } catch (err: any) {
            setSavedMsg(err?.message ?? 'Erro');
        } finally {
            setSaving(false);
        }
    }

    async function addNote(text: string) {
        await appendHistory(r.id, { kind: 'note', text });
        const updatedHistory = [...r.history, { at: new Date().toISOString(), kind: 'note' as const, text }];
        set('history', updatedHistory as any);
        onPatch({ history: updatedHistory as any });
    }

    async function doArchive() {
        if (!confirm('Arquivar essa reserva? Ela sai do board ativo mas continua acessível em "Arquivados".')) return;
        await archiveReservation(r.id);
        onArchive();
    }

    const phoneDigits = r.customer_phone?.replace(/\D/g, '') ?? '';

    return (
        <div
            className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-3xl my-4 sm:my-8 bg-white dark:bg-[#161616] border border-[rgba(232,203,133,0.28)] shadow-2xl shadow-black/60"
                onClick={(e) => e.stopPropagation()}
                style={{ borderRadius: 4 }}
            >
                <span aria-hidden className="absolute top-0 left-0 block" style={{ width: 48, height: 1, background: '#A0792E' }} />
                <span aria-hidden className="absolute top-0 right-0 block" style={{ width: 48, height: 1, background: '#A0792E' }} />
                {/* ── Header ── */}
                <div className="bg-white dark:bg-[#161616] border-b border-gray-200 dark:border-[rgba(232,203,133,0.14)] px-6 py-4" style={{ borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span
                                    className="text-[#D4A85C]"
                                    style={{
                                        fontFamily: 'var(--font-mono), monospace',
                                        fontSize: 12,
                                        letterSpacing: '0.22em',
                                        fontWeight: 600,
                                    }}
                                >
                                    {r.code}
                                </span>
                                <span
                                    className="text-[10px] text-gray-400 dark:text-[#F5F0E4]/40 uppercase"
                                    style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.18em' }}
                                >
                                    {r.product_kind === 'semen' ? 'Sêmen' : 'Embrião'} · {new Date(r.created_at).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-[#F5F0E4] truncate">
                                {r.product_name}
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {savedMsg && (
                                <span className="text-xs text-[#D4A85C] uppercase tracking-wider"
                                    style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.18em' }}>
                                    {savedMsg}
                                </span>
                            )}
                            <button
                                onClick={save}
                                disabled={saving}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#A0792E] hover:bg-[#D4A85C] disabled:opacity-50 text-[#161616] text-xs font-bold uppercase transition-colors"
                                style={{ borderRadius: 3, letterSpacing: '0.14em' }}
                            >
                                <Save size={13} />
                                {saving ? 'Salvando…' : 'Salvar'}
                            </button>
                            <button
                                onClick={doArchive}
                                title="Arquivar"
                                className="p-2 text-gray-500 dark:text-[#F5F0E4]/50 hover:text-[#D4A85C] transition-colors"
                            >
                                <Archive size={16} />
                            </button>
                            <button
                                onClick={onClose}
                                title="Fechar"
                                className="p-2 text-gray-500 dark:text-[#F5F0E4]/50 hover:text-[#D4A85C] transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Status + Priority */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <SelectField
                            label="Status"
                            value={r.status}
                            onChange={(v) => set('status', v as any)}
                            options={[
                                ...(columns && columns.length > 0
                                    ? columns.map(c => ({ id: c.id, label: c.title }))
                                    : RESERVA_STAGES.map(s => ({ id: s.id, label: s.label }))),
                                ...RESERVA_SPECIAL_STAGES.map(s => ({ id: s.id, label: '⚠ ' + s.label })),
                            ]}
                        />
                        <SelectField
                            label="Prioridade"
                            value={r.priority}
                            onChange={(v) => set('priority', v as any)}
                            options={RESERVA_PRIORITY.map(p => ({ id: p.id, label: p.label }))}
                        />
                        {phoneDigits && (
                            <a
                                href={`https://wa.me/55${phoneDigits}?text=${encodeURIComponent(`Olá ${r.customer_name.split(' ')[0]}! Aqui é da Fórmula do Boi sobre a sua reserva ${r.code}.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#A0792E] text-[#D4A85C] hover:bg-[#A0792E]/10 text-xs uppercase font-bold transition-colors"
                                style={{ borderRadius: 3, letterSpacing: '0.14em' }}
                            >
                                <Send size={12} />
                                WhatsApp
                            </a>
                        )}
                    </div>
                </div>

                {/* ── Blocks ── */}
                <div className="p-6 space-y-6">
                    {/* BLOCO 1 — Cliente */}
                    <Block icon={User} title="Cliente">
                        <Grid cols={2}>
                            <Input label="Nome" value={r.customer_name} onChange={v => set('customer_name', v)} />
                            <Input label="Telefone / WhatsApp" value={r.customer_phone} onChange={v => set('customer_phone', v)} />
                            <Input label="E-mail" value={r.customer_email ?? ''} onChange={v => set('customer_email', v || null)} />
                            <Input label="CPF / CNPJ" value={r.customer_doc ?? ''} onChange={v => set('customer_doc', v || null)} />
                            <Input label="Fazenda" value={r.customer_fazenda ?? ''} onChange={v => set('customer_fazenda', v || null)} />
                            <Grid cols={2}>
                                <Input label="Cidade" value={r.customer_city ?? ''} onChange={v => set('customer_city', v || null)} />
                                <Input label="UF" value={r.customer_uf ?? ''} onChange={v => set('customer_uf', (v || null)?.toUpperCase() ?? null)} />
                            </Grid>
                        </Grid>
                    </Block>

                    {/* BLOCO 2 — Produto */}
                    <Block icon={Building2} title="Produto">
                        <Grid cols={2}>
                            <Input label={r.product_kind === 'semen' ? 'Touro' : 'Doadora'} value={r.product_name} onChange={v => set('product_name', v)} />
                            <Input label="Central / Criador" value={r.central ?? ''} onChange={v => set('central', v || null)} />
                            <Input label={r.product_kind === 'semen' ? 'Quantidade de doses' : 'Quantidade de embriões'} type="number" value={String(r.quantity)} onChange={v => set('quantity', Number(v) || 0)} />
                            <Input label="Valor unitário (R$)" type="number" value={r.unit_price?.toString() ?? ''} onChange={v => set('unit_price', v ? Number(v) : null)} />
                            <Input label="Valor total (R$)" type="number" value={r.total_value?.toString() ?? ''} onChange={v => set('total_value', v ? Number(v) : null)} />
                        </Grid>
                    </Block>

                    {/* BLOCO 3 — Reserva */}
                    <Block icon={Clock} title="Reserva">
                        <Grid cols={2}>
                            <Input
                                label="Prazo de validade"
                                type="datetime-local"
                                value={r.expires_at ? r.expires_at.slice(0, 16) : ''}
                                onChange={v => set('expires_at', v ? new Date(v).toISOString() : null)}
                            />
                            <Input label="Responsável interno" value={r.assigned_to ?? ''} onChange={v => set('assigned_to', v || null)} />
                            <Input label="Origem do pedido" value={r.origin} onChange={v => set('origin', v || 'site')} />
                        </Grid>
                    </Block>

                    {/* BLOCO 4 — Financeiro */}
                    <Block icon={Wallet} title="Financeiro">
                        <Grid cols={2}>
                            <Select
                                label="Forma de pagamento"
                                value={r.payment_method ?? ''}
                                onChange={v => set('payment_method', v || null)}
                                options={[{ id: '', label: '—' }, ...PAYMENT_METHODS.map(p => ({ id: p.id, label: p.label }))]}
                            />
                            <Select
                                label="Status do pagamento"
                                value={r.payment_status ?? 'pendente'}
                                onChange={v => set('payment_status', v || null)}
                                options={[
                                    { id: 'pendente',    label: 'Pendente' },
                                    { id: 'sinal_pago',  label: 'Sinal pago' },
                                    { id: 'pago',        label: 'Pago' },
                                    { id: 'estornado',   label: 'Estornado' },
                                ]}
                            />
                            <Input label="Sinal pago (R$)" type="number" value={r.down_payment?.toString() ?? ''} onChange={v => set('down_payment', v ? Number(v) : null)} />
                            <Input label="Comprovante (URL)" value={r.payment_proof_url ?? ''} onChange={v => set('payment_proof_url', v || null)} />
                        </Grid>
                        {r.payment_proof_url && (
                            <a href={r.payment_proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#D4A85C] hover:underline">
                                <ExternalLink size={12} /> Abrir comprovante
                            </a>
                        )}
                    </Block>

                    {/* BLOCO 5 — Faturamento */}
                    <Block icon={Receipt} title="Faturamento">
                        <Grid cols={2}>
                            <Select
                                label="NF"
                                value={r.invoice_status ?? ''}
                                onChange={v => set('invoice_status', v || null)}
                                options={[
                                    { id: '',          label: '—' },
                                    { id: 'pendente',  label: 'Pendente' },
                                    { id: 'emitida',   label: 'Emitida' },
                                    { id: 'cancelada', label: 'Cancelada' },
                                ]}
                            />
                            <Input label="Número da NF" value={r.invoice_number ?? ''} onChange={v => set('invoice_number', v || null)} />
                            <Input
                                label="Data de emissão"
                                type="datetime-local"
                                value={r.invoice_issued_at ? r.invoice_issued_at.slice(0, 16) : ''}
                                onChange={v => set('invoice_issued_at', v ? new Date(v).toISOString() : null)}
                            />
                        </Grid>
                        <Textarea label="Observações fiscais" value={r.fiscal_notes ?? ''} onChange={v => set('fiscal_notes', v || null)} />
                    </Block>

                    {/* BLOCO 6 — Logística */}
                    <Block icon={Truck} title="Logística">
                        <Grid cols={2}>
                            <Select
                                label="Tipo"
                                value={r.logistics_type ?? ''}
                                onChange={v => set('logistics_type', (v || null) as any)}
                                options={[
                                    { id: '',         label: '—' },
                                    { id: 'envio',    label: 'Envio' },
                                    { id: 'retirada', label: 'Retirada' },
                                ]}
                            />
                            <Input
                                label="Data prevista"
                                type="date"
                                value={r.expected_ship_at ?? ''}
                                onChange={v => set('expected_ship_at', v || null)}
                            />
                            <Input label="Responsável logística" value={r.logistics_responsible ?? ''} onChange={v => set('logistics_responsible', v || null)} />
                            <Input label="Código de rastreio" value={r.tracking_code ?? ''} onChange={v => set('tracking_code', v || null)} />
                            <Input
                                label="Enviado em"
                                type="datetime-local"
                                value={r.shipped_at ? r.shipped_at.slice(0, 16) : ''}
                                onChange={v => set('shipped_at', v ? new Date(v).toISOString() : null)}
                            />
                            <Input
                                label="Entregue em"
                                type="datetime-local"
                                value={r.delivered_at ? r.delivered_at.slice(0, 16) : ''}
                                onChange={v => set('delivered_at', v ? new Date(v).toISOString() : null)}
                            />
                        </Grid>
                    </Block>

                    {/* BLOCO 7 — Observações livres */}
                    <Block icon={FileText} title="Observações">
                        <Textarea
                            value={r.notes ?? ''}
                            onChange={v => set('notes', v || null)}
                            placeholder="Notas operacionais — visíveis no card de detalhe"
                        />
                    </Block>

                    {/* BLOCO 8 — Histórico */}
                    <Block icon={History} title="Histórico">
                        <HistoryView events={r.history} />
                        <AddNoteRow onAdd={addNote} />
                    </Block>
                </div>
            </div>
        </div>
    );
}

// ─── Building blocks ───────────────────────────────────────

function Block({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
    return (
        <section className="border border-gray-200 dark:border-[rgba(232,203,133,0.14)] relative" style={{ borderRadius: 3 }}>
            <span aria-hidden className="absolute top-0 left-0 block" style={{ width: 24, height: 1, background: '#A0792E' }} />
            <header className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-gray-100 dark:border-[rgba(232,203,133,0.10)]">
                <Icon size={14} className="text-[#D4A85C]" />
                <h3
                    className="text-gray-800 dark:text-[#F5F0E4]"
                    style={{
                        fontFamily: 'var(--font-mono), monospace',
                        fontSize: 11,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                    }}
                >
                    {title}
                </h3>
            </header>
            <div className="p-4">{children}</div>
        </section>
    );
}

function Grid({ cols, children }: { cols: 1 | 2 | 3; children: React.ReactNode }) {
    const cls = cols === 1 ? '' : cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3';
    return <div className={`grid grid-cols-1 ${cls} gap-3`}>{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
    return (
        <span
            className="block mb-1 text-gray-500 dark:text-[#F5F0E4]/50"
            style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 500,
            }}
        >
            {children}
        </span>
    );
}

const inputBase = "w-full px-2.5 py-2 bg-white dark:bg-[#202020] border border-gray-200 dark:border-[rgba(232,203,133,0.18)] focus:border-[#D4A85C] focus:outline-none text-sm text-gray-900 dark:text-[#F5F0E4]";

function Input({ label, value, onChange, type = 'text', placeholder }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
}) {
    return (
        <label className="block">
            <Label>{label}</Label>
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={inputBase}
                style={{ borderRadius: 3 }}
            />
        </label>
    );
}

function Textarea({ label, value, onChange, placeholder }: {
    label?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <label className="block">
            {label && <Label>{label}</Label>}
            <textarea
                rows={3}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={inputBase}
                style={{ borderRadius: 3 }}
            />
        </label>
    );
}

function Select({ label, value, onChange, options }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { id: string; label: string }[];
}) {
    return (
        <label className="block">
            <Label>{label}</Label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={inputBase}
                style={{ borderRadius: 3 }}
            >
                {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
        </label>
    );
}

function SelectField({ label, value, onChange, options }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { id: string; label: string }[];
}) {
    return (
        <div className="flex items-center gap-1.5">
            <span
                className="text-gray-500 dark:text-[#F5F0E4]/50"
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
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="px-2 py-1 text-xs bg-white dark:bg-[#202020] border border-gray-200 dark:border-[rgba(232,203,133,0.18)] focus:border-[#D4A85C] focus:outline-none text-gray-900 dark:text-[#F5F0E4]"
                style={{ borderRadius: 3 }}
            >
                {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
        </div>
    );
}

function HistoryView({ events }: { events: ProductReservation['history'] }) {
    if (!events || events.length === 0) {
        return (
            <p className="text-xs text-gray-400 dark:text-[#F5F0E4]/40 italic">Sem eventos registrados ainda.</p>
        );
    }
    const sorted = [...events].sort((a, b) => (a.at > b.at ? -1 : 1));

    return (
        <ol className="space-y-2 mb-3">
            {sorted.map((ev, i) => {
                const when = new Date(ev.at);
                return (
                    <li key={i} className="flex items-start gap-3 text-xs">
                        <span
                            className="text-gray-400 dark:text-[#F5F0E4]/40 tabular-nums shrink-0 w-[68px]"
                            style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 10, letterSpacing: '0.04em' }}
                        >
                            {when.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}{' '}
                            {when.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-gray-700 dark:text-[#F5F0E4]/80 flex-1">
                            <EventLine ev={ev} />
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

function EventLine({ ev }: { ev: ProductReservation['history'][number] }) {
    if (ev.kind === 'created') return <>📝 Reserva criada{ev.text ? ` — ${ev.text}` : ''}</>;
    if (ev.kind === 'status') return <>↪ Movida de <em className="not-italic text-gray-500 dark:text-[#F5F0E4]/50">{ev.from}</em> → <strong className="text-[#D4A85C]">{ev.to}</strong></>;
    if (ev.kind === 'note') return <>💬 {ev.text}</>;
    if (ev.kind === 'attachment') return <>📎 Anexo: {ev.text}</>;
    if (ev.kind === 'payment') return <>💰 {ev.text ?? 'Pagamento atualizado'}</>;
    if (ev.kind === 'invoice') return <>🧾 {ev.text ?? 'Fatura'}</>;
    if (ev.kind === 'shipping') return <>🚚 {ev.text ?? 'Logística'}</>;
    if (ev.kind === 'archive') return <>📦 Arquivada</>;
    if (ev.kind === 'unarchive') return <>📂 Desarquivada</>;
    return <>{ev.text ?? ev.kind}</>;
}

function AddNoteRow({ onAdd }: { onAdd: (text: string) => Promise<void> }) {
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);

    async function go() {
        if (!text.trim()) return;
        setSending(true);
        try {
            await onAdd(text.trim());
            setText('');
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-[rgba(232,203,133,0.10)]">
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') go(); }}
                placeholder="Registrar uma nota no histórico…"
                className={inputBase}
                style={{ borderRadius: 3 }}
            />
            <button
                onClick={go}
                disabled={sending || !text.trim()}
                className="px-3 py-2 bg-[#A0792E] hover:bg-[#D4A85C] disabled:opacity-50 text-[#161616] text-xs font-bold uppercase whitespace-nowrap"
                style={{ borderRadius: 3, letterSpacing: '0.14em' }}
            >
                {sending ? '…' : 'Registrar'}
            </button>
        </div>
    );
}
