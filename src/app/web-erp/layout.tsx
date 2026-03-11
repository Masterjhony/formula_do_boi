import { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    LayoutDashboard,
    Wallet,
    Package,
    Calculator,
    LogOut,
    Settings,
} from 'lucide-react'

export const metadata = {
    title: 'ERP | Fórmula do Boi',
    description: 'Sistema ERP Integrado Fórmula do Boi',
}

interface ERpLayoutProps {
    children: ReactNode
}

export default function ERpLayout({ children }: ERpLayoutProps) {
    const navItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Financeiro', href: '/financeiro', icon: Wallet },
        { name: 'Estoque', href: '/estoque', icon: Package },
        { name: 'Contábil', href: '/contabil', icon: Calculator },
        { name: 'Configurações', href: '/configuracoes', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-[--brand-light] flex dark:bg-black">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-[#111] border-r border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="p-6 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
                    <Image
                        src="/FORMULA DO BOI_LOGO-11.svg"
                        alt="Fórmula do Boi"
                        width={150}
                        height={40}
                        className="dark:invert"
                    />
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:text-[--brand-gold] hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-[--brand-gold] transition-colors"
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <LogOut className="w-5 h-5" />
                        Sair do ERP
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 flex items-center px-8 justify-between">
                    <h1 className="text-xl font-semibold text-[--brand-black] dark:text-white">ERP</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[--brand-gold] flex items-center justify-center text-white font-bold text-sm">
                                AD
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Administrador
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
