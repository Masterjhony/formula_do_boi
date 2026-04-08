'use client';

import { useState, useRef, useMemo } from 'react';
import {
    FileText, Plus, Search, Download, Trash2, X, Save,
    Calendar, DollarSign, User, AlertTriangle, CheckCircle,
    Clock, XCircle, Upload, ExternalLink, StickyNote,
    Grid3X3, List, Folder, FolderOpen, ChevronRight,
} from 'lucide-react';
import { Contract, ContractInput, createContract, updateContract, deleteContract, uploadContractFile, deleteContractFile } from '@/app/web-admin/actions/contracts';

const STATUS_CONFIG = {
    Ativo:     { label: 'Ativo',     color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500', icon: CheckCircle,   folderColor: 'text-emerald-500' },
    Pendente:  { label: 'Pendente',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',         dot: 'bg-amber-500',   icon: Clock,          folderColor: 'text-amber-500' },
    Vencido:   { label: 'Vencido',   color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',                 dot: 'bg-red-500',     icon: AlertTriangle,  folderColor: 'text-red-500' },
    Cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',               dot: 'bg-gray-400',    icon: XCircle,        folderColor: 'text-gray-400' },
};

const STATUSES = Object.keys(STATUS_CONFIG) as Contract['status'][];

const EMPTY_FORM: ContractInput = {
    client_name: '', title: '', status: 'Pendente',
    value: null, start_date: null, end_date: null,
    file_url: null, file_path: null, file_name: null, notes: null,
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
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
}

interface Props { initialContracts: Contract[]; }

export function ContractsView({ initialContracts }: Props) {
    const [contracts, setContracts] = useState<Contract[]>(initialContracts);
    const [search, setSearch] = useState('');
    const [currentFolder, setCurrentFolder] = useState<'all' | Contract['status']>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Contract | null>(null);
    const [form, setForm] = useState<ContractInput>(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<{ url: string; path: string; name: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setUploadedFile(null); setModalOpen(true); };
    const openEdit = (c: Contract) => {
        setEditing(c);
        setForm({ client_name: c.client_name, title: c.title, status: c.status, value: c.value ?? null, start_date: c.start_date ?? null, end_date: c.end_date ?? null, file_url: c.file_url ?? null, file_path: c.file_path ?? null, file_name: c.file_name ?? null, notes: c.notes ?? null });
        setUploadedFile(c.file_url ? { url: c.file_url, path: c.file_path!, name: c.file_name! } : null);
        setModalOpen(true);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const result = await uploadContractFile(fd);
            setUploadedFile(result);
            setForm(f => ({ ...f, file_url: result.url, file_path: result.path, file_name: result.name }));
        } catch (err: any) { alert(`Erro no upload: ${err.message}`); }
        finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };

    const handleRemoveFile = async () => {
        if (!uploadedFile) return;
        await deleteContractFile(uploadedFile.path).catch(() => {});
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
        } catch (err: any) { alert(`Erro ao salvar: ${err.message}`); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async (id: string, clientName: string) => {
        if (!confirm(`Excluir contrato de "${clientName}"?`)) return;
        await deleteContract(id);
        setContracts(cs => cs.filter(c => c.id !== id));
    };

    const counts = useMemo(() => {
        const total = contracts.length;
        const byStatus = Object.fromEntries(STATUSES.map(s => [s, contracts.filter(c => c.status === s).length]));
        const ativo = byStatus['Ativo'] ?? 0;
        const vencendo = contracts.filter(c => { const d = daysUntil(c.end_date); return d !== null && d >= 0 && d <= 30 && c.status === 'Ativo'; }).length;
        const valor = contracts.filter(c => c.status === 'Ativo').reduce((s, c) => s + (c.value || 0), 0);
        return { total, byStatus, ativo, vencendo, valor };
    }, [contracts]);

    const filtered = useMemo(() => {
        let result = currentFolder === 'all' ? contracts : contracts.filter(c => c.status === currentFolder);
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(c => c.client_name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));
        }
        return result;
    }, [contracts, currentFolder, search]);

    const isRoot = currentFolder === 'all' && !search.trim();

    return (
        <div className="flex flex-1 min-h-0 gap-0 overflow-hidden rounded-xl border border-gray-200 dark:border-[#222222]">

            {/* ── Sidebar ── */}
            <aside className="w-52 shrink-0 flex flex-col bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#222222]">
                <div className="px-4 pt-5 pb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Pastas</p>
                </div>

                {/* All */}
                <button
                    onClick={() => { setCurrentFolder('all'); setSearch(''); }}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${currentFolder === 'all' ? 'text-[#B8860B] bg-[#B8860B]/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1A1A1A]'}`}
                >
                    <div className="flex items-center gap-2.5">
                        <Folder size={15} className={currentFolder === 'all' ? 'text-[#B8860B]' : 'text-gray-400'} />
                        Todos os Contratos
                    </div>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${currentFolder === 'all' ? 'bg-[#B8860B] text-black' : 'bg-gray-200 dark:bg-[#2A2A2A] text-gray-600 dark:text-gray-400'}`}>
                        {counts.total}
                    </span>
                </button>

                {/* Status folders */}
                {STATUSES.map(status => {
                    const cfg = STATUS_CONFIG[status];
                    const isActive = currentFolder === status;
                    const StatusIcon = cfg.icon;
                    return (
                        <button
                            key={status}
                            onClick={() => { setCurrentFolder(status); setSearch(''); }}
                            className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${isActive ? 'text-[#B8860B] bg-[#B8860B]/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1A1A1A]'}`}
                        >
                            <div className="flex items-center gap-2.5">
                                <StatusIcon size={14} className={isActive ? 'text-[#B8860B]' : cfg.folderColor} />
                                {status}
                            </div>
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#B8860B] text-black' : 'bg-gray-200 dark:bg-[#2A2A2A] text-gray-600 dark:text-gray-400'}`}>
                                {counts.byStatus[status] ?? 0}
                            </span>
                        </button>
                    );
                })}

                {/* Bottom: valor */}
                <div className="mt-auto px-4 py-5 border-t border-gray-100 dark:border-[#222222]">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Valor em Ativos</p>
                    <p className="text-sm font-bold text-[#B8860B]">{formatCurrency(counts.valor)}</p>
                    {counts.vencendo > 0 && (
                        <p className="text-xs text-amber-500 mt-1.5 flex items-center gap-1">
                            <AlertTriangle size={11} />
                            {counts.vencendo} vencendo em 30d
                        </p>
                    )}
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-[#0D0D0D]">

                {/* Toolbar */}
                <div className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#222222] shrink-0">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 mr-2 shrink-0">
                        <span
                            className="hover:text-[#B8860B] cursor-pointer transition-colors"
                            onClick={() => { setCurrentFolder('all'); setSearch(''); }}
                        >
                            Contratos
                        </span>
                        {currentFolder !== 'all' && (
                            <>
                                <ChevronRight size={13} />
                                <span className="text-gray-900 dark:text-white font-medium">{currentFolder}</span>
                            </>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 min-w-0">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar contratos..."
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#222222] rounded-xl outline-none focus:ring-2 focus:ring-[#B8860B] text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center bg-gray-100 dark:bg-[#1A1A1A] rounded-xl p-1">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-[#2A2A2A] shadow text-[#B8860B]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                            <Grid3X3 size={14} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-[#2A2A2A] shadow text-[#B8860B]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                            <List size={14} />
                        </button>
                    </div>

                    {/* New contract */}
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#B8860B]/20 transition-all hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                    >
                        <Upload size={14} /> Novo Contrato
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: String(counts.total), sub: 'TOTAL', color: 'text-gray-700 dark:text-gray-200', icon: <FileText size={18} className="text-gray-400" /> },
                            { label: String(counts.ativo),    sub: 'ATIVOS',    color: 'text-emerald-600 dark:text-emerald-400', icon: <CheckCircle size={18} className="text-emerald-500" /> },
                            { label: String(counts.vencendo), sub: 'VENCENDO',  color: 'text-amber-600 dark:text-amber-400',   icon: <Clock size={18} className="text-amber-500" /> },
                            { label: String(counts.byStatus['Pendente'] ?? 0), sub: 'PENDENTES', color: 'text-blue-600 dark:text-blue-400', icon: <AlertTriangle size={18} className="text-blue-500" /> },
                        ].map((s, i) => (
                            <div key={i} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl p-4 flex items-center gap-3">
                                <div className="shrink-0">{s.icon}</div>
                                <div>
                                    <p className={`text-2xl font-bold leading-none ${s.color}`}>{s.label}</p>
                                    <p className="text-[10px] font-semibold text-gray-400 tracking-wider mt-1">{s.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Root: folder cards */}
                    {isRoot && (
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Pastas</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {STATUSES.map(status => {
                                    const cfg = STATUS_CONFIG[status];
                                    const StatusIcon = cfg.icon;
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => setCurrentFolder(status)}
                                            className="group flex flex-col gap-3 p-4 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl hover:border-[#B8860B]/40 hover:shadow-md hover:shadow-[#B8860B]/10 transition-all text-left"
                                        >
                                            <div className="flex items-center justify-between">
                                                <FolderOpen size={28} className={`${cfg.folderColor} group-hover:scale-110 transition-transform`} />
                                                <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-[#B8860B] transition-colors" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{status}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{counts.byStatus[status] ?? 0} contrato{(counts.byStatus[status] ?? 0) !== 1 ? 's' : ''}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Contract list (when searching or inside a folder) */}
                    {(!isRoot || search.trim()) && (
                        <div>
                            {!search.trim() && currentFolder !== 'all' && (
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">{currentFolder}</p>
                            )}
                            {search.trim() && (
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Resultados para "{search}"</p>
                            )}

                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                    <FileText size={40} className="mb-3 opacity-20" />
                                    <p className="font-medium text-sm">Nenhum contrato encontrado</p>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filtered.map(c => <ContractCard key={c.id} contract={c} onEdit={openEdit} onDelete={handleDelete} />)}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl overflow-hidden">
                                    <table className="w-full min-w-[600px] text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-[#222222] bg-gray-50 dark:bg-[#0D0D0D]">
                                                {['Cliente', 'Título', 'Status', 'Vigência', 'Valor', 'Arquivo', ''].map(h => (
                                                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-[#222222]">
                                            {filtered.map(c => <ContractRow key={c.id} contract={c} onEdit={openEdit} onDelete={handleDelete} />)}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* ── Modal ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-[#222222] flex flex-col max-h-[90vh]">

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

                        <div className="overflow-y-auto flex-1 p-6 space-y-5 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5"><User size={13} /> Cliente</label>
                                    <input type="text" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Nome do cliente..." className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none text-gray-900 dark:text-white text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5"><FileText size={13} /> Título do Contrato</label>
                                    <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Contrato de Venda — Touro Prometeu..." className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none text-gray-900 dark:text-white text-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Contract['status'] }))} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] outline-none text-gray-900 dark:text-white text-sm">
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5"><DollarSign size={13} /> Valor (R$)</label>
                                    <input type="number" min="0" step="0.01" value={form.value ?? ''} onChange={e => setForm(f => ({ ...f, value: e.target.value ? parseFloat(e.target.value) : null }))} placeholder="0,00" className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] outline-none text-gray-900 dark:text-white text-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5"><Calendar size={13} /> Início da Vigência</label>
                                    <input type="date" value={form.start_date ?? ''} onChange={e => setForm(f => ({ ...f, start_date: e.target.value || null }))} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] outline-none text-gray-900 dark:text-white text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5"><Calendar size={13} /> Fim da Vigência</label>
                                    <input type="date" value={form.end_date ?? ''} onChange={e => setForm(f => ({ ...f, end_date: e.target.value || null }))} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] outline-none text-gray-900 dark:text-white text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5"><StickyNote size={13} /> Observações</label>
                                <textarea value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value || null }))} rows={3} placeholder="Detalhes adicionais sobre o contrato..." className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] outline-none text-gray-900 dark:text-white text-sm resize-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5"><Upload size={13} /> Arquivo do Contrato</label>
                                {uploadedFile ? (
                                    <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                        <FileText size={18} className="text-blue-500 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">{uploadedFile.name}</p>
                                        </div>
                                        <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-blue-500 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40">
                                            <Download size={15} />
                                        </a>
                                        <button type="button" onClick={handleRemoveFile} className="p-1.5 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <X size={15} />
                                        </button>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full flex flex-col items-center gap-2 px-4 py-6 bg-gray-50 dark:bg-[#111111] border-2 border-dashed border-gray-200 dark:border-[#333333] rounded-xl hover:border-[#B8860B] hover:bg-[#B8860B]/5 transition-all disabled:opacity-50 cursor-pointer">
                                        {isUploading ? <div className="w-6 h-6 border-2 border-[#B8860B]/30 border-t-[#B8860B] rounded-full animate-spin" /> : <Upload size={22} className="text-gray-400" />}
                                        <span className="text-sm text-gray-500">{isUploading ? 'Enviando...' : 'Clique para fazer upload do contrato (PDF)'}</span>
                                    </button>
                                )}
                                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-[#222222] shrink-0">
                            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-[#222222] hover:bg-gray-200 dark:hover:bg-[#2A2A2A] rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button type="button" onClick={handleSave} disabled={isSaving || !form.client_name.trim() || !form.title.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#B8860B]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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

/* ── Contract Card (grid view) ── */
function ContractCard({ contract: c, onEdit, onDelete }: { contract: Contract; onEdit: (c: Contract) => void; onDelete: (id: string, name: string) => void }) {
    const cfg = STATUS_CONFIG[c.status];
    const StatusIcon = cfg.icon;
    const days = daysUntil(c.end_date);
    const expiringSoon = days !== null && days >= 0 && days <= 30 && c.status === 'Ativo';

    return (
        <div
            onClick={() => onEdit(c)}
            className="group relative bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl p-4 hover:border-[#B8860B]/40 hover:shadow-md hover:shadow-[#B8860B]/10 transition-all cursor-pointer"
        >
            {/* Delete btn */}
            <button
                onClick={e => { e.stopPropagation(); onDelete(c.id, c.client_name); }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            >
                <Trash2 size={13} />
            </button>

            {/* Icon + status */}
            <div className="flex items-start gap-3 mb-3">
                <div className="p-2.5 bg-[#B8860B]/10 rounded-xl shrink-0">
                    <FileText size={18} className="text-[#B8860B]" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate pr-6">{c.title}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{c.client_name}</p>
                </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center justify-between mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                    <StatusIcon size={10} />
                    {cfg.label}
                </span>
                {c.value && (
                    <span className="text-xs font-bold text-[#B8860B]">{formatCurrency(c.value)}</span>
                )}
            </div>

            {/* Dates */}
            {(c.start_date || c.end_date) && (
                <div className="mt-2.5 pt-2.5 border-t border-gray-100 dark:border-[#222222] flex items-center gap-1 text-[11px] text-gray-400">
                    <Calendar size={10} />
                    <span>{formatDate(c.start_date)} → {formatDate(c.end_date)}</span>
                    {expiringSoon && (
                        <span className="ml-auto text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-1.5 py-0.5 rounded-full font-semibold">
                            {days}d
                        </span>
                    )}
                </div>
            )}

            {/* File */}
            {c.file_url && (
                <a
                    href={c.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="mt-2 flex items-center gap-1 text-[11px] text-blue-500 hover:underline"
                >
                    <ExternalLink size={10} /> {c.file_name || 'Ver arquivo'}
                </a>
            )}
        </div>
    );
}

/* ── Contract Row (list view) ── */
function ContractRow({ contract: c, onEdit, onDelete }: { contract: Contract; onEdit: (c: Contract) => void; onDelete: (id: string, name: string) => void }) {
    const cfg = STATUS_CONFIG[c.status];
    const StatusIcon = cfg.icon;
    const days = daysUntil(c.end_date);
    const expiringSoon = days !== null && days >= 0 && days <= 30 && c.status === 'Ativo';
    const expired = days !== null && days < 0 && c.status === 'Ativo';

    return (
        <tr onClick={() => onEdit(c)} className="hover:bg-gray-50 dark:hover:bg-[#0D0D0D] transition-colors cursor-pointer group">
            <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#B8860B] to-[#9A7209] text-black text-xs flex items-center justify-center font-bold shrink-0">
                        {c.client_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[130px]" title={c.client_name}>{c.client_name}</span>
                </div>
            </td>
            <td className="px-4 py-3.5">
                <span className="text-gray-700 dark:text-gray-300 truncate max-w-[180px] block" title={c.title}>{c.title}</span>
                {c.notes && <span className="text-xs text-gray-400 truncate max-w-[180px] block mt-0.5">{c.notes}</span>}
            </td>
            <td className="px-4 py-3.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                    <StatusIcon size={11} />
                    {cfg.label}
                </span>
            </td>
            <td className="px-4 py-3.5">
                <div className="text-xs space-y-0.5 text-gray-600 dark:text-gray-400">
                    {c.start_date && <div className="flex items-center gap-1"><Calendar size={10} className="text-gray-400" />{formatDate(c.start_date)}</div>}
                    {c.end_date && (
                        <div className={`flex items-center gap-1 ${expiringSoon ? 'text-amber-500 font-semibold' : expired ? 'text-red-500' : ''}`}>
                            <Calendar size={10} className={expiringSoon ? 'text-amber-500' : expired ? 'text-red-500' : 'text-gray-400'} />
                            {formatDate(c.end_date)}
                            {expiringSoon && <span className="ml-1 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-1.5 py-0.5 rounded-full">vence em {days}d</span>}
                            {expired && <span className="ml-1 text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 px-1.5 py-0.5 rounded-full">vencido</span>}
                        </div>
                    )}
                    {!c.start_date && !c.end_date && <span className="text-gray-400">—</span>}
                </div>
            </td>
            <td className="px-4 py-3.5">
                <span className={`font-semibold ${c.value ? 'text-[#B8860B]' : 'text-gray-400'}`}>{formatCurrency(c.value)}</span>
            </td>
            <td className="px-4 py-3.5">
                {c.file_url ? (
                    <a href={c.file_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        <FileText size={12} />
                        <span className="truncate max-w-[90px]">{c.file_name || 'Contrato'}</span>
                        <ExternalLink size={10} />
                    </a>
                ) : (
                    <span className="text-gray-400 text-xs">Sem arquivo</span>
                )}
            </td>
            <td className="px-4 py-3.5">
                <button onClick={e => { e.stopPropagation(); onDelete(c.id, c.client_name); }} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                    <Trash2 size={14} />
                </button>
            </td>
        </tr>
    );
}
