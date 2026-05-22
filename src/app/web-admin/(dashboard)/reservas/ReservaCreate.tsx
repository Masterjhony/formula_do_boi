'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { createManualReservation } from '@/app/web-admin/actions/reservations';
import { ProductReservation, PAYMENT_METHODS, RESERVA_PRIORITY } from '@/lib/reservations';

interface Props {
    onClose: () => void;
    onCreated: (r: ProductReservation) => void;
}

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export default function ReservaCreate({ onClose, onCreated }: Props) {
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [form, setForm] = useState({
        product_kind: 'semen' as 'semen' | 'embriao',
        product_name: '',
        central: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        customer_doc: '',
        customer_fazenda: '',
        customer_city: '',
        customer_uf: '',
        quantity: '10',
        unit_price: '',
        total_value: '',
        payment_method: 'avista',
        priority: 'normal' as 'baixa' | 'normal' | 'alta',
        notes: '',
    });

    function set<K extends keyof typeof form>(key: K, value: string) {
        setForm(prev => ({ ...prev, [key]: value as any }));
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (saving) return;
        setErrorMsg(null);

        const phoneDigits = form.customer_phone.replace(/\D/g, '');
        if (!form.customer_name.trim()) {
            setErrorMsg('Nome do cliente é obrigatório.');
            return;
        }
        if (phoneDigits.length < 10) {
            setErrorMsg('Telefone inválido. Inclua DDD + número.');
            return;
        }
        if (!form.product_name.trim()) {
            setErrorMsg('Nome do produto (touro/doadora) é obrigatório.');
            return;
        }
        const qty = Number(form.quantity);
        if (!Number.isInteger(qty) || qty <= 0) {
            setErrorMsg('Quantidade inválida.');
            return;
        }

        const unit_price = form.unit_price ? Number(form.unit_price.replace(',', '.')) : null;
        const total_value = form.total_value
            ? Number(form.total_value.replace(',', '.'))
            : (unit_price != null ? unit_price * qty : null);

        setSaving(true);
        try {
            const created = await createManualReservation({
                product_kind: form.product_kind,
                product_name: form.product_name.trim(),
                product_category: form.product_kind === 'semen' ? 'Sêmen' : 'Embrião',
                central: form.central.trim() || null,
                customer_name: form.customer_name.trim(),
                customer_phone: phoneDigits,
                customer_email: form.customer_email.trim() || null,
                customer_doc: form.customer_doc.replace(/\D/g, '') || null,
                customer_fazenda: form.customer_fazenda.trim() || null,
                customer_city: form.customer_city.trim() || null,
                customer_uf: form.customer_uf || null,
                quantity: qty,
                unit_price,
                total_value,
                payment_method: form.payment_method,
                priority: form.priority,
                notes: form.notes.trim() || null,
            });
            onCreated(created);
        } catch (err: any) {
            setErrorMsg(err?.message ?? 'Erro ao criar reserva.');
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
            <div
                className="relative w-full max-w-2xl bg-white dark:bg-[#161616] border border-[rgba(232,203,133,0.28)]"
                onClick={(e) => e.stopPropagation()}
                style={{ borderRadius: 4 }}
            >
                <span aria-hidden className="absolute top-0 left-0 block" style={{ width: 48, height: 1, background: '#A0792E' }} />
                <span aria-hidden className="absolute top-0 right-0 block" style={{ width: 48, height: 1, background: '#A0792E' }} />

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[rgba(232,203,133,0.14)]">
                    <div>
                        <p
                            style={{
                                fontFamily: 'var(--font-mono), monospace',
                                fontSize: 10,
                                color: '#D4A85C',
                                letterSpacing: '0.24em',
                                textTransform: 'uppercase',
                                fontWeight: 500,
                            }}
                        >
                            Nova reserva
                        </p>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-[#F5F0E4] mt-0.5">
                            Cadastro manual
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 dark:text-[#F5F0E4]/50 hover:text-[#D4A85C]"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-5">
                    {/* Tipo do produto */}
                    <div className="flex gap-2">
                        {(['semen', 'embriao'] as const).map(kind => (
                            <button
                                key={kind}
                                type="button"
                                onClick={() => set('product_kind', kind)}
                                className={`flex-1 px-4 py-2.5 text-xs uppercase font-bold transition-colors border ${
                                    form.product_kind === kind
                                        ? 'bg-[#A0792E] border-[#A0792E] text-[#161616]'
                                        : 'bg-white dark:bg-[#202020] border-gray-200 dark:border-[rgba(232,203,133,0.18)] text-gray-700 dark:text-[#F5F0E4]/70 hover:border-[#D4A85C]'
                                }`}
                                style={{ borderRadius: 3, letterSpacing: '0.16em' }}
                            >
                                {kind === 'semen' ? 'Sêmen' : 'Embrião'}
                            </button>
                        ))}
                    </div>

                    {/* Produto */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label={form.product_kind === 'semen' ? 'Touro *' : 'Doadora *'}>
                            <input
                                required
                                value={form.product_name}
                                onChange={(e) => set('product_name', e.target.value)}
                                className={inp}
                                style={{ borderRadius: 3 }}
                            />
                        </Field>
                        <Field label="Central / Criador">
                            <input
                                value={form.central}
                                onChange={(e) => set('central', e.target.value)}
                                className={inp}
                                style={{ borderRadius: 3 }}
                                placeholder="Ex.: Central Bela Vista"
                            />
                        </Field>
                    </div>

                    {/* Cliente */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Cliente *">
                            <input
                                required
                                value={form.customer_name}
                                onChange={(e) => set('customer_name', e.target.value)}
                                className={inp}
                                style={{ borderRadius: 3 }}
                            />
                        </Field>
                        <Field label="WhatsApp *">
                            <input
                                required
                                value={form.customer_phone}
                                onChange={(e) => set('customer_phone', e.target.value)}
                                className={inp}
                                style={{ borderRadius: 3 }}
                                placeholder="(00) 00000-0000"
                            />
                        </Field>
                        <Field label="E-mail">
                            <input
                                type="email"
                                value={form.customer_email}
                                onChange={(e) => set('customer_email', e.target.value)}
                                className={inp}
                                style={{ borderRadius: 3 }}
                            />
                        </Field>
                        <Field label="CPF / CNPJ">
                            <input
                                value={form.customer_doc}
                                onChange={(e) => set('customer_doc', e.target.value)}
                                className={inp}
                                style={{ borderRadius: 3 }}
                            />
                        </Field>
                        <Field label="Fazenda">
                            <input
                                value={form.customer_fazenda}
                                onChange={(e) => set('customer_fazenda', e.target.value)}
                                className={inp}
                                style={{ borderRadius: 3 }}
                            />
                        </Field>
                        <div className="grid grid-cols-3 gap-2">
                            <Field label="Cidade" className="col-span-2">
                                <input
                                    value={form.customer_city}
                                    onChange={(e) => set('customer_city', e.target.value)}
                                    className={inp}
                                    style={{ borderRadius: 3 }}
                                />
                            </Field>
                            <Field label="UF">
                                <select
                                    value={form.customer_uf}
                                    onChange={(e) => set('customer_uf', e.target.value)}
                                    className={inp}
                                    style={{ borderRadius: 3 }}
                                >
                                    <option value="">—</option>
                                    {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                </select>
                            </Field>
                        </div>
                    </div>

                    {/* Pedido */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Field label="Quantidade *">
                            <input
                                required
                                type="number"
                                min={1}
                                value={form.quantity}
                                onChange={(e) => set('quantity', e.target.value)}
                                className={inp}
                                style={{ borderRadius: 3 }}
                            />
                        </Field>
                        <Field label="Valor unitário">
                            <input
                                value={form.unit_price}
                                onChange={(e) => set('unit_price', e.target.value)}
                                className={inp}
                                style={{ borderRadius: 3 }}
                                placeholder="R$"
                            />
                        </Field>
                        <Field label="Valor total">
                            <input
                                value={form.total_value}
                                onChange={(e) => set('total_value', e.target.value)}
                                className={inp}
                                style={{ borderRadius: 3 }}
                                placeholder="R$ (auto)"
                            />
                        </Field>
                        <Field label="Pagamento">
                            <select
                                value={form.payment_method}
                                onChange={(e) => set('payment_method', e.target.value)}
                                className={inp}
                                style={{ borderRadius: 3 }}
                            >
                                {PAYMENT_METHODS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                            </select>
                        </Field>
                    </div>

                    <Field label="Prioridade">
                        <select
                            value={form.priority}
                            onChange={(e) => set('priority', e.target.value)}
                            className={inp}
                            style={{ borderRadius: 3 }}
                        >
                            {RESERVA_PRIORITY.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                        </select>
                    </Field>

                    <Field label="Observações">
                        <textarea
                            rows={3}
                            value={form.notes}
                            onChange={(e) => set('notes', e.target.value)}
                            className={inp}
                            style={{ borderRadius: 3 }}
                            placeholder="Contexto, próximos passos…"
                        />
                    </Field>

                    {errorMsg && (
                        <p className="text-sm text-red-400 px-3 py-2 border border-red-500/30 bg-red-500/5" style={{ borderRadius: 3 }}>
                            {errorMsg}
                        </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-[rgba(232,203,133,0.10)]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs uppercase tracking-wider text-gray-700 dark:text-[#F5F0E4]/70 hover:text-[#D4A85C]"
                            style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.16em' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#A0792E] hover:bg-[#D4A85C] disabled:opacity-50 text-[#161616] text-xs font-bold uppercase transition-colors"
                            style={{ borderRadius: 3, letterSpacing: '0.16em' }}
                        >
                            <Save size={13} />
                            {saving ? 'Salvando…' : 'Criar reserva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const inp = "w-full px-2.5 py-2 bg-white dark:bg-[#202020] border border-gray-200 dark:border-[rgba(232,203,133,0.18)] focus:border-[#D4A85C] focus:outline-none text-sm text-gray-900 dark:text-[#F5F0E4]";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <label className={`block ${className ?? ''}`}>
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
                {label}
            </span>
            {children}
        </label>
    );
}
