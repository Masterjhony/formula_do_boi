import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    LayoutDashboard,
    FileText,
    Heart,
    User,
    Beef,
    LogOut,
    ChevronRight,
    Store
} from 'lucide-react'

import { ThemeToggle } from '@/components/theme-toggle'
import { NavLink } from './components/nav-link'
import { MobileNav } from './components/mobile-nav'
import { SidebarNav } from './components/sidebar-nav'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row transition-colors duration-300">
            {/* Mobile Header */}
            <MobileNav user={user} profile={profile} />
            {/* Sidebar */}
            <aside className="w-64 bg-gray-50 dark:bg-[#111111] border-r border-gray-200 dark:border-[#222222] hidden md:flex flex-col transition-colors duration-300">
                <div className="p-6">
                    <Link href="/">
                        <Image
                            src="/logo_complete.svg"
                            alt="Fórmula do Boi"
                            width={240}
                            height={100}
                            className="h-28 w-auto"
                        />
                    </Link>
                </div>

                <div className="px-6 mb-8">
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222222] shadow-sm dark:shadow-none transition-colors duration-300">
                        <div className="w-10 h-10 rounded-full bg-[#B8860B] flex items-center justify-center text-black font-bold text-lg overflow-hidden relative">
                            {profile?.avatar_url ? (
                                <Image
                                    src={profile.avatar_url}
                                    alt={profile?.full_name || 'Usuário'}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                (profile?.full_name || user.email || '?').charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h3 className="text-gray-900 dark:text-white text-sm font-medium truncate">
                                {profile?.full_name || user?.user_metadata?.full_name || 'Usuário'}
                            </h3>
                            <p className="text-gray-500 text-xs truncate">{user.email}</p>
                        </div>
                    </div>
                </div>

                <SidebarNav userEmail={user.email} />

                <div className="p-4 border-t border-gray-200 dark:border-[#222222]">
                    <form action="/auth/signout" method="post">
                        <button className="flex items-center gap-3 w-full px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all text-sm font-medium">
                            <LogOut className="w-5 h-5" />
                            Sair da Conta
                        </button>
                    </form>
                </div>
            </aside>

            {/* Mobile Header (Visible only on mobile) */}

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative w-full">
                <div className="absolute top-4 right-4 z-10 hidden md:block">
                    <ThemeToggle />
                </div>
                <div className="max-w-7xl mx-auto p-6 md:p-12">
                    {children}
                </div>
            </main>
        </div>
    )
}


