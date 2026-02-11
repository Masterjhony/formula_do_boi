"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    LayoutDashboard,
    FileText,
    Heart,
    User,
    Beef,
    LogOut,
    Menu,
    X,
    Store
} from 'lucide-react'
import { NavLink } from './nav-link'
import { ThemeToggle } from '@/components/theme-toggle'
import { AnimatePresence, motion } from 'framer-motion'

interface MobileNavProps {
    user: any
    profile: any
}

export function MobileNav({ user, profile }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleOpen = () => setIsOpen(!isOpen)

    return (
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#222222]">
            <Link href="/">
                <Image
                    src="/logo_complete.svg"
                    alt="Fórmula do Boi"
                    width={180}
                    height={60}
                    className="h-10 w-auto"
                />
            </Link>

            <button
                onClick={toggleOpen}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] rounded-lg transition-colors"
            >
                <Menu className="w-6 h-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleOpen}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#222222] shadow-xl flex flex-col"
                        >
                            <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-[#222222]">
                                <Link href="/" onClick={toggleOpen}>
                                    <Image
                                        src="/logo_complete.svg"
                                        alt="Fórmula do Boi"
                                        width={180}
                                        height={60}
                                        className="h-8 w-auto"
                                    />
                                </Link>
                                <button
                                    onClick={toggleOpen}
                                    className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A]"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-4 flex flex-col h-full overflow-y-auto">
                                {/* User Info */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-100 dark:border-[#222222]">
                                        <div className="w-10 h-10 rounded-full bg-[#B8860B] flex items-center justify-center text-black font-bold text-lg overflow-hidden relative shrink-0">
                                            {profile?.avatar_url ? (
                                                <Image
                                                    src={profile.avatar_url}
                                                    alt={profile?.full_name || 'Usuário'}
                                                    fill
                                                    sizes="40px"
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

                                {/* Navigation */}
                                <nav className="space-y-1 flex-1">
                                    {user?.email?.toLowerCase() === 'formuladoboi@gmail.com' && (
                                        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-[#222222]">
                                            <NavLink href="/admin" icon={User} onClick={toggleOpen}>Acessar Painel Admin</NavLink>
                                        </div>
                                    )}

                                    <NavLink href="/dashboard" icon={LayoutDashboard} onClick={toggleOpen}>Visão Geral</NavLink>
                                    <NavLink href="/dashboard/ads" icon={Store} onClick={toggleOpen}>Meus Anúncios</NavLink>
                                    <NavLink href="/dashboard/proposals" icon={FileText} onClick={toggleOpen}>Minhas Propostas</NavLink>
                                    <NavLink href="/dashboard/favorites" icon={Heart} onClick={toggleOpen}>Meus Favoritos</NavLink>
                                    <NavLink href="/dashboard/herds" icon={Beef} onClick={toggleOpen}>Dados do Rebanho</NavLink>
                                    <NavLink href="/dashboard/profile" icon={User} onClick={toggleOpen}>Dados Cadastrais</NavLink>
                                </nav>

                                {/* Footer Actions */}
                                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-[#222222] space-y-4">
                                    <div className="flex items-center justify-between px-4">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Tema</span>
                                        <ThemeToggle />
                                    </div>

                                    <form action="/auth/signout" method="post">
                                        <button className="flex items-center gap-3 w-full px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all text-sm font-medium">
                                            <LogOut className="w-5 h-5" />
                                            Sair da Conta
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
