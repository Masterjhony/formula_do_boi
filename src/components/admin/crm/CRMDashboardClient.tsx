'use client';

import { useState } from 'react';
import { CRMLead, updateLead, createLead, moveLead, deleteLead } from '@/app/web-admin/actions/crm-leads';
import { CRMKanbanBoard } from './CRMKanbanBoard';
import { CRMModal } from './CRMModal';
import { BarChart2, LayoutGrid, List, AlertCircle, DollarSign, Plus, Settings2 } from 'lucide-react';
import { CRMChart } from './CRMChart';
import { CRMTable } from './CRMTable';

interface CRMDashboardClientProps {
    initialLeads: CRMLead[];
}

type ViewType = 'grafico' | 'kanban' | 'todos' | 'prioridade_alta' | 'valor_alto';

export function CRMDashboardClient({ initialLeads }: CRMDashboardClientProps) {
    const [leads, setLeads] = useState<CRMLead[]>(initialLeads);
    const [activeView, setActiveView] = useState<ViewType>('kanban'); // 'Por status' as default in Notion usually, or 'Gráfico'

    // Global Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<CRMLead | undefined>(undefined);
    const [defaultStatus, setDefaultStatus] = useState('Lead');

    const handleOpenNewLead = (status: string = 'Lead') => {
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
        // Optimistic update locally
        setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus, position: newPosition } : l));
        try {
            await moveLead(id, newStatus, newPosition);
        } catch (error) {
            console.error('Failed to move lead:', error);
            // Optionally revert state here if api fails
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
        { id: 'todos', label: 'Todos os registros', icon: List },
        { id: 'prioridade_alta', label: 'Prioridade alta', icon: AlertCircle },
        { id: 'valor_alto', label: 'Valor estimado > R$ 1000', icon: DollarSign },
    ] as const;

    // Filter leads based on active view
    let displayLeads = leads;
    if (activeView === 'prioridade_alta') {
        displayLeads = leads.filter(l => l.prioridade === 'Alta');
    } else if (activeView === 'valor_alto') {
        // Simple logic: if 'interesse' contains 'R$' or 'Touro' assume interesting/high value for now
        // In a real app, you'd have a numeric 'valor' column
        displayLeads = leads.filter(l => l.interesse?.includes('R$') || l.interesse?.toLowerCase().includes('touro'));
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] overflow-hidden">
            {/* Header Description similar to Notion */}
            <div className="p-6 pb-2">
                <p className="text-gray-500 text-sm mb-4">
                    Simplifique seu processo de vendas com este modelo de CRM. Acompanhe facilmente os leads e as interações com os clientes, personalize com anotações e com propriedades adicionais.
                </p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Banco de dados de clientes
                </h2>

                {/* Tabs & Controls */}
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-[#222222] pb-0">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                        {views.map((view) => {
                            const Icon = view.icon;
                            const isActive = activeView === view.id;
                            return (
                                <button
                                    key={view.id}
                                    onClick={() => setActiveView(view.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${isActive
                                            ? 'border-[#B8860B] text-gray-900 dark:text-white bg-gray-50 dark:bg-[#1A1A1A]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {view.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 pb-2 pr-2">
                        <button className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#222222] transition-colors">
                            <Settings2 size={18} />
                        </button>
                        <button
                            onClick={() => handleOpenNewLead('Lead')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 shadow-sm"
                        >
                            Nova <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* View Content Area */}
            <div className="flex-1 overflow-hidden p-6 bg-gray-50/50 dark:bg-[#0A0A0A]">
                {activeView === 'grafico' && (
                    <CRMChart leads={leads} />
                )}

                {activeView === 'kanban' && (
                    <CRMKanbanBoard
                        leads={leads}
                        onEditLead={handleEditLead}
                        onAddLead={handleOpenNewLead}
                        onMoveLead={handleMoveLead}
                    />
                )}

                {(activeView === 'todos' || activeView === 'prioridade_alta' || activeView === 'valor_alto') && (
                    <CRMTable
                        leads={displayLeads}
                        onEditLead={handleEditLead}
                    />
                )}
            </div>

            <CRMModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                lead={editingLead}
                defaultStatus={defaultStatus}
                onSave={handleSaveLead}
                onDelete={editingLead ? () => handleDeleteLead(editingLead.id) : undefined}
            />
        </div>
    );
}
