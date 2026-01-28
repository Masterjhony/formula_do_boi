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
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 hover:border-[#B8860B]/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#1A1A1A] rounded-xl group-hover:bg-[#B8860B]/10 transition-colors">
                    <Icon className="w-6 h-6 text-[#B8860B]" />
                </div>
                {isCurrency && (
                    <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+0%</span>
                )}
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
            <div className="text-2xl font-bold text-white mb-2">{value}</div>
            <p className="text-gray-600 text-xs">{description}</p>
        </div>
    )
}
