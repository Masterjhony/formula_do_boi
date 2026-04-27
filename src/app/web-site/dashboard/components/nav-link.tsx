"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'


interface NavLinkProps {
    href: string
    icon: LucideIcon
    children: React.ReactNode
    onClick?: () => void
}

export function NavLink({ href, icon: Icon, children, onClick }: NavLinkProps) {
    const pathname = usePathname()
    const isActive = pathname === href

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 group rounded-xl transition-all ${isActive
                ? 'bg-[#A0792E]/10 text-[#A0792E] dark:bg-[#A0792E]/20 dark:text-[#A0792E]'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1A1A1A]'
                }`}
        >
            <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#A0792E]' : 'text-gray-500 group-hover:text-[#A0792E]'
                }`} />
            <span className="flex-1 font-medium">{children}</span>
        </Link>
    )
}
