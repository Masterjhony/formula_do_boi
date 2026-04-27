import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description: string
    isCurrency?: boolean
}

export function StatsCard({ title, value, icon: Icon, description, isCurrency }: StatsCardProps) {
    return (
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-2xl p-6 hover:border-[#A0792E]/30 transition-colors group shadow-sm dark:shadow-none">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl group-hover:bg-[#A0792E]/10 transition-colors">
                    <Icon className="w-6 h-6 text-[#A0792E]" />
                </div>
                {isCurrency && (
                    <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+0%</span>
                )}
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{value}</div>
            <p className="text-gray-400 dark:text-gray-600 text-xs">{description}</p>
        </div>
    )
}
