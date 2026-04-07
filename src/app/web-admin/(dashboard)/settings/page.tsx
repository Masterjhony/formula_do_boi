'use client';

import { useState, useEffect } from 'react';
import { SettingsService } from '@/services/settingsService';
import { Loader2, Save, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [topBreedersEnabled, setTopBreedersEnabled] = useState(false);
    const [rankingPageEnabled, setRankingPageEnabled] = useState(false);
    const [semenPageEnabled, setSemenPageEnabled] = useState(false);
    const [tourosPageEnabled, setTourosPageEnabled] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            const enabled = await SettingsService.getSetting('top_breeders_enabled');
            // If setting doesn't exist yet, it might return null, default to false
            setTopBreedersEnabled(enabled === true);

            const rankingEnabled = await SettingsService.getSetting('ranking_page_enabled');
            // If setting doesn't exist yet, it might return null, default to false (as per request)
            setRankingPageEnabled(rankingEnabled === true); // Default is false anyway if null

            const semenEnabled = await SettingsService.getSetting('semen_page_enabled');
            setSemenPageEnabled(semenEnabled === true);

            const tourosEnabled = await SettingsService.getSetting('touros_page_enabled');
            setTourosPageEnabled(tourosEnabled !== false);
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        setMessage(null);
        try {
            await SettingsService.updateSetting('top_breeders_enabled', topBreedersEnabled);
            await SettingsService.updateSetting('ranking_page_enabled', rankingPageEnabled);
            await SettingsService.updateSetting('semen_page_enabled', semenPageEnabled);
            await SettingsService.updateSetting('touros_page_enabled', tourosPageEnabled);
            setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao salvar configurações.' });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Configurações do Sistema</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gerencie a visibilidade de páginas e funcionalidades.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Alterações
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white dark:bg-[#151515] rounded-xl border border-gray-200 dark:border-[#222] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-[#222]">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Eye className="w-5 h-5 text-brand-gold" />
                        Visibilidade de Páginas
                    </h2>
                </div>

                <div className="p-6 space-y-6">
                    {/* Top Criadores Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-[#333]">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Top Criadores</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Ativar ou desativar o acesso público à página de Top Criadores.
                            </p>
                            <div className="mt-2 text-xs flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${topBreedersEnabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className={topBreedersEnabled ? 'text-green-500' : 'text-red-500'}>
                                    {topBreedersEnabled ? 'Página Visível' : 'Página Oculta (Redireciona para Home)'}
                                </span>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={topBreedersEnabled}
                                onChange={(e) => setTopBreedersEnabled(e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-gold/30 dark:peer-focus:ring-brand-gold/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-brand-gold"></div>
                        </label>
                    </div>

                    {/* Ranking Page Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-[#333]">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Página de Ranking</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Ativar ou desativar o acesso público à página de Ranking.
                            </p>
                            <div className="mt-2 text-xs flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${rankingPageEnabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className={rankingPageEnabled ? 'text-green-500' : 'text-red-500'}>
                                    {rankingPageEnabled ? 'Página Visível' : 'Página Oculta (Redireciona para Home)'}
                                </span>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={rankingPageEnabled}
                                onChange={(e) => setRankingPageEnabled(e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-gold/30 dark:peer-focus:ring-brand-gold/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-brand-gold"></div>
                        </label>
                    </div>

                    {/* Touros Page Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-[#333]">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Página de Touros</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Ativar ou desativar o acesso público à página de Touros.
                            </p>
                            <div className="mt-2 text-xs flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${tourosPageEnabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className={tourosPageEnabled ? 'text-green-500' : 'text-red-500'}>
                                    {tourosPageEnabled ? 'Página Visível' : 'Página Oculta (Redireciona para Home)'}
                                </span>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={tourosPageEnabled}
                                onChange={(e) => setTourosPageEnabled(e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-gold/30 dark:peer-focus:ring-brand-gold/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-brand-gold"></div>
                        </label>
                    </div>

                    {/* Semen Page Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-[#333]">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Página de Sêmen</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Ativar ou desativar o acesso público à página de Sêmen.
                            </p>
                            <div className="mt-2 text-xs flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${semenPageEnabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className={semenPageEnabled ? 'text-green-500' : 'text-red-500'}>
                                    {semenPageEnabled ? 'Página Visível' : 'Página Oculta (Redireciona para Home)'}
                                </span>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={semenPageEnabled}
                                onChange={(e) => setSemenPageEnabled(e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-gold/30 dark:peer-focus:ring-brand-gold/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-brand-gold"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
