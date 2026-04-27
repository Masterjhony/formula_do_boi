'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CRMLead } from '@/app/web-admin/actions/crm-leads';
import { Phone, Building, Calendar, DollarSign, User, MapPin } from 'lucide-react';

interface CRMCardProps {
    lead: CRMLead;
    onClick: (lead: CRMLead) => void;
}

export function CRMCard({ lead, onClick }: CRMCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: lead.id,
        data: {
            type: 'Lead',
            lead,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 border-2 border-dashed border-[#A0792E] rounded-xl h-[120px]"
            />
        );
    }

    const priorityColors: Record<string, string> = {
        'Alta': 'bg-red-500/10 text-red-500 border-red-500/20',
        'Baixa': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(lead)}
            className="group relative bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border border-gray-200 dark:border-[#222222] shadow-sm hover:shadow-md hover:border-[#A0792E]/50 transition-all cursor-grab active:cursor-grabbing flex flex-col gap-3"
        >
            {/* Header */}
            <div className="flex justify-between items-start gap-2">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight flex-1">
                    {lead.nome}
                </h4>
            </div>

            {/* Cidade/Estado */}
            {(lead.cidade || lead.estado) && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin size={12} className="shrink-0 text-orange-400" />
                    <span className="truncate">
                        {lead.cidade && lead.estado ? `${lead.cidade}/${lead.estado}` : (lead.cidade || lead.estado)}
                    </span>
                </div>
            )}

            {/* Empresa (if exists) */}
            {lead.empresa && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Building size={12} className="shrink-0" />
                    <span className="truncate">{lead.empresa}</span>
                </div>
            )}

            {/* Interesse */}
            {lead.interesse && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <DollarSign size={12} className="shrink-0 text-emerald-500" />
                    <span className="line-clamp-2">{lead.interesse}</span>
                </div>
            )}

            {/* Contato Info */}
            {(lead.telefone || lead.celular) && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                    <Phone size={12} className="shrink-0 text-blue-500" />
                    <span>{lead.celular || lead.telefone}</span>
                </div>
            )}

            <div className="flex items-center justify-between pt-2 mt-auto border-t border-gray-100 dark:border-[#222222]">
                {lead.responsavel && (
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-semibold">
                        <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-[#333333] flex items-center justify-center text-gray-600 dark:text-gray-300">
                            {lead.responsavel.charAt(0)}
                        </div>
                        <span className="truncate max-w-[80px]">{lead.responsavel}</span>
                    </div>
                )}

                {/* Priority Badge */}
                {lead.prioridade && (
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityColors[lead.prioridade] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {lead.prioridade}
                    </div>
                )}
            </div>

            {(lead.ultimo_contato || lead.data_entrada) && (
                <div className="flex items-center justify-center mt-2 pb-1">
                    <span className="text-[10px] bg-gray-100 dark:bg-[#222222] text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full border border-gray-200 dark:border-[#333] w-full text-center">
                        {lead.ultimo_contato
                            ? `Contatado ${new Date(lead.ultimo_contato).toLocaleDateString('pt-BR')}`
                            : `Entrada ${new Date(lead.data_entrada!).toLocaleDateString('pt-BR')}`
                        }
                    </span>
                </div>
            )}
        </div>
    );
}
