'use client';

import { useMemo, useState } from 'react';
import { CRMLead, updateLead, createLead, moveLead, deleteLead } from '@/app/web-admin/actions/crm-leads';
import type { CRMConfig } from '@/lib/crm-types';
import { isQualificationStage } from '@/lib/crm-types';
import { CRMKanbanBoard } from './CRMKanbanBoard';
import { CRMModal } from './CRMModal';
import { CRMChart } from './CRMChart';
import { CRMTable } from './CRMTable';
import { CRMSettingsView } from './CRMSettingsView';
import { CRMQualificacaoView } from './CRMQualificacaoView';
import { CRMPreferenciaisStrip } from './CRMPreferenciaisStrip';
import { CRMFunnelView } from '@/components/admin/funil-vendas/CRMFunnelView';
import {
    BarChart2, LayoutGrid, AlertCircle, DollarSign,
    Plus, Maximize2, Minimize2, Settings, TrendingUp, ListChecks,
} from 'lucide-react';

interface CRMDashboardClientProps {
    initialLeads: CRMLead[];
    crmConfig: CRMConfig;
}

type ViewType = 'qualificacao' | 'grafico' | 'kanban' | 'prioridade_alta' | 'valor_alto' | 'funil' | 'configuracoes';

export function CRMDashboardClient({ initialLeads, crmConfig: initialConfig }: CRMDashboardClientProps) {
    const [leads, setLeads] = useState<CRMLead[]>(initialLeads);
    const [activeView, setActiveView] = useState<ViewType>('qualificacao');
    const [crmConfig, setCrmConfig] = useState<CRMConfig>(initialConfig);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<CRMLead | undefined>(undefined);
    const [defaultStatus, setDefaultStatus] = useState('Lead');
    const [isFullscreen, setIsFullscreen] = useState(false);

    const allStages = crmConfig.stages.map(s => s.name);

    // Etapas que aparecem no Kanban principal (exclui as marcadas como qualificação)
    const advancedStages = useMemo(
        () => crmConfig.stages.filter(s => !isQualificationStage(s)).map(s => s.name),
        [crmConfig.stages]
    );

    const qualificationStageNames = useMemo(
        () => new Set(crmConfig.stages.filter(isQualificationStage).map(s => s.name)),
        [crmConfig.stages]
    );

    const qualificationCount = useMemo(
        () => leads.filter(l => qualificationStageNames.has(l.status)).length,
        [leads, qualificationStageNames]
    );

    const handleOpenNewLead = (status: string = advancedStages[0] || 'Qualificado') => {
        setEditingLead(undefined);
        setDefaultStatus(status);
        setIsModalOpen(true);
    };

    const handleEditLead = (lead: CRMLead) => {
        setEditingLead(lead);
        setIsModalOpen(true);
    };

    const handleSaveLead = async (leadData: Partial<CRMLead>) => {
        if (editingLead) {
            const updated = await updateLead(editingLead.id, leadData);
            setLeads(leads.map(l => l.id === updated.id ? updated : l));
            setEditingLead(updated);
        } else {
            const newLead = await createLead({ ...leadData, status: leadData.status || defaultStatus });
            setLeads([...leads, newLead]);
        }
    };

    const handleMoveLead = async (id: string, newStatus: string, newPosition: number) => {
        setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus, position: newPosition } : l));
        try {
            await moveLead(id, newStatus, newPosition);
        } catch (error) {
            console.error('Failed to move lead:', error);
            window.location.reload();
        }
    };

    const handleDeleteLead = async (id: string) => {
        setLeads(leads.filter(l => l.id !== id));
        await deleteLead(id);
        setIsModalOpen(false);
    };

    const handleLeadUpdated = (lead: CRMLead) => {
        setLeads(prev => prev.map(l => l.id === lead.id ? lead : l));
        if (editingLead?.id === lead.id) setEditingLead(lead);
    };

    // Leads que podem aparecer no kanban / listas (exclui qualificação)
    const advancedLeads = useMemo(
        () => leads.filter(l => !qualificationStageNames.has(l.status)),
        [leads, qualificationStageNames]
    );

    const views = [
        { id: 'qualificacao', label: 'Qualificação', icon: ListChecks, badge: qualificationCount },
        { id: 'grafico', label: 'Gráfico', icon: BarChart2 },
        { id: 'kanban', label: 'CRM Principal', icon: LayoutGrid },
        { id: 'prioridade_alta', label: 'Prioridade alta', icon: AlertCircle },
        { id: 'valor_alto', label: 'Valor > R$ 1000', icon: DollarSign },
        { id: 'funil', label: 'Funil de Vendas', icon: TrendingUp },
        { id: 'configuracoes', label: 'Configurações', icon: Settings },
    ] as const;

    let displayLeads = advancedLeads;
    if (activeView === 'prioridade_alta') {
        displayLeads = leads.filter(l => {
            const match = l.quantidade_animais?.match(/\d+/);
            return match ? Number(match[0]) > 100 : false;
        });
    } else if (activeView === 'valor_alto') {
        displayLeads = advancedLeads.filter(l => l.interesse?.includes('R$') || l.interesse?.toLowerCase().includes('touro'));
    }

    const isSettings = activeView === 'configuracoes';
    const isFunnel = activeView === 'funil';
    const isQualificacao = activeView === 'qualificacao';
    const isScrollable = isSettings || isFunnel || isQualificacao || activeView === 'grafico';

    return (
        <div className={
            isFullscreen
                ? 'fixed inset-0 z-[100] bg-white dark:bg-[#111111] w-screen h-screen flex flex-col overflow-hidden'
                : 'flex flex-col h-full bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] overflow-hidden'
        }>
            {/* Header */}
            <div className="p-6 pb-0 shrink-0">
                <p className="text-gray-500 text-sm mb-3">
                    Concentre todo o ciclo de vendas aqui — qualifique novos leads, acompanhe o pipeline avançado e priorize quem mais importa.
                </p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    CRM de vendas
                </h2>

                {/* Tabs & Controls */}
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-[#222222]">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                        {views.map((view) => {
                            const Icon = view.icon;
                            const isActive = activeView === view.id;
                            const isSpecial = view.id === 'configuracoes';
                            const badge = (view as { badge?: number }).badge;
                            return (
                                <button
                                    key={view.id}
                                    onClick={() => setActiveView(view.id as ViewType)}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                                        isActive
                                            ? 'border-[#A0792E] text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1A1A1A]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'
                                    } ${(isSpecial || view.id === 'funil') && !isActive ? 'ml-1' : ''}`}
                                >
                                    <Icon size={15} />
                                    {view.label}
                                    {badge != null && badge > 0 && (
                                        <span className={`ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold rounded-full ${
                                            isActive ? 'bg-[#A0792E] text-black' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                        }`}>
                                            {badge}
                                        </span>
                                    )}
                                    {view.id === 'configuracoes' && (
                                        <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 inline-block" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 pb-2 pr-2 shrink-0">
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#222222] transition-colors"
                            title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
                        >
                            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                        {!isSettings && (
                            <button
                                onClick={() => handleOpenNewLead()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 shadow-sm"
                            >
                                Novo <Plus size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className={`flex-1 ${isScrollable ? 'overflow-auto' : 'overflow-hidden'} p-6 bg-gray-50/50 dark:bg-[#0A0A0A]`}>
                {activeView === 'qualificacao' && (
                    <CRMQualificacaoView
                        leads={leads}
                        crmConfig={crmConfig}
                        onLeadUpdated={handleLeadUpdated}
                        onOpenLead={handleEditLead}
                    />
                )}

                {activeView === 'grafico' && <CRMChart leads={leads} stages={allStages} />}

                {activeView === 'kanban' && (
                    <div className="flex flex-col h-full min-h-0">
                        <CRMPreferenciaisStrip
                            leads={advancedLeads}
                            crmConfig={crmConfig}
                            onOpenLead={handleEditLead}
                        />
                        <div className="flex-1 min-h-0 overflow-hidden">
                            <CRMKanbanBoard
                                leads={advancedLeads}
                                stages={advancedStages}
                                onEditLead={handleEditLead}
                                onAddLead={handleOpenNewLead}
                                onMoveLead={handleMoveLead}
                            />
                        </div>
                    </div>
                )}

                {(activeView === 'prioridade_alta' || activeView === 'valor_alto') && (
                    <CRMTable leads={displayLeads} onEditLead={handleEditLead} />
                )}

                {activeView === 'funil' && (
                    <CRMFunnelView
                        leads={leads}
                        crmConfig={crmConfig}
                        onConfigSaved={(config) => setCrmConfig(config)}
                    />
                )}

                {activeView === 'configuracoes' && (
                    <CRMSettingsView
                        initialConfig={crmConfig}
                        onConfigSaved={(config) => setCrmConfig(config)}
                    />
                )}
            </div>

            <CRMModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                lead={editingLead}
                defaultStatus={defaultStatus}
                stages={allStages}
                customFields={crmConfig.custom_fields}
                responsaveis={crmConfig.responsaveis}
                funnels={crmConfig.funnels}
                onSave={handleSaveLead}
                onDelete={editingLead ? () => handleDeleteLead(editingLead.id) : undefined}
                onLeadUpdated={handleLeadUpdated}
            />
        </div>
    );
}
