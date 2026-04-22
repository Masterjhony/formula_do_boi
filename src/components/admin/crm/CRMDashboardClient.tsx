'use client';

import { useState } from 'react';
import { CRMLead, updateLead, createLead, moveLead, deleteLead } from '@/app/web-admin/actions/crm-leads';
import type { CRMConfig } from '@/lib/crm-types';
import { CRMKanbanBoard } from './CRMKanbanBoard';
import { CRMModal } from './CRMModal';
import { CRMChart } from './CRMChart';
import { CRMTable } from './CRMTable';
import { CRMLeadsView } from './CRMLeadsView';
import { CRMSettingsView } from './CRMSettingsView';
import {
    BarChart2, LayoutGrid, List, AlertCircle, DollarSign,
    Plus, Maximize2, Minimize2, Users, Settings,
} from 'lucide-react';

interface CRMDashboardClientProps {
    initialLeads: CRMLead[];
    crmConfig: CRMConfig;
}

type ViewType = 'grafico' | 'kanban' | 'todos' | 'prioridade_alta' | 'valor_alto' | 'leads' | 'configuracoes';

export function CRMDashboardClient({ initialLeads, crmConfig: initialConfig }: CRMDashboardClientProps) {
    const [leads, setLeads] = useState<CRMLead[]>(initialLeads);
    const [activeView, setActiveView] = useState<ViewType>('kanban');
    const [crmConfig, setCrmConfig] = useState<CRMConfig>(initialConfig);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<CRMLead | undefined>(undefined);
    const [defaultStatus, setDefaultStatus] = useState('Lead');
    const [isFullscreen, setIsFullscreen] = useState(false);

    const stages = crmConfig.stages.map(s => s.name);

    const handleOpenNewLead = (status: string = stages[0] || 'Lead') => {
        setEditingLead(undefined);
        setDefaultStatus(status);
        setIsModalOpen(true);
    };

    const handleEditLead = (lead: CRMLead) => {
        setEditingLead(lead);
        setIsModalOpen(true);
    };

    const handleSaveLead = async (leadData: any) => {
        if (editingLead) {
            const updated = await updateLead(editingLead.id, leadData);
            setLeads(leads.map(l => l.id === updated.id ? updated : l));
        } else {
            const newLead = await createLead({ ...leadData, status: defaultStatus });
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

    const views = [
        { id: 'grafico', label: 'Gráfico', icon: BarChart2 },
        { id: 'kanban', label: 'Por status', icon: LayoutGrid },
        { id: 'todos', label: 'Todos', icon: List },
        { id: 'prioridade_alta', label: 'Prioridade alta', icon: AlertCircle },
        { id: 'valor_alto', label: 'Valor > R$ 1000', icon: DollarSign },
        { id: 'leads', label: 'Leads', icon: Users },
        { id: 'configuracoes', label: 'Configurações', icon: Settings },
    ] as const;

    let displayLeads = leads;
    if (activeView === 'prioridade_alta') {
        displayLeads = leads.filter(l => l.prioridade === 'Alta');
    } else if (activeView === 'valor_alto') {
        displayLeads = leads.filter(l => l.interesse?.includes('R$') || l.interesse?.toLowerCase().includes('touro'));
    }

    const isSettingsOrLeads = activeView === 'leads' || activeView === 'configuracoes';

    return (
        <div className={
            isFullscreen
                ? 'fixed inset-0 z-[100] bg-white dark:bg-[#111111] w-screen h-screen flex flex-col overflow-hidden'
                : 'flex flex-col h-full bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] overflow-hidden'
        }>
            {/* Header */}
            <div className="p-6 pb-0 shrink-0">
                <p className="text-gray-500 text-sm mb-3">
                    Simplifique seu processo de vendas com este modelo de CRM. Acompanhe leads, interações e personalize as etapas conforme sua operação.
                </p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Banco de dados de clientes
                </h2>

                {/* Tabs & Controls */}
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-[#222222]">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                        {views.map((view) => {
                            const Icon = view.icon;
                            const isActive = activeView === view.id;
                            const isSpecial = view.id === 'leads' || view.id === 'configuracoes';
                            return (
                                <button
                                    key={view.id}
                                    onClick={() => setActiveView(view.id as ViewType)}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                                        isActive
                                            ? 'border-[#B8860B] text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1A1A1A]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'
                                    } ${isSpecial && !isActive ? 'ml-1' : ''}`}
                                >
                                    <Icon size={15} />
                                    {view.label}
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
                        {!isSettingsOrLeads && (
                            <button
                                onClick={() => handleOpenNewLead()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 shadow-sm"
                            >
                                Nova <Plus size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className={`flex-1 overflow-auto p-6 ${isSettingsOrLeads ? 'bg-gray-50/50 dark:bg-[#0A0A0A]' : 'overflow-hidden bg-gray-50/50 dark:bg-[#0A0A0A]'}`}>
                {activeView === 'grafico' && <CRMChart leads={leads} />}

                {activeView === 'kanban' && (
                    <CRMKanbanBoard
                        leads={leads}
                        stages={stages}
                        onEditLead={handleEditLead}
                        onAddLead={handleOpenNewLead}
                        onMoveLead={handleMoveLead}
                    />
                )}

                {(activeView === 'todos' || activeView === 'prioridade_alta' || activeView === 'valor_alto') && (
                    <CRMTable leads={displayLeads} onEditLead={handleEditLead} />
                )}

                {activeView === 'leads' && (
                    <CRMLeadsView
                        leads={leads}
                        stages={stages}
                        onEditLead={handleEditLead}
                        onAddLead={() => handleOpenNewLead()}
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
                stages={stages}
                customFields={crmConfig.custom_fields}
                onSave={handleSaveLead}
                onDelete={editingLead ? () => handleDeleteLead(editingLead.id) : undefined}
            />
        </div>
    );
}
