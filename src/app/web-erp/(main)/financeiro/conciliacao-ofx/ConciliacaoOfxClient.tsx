'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    Upload, FileText, Link2, PlusCircle, Ban, CheckCircle2, AlertTriangle,
    Loader2, ArrowUpRight, ArrowDownRight, Building2, Calendar,
} from 'lucide-react';
import { analyzeOfx, type OfxLineWithMatches, type AnalyzeOfxResult } from './actions';
import {
    vincularTransacaoOfx, criarTransacaoDoOfx, ignorarOfxFitid,
} from '../actions';

interface Account { id: string; name: string; type: string; }
interface Category { id: string; name: string; type: string; }

interface Props {
    accounts: Account[];
    categories: Category[];
}

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtDate = (d: string) =>
    new Date(d + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });

export default function ConciliacaoOfxClient({ accounts, categories }: Props) {
    const router = useRouter();
    const [accountId, setAccountId] = useState<string>(accounts[0]?.id ?? '');
    const [file, setFile] = useState<File | null>(null);
    const [dayWindow, setDayWindow] = useState(7);
    const [result, setResult] = useState<AnalyzeOfxResult | null>(null);
    const [isAnalyzing, startAnalyze] = useTransition();
    const [busyFitid, setBusyFitid] = useState<string | null>(null);
    const [filter, setFilter] = useState<'unlinked' | 'linked' | 'ignored' | 'all'>('unlinked');

    const lines = result?.lines ?? [];
    const filtered = useMemo(() => {
        if (filter === 'all') return lines;
        if (filter === 'linked') return lines.filter(l => l.alreadyLinkedTo);
        if (filter === 'ignored') return lines.filter(l => l.ignored);
        return lines.filter(l => !l.alreadyLinkedTo && !l.ignored);
    }, [lines, filter]);

    function handleAnalyze() {
        if (!file || !accountId) return;
        const fd = new FormData();
        fd.append('file', file);
        fd.append('accountId', accountId);
        fd.append('dayWindow', String(dayWindow));
        startAnalyze(async () => {
            const r = await analyzeOfx(fd);
            setResult(r);
        });
    }

    async function handleVincular(line: OfxLineWithMatches, transactionId: string) {
        setBusyFitid(line.fitid);
        const r = await vincularTransacaoOfx({
            transactionId,
            fitid: line.fitid,
            accountId,
            actualDate: line.date,
            memo: `${line.name}${line.memo ? ` — ${line.memo}` : ''}`.slice(0, 280),
        });
        setBusyFitid(null);
        if (!r.success) { alert(r.error ?? 'Falha ao vincular.'); return; }
        // Reanalisa pra refletir
        handleAnalyze();
        router.refresh();
    }

    async function handleCriarNova(line: OfxLineWithMatches) {
        setBusyFitid(line.fitid);
        const r = await criarTransacaoDoOfx({
            accountId,
            fitid: line.fitid,
            type: line.type,
            amount: line.amount,
            description: `${line.type === 'income' ? 'Pix recebido — ' : 'Pix enviado — '}${line.name || line.memo || 'Transação OFX'}`,
            transactionDate: line.date,
            memo: line.memo || null,
        });
        setBusyFitid(null);
        if (!r.success) { alert(r.error ?? 'Falha ao criar lançamento.'); return; }
        handleAnalyze();
        router.refresh();
    }

    async function handleIgnorar(line: OfxLineWithMatches) {
        setBusyFitid(line.fitid);
        const r = await ignorarOfxFitid({ accountId, fitid: line.fitid, reason: 'Marcado manualmente' });
        setBusyFitid(null);
        if (!r.success) { alert(r.error ?? 'Falha ao ignorar.'); return; }
        handleAnalyze();
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-wide uppercase bg-gradient-to-r from-[#D4A85C] via-[#FFF8DC] to-[#D4A85C] text-transparent bg-clip-text">
                    Conciliação OFX
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-[#888] font-medium tracking-wider uppercase">
                    Importar extrato bancário e vincular às contas a pagar/receber
                </p>
            </div>

            {/* Upload box */}
            <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest block mb-2">
                            Conta de destino
                        </label>
                        <select
                            value={accountId}
                            onChange={e => setAccountId(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-[#D4A85C]/50"
                        >
                            {accounts.length === 0 && <option value="">Cadastre uma conta primeiro</option>}
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest block mb-2">
                            Janela de match (dias)
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={30}
                            value={dayWindow}
                            onChange={e => setDayWindow(Number(e.target.value) || 7)}
                            className="w-28 px-3 py-2.5 text-sm bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-[#D4A85C]/50"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest block mb-2">
                            Arquivo OFX
                        </label>
                        <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-[#0A0A0A] border border-dashed border-gray-300 dark:border-[#333] hover:border-[#D4A85C]/50 text-sm text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer transition-all">
                            <Upload className="w-4 h-4 text-[#D4A85C]" />
                            <span className="truncate">{file ? file.name : 'Selecionar .ofx'}</span>
                            <input
                                type="file"
                                accept=".ofx,application/x-ofx,text/plain"
                                className="hidden"
                                onChange={e => setFile(e.target.files?.[0] ?? null)}
                            />
                        </label>
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={!file || !accountId || isAnalyzing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#A0792E] to-[#9A7209] text-black rounded-xl text-sm font-bold shadow-lg shadow-[#A0792E]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
                    >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        Analisar
                    </button>
                </div>
                {result && !result.success && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                        <AlertTriangle className="w-4 h-4" /> {result.error}
                    </div>
                )}
            </div>

            {/* Summary */}
            {result?.success && result.summary && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <SummaryCard label="Banco / Conta" value={`${result.summary.bankId ?? '—'} · ${result.summary.accountIdRaw ?? '—'}`} icon={Building2} />
                    <SummaryCard label="Período" value={`${result.summary.dateStart ? fmtDate(result.summary.dateStart) : '—'} → ${result.summary.dateEnd ? fmtDate(result.summary.dateEnd) : '—'}`} icon={Calendar} />
                    <SummaryCard label="Saldo OFX" value={result.summary.ledgerBalance != null ? fmt(result.summary.ledgerBalance) : '—'} icon={Building2} />
                    <SummaryCard
                        label="Linhas"
                        value={`${result.summary.totalTrn} · ${result.summary.alreadyLinked} vinc · ${result.summary.unlinked} pend`}
                        icon={CheckCircle2}
                    />
                    <SummaryCard label="Ignorados" value={String(result.summary.ignored)} icon={Ban} />
                </div>
            )}

            {/* Filter */}
            {result?.success && lines.length > 0 && (
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#0A0A0A] p-1 rounded-xl w-fit">
                    {([
                        { k: 'unlinked', l: `Pendentes (${result.summary?.unlinked ?? 0})` },
                        { k: 'linked', l: `Vinculadas (${result.summary?.alreadyLinked ?? 0})` },
                        { k: 'ignored', l: `Ignoradas (${result.summary?.ignored ?? 0})` },
                        { k: 'all', l: `Todas (${lines.length})` },
                    ] as const).map(opt => (
                        <button
                            key={opt.k}
                            onClick={() => setFilter(opt.k)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === opt.k ? 'bg-white dark:bg-[#222] text-[#D4A85C] shadow' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            {opt.l}
                        </button>
                    ))}
                </div>
            )}

            {/* Lines */}
            {result?.success && filtered.length === 0 && lines.length > 0 && (
                <div className="text-sm text-gray-500 italic">Nada nesse filtro.</div>
            )}

            <div className="space-y-3">
                {filtered.map(line => (
                    <OfxLineCard
                        key={line.fitid}
                        line={line}
                        busy={busyFitid === line.fitid}
                        onVincular={(id) => handleVincular(line, id)}
                        onCriar={() => handleCriarNova(line)}
                        onIgnorar={() => handleIgnorar(line)}
                    />
                ))}
            </div>
        </div>
    );
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
    return (
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">
                <Icon className="w-3.5 h-3.5 text-[#D4A85C]" /> {label}
            </div>
            <p className="mt-1.5 text-sm font-mono text-gray-900 dark:text-white truncate">{value}</p>
        </div>
    );
}

function OfxLineCard({
    line, busy, onVincular, onCriar, onIgnorar,
}: {
    line: OfxLineWithMatches;
    busy: boolean;
    onVincular: (transactionId: string) => void;
    onCriar: () => void;
    onIgnorar: () => void;
}) {
    const isIncome = line.type === 'income';
    const bestScore = line.suggestions[0]?.score ?? 0;
    const statusTone =
        line.alreadyLinkedTo ? 'border-emerald-500/40 bg-emerald-500/5'
        : line.ignored ? 'border-gray-300 dark:border-[#333] bg-gray-50 dark:bg-[#0A0A0A] opacity-60'
        : bestScore >= 80 ? 'border-[#D4A85C]/40 bg-[#D4A85C]/5'
        : 'border-gray-200 dark:border-[#222] bg-white dark:bg-[#0F0F0F]';

    return (
        <div className={`rounded-2xl border shadow-xl ${statusTone}`}>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-0">
                {/* OFX side */}
                <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100 dark:border-[#1A1A1A]">
                    <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className={`font-mono text-lg font-extrabold tracking-tight ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {isIncome ? '+' : '−'} {fmt(line.amount)}
                                </p>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#888] bg-gray-100 dark:bg-[#1A1A1A] px-2 py-0.5 rounded">
                                    {fmtDate(line.date)}
                                </span>
                            </div>
                            <p className="mt-1.5 text-sm font-bold text-gray-900 dark:text-white truncate">{line.name || '—'}</p>
                            {line.memo && (
                                <p className="mt-0.5 text-xs text-gray-500 dark:text-[#888] line-clamp-2">{line.memo}</p>
                            )}
                            <p className="mt-2 text-[10px] font-mono text-gray-400 dark:text-[#555]">FITID {line.fitid}</p>
                        </div>
                    </div>
                </div>

                {/* Action side */}
                <div className="p-5">
                    {line.alreadyLinkedTo ? (
                        <div className="flex items-center gap-2 text-sm text-emerald-500 font-semibold">
                            <CheckCircle2 className="w-4 h-4" /> Já vinculada à transação <span className="font-mono text-xs">{line.alreadyLinkedTo.slice(0, 8)}</span>
                        </div>
                    ) : line.ignored ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Ban className="w-4 h-4" /> Marcada como ignorada
                        </div>
                    ) : (
                        <>
                            {line.suggestions.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">
                                        Candidatos no ERP
                                    </p>
                                    {line.suggestions.slice(0, 4).map(s => (
                                        <div key={s.transaction.id} className="flex items-center gap-3 p-2.5 bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl">
                                            <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${s.score >= 80 ? 'bg-[#D4A85C]/20 text-[#A0792E]' : s.score >= 50 ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-500'}`}>
                                                {s.score}%
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                    {s.transaction.description}
                                                </p>
                                                <p className="text-[10px] text-gray-500 dark:text-[#888]">
                                                    {fmtDate(s.transaction.transaction_date)} · {fmt(Number(s.transaction.amount))} · {s.transaction.status} · Δ{s.dateDiffDays}d
                                                </p>
                                            </div>
                                            <button
                                                disabled={busy}
                                                onClick={() => onVincular(s.transaction.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                                            >
                                                <Link2 className="w-3.5 h-3.5" /> Vincular
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 italic mb-3">Nenhum candidato encontrado no ERP nessa janela.</p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-[#1A1A1A]">
                                <button
                                    disabled={busy}
                                    onClick={onCriar}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A85C]/10 hover:bg-[#D4A85C]/20 border border-[#D4A85C]/30 text-[#A0792E] dark:text-[#D4A85C] text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                                >
                                    <PlusCircle className="w-3.5 h-3.5" /> Criar nova
                                </button>
                                <button
                                    disabled={busy}
                                    onClick={onIgnorar}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#222] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                                >
                                    <Ban className="w-3.5 h-3.5" /> Ignorar
                                </button>
                                {busy && <Loader2 className="w-4 h-4 animate-spin text-[#D4A85C] self-center" />}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
