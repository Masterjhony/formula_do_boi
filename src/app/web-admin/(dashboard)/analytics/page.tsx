'use client';

import { Activity, Calendar, Users, MousePointerClick, FileText, Share2, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    getDetailedReport,
    getPageViews,
    getSessionChannels,
    getAverageTimeReport,
    type DetailedAnalyticsReport,
    type PageViewsReport,
    type SessionChannelsReport,
    type AverageTimeReport
} from '@/actions/analytics';

export default function AnalyticsPage() {
    const [reportData, setReportData] = useState<DetailedAnalyticsReport[]>([]);
    const [pageViews, setPageViews] = useState<PageViewsReport[]>([]);
    const [channels, setChannels] = useState<SessionChannelsReport[]>([]);
    const [averageTime, setAverageTime] = useState<AverageTimeReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [data, pages, ch, avg] = await Promise.all([
                    getDetailedReport(),
                    getPageViews(),
                    getSessionChannels(),
                    getAverageTimeReport(),
                ]);
                setReportData(data);
                setPageViews(pages);
                setChannels(ch);
                setAverageTime(avg);
            } catch (error) {
                console.error("Failed to load analytics data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Helper to format date YYYYMMDD to DD/MM/YYYY
    const formatDate = (dateString: string) => {
        if (!dateString || dateString.length !== 8) return dateString;
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        return `${day}/${month}/${year}`;
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const maxPageViews = Math.max(...pageViews.map(p => p.views), 1);
    const maxChannels = Math.max(...channels.map(c => c.sessions), 1);

    return (
        <div className="space-y-8 pb-12">
            <div className="border-b border-gray-200 dark:border-[#222222] pb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
                    <p className="text-gray-500 dark:text-gray-400">Detalhamento de acesso e comportamento (Últimos 30 dias)</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-[#1A1A1A] px-3 py-1 rounded-full border border-gray-200 dark:border-[#222222]">
                    <Calendar className="w-4 h-4" />
                    Atualizado em: {new Date().toLocaleDateString('pt-BR')}
                </div>
            </div>

            {loading ? (
                <div className="p-12 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Grids Superiores: Acessos e Tempo */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Histórico de Acessos */}
                        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl overflow-hidden flex flex-col h-96">
                            <div className="p-6 border-b border-gray-200 dark:border-[#222222] shrink-0">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-400" />
                                    Histórico de Acessos
                                </h2>
                            </div>
                            <div className="overflow-x-auto overflow-y-auto grow custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-gray-50 dark:bg-[#1A1A1A] z-10">
                                        <tr className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="p-4 font-medium border-b border-gray-200 dark:border-[#222222]">Data</th>
                                            <th className="p-4 font-medium border-b border-gray-200 dark:border-[#222222]">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    Ativos
                                                </div>
                                            </th>
                                            <th className="p-4 font-medium border-b border-gray-200 dark:border-[#222222]">
                                                <div className="flex items-center gap-2">
                                                    <MousePointerClick className="w-4 h-4" />
                                                    Sessões
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-[#222222]">
                                        {reportData.length > 0 ? (
                                            reportData.map((row) => (
                                                <tr key={row.date} className="hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors">
                                                    <td className="p-4 text-gray-900 dark:text-gray-300 font-medium">{formatDate(row.date)}</td>
                                                    <td className="p-4 text-gray-700 dark:text-gray-400">{row.activeUsers}</td>
                                                    <td className="p-4 text-gray-700 dark:text-gray-400">{row.sessions}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="p-8 text-center text-gray-500 dark:text-gray-400 italic">
                                                    Nenhum dado encontrado.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Tempo Médio */}
                        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl overflow-hidden flex flex-col h-96">
                            <div className="p-6 border-b border-gray-200 dark:border-[#222222] shrink-0">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Timer className="w-5 h-5 text-emerald-400" />
                                    Tempo Médio por Dia
                                </h2>
                            </div>
                            <div className="overflow-x-auto overflow-y-auto grow custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-gray-50 dark:bg-[#1A1A1A] z-10">
                                        <tr className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="p-4 font-medium border-b border-gray-200 dark:border-[#222222]">Data</th>
                                            <th className="p-4 font-medium border-b border-gray-200 dark:border-[#222222]">Duração Média</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-[#222222]">
                                        {averageTime.length > 0 ? (
                                            averageTime.map((row) => (
                                                <tr key={row.date} className="hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors">
                                                    <td className="p-4 text-gray-900 dark:text-gray-300 font-medium">{formatDate(row.date)}</td>
                                                    <td className="p-4 text-gray-700 dark:text-gray-400 font-mono">{formatTime(row.averageSessionDuration)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={2} className="p-8 text-center text-gray-500 dark:text-gray-400 italic">
                                                    Nenhum dado encontrado.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Grids Inferiores: Views e Canais */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Páginas Mais Vistas (Lotes) */}
                        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl overflow-hidden flex flex-col h-max">
                            <div className="p-6 border-b border-gray-200 dark:border-[#222222] shrink-0">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-amber-500" />
                                    Visualizações por Página
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">Top 10 páginas mais acessadas</p>
                            </div>
                            <div className="p-6 space-y-5 overflow-x-hidden">
                                {pageViews.length > 0 ? (
                                    pageViews.map((page, i) => (
                                        <div key={i} className="flex flex-col gap-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-gray-900 dark:text-gray-200 truncate pr-4" title={page.pageTitle || page.pagePath}>
                                                    {page.pageTitle ? page.pageTitle.replace(' - Formula do Boi', '') : page.pagePath}
                                                </span>
                                                <span className="text-gray-500 whitespace-nowrap">{page.views} views</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-[#222222] rounded-full h-2">
                                                <div
                                                    className="bg-amber-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${(page.views / maxPageViews) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 italic py-4">Nenhum dado encontrado</div>
                                )}
                            </div>
                        </div>

                        {/* Canais de Sessão */}
                        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl overflow-hidden flex flex-col h-max">
                            <div className="p-6 border-b border-gray-200 dark:border-[#222222] shrink-0">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Share2 className="w-5 h-5 text-indigo-400" />
                                    Canais de Tráfego
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">Origem dos acessos (Direct, Organic, Social, etc)</p>
                            </div>
                            <div className="p-6 space-y-5 overflow-x-hidden">
                                {channels.length > 0 ? (
                                    channels.map((ch, i) => (
                                        <div key={i} className="flex flex-col gap-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-gray-900 dark:text-gray-200 capitalize">
                                                    {ch.channelGroup === '(other)' ? 'Outros' : ch.channelGroup}
                                                </span>
                                                <span className="text-gray-500 whitespace-nowrap">{ch.sessions} sessões</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-[#222222] rounded-full h-2">
                                                <div
                                                    className="bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${(ch.sessions / maxChannels) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 italic py-4">Nenhum dado encontrado</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <p className="text-center text-sm text-gray-500 dark:text-gray-600">
                Dados fornecidos via Google Analytics Data API (Beta).
            </p>
        </div>
    );
}
