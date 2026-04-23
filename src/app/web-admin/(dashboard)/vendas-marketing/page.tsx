import { createClient } from '@/utils/supabase/server';
import {
    Users, Flame, Target, PhoneCall, MessageSquare, ArrowRight,
    TrendingUp, CheckCircle2, Clock, Megaphone, Sparkles, ChevronRight,
    Zap, UserPlus, Send,
} from 'lucide-react';
import Link from 'next/link';

const fmtPct = (v: number) => `${v.toFixed(0)}%`;

function daysFromNow(dateStr: string | null | undefined): number | null {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const PRIO_STYLES: Record<string, string> = {
    Alta: 'text-rose-500 bg-rose-500/10 border-rose-500/25',
    Média: 'text-amber-500 bg-amber-500/10 border-amber-500/25',
    Baixa: 'text-blue-500 bg-blue-500/10 border-blue-500/25',
};

export default async function VendasMarketingPage() {
    const supabase = await createClient();

    const [
        { data: leads },
        { data: whatsappMessages },
    ] = await Promise.all([
        supabase.from('crm_leads')
            .select('id, nome, status, prioridade, data_estimada_fechamento, created_at, valor_estimado, origem')
            .order('created_at', { ascending: false }),
        supabase.from('whatsapp_messages')
            .select('id, status, created_at')
            .order('created_at', { ascending: false })
            .limit(500),
    ]);

    const allLeads = leads ?? [];
    const totalLeads = allLeads.length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const start30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const start7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const leadsMonth = allLeads.filter(l => new Date(l.created_at) >= startOfMonth).length;
    const leads7d = allLeads.filter(l => new Date(l.created_at) >= start7d).length;
    const leads30d = allLeads.filter(l => new Date(l.created_at) >= start30d).length;

    const hotLeads = allLeads.filter(l => l.prioridade === 'Alta').length;
    const mediumLeads = allLeads.filter(l => l.prioridade === 'Média').length;
    const coldLeads = allLeads.filter(l => l.prioridade === 'Baixa').length;

    const closingLeads = allLeads.filter(l => {
        const d = daysFromNow(l.data_estimada_fechamento);
        return d !== null && d >= 0 && d <= 7;
    });

    const leadsByStatus: Record<string, number> = {};
    for (const l of allLeads) {
        leadsByStatus[l.status || 'Sem status'] = (leadsByStatus[l.status || 'Sem status'] || 0) + 1;
    }
    const closedLeads = leadsByStatus['Fechado'] || 0;
    const lostLeads = leadsByStatus['Perdido'] || 0;
    const activeLeads = totalLeads - closedLeads - lostLeads;
    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

    const leadsByOrigem: Record<string, number> = {};
    for (const l of allLeads) {
        const o = (l.origem || 'Desconhecida') as string;
        leadsByOrigem[o] = (leadsByOrigem[o] || 0) + 1;
    }
    const topOrigens = Object.entries(leadsByOrigem).sort(([, a], [, b]) => b - a).slice(0, 5);

    const recentLeads = allLeads.slice(0, 8);

    // WhatsApp
    const allWpp = whatsappMessages ?? [];
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const wppToday = allWpp.filter(m => m.created_at >= todayStart).length;
    const wpp7d = allWpp.filter(m => new Date(m.created_at) >= start7d).length;
    const wpp30d = allWpp.filter(m => new Date(m.created_at) >= start30d).length;
    const wppSentRate = allWpp.length > 0
        ? (allWpp.filter(m => m.status === 'sent').length / allWpp.length) * 100
        : 0;

    // Valor estimado do pipeline (soma `valor_estimado` de leads ativos)
    const pipelineValue = allLeads
        .filter(l => l.status !== 'Fechado' && l.status !== 'Perdido')
        .reduce((s, l) => s + (Number(l.valor_estimado) || 0), 0);

    const fmtBRLCompact = (v: number) => {
        if (!v) return 'R$ 0';
        if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',')}M`;
        if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`;
        return `R$ ${v.toLocaleString('pt-BR')}`;
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-gray-200 dark:border-[#1E1E1E]">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 border border-violet-500/20">
                        <Megaphone className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendas & Marketing</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Visão consolidada do pipeline comercial e automações</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/crm" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/25 text-violet-600 dark:text-violet-400 text-xs font-semibold hover:bg-violet-500/20 transition-all">
                        <PhoneCall size={13} /> Abrir CRM
                    </Link>
                    <Link href="/whatsapp" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/25 text-green-600 dark:text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-all">
                        <MessageSquare size={13} /> WhatsApp
                    </Link>
                </div>
            </div>

            {/* Hero KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent p-5">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-violet-500/20">
                                <Users className="w-4 h-4 text-violet-500" />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold">Pipeline Ativo</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{activeLeads}</p>
                        <p className="text-xs text-gray-500 mt-1">leads em negociação</p>
                        <div className="mt-3 pt-3 border-t border-violet-500/15 flex items-center gap-3 text-[10px] text-gray-500">
                            <span className="inline-flex items-center gap-1"><UserPlus size={10} className="text-violet-400" /> {leads7d} em 7d</span>
                            <span className="inline-flex items-center gap-1"><TrendingUp size={10} className="text-emerald-500" /> {leadsMonth} no mês</span>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#B8860B]/5 to-transparent p-5">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-amber-500/20">
                                <Target className="w-4 h-4 text-amber-500" />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">Pipeline Valor</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{fmtBRLCompact(pipelineValue)}</p>
                        <p className="text-xs text-gray-500 mt-1">valor estimado em aberto</p>
                        <div className="mt-3 pt-3 border-t border-amber-500/15 flex items-center gap-3 text-[10px] text-gray-500">
                            <span className="inline-flex items-center gap-1"><Flame size={10} className="text-orange-500" /> {hotLeads} quentes</span>
                            <span className="inline-flex items-center gap-1"><Clock size={10} className="text-emerald-500" /> {closingLeads.length} fechando 7d</span>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-emerald-500/20">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Conversão</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{fmtPct(conversionRate)}</p>
                        <p className="text-xs text-gray-500 mt-1">{closedLeads} fechados · {lostLeads} perdidos</p>
                        <div className="mt-3 pt-3 border-t border-emerald-500/15">
                            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-[#1A1A1A] overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${Math.min(conversionRate, 100)}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-5">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/5 rounded-full blur-3xl" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-green-500/20">
                                <MessageSquare className="w-4 h-4 text-green-500" />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-green-600 dark:text-green-400 font-bold">Automação</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{wpp30d}</p>
                        <p className="text-xs text-gray-500 mt-1">mensagens em 30 dias</p>
                        <div className="mt-3 pt-3 border-t border-green-500/15 flex items-center gap-3 text-[10px] text-gray-500">
                            <span className="inline-flex items-center gap-1"><Send size={10} className="text-green-500" /> {wppToday} hoje</span>
                            <span className="inline-flex items-center gap-1"><Zap size={10} className="text-amber-500" /> {fmtPct(wppSentRate)} entrega</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pipeline por status + Prioridade */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Status distribution */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-violet-500/10 rounded-xl">
                                <TrendingUp className="w-4 h-4 text-violet-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Pipeline por Status</h3>
                                <p className="text-[10px] text-gray-500 mt-0.5">Distribuição de leads por etapa</p>
                            </div>
                        </div>
                        <Link href="/crm" className="text-xs text-gray-400 hover:text-violet-500 transition-colors flex items-center gap-1">
                            Gerenciar <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="p-5 flex-1 space-y-3">
                        {Object.entries(leadsByStatus).length === 0 ? (
                            <p className="text-sm text-gray-400 italic">Nenhum lead cadastrado.</p>
                        ) : (
                            Object.entries(leadsByStatus)
                                .sort(([, a], [, b]) => b - a)
                                .map(([status, count]) => {
                                    const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                                    const isWin = status === 'Fechado';
                                    const isLoss = status === 'Perdido';
                                    const color = isWin ? 'bg-emerald-500' : isLoss ? 'bg-rose-500' : 'bg-violet-500';
                                    const txtColor = isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-violet-500';
                                    return (
                                        <div key={status}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${color}`} />
                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{status}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-black ${txtColor}`}>{count}</span>
                                                    <span className="text-[10px] text-gray-500">{pct.toFixed(0)}%</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-[#1A1A1A] overflow-hidden">
                                                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>

                {/* Prioridade */}
                <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center gap-2">
                        <div className="p-2 bg-orange-500/10 rounded-xl">
                            <Flame className="w-4 h-4 text-orange-500" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Temperatura</h3>
                    </div>
                    <div className="p-5 flex-1 space-y-2">
                        {[
                            { label: 'Quentes', count: hotLeads, icon: Flame, bg: 'bg-rose-500/5', border: 'border-rose-500/20', text: 'text-rose-500' },
                            { label: 'Médios', count: mediumLeads, icon: TrendingUp, bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-500' },
                            { label: 'Frios', count: coldLeads, icon: Clock, bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-500' },
                        ].map(({ label, count, icon: Icon, bg, border, text }) => (
                            <div key={label} className={`p-3 rounded-xl ${bg} border ${border} flex items-center justify-between`}>
                                <div className="flex items-center gap-2">
                                    <Icon className={`w-4 h-4 ${text}`} />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                                </div>
                                <span className={`text-xl font-black ${text}`}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Leads recentes + Origem */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Leads recentes */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-violet-500/10 rounded-xl">
                                <Sparkles className="w-4 h-4 text-violet-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Leads Recentes</h3>
                                <p className="text-[10px] text-gray-500 mt-0.5">Últimos {recentLeads.length} cadastros</p>
                            </div>
                        </div>
                        <Link href="/crm" className="text-xs text-gray-400 hover:text-violet-500 transition-colors flex items-center gap-1">
                            Ver todos <ArrowRight size={12} />
                        </Link>
                    </div>

                    {recentLeads.length === 0 ? (
                        <div className="p-10 text-center text-gray-400">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-xs">Nenhum lead cadastrado ainda.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-[#1E1E1E]">
                            {recentLeads.map(l => {
                                const created = new Date(l.created_at);
                                const diasAtras = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
                                const prioStyle = PRIO_STYLES[l.prioridade || ''] ?? 'text-gray-400 bg-gray-500/10 border-gray-500/20';
                                return (
                                    <Link href="/crm" key={l.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-[#161616] transition-colors group">
                                        <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/20 flex items-center justify-center text-violet-500 font-bold text-sm">
                                            {(l.nome || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{l.nome || 'Sem nome'}</p>
                                            <p className="text-[10px] text-gray-500 truncate">
                                                {[l.status, l.origem, diasAtras === 0 ? 'hoje' : `${diasAtras}d atrás`].filter(Boolean).join(' · ')}
                                            </p>
                                        </div>
                                        {l.prioridade && (
                                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${prioStyle}`}>
                                                {l.prioridade}
                                            </span>
                                        )}
                                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Origem dos leads */}
                <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center gap-2">
                        <div className="p-2 bg-fuchsia-500/10 rounded-xl">
                            <Megaphone className="w-4 h-4 text-fuchsia-500" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Origem dos Leads</h3>
                    </div>
                    <div className="p-5 flex-1 space-y-2.5">
                        {topOrigens.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">Sem dados de origem.</p>
                        ) : (
                            topOrigens.map(([origem, count]) => {
                                const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                                return (
                                    <div key={origem}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[140px]">{origem}</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-bold text-fuchsia-500">{count}</span>
                                                <span className="text-[9px] text-gray-500">({pct.toFixed(0)}%)</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-[#1A1A1A] overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-fuchsia-400 to-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Módulos do sistema */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/crm" className="group relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent p-6 hover:shadow-lg hover:shadow-violet-500/10 transition-all">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl" />
                    <div className="relative flex items-start gap-4">
                        <div className="shrink-0 p-3 rounded-xl bg-violet-500/20 border border-violet-500/30">
                            <PhoneCall className="w-6 h-6 text-violet-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-violet-500 transition-colors">CRM — Pipeline de Vendas</h3>
                            <p className="text-sm text-gray-500 mt-1">Gerencie leads, negociações e fechamentos no Kanban.</p>
                            <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-600 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1"><Users size={12} className="text-violet-500" /> {totalLeads} leads</span>
                                <span className="inline-flex items-center gap-1"><Flame size={12} className="text-orange-500" /> {hotLeads} quentes</span>
                                <span className="inline-flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> {fmtPct(conversionRate)} conv.</span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-violet-500/50 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>

                <Link href="/whatsapp" className="group relative overflow-hidden rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-6 hover:shadow-lg hover:shadow-green-500/10 transition-all">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 rounded-full blur-3xl" />
                    <div className="relative flex items-start gap-4">
                        <div className="shrink-0 p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                            <MessageSquare className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-green-500 transition-colors">Automação WhatsApp</h3>
                            <p className="text-sm text-gray-500 mt-1">Fluxos de boas-vindas, respostas automáticas e disparo de mensagens.</p>
                            <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-600 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1"><Send size={12} className="text-green-500" /> {wppToday} hoje</span>
                                <span className="inline-flex items-center gap-1"><TrendingUp size={12} className="text-blue-500" /> {wpp7d} em 7d</span>
                                <span className="inline-flex items-center gap-1"><Zap size={12} className="text-amber-500" /> {fmtPct(wppSentRate)} entrega</span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-green-500/50 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>
            </div>

        </div>
    );
}
