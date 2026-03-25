'use client';

import { useState, useRef, useMemo } from 'react';
import {
    FileText, Plus, Search, Download, Trash2, X, Save,
    Calendar, DollarSign, User, AlertTriangle, CheckCircle,
    Clock, XCircle, Upload, ExternalLink, StickyNote, Filter,
} from 'lucide-react';
import { Contract, ContractInput, createContract, updateContract, deleteContract } from '@/app/web-admin/actions/contracts';
import { createClient } from '@/utils/supabase/client';

const STATUS_CONFIG = {
    Ativo:      { label: 'Ativo',      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500', icon: CheckCircle },
    Pendente:   { label: 'Pendente',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',         dot: 'bg-amber-500',   icon: Clock },
    Vencido:    { label: 'Vencido',    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',                 dot: 'bg-red-500',     icon: AlertTriangle },
    Cancelado:  { label: 'Cancelado',  color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',               dot: 'bg-gray-400',    icon: XCircle },
};

const STATUSES = Object.keys(STATUS_CONFIG) as Contract['status'][];

const EMPTY_FORM: ContractInput = {
    client_name: '',
    title: '',
    status: 'Pendente',
    value: null,
    start_date: null,
    end_date: null,
    file_url: null,
    file_path: null,
    file_name: null,
    notes: null,
};

function formatCurrency(v?: number | null) {
    if (v == null) return '—';
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(d?: string | null) {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
}

function daysUntil(d?: string | null): number | null {
    if (!d) return null;
    const diff = new Date(d).getTime() - Date.now();
    return Math.ceil(diff / 86_400_000);
}

interface Props {
    initialContracts: Contract[];
}

export function ContractsView({ initialContracts }: Props) {
    const [contracts, setContracts] = useState<Contract[]>(initialContracts);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Contract | null>(null);
    const [form, setForm] = useState<ContractInput>(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<{ url: string; path: string; name: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setUploadedFile(null);
        setModalOpen(true);
    };

    const openEdit = (c: Contract) => {
        setEditing(c);
        setForm({
            client_name: c.client_name,
            title: c.title,
            status: c.status,
            value: c.value ?? null,
            start_date: c.start_date ?? null,
            end_date: c.end_date ?? null,
            file_url: c.file_url ?? null,
            file_path: c.file_path ?? null,
            file_name: c.file_name ?? null,
            notes: c.notes ?? null,
        });
        setUploadedFile(c.file_url ? { url: c.file_url, path: c.file_path!, name: c.file_name! } : null);
        setModalOpen(true);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const supabase = createClient();
        try {
            const safeName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
            const filePath = `contracts/${Date.now()}_${safeName}`;
            const { error } = await supabase.storage.from('contracts').upload(filePath, file, {
                contentType: file.type || 'application/pdf',
            });
            if (error) throw new Error(error.message);
            const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(filePath);
            setUploadedFile({ url: urlData.publicUrl, path: filePath, name: file.name });
            setForm(f => ({ ...f, file_url: urlData.publicUrl, file_path: filePath, file_name: file.name }));
        } catch (err: any) {
            alert(`Erro no upload: ${err.message}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveFile = async () => {
        if (!uploadedFile) return;
        const supabase = createClient();
        await supabase.storage.from('contracts').remove([uploadedFile.path]).catch(() => {});
        setUploadedFile(null);
        setForm(f => ({ ...f, file_url: null, file_path: null, file_name: null }));
    };

    const handleSave = async () => {
        if (!form.client_name.trim() || !form.title.trim()) return;
        setIsSaving(true);
        try {
            if (editing) {
                const updated = await updateContract(editing.id, form);
                setContracts(cs => cs.map(c => c.id === updated.id ? updated : c));
            } else {
                const created = await createContract(form);
                setContracts(cs => [created, ...cs]);
            }
            setModalOpen(false);
        } catch (err: any) {
            alert(`Erro ao salvar: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, clientName: string) => {
        if (!confirm(`Excluir contrato de "${clientName}"?`)) return;
        await deleteContract(id);
        setContracts(cs => cs.filter(c => c.id !== id));
    };

    const filtered = useMemo(() => {
        let result = contracts;
        if (filterStatus !== 'all') result = result.filter(c => c.status === filterStatus);
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(c =>
                c.client_name.toLowerCase().includes(q) ||
                c.title.toLowerCase().includes(q)
            );
        }
        return result;
    }, [contracts, filterStatus, search]);

    const stats = useMemo(() => ({
        total: contracts.length,
        ativos: contracts.filter(c => c.status === 'Ativo').length,
        vencendo: contracts.filter(c => { const d = daysUntil(c.end_date); return d !== null && d >= 0 && d <= 30 && c.status === 'Ativo'; }).length,
        valor: contracts.filter(c => c.status === 'Ativo').reduce((s, c) => s + (c.value || 0), 0),
    }), [contracts]);

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

            {/* ── Stats bar ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 shrink-0">
                {[
                    { label: 'Total', value: stats.total, sub: 'contratos', color: 'text-gray-700 dark:text-gray-300', bg: 'dark:bg-[#1A1A1A]' },
                    { label: 'Ativos', value: stats.ativos, sub: 'em vigência', color: 'text-emerald-600 dark:text-emerald-400', bg: 'dark:bg-[#1A1A1A]' },
                    { label: 'Vencendo', value: stats.vencendo, sub: 'em 30 dias', color: 'text-amber-600 dark:text-amber-400', bg: 'dark:bg-[#1A1A1A]' },
                    { label: formatCurrency(stats.valor), value: null, sub: 'em contratos ativos', color: 'text-[#B8860B]', bg: 'dark:bg-[#1A1A1A]' },
                ].map((s, i) => (
                    <div key={i} className={`bg-white ${s.bg} border border-gray-200 dark:border-[#222222] rounded-xl p-4`}>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value !== null ? s.value : s.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-3 mb-4 shrink-0">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por cliente ou título..."
                        className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#222222] rounded-xl outline-none focus:ring-2 focus:ring-[#B8860B] text-gray-900 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-1.5">
                    <Filter size={14} className="text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="text-sm bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#222222] rounded-xl px-3 py-2 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-[#B8860B]"
                    >
                        <option value="all">Todos os status</option>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#B8860B]/20 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                >
                    <Plus size={15} /> Novo Contrato
                </button>
            </div>

            {/* ── Table ── */}
            <div className="flex-1 overflow-auto custom-scrollbar rounded-xl border border-gray-200 dark:border-[#222222]">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <FileText size={48} className="mb-4 opacity-30" />
                        <p className="font-medium">Nenhum contrato encontrado</p>
                        <p className="text-sm opacity-70 mt-1">Clique em "Novo Contrato" para adicionar.</p>
                    </div>
                ) : (
                    <table className="w-full min-w-[800px] text-sm">
                        <thead className="sticky top-0 bg-gray-50 dark:bg-[#111111] z-10">
                            <tr className="border-b border-gray-200 dark:border-[#222222]">
                                {['Cliente', 'Título', 'Status', 'Vigência', 'Valor', 'Arquivo', ''].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[#1A1A1A] divide-y divide-gray-100 dark:divide-[#222222]">
                            {filtered.map(c => {
                                const cfg = STATUS_CONFIG[c.status];
                                const StatusIcon = cfg.icon;
                                const days = daysUntil(c.end_date);
                                const expiringSoon = days !== null && days >= 0 && days <= 30 && c.status === 'Ativo';
                                const expired = days !== null && days < 0 && c.status === 'Ativo';

                                return (
                                    <tr
                                        key={c.id}
                                        onClick={() => openEdit(c)}
                                        className="hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors cursor-pointer group"
                                    >
                                        {/* Cliente */}
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B8860B] to-[#9A7209] text-black text-xs flex items-center justify-center font-bold shrink-0">
                                                    {c.client_name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[140px]" title={c.client_name}>
                                                    {c.client_name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Título */}
                                        <td className="px-4 py-3.5">
                                            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px] block" title={c.title}>
                                                {c.title}
                                            </span>
                                            {c.notes && (
                                                <span className="text-xs text-gray-400 truncate max-w-[200px] block mt-0.5">{c.notes}</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                                                <StatusIcon size={11} />
                                                {cfg.label}
                                            </span>
                                        </td>

                                        {/* Vigência */}
                                        <td className="px-4 py-3.5">
                                            <div className="text-gray-700 dark:text-gray-300 text-xs space-y-0.5">
                                                {c.start_date && <div className="flex items-center gap-1"><Calendar size={11} className="text-gray-400" /> {formatDate(c.start_date)}</div>}
                                                {c.end_date && (
                                                    <div className={`flex items-center gap-1 ${expiringSoon ? 'text-amber-500 font-semibold' : expired ? 'text-red-500' : ''}`}>
                                                        <Calendar size={11} className={expiringSoon ? 'text-amber-500' : expired ? 'text-red-500' : 'text-gray-400'} />
                                                        {formatDate(c.end_date)}
                                                        {expiringSoon && <span className="ml-1 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-1.5 py-0.5 rounded-full">vence em {days}d</span>}
                                                        {expired && <span className="ml-1 text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 px-1.5 py-0.5 rounded-full">vencido</span>}
                                                    </div>
                                                )}
                                                {!c.start_date && !c.end_date && <span className="text-gray-400">—</span>}
                                            </div>
                                        </td>

                                        {/* Valor */}
                                        <td className="px-4 py-3.5">
                                            <span className={`font-semibold ${c.value ? 'text-[#B8860B]' : 'text-gray-400'}`}>
                                                {formatCurrency(c.value)}
                                            </span>
                                        </td>

                                        {/* Arquivo */}
                                        <td className="px-4 py-3.5">
                                            {c.file_url ? (
                                                <a
                                                    href={c.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={e => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                                    title={c.file_name || 'Abrir arquivo'}
                                                >
                                                    <FileText size={13} />
                                                    <span className="truncate max-w-[100px]">{c.file_name || 'Contrato'}</span>
                                                    <ExternalLink size={11} />
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Sem arquivo</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3.5">
                                            <button
                                                onClick={e => { e.stopPropagation(); handleDelete(c.id, c.client_name); }}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                title="Excluir contrato"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Modal ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-[#222222] flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#222222] shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#B8860B]/10 rounded-xl">
                                    <FileText size={20} className="text-[#B8860B]" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {editing ? 'Editar Contrato' : 'Novo Contrato'}
                                </h2>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1">
                                <X size={22} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto flex-1 p-6 space-y-5 custom-scrollbar">

                            {/* Cliente + Título */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                                        <User size={13} /> Cliente
                                    </label>
                                    <input
                                        type="text"
                                        value={form.client_name}
                                        onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                                        placeholder="Nome do cliente..."
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none text-gray-900 dark:text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                                        <FileText size={13} /> Título do Contrato
                                    </label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                        placeholder="Ex: Contrato de Venda — Touro Prometeu..."
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none text-gray-900 dark:text-white text-sm"
                                    />
                                </div>
                            </div>

                            {/* Status + Valor */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={e => setForm(f => ({ ...f, status: e.target.value as Contract['status'] }))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] outline-none text-gray-900 dark:text-white text-sm"
                                    >
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                                        <DollarSign size={13} /> Valor (R$)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.value ?? ''}
                                        onChange={e => setForm(f => ({ ...f, value: e.target.value ? parseFloat(e.target.value) : null }))}
                                        placeholder="0,00"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] outline-none text-gray-900 dark:text-white text-sm"
                                    />
                                </div>
                            </div>

                            {/* Datas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                                        <Calendar size={13} /> Início da Vigência
                                    </label>
                                    <input
                                        type="date"
                                        value={form.start_date ?? ''}
                                        onChange={e => setForm(f => ({ ...f, start_date: e.target.value || null }))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] outline-none text-gray-900 dark:text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                                        <Calendar size={13} /> Fim da Vigência
                                    </label>
                                    <input
                                        type="date"
                                        value={form.end_date ?? ''}
                                        onChange={e => setForm(f => ({ ...f, end_date: e.target.value || null }))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] outline-none text-gray-900 dark:text-white text-sm"
                                    />
                                </div>
                            </div>

                            {/* Observações */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                                    <StickyNote size={13} /> Observações
                                </label>
                                <textarea
                                    value={form.notes ?? ''}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value || null }))}
                                    rows={3}
                                    placeholder="Detalhes adicionais sobre o contrato..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] outline-none text-gray-900 dark:text-white text-sm resize-none"
                                />
                            </div>

                            {/* Arquivo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                                    <Upload size={13} /> Arquivo do Contrato
                                </label>

                                {uploadedFile ? (
                                    <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                        <FileText size={18} className="text-blue-500 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">{uploadedFile.name}</p>
                                        </div>
                                        <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer"
                                            className="p-1.5 text-blue-500 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40">
                                            <Download size={15} />
                                        </a>
                                        <button type="button" onClick={handleRemoveFile}
                                            className="p-1.5 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <X size={15} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="w-full flex flex-col items-center gap-2 px-4 py-6 bg-gray-50 dark:bg-[#111111] border-2 border-dashed border-gray-200 dark:border-[#333333] rounded-xl hover:border-[#B8860B] hover:bg-[#B8860B]/5 transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {isUploading ? (
                                            <div className="w-6 h-6 border-2 border-[#B8860B]/30 border-t-[#B8860B] rounded-full animate-spin" />
                                        ) : (
                                            <Upload size={22} className="text-gray-400" />
                                        )}
                                        <span className="text-sm text-gray-500">
                                            {isUploading ? 'Enviando...' : 'Clique para fazer upload do contrato (PDF)'}
                                        </span>
                                    </button>
                                )}
                                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-[#222222] shrink-0">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-[#222222] hover:bg-gray-200 dark:hover:bg-[#2A2A2A] rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving || !form.client_name.trim() || !form.title.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#B8860B]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save size={15} />}
                                {isSaving ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
