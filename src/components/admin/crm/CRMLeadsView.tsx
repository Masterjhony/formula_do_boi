'use client';

import { useState, useMemo } from 'react';
import { CRMLead } from '@/app/web-admin/actions/crm-leads';
import { Search, Phone, MapPin, Calendar, Instagram, TrendingUp, Users, Plus } from 'lucide-react';

interface CRMLeadsViewProps {
    leads: CRMLead[];
    stages: string[];
    onEditLead: (lead: CRMLead) => void;
    onAddLead: () => void;
}

const SOURCE_LABELS: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    google: 'Google',
    whatsapp: 'WhatsApp',
    indicacao: 'Indicação',
    site: 'Site',
    'google-ads': 'Google Ads',
    'facebook-ads': 'Facebook Ads',
};

const SOURCE_COLORS: Record<string, string> = {
    facebook: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    instagram: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
    google: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    'google-ads': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    whatsapp: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    indicacao: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
    site: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300',
    'facebook-ads': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
};

const STAGE_COLORS: Record<string, string> = {
    Lead: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
    Qualificado: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
    Proposta: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    'Negociação': 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
    Fechado: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    Perdido: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
    'Sem Status': 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300',
};

export function CRMLeadsView({ leads, stages, onEditLead, onAddLead }: CRMLeadsViewProps) {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [page, setPage] = useState(1);
    const PER_PAGE = 25;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);

    const todayCount = leads.filter(l => {
        const d = l.data_entrada || l.created_at;
        return d && new Date(d) >= today;
    }).length;

    const weekCount = leads.filter(l => {
        const d = l.data_entrada || l.created_at;
        return d && new Date(d) >= weekStart;
    }).length;

    const estados = useMemo(
        () => [...new Set(leads.map(l => l.estado).filter(Boolean) as string[])].sort(),
        [leads]
    );

    const filtered = useMemo(() => {
        setPage(1);
        return leads.filter(lead => {
            const q = search.toLowerCase();
            const matchSearch =
                !search ||
                lead.nome.toLowerCase().includes(q) ||
                lead.celular?.includes(search) ||
                lead.telefone?.includes(search) ||
                lead.cidade?.toLowerCase().includes(q) ||
                lead.empresa?.toLowerCase().includes(q) ||
                lead.instagram?.toLowerCase().includes(q);
            const matchStatus = !filterStatus || lead.status === filterStatus;
            const matchEstado = !filterEstado || lead.estado === filterEstado;
            return matchSearch && matchStatus && matchEstado;
        });
    }, [leads, search, filterStatus, filterEstado]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="flex flex-col gap-4 h-full min-h-0">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
                <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222] p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Users size={18} className="text-blue-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{leads.length}</p>
                        <p className="text-xs text-gray-500">Total de leads</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222] p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center shrink-0">
                        <Calendar size={18} className="text-green-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayCount}</p>
                        <p className="text-xs text-gray-500">Hoje</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222] p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                        <TrendingUp size={18} className="text-orange-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{weekCount}</p>
                        <p className="text-xs text-gray-500">Últimos 7 dias</p>
                    </div>
                </div>
            </div>

            {/* Search + filters */}
            <div className="flex gap-3 flex-wrap shrink-0">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, telefone, cidade, instagram..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-xl text-sm focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none dark:text-white placeholder:text-gray-400"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-xl text-sm focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none dark:text-white"
                >
                    <option value="">Todos os status</option>
                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {estados.length > 0 && (
                    <select
                        value={filterEstado}
                        onChange={e => setFilterEstado(e.target.value)}
                        className="px-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-xl text-sm focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none dark:text-white"
                    >
                        <option value="">Todos os estados</option>
                        {estados.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                )}
                <button
                    onClick={onAddLead}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus size={15} /> Novo lead
                </button>
            </div>

            {/* Table */}
            <div className="flex-1 min-h-0 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222] overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-[#333] z-10">
                            <tr>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Nome</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Contato</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Origem</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Localização</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">O que busca</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Status</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Entrada</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Responsável</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#222]">
                            {paginated.map(lead => {
                                const src = lead.source?.toLowerCase() || '';
                                const sourceLabel = SOURCE_LABELS[src] || lead.source || null;
                                const sourceColor = SOURCE_COLORS[src] || 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300';
                                const stageColor = STAGE_COLORS[lead.status] || 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300';
                                const dateStr = lead.data_entrada || lead.created_at;

                                return (
                                    <tr
                                        key={lead.id}
                                        onClick={() => onEditLead(lead)}
                                        className="hover:bg-gray-50 dark:hover:bg-[#222] cursor-pointer transition-colors"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="font-medium text-gray-900 dark:text-white leading-tight">{lead.nome}</div>
                                            {lead.empresa && (
                                                <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">{lead.empresa}</div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-col gap-0.5">
                                                {(lead.celular || lead.telefone) && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                                                        <Phone size={11} className="shrink-0" />
                                                        <span>{lead.celular || lead.telefone}</span>
                                                    </div>
                                                )}
                                                {lead.instagram && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                                        <Instagram size={11} className="shrink-0" />
                                                        <span>{lead.instagram}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {sourceLabel ? (
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sourceColor}`}>
                                                    {sourceLabel}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 dark:text-gray-600">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {(lead.cidade || lead.estado) ? (
                                                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                                                    <MapPin size={11} className="text-orange-400 shrink-0" />
                                                    <span>
                                                        {lead.cidade && lead.estado
                                                            ? `${lead.cidade}/${lead.estado}`
                                                            : (lead.cidade || lead.estado)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 dark:text-gray-600">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 max-w-[180px]">
                                            <span className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                                                {lead.o_que_busca || lead.interesse || <span className="text-gray-300 dark:text-gray-600">—</span>}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${stageColor}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                                            {dateStr
                                                ? new Date(dateStr).toLocaleDateString('pt-BR')
                                                : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {lead.responsavel ? (
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-6 h-6 rounded-full bg-[#B8860B]/20 text-[#B8860B] text-xs font-bold flex items-center justify-center shrink-0">
                                                        {lead.responsavel.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[80px]">
                                                        {lead.responsavel}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 dark:text-gray-600">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div className="p-12 text-center text-gray-400 text-sm">
                            {search || filterStatus || filterEstado
                                ? 'Nenhum lead encontrado com esses filtros.'
                                : 'Nenhum lead cadastrado ainda.'}
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 dark:border-[#333] px-5 py-2.5 flex items-center justify-between shrink-0">
                    <span className="text-xs text-gray-500">
                        {filtered.length === leads.length
                            ? `${leads.length} lead${leads.length !== 1 ? 's' : ''}`
                            : `${filtered.length} de ${leads.length} leads`}
                        {totalPages > 1 && ` · página ${page} de ${totalPages}`}
                    </span>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-[#333] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors text-gray-600 dark:text-gray-300"
                            >
                                ← Anterior
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let p: number;
                                if (totalPages <= 5) p = i + 1;
                                else if (page <= 3) p = i + 1;
                                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                                else p = page - 2 + i;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-7 h-7 text-xs rounded-lg border transition-colors ${
                                            p === page
                                                ? 'bg-[#B8860B] border-[#B8860B] text-white font-medium'
                                                : 'border-gray-200 dark:border-[#333] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222]'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-[#333] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors text-gray-600 dark:text-gray-300"
                            >
                                Próxima →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
