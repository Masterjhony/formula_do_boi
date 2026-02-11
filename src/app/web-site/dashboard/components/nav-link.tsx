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
                ? 'bg-[#B8860B]/10 text-[#B8860B] dark:bg-[#B8860B]/20 dark:text-[#B8860B]'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1A1A1A]'
                }`}
        >
            <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#B8860B]' : 'text-gray-500 group-hover:text-[#B8860B]'
                }`} />
            <span className="flex-1 font-medium">{children}</span>
        </Link>
    )
}
