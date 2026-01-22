import Link from "next/link";
import { Search, ShoppingCart, User, Menu } from "lucide-react";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                {/* Left: Menu & Logo */}
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-gray-50 rounded-lg lg:hidden">
                        <Menu className="w-6 h-6 text-gray-700" />
                    </button>

                    <Link href="/" className="flex items-center gap-2">
                        {/* Logo Image from Assets */}
                        <div className="relative h-12 w-48">
                            <img
                                src="/logo_full_embedded.svg"
                                alt="Fórmula do Boi"
                                className="h-full w-full object-contain object-left"
                            />
                        </div>
                    </Link>
                </div>

                {/* Center: Search Bar (Hidden on mobile) */}
                <div className="hidden lg:flex flex-1 max-w-xl mx-8">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Buscar animais, categorias..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/20 transition-all text-sm"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-xs text-gray-500">Precisa de ajuda?</span>
                        <span className="text-xs font-semibold text-brand-gold">+55 62 9999-9999</span>
                    </div>

                    <button className="p-2 hover:bg-gray-50 rounded-full transition-colors relative group">
                        <User className="w-5 h-5 text-gray-700 group-hover:text-brand-gold transition-colors" />
                    </button>

                    <button className="p-2 hover:bg-gray-50 rounded-full transition-colors relative group">
                        <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-brand-gold transition-colors" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-brand-gold rounded-full ring-2 ring-white"></span>
                    </button>
                </div>
            </div>
        </header>
    );
}
