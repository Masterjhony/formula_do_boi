"use client"

import {
    LayoutDashboard,
    FileText,
    Heart,
    User,
    Beef,
    Store
} from 'lucide-react'
import { NavLink } from './nav-link'

interface SidebarNavProps {
    userEmail: string | undefined | null
}

export function SidebarNav({ userEmail }: SidebarNavProps) {
    return (
        <nav className="flex-1 px-4 space-y-2">
            {userEmail?.toLowerCase() === 'formuladoboi@gmail.com' && (
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-[#222222]">
                    <NavLink href="/admin" icon={User}>Acessar Painel Admin</NavLink>
                </div>
            )}

            {/* Debug info - Remove later. Keeping consistent with previous implementation for now */}
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-600">
                Logado como: {userEmail}
            </div>

            <NavLink href="/dashboard" icon={LayoutDashboard}>Visão Geral</NavLink>
            <NavLink href="/dashboard/ads" icon={Store}>Meus Anúncios</NavLink>
            <NavLink href="/dashboard/proposals" icon={FileText}>Minhas Propostas</NavLink>
            <NavLink href="/dashboard/favorites" icon={Heart}>Meus Favoritos</NavLink>
            <NavLink href="/dashboard/herds" icon={Beef}>Dados do Rebanho</NavLink>
            <NavLink href="/dashboard/profile" icon={User}>Dados Cadastrais</NavLink>
        </nav>
    )
}
