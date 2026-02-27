'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CRMCard } from './CRMCard';
import { CRMLead } from '@/app/web-admin/actions/crm-leads';
import { Plus } from 'lucide-react';

interface CRMColumnProps {
    id: string;
    title: string;
    leads: CRMLead[];
    onLeadClick: (lead: CRMLead) => void;
    onAddLead: (status: string) => void;
}

export function CRMColumn({ id, title, leads, onLeadClick, onAddLead }: CRMColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
        data: {
            type: 'Column',
            status: id,
        },
    });

    const columnColors: Record<string, string> = {
        'Sem Status': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        'Lead': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
        'Qualificado': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        'Proposta': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'Negociação': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        'Fechado': 'bg-green-500/10 text-green-500 border-green-500/20',
        'Perdido': 'bg-red-500/10 text-red-500 border-red-500/20',
        'default': 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    };

    const headerColor = columnColors[title] || columnColors['default'];

    return (
        <div
            ref={setNodeRef}
            className="flex-1 min-w-[320px] flex flex-col gap-4 bg-gray-50 dark:bg-[#111111] p-4 rounded-2xl border border-gray-200 dark:border-[#222222]"
        >
            <div className="flex items-center justify-between pointer-events-none">
                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex w-full justify-between items-center ${headerColor}`}>
                    <span>{title}</span>
                    <span className="opacity-70 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{leads.length}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-3 min-h-[500px]">
                <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                    {leads.map((lead) => (
                        <CRMCard
                            key={lead.id}
                            lead={lead}
                            onClick={onLeadClick}
                        />
                    ))}
                </SortableContext>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onAddLead(id);
                    }}
                    className="w-full py-3 mt-2 rounded-xl flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 hover:text-[#B8860B] hover:bg-[#B8860B]/5 border border-transparent hover:border-[#B8860B]/20 transition-all text-sm font-medium"
                >
                    <Plus size={16} /> Nova página
                </button>
            </div>
        </div>
    );
}
