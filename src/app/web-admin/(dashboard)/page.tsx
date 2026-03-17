import { createClient } from '@/utils/supabase/server';
import {
    Package, DollarSign, Users, UserCheck, MapPin, TrendingUp,
    ExternalLink, Database, PhoneCall, CheckCircle2, Clock,
    AlertTriangle, ArrowRight, BarChart3, Target, Flame,
    CircleDot, ListTodo, Activity,
} from 'lucide-react';
import Link from 'next/link';
import AnalyticsDashboardCard from '@/components/admin/AnalyticsDashboardCard';

// ─── helpers ────────────────────────────────────────────────────────────────

function parsePrice(raw: unknown): number {
    if (!raw) return 0;
    const clean = raw.toString().replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
    const v = parseFloat(clean);
    return isNaN(v) ? 0 : v;
}

function daysFromNow(dateStr: string | null | undefined): number | null {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── component ──────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
    const supabase = await createClient();

    // ── fetch em paralelo ──────────────────────────────────────────────────
    const [
        { data: products },
        { count: breedersCount },
        { data: leads },
        { data: tasks },
    ] = await Promise.all([
        supabase.from('products').select('id, price, category, location, active, sold, details'),
        supabase.from('breeders').select('*', { count: 'exact', head: true }),
        supabase.from('crm_leads').select('id, nome, status, prioridade, ultimo_contato, data_estimada_fechamento, created_at').order('created_at', { ascending: false }),
        supabase.from('tactical_tasks').select('id, title, status, priority, due_date').order('position', { ascending: true }),
    ]);

    let usersCount = 0;
    try {
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        usersCount = count || 0;
    } catch { /* sem acesso à tabela profiles */ }

    // ── métricas de animais ────────────────────────────────────────────────
    const allProducts = products || [];
    const totalAnimals = allProducts.length;
    let totalValue = 0;
    const categoryStats: Record<string, number> = {};
    const regionStats: Record<string, number> = {};
    let available = 0, sold = 0;

    for (const p of allProducts) {
        totalValue += parsePrice(p.price);
        categoryStats[p.category || 'Outros'] = (categoryStats[p.category || 'Outros'] || 0) + 1;
        const state = p.location ? p.location.split('-').pop()?.trim() || '?' : '?';
        regionStats[state] = (regionStats[state] || 0) + 1;
        const detStatus = (p.details as Record<string, string> | null)?.status;
        const VALID = new Set(['Disponível', 'Vendido', 'Reservado', 'Inativo']);
        const status = (detStatus && VALID.has(detStatus)) ? detStatus : p.sold ? 'Vendido' : !p.active ? 'Inativo' : 'Disponível';
        if (status === 'Disponível') available++;
        else if (status === 'Vendido') sold++;
    }

    const avgValue = totalAnimals > 0 ? totalValue / totalAnimals : 0;
    const formattedAvg = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(avgValue);
    const sortedCategories = Object.entries(categoryStats).sort(([, a], [, b]) => b - a).slice(0, 6);
    const sortedRegions   = Object.entries(regionStats).sort(([, a], [, b]) => b - a).slice(0, 5);

    // ── métricas de CRM ────────────────────────────────────────────────────
    const allLeads = leads || [];
    const totalLeads = allLeads.length;
    const leadsByStatus: Record<string, number> = {};
    for (const l of allLeads) {
        leadsByStatus[l.status || 'Sem status'] = (leadsByStatus[l.status || 'Sem status'] || 0) + 1;
    }
    const hotLeads = allLeads.filter(l => l.prioridade === 'Alta').length;
    const recentLeads = allLeads.slice(0, 4);
    const closingLeads = allLeads.filter(l => {
        const d = daysFromNow(l.data_estimada_fechamento);
        return d !== null && d >= 0 && d <= 7;
    }).length;

    // ── métricas do Plano Tático ───────────────────────────────────────────
    const allTasks = tasks || [];
    const totalTasks = allTasks.length;
    const tasksByStatus: Record<string, number> = {};
    for (const t of allTasks) {
        tasksByStatus[t.status || 'Sem status'] = (tasksByStatus[t.status || 'Sem status'] || 0) + 1;
    }
    const highPrioTasks = allTasks.filter(t => t.priority === 'Alta').length;
    const overdueTasks = allTasks.filter(t => {
        const d = daysFromNow(t.due_date);
        return d !== null && d < 0 && t.status !== 'Completa';
    }).length;
    const completedTasks = tasksByStatus['Completa'] || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const today = new Date().toLocaleDateString('pt-BR');

    return (
        <div className="space-y-8">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="border-b border-gray-200 dark:border-[#222222] pb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Visão Geral</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Resumo de animais, pipeline comercial e execução tática.</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-[#1A1A1A] px-3 py-1 rounded-full border border-gray-200 dark:border-[#222222]">
                    {today}
                </span>
            </div>

            {/* ── KPI Cards ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total de Animais', value: totalAnimals, icon: Package,    color: 'text-[#B8860B]', bg: 'bg-[#B8860B]/10' },
                    { label: 'Criadores',         value: breedersCount || 0, icon: UserCheck, color: 'text-blue-500',   bg: 'bg-blue-500/10' },
                    { label: 'Disponíveis',        value: available,          icon: CircleDot, color: 'text-green-500',  bg: 'bg-green-500/10' },
                    { label: 'Valor Médio',        value: formattedAvg,       icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 ${bg} rounded-xl`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider leading-tight">{label}</span>
                        </div>
                        <p className={`text-2xl font-bold text-gray-900 dark:text-white ${typeof value === 'string' ? 'text-xl' : ''}`}>{value}</p>
                    </div>
                ))}
            </div>

            {/* ── Módulos: ERP · CRM · Plano Tático ──────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ERP — card compacto */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-[#B8860B]/30 rounded-2xl shadow-xl overflow-hidden relative">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#B8860B] rounded-full blur-[60px] opacity-20" />
                    </div>
                    <div className="relative p-6 flex flex-col h-full gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#B8860B]/20 border border-[#B8860B]/40 rounded-xl">
                                <Database className="w-5 h-5 text-[#B8860B]" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Sistema</p>
                                <h3 className="text-white font-bold leading-tight">Fórmula do Boi <span className="text-[#B8860B]">ERP</span></h3>
                            </div>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed flex-1">
                            Controle financeiro, estoque, contábil e gestão integrada da operação.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-white/5 rounded-xl p-2">
                                <p className="text-[#B8860B] font-bold text-lg">{totalAnimals}</p>
                                <p className="text-gray-500 text-[10px]">Animais</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-2">
                                <p className="text-[#B8860B] font-bold text-lg">{sold}</p>
                                <p className="text-gray-500 text-[10px]">Vendidos</p>
                            </div>
                        </div>
                        <Link
                            href="https://erp.formuladoboi.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-[#B8860B] hover:bg-[#9a7009] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                        >
                            Acessar o ERP <ExternalLink size={14} />
                        </Link>
                    </div>
                </div>

                {/* CRM */}
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-2xl shadow-xl overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-violet-500/10 rounded-xl">
                                <PhoneCall className="w-4 h-4 text-violet-500" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">CRM</h3>
                        </div>
                        <Link href="/crm" className="text-xs text-gray-400 hover:text-violet-500 transition-colors flex items-center gap-1">
                            Ver tudo <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="p-5 flex-1 space-y-4">
                        {/* Resumo numérico */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-2.5">
                                <p className="text-violet-500 font-bold text-xl">{totalLeads}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">Total</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-2.5">
                                <p className="text-orange-500 font-bold text-xl">{hotLeads}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5 flex items-center justify-center gap-0.5"><Flame size={9} />Quentes</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-2.5">
                                <p className="text-green-500 font-bold text-xl">{closingLeads}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">Fechando</p>
                            </div>
                        </div>
                        {/* Pipeline por status */}
                        <div className="space-y-1.5">
                            {Object.entries(leadsByStatus).slice(0, 4).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                        <span className="text-gray-600 dark:text-gray-400 truncate max-w-[110px]">{status}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 bg-gray-100 dark:bg-[#222] rounded-full h-1 overflow-hidden">
                                            <div
                                                className="h-full bg-violet-400 rounded-full"
                                                style={{ width: `${totalLeads > 0 ? (count / totalLeads) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300 w-4 text-right">{count}</span>
                                    </div>
                                </div>
                            ))}
                            {totalLeads === 0 && (
                                <p className="text-gray-400 text-xs italic">Nenhum lead cadastrado.</p>
                            )}
                        </div>
                        {/* Leads recentes */}
                        {recentLeads.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-gray-100 dark:border-[#1E1E1E]">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-2">Recentes</p>
                                {recentLeads.map(l => (
                                    <div key={l.id} className="flex items-center justify-between text-xs py-0.5">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[130px]">{l.nome}</span>
                                        <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-[#1A1A1A] px-1.5 py-0.5 rounded-full shrink-0">{l.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Plano Tático */}
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-2xl shadow-xl overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-sky-500/10 rounded-xl">
                                <Target className="w-4 h-4 text-sky-500" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Plano Tático</h3>
                        </div>
                        <Link href="/tactical-plan" className="text-xs text-gray-400 hover:text-sky-500 transition-colors flex items-center gap-1">
                            Ver tudo <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="p-5 flex-1 space-y-4">
                        {/* Status rápido */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-2.5">
                                <p className="text-sky-500 font-bold text-xl">{tasksByStatus['A fazer'] || 0}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">A fazer</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-2.5">
                                <p className="text-amber-500 font-bold text-xl">{tasksByStatus['Em andamento'] || 0}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">Em andamento</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-2.5">
                                <p className="text-green-500 font-bold text-xl">{completedTasks}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">Concluídas</p>
                            </div>
                        </div>
                        {/* Taxa de conclusão */}
                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-gray-500 font-medium">Taxa de conclusão</span>
                                <span className="text-sky-500 font-bold">{completionRate}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-[#222] rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all"
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>
                        </div>
                        {/* Alertas */}
                        <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-[#1E1E1E]">
                            {overdueTasks > 0 && (
                                <div className="flex items-center gap-2 text-xs bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-2 rounded-xl border border-red-200 dark:border-red-500/20">
                                    <AlertTriangle size={13} className="shrink-0" />
                                    <span><strong>{overdueTasks}</strong> tarefa{overdueTasks > 1 ? 's' : ''} em atraso</span>
                                </div>
                            )}
                            {highPrioTasks > 0 && (
                                <div className="flex items-center gap-2 text-xs bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-2 rounded-xl border border-orange-200 dark:border-orange-500/20">
                                    <Flame size={13} className="shrink-0" />
                                    <span><strong>{highPrioTasks}</strong> tarefa{highPrioTasks > 1 ? 's' : ''} de alta prioridade</span>
                                </div>
                            )}
                            {overdueTasks === 0 && highPrioTasks === 0 && totalTasks > 0 && (
                                <div className="flex items-center gap-2 text-xs bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-2 rounded-xl border border-green-200 dark:border-green-500/20">
                                    <CheckCircle2 size={13} className="shrink-0" />
                                    <span>Tudo em dia</span>
                                </div>
                            )}
                            {totalTasks === 0 && (
                                <p className="text-gray-400 text-xs italic">Nenhuma tarefa cadastrada.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Distribuições de Animais ────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5 border-b border-gray-100 dark:border-[#1E1E1E] pb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#B8860B]" />
                        Distribuição por Categoria
                    </h2>
                    <div className="space-y-3">
                        {sortedCategories.map(([cat, count]) => {
                            const pct = ((count / totalAnimals) * 100).toFixed(1);
                            return (
                                <div key={cat}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{cat}</span>
                                        <span className="text-gray-500">{count} ({pct}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-[#222] rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-[#B8860B] h-full rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                        {sortedCategories.length === 0 && <p className="text-gray-400 text-xs italic">Sem dados.</p>}
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5 border-b border-gray-100 dark:border-[#1E1E1E] pb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        Distribuição por Estado
                    </h2>
                    <div className="space-y-3">
                        {sortedRegions.map(([region, count]) => {
                            const pct = ((count / totalAnimals) * 100).toFixed(1);
                            return (
                                <div key={region}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{region}</span>
                                        <span className="text-gray-500">{count} ({pct}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-[#222] rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-green-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                        {sortedRegions.length === 0 && <p className="text-gray-400 text-xs italic">Sem dados.</p>}
                    </div>
                </div>
            </div>

            {/* ── Analytics + Atalhos ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <AnalyticsDashboardCard />

                {/* Atalhos rápidos */}
                <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5 border-b border-gray-100 dark:border-[#1E1E1E] pb-3">Atalhos Rápidos</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { href: '/products/new',   icon: Package,   label: 'Novo Card',      color: 'hover:border-[#B8860B] hover:text-[#B8860B]' },
                            { href: '/breeders',        icon: UserCheck,  label: 'Criadores',      color: 'hover:border-blue-500 hover:text-blue-500' },
                            { href: '/crm',             icon: PhoneCall,  label: 'CRM',            color: 'hover:border-violet-500 hover:text-violet-500' },
                            { href: '/tactical-plan',   icon: ListTodo,   label: 'Plano Tático',   color: 'hover:border-sky-500 hover:text-sky-500' },
                            { href: '/animal-availability', icon: Activity, label: 'Disponibilidade', color: 'hover:border-green-500 hover:text-green-500' },
                            { href: '/products',        icon: BarChart3,  label: 'Produtos',       color: 'hover:border-amber-500 hover:text-amber-500' },
                        ].map(({ href, icon: Icon, label, color }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222222] ${color} transition-all flex items-center gap-3 text-gray-400 group`}
                            >
                                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
                                <span className="font-medium text-sm">{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
