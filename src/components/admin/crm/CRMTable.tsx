'use client';

import { CRMLead } from '@/app/web-admin/actions/crm-leads';

interface CRMTableProps {
    leads: CRMLead[];
    onEditLead: (lead: CRMLead) => void;
}

export function CRMTable({ leads, onEditLead }: CRMTableProps) {
    if (leads.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                Nenhum registro encontrado nesta visualização.
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222222] overflow-hidden h-full flex flex-col">
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[#111111] dark:text-gray-400 sticky top-0 z-10 border-b border-gray-200 dark:border-[#333]">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-medium">Nome</th>
                            <th scope="col" className="px-6 py-3 font-medium">Status</th>
                            <th scope="col" className="px-6 py-3 font-medium">Prioridade</th>
                            <th scope="col" className="px-6 py-3 font-medium">Empresa</th>
                            <th scope="col" className="px-6 py-3 font-medium">Responsável</th>
                            <th scope="col" className="px-6 py-3 font-medium">Último Contato</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map((lead) => (
                            <tr
                                key={lead.id}
                                onClick={() => onEditLead(lead)}
                                className="bg-white border-b dark:bg-[#1A1A1A] dark:border-[#222222] hover:bg-gray-50 dark:hover:bg-[#222222] cursor-pointer transition-colors"
                            >
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {lead.nome}
                                </th>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-[#333] rounded text-xs">
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {lead.prioridade || '-'}
                                </td>
                                <td className="px-6 py-4">
                                    {lead.empresa || '-'}
                                </td>
                                <td className="px-6 py-4">
                                    {lead.responsavel || '-'}
                                </td>
                                <td className="px-6 py-4 truncate max-w-[150px]">
                                    {lead.ultimo_contato ? new Date(lead.ultimo_contato).toLocaleDateString('pt-BR') : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-[#333] text-xs text-gray-500 font-medium">
                Contagem total: {leads.length}
            </div>
        </div>
    );
}
