'use client';

import { CRMLead } from '@/app/web-admin/actions/crm-leads';
import { CRM_COLUMNS } from './CRMKanbanBoard';

interface CRMChartProps {
    leads: CRMLead[];
}

export function CRMChart({ leads }: CRMChartProps) {
    // Count leads by status
    const statusCounts = CRM_COLUMNS.reduce((acc, status) => {
        acc[status] = leads.filter(l => l.status === status).length;
        return acc;
    }, {} as Record<string, number>);

    const maxCount = Math.max(...Object.values(statusCounts), 1); // Avoid division by zero

    // Custom colors inspired by Notion
    const columnColors: Record<string, string> = {
        'Sem Status': 'bg-gray-400',
        'Lead': 'bg-pink-400',
        'Qualificado': 'bg-orange-400',
        'Proposta': 'bg-blue-400',
        'Negociação': 'bg-purple-400',
        'Fechado': 'bg-green-400',
        'Perdido': 'bg-red-400',
        'default': 'bg-gray-400'
    };

    return (
        <div className="w-full h-full p-4 flex flex-col pt-10">
            {/* Y Axis Limits Mock */}
            <div className="relative flex-1 flex justify-around items-end ml-10 border-b border-gray-200 dark:border-[#333]">
                {/* Horizontal Grid lines */}
                <div className="absolute top-0 left-0 w-full border-t border-dashed border-gray-200 dark:border-[#333] z-0" />
                <div className="absolute top-[25%] left-0 w-full border-t border-dashed border-gray-200 dark:border-[#333] z-0" />
                <div className="absolute top-[50%] left-0 w-full border-t border-dashed border-gray-200 dark:border-[#333] z-0" />
                <div className="absolute top-[75%] left-0 w-full border-t border-dashed border-gray-200 dark:border-[#333] z-0" />

                {/* Y-axis labels */}
                <div className="absolute -left-10 top-0 text-xs text-gray-400 transform -translate-y-1/2">{Math.ceil(maxCount)}</div>
                <div className="absolute -left-10 top-[25%] text-xs text-gray-400 transform -translate-y-1/2">{Math.ceil(maxCount * 0.75)}</div>
                <div className="absolute -left-10 top-[50%] text-xs text-gray-400 transform -translate-y-1/2">{Math.ceil(maxCount * 0.5)}</div>
                <div className="absolute -left-10 top-[75%] text-xs text-gray-400 transform -translate-y-1/2">{Math.ceil(maxCount * 0.25)}</div>
                <div className="absolute -left-10 bottom-0 text-xs text-gray-400 transform translate-y-1/2">0</div>

                {CRM_COLUMNS.map(status => {
                    const count = statusCounts[status] || 0;
                    const heightPercent = (count / maxCount) * 100;
                    const color = columnColors[status] || columnColors['default'];

                    return (
                        <div key={status} className="flex flex-col items-center gap-2 z-10 -mb-[1px]">
                            <div className="text-xs text-gray-500 font-medium">
                                {count}
                            </div>
                            <div
                                className={`w-8 rounded-t-sm transition-all duration-500 ease-out hover:opacity-80 cursor-pointer ${color}`}
                                style={{ height: `${heightPercent}%`, minHeight: count > 0 ? '4px' : '0px' }}
                                title={`${status}: ${count}`}
                            />
                        </div>
                    );
                })}
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-around items-start ml-10 mt-4">
                {CRM_COLUMNS.map(status => (
                    <div key={`label-${status}`} className="text-xs text-gray-500 w-20 text-center truncate">
                        {status}
                    </div>
                ))}
            </div>
        </div>
    );
}
