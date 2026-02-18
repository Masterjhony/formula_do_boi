'use client';

import { Activity, Calendar, Users, Clock, MousePointerClick } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDetailedReport, type DetailedAnalyticsReport } from '@/actions/analytics';

export default function AnalyticsPage() {
    const [reportData, setReportData] = useState<DetailedAnalyticsReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getDetailedReport();
                setReportData(data);
            } catch (error) {
                console.error("Failed to load detailed report", error);
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

    return (
        <div className="space-y-8">
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

            {/* Main Content */}
            <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-[#222222]">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        Histórico de Acessos
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#1A1A1A] text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-medium border-b border-gray-200 dark:border-[#222222]">Data</th>
                                    <th className="p-4 font-medium border-b border-gray-200 dark:border-[#222222]">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Usuários Ativos
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
                                            Nenhum dado encontrado para o período.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-600">
                Dados fornecidos via Google Analytics Data API (Beta).
            </p>
        </div>
    );
}
