import { Settings, User, Shield, Bell, Database } from 'lucide-react';

export default function ConfiguracoesPage() {
    return (
        <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-4">
                <div>
                    <h2 className="text-xl sm:text-3xl font-bold tracking-wide uppercase bg-gradient-to-r from-[#D4A85C] via-[#FFF8DC] to-[#D4A85C] text-transparent bg-clip-text">
                        Configurações do ERP
                    </h2>
                    <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm text-gray-500 dark:text-[#888] font-medium tracking-wider uppercase">
                        Gerenciamento de acessos, perfil e sistema
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 pt-2 sm:pt-4">
                {/* Visual Settings Nav (Static for now) */}
                <div className="lg:col-span-1 space-y-2">
                    {/* Mobile: horizontal pill scroller */}
                    <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
                        <button className="shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-[#A0792E]/30 rounded-xl">
                            <User className="w-4 h-4 text-[#D4A85C]" />
                            <span className="text-gray-900 dark:text-white font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">Meu Perfil</span>
                        </button>
                        <button className="shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500 dark:text-[#888] font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">Acessos</span>
                        </button>
                        <button className="shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl">
                            <Bell className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500 dark:text-[#888] font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">Notificações</span>
                        </button>
                        <button className="shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl">
                            <Database className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500 dark:text-[#888] font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">Sistema</span>
                        </button>
                    </div>
                    {/* Desktop: stacked nav */}
                    <div className="hidden lg:block bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-2xl p-2 shadow-xl">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-[#1A1A1A] border border-[#A0792E]/20 rounded-xl text-left transition-all">
                            <User className="w-5 h-5 text-[#D4A85C]" />
                            <span className="text-gray-900 dark:text-white font-bold text-sm tracking-wider uppercase">Meu Perfil</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#141414] rounded-xl text-left transition-all group">
                            <Shield className="w-5 h-5 text-gray-400 dark:text-[#666] group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                            <span className="text-gray-500 dark:text-[#888] group-hover:text-gray-900 dark:group-hover:text-white font-bold text-sm tracking-wider uppercase transition-colors">Acessos</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#141414] rounded-xl text-left transition-all group">
                            <Bell className="w-5 h-5 text-gray-400 dark:text-[#666] group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                            <span className="text-gray-500 dark:text-[#888] group-hover:text-gray-900 dark:group-hover:text-white font-bold text-sm tracking-wider uppercase transition-colors">Notificações</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#141414] rounded-xl text-left transition-all group border-t border-gray-200 dark:border-[#222] mt-2 pt-4">
                            <Database className="w-5 h-5 text-gray-400 dark:text-[#666] group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                            <span className="text-gray-500 dark:text-[#888] group-hover:text-gray-900 dark:group-hover:text-white font-bold text-sm tracking-wider uppercase transition-colors">Sistema</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#A0792E]/5 rounded-full blur-[100px] pointer-events-none" />

                        <div className="p-4 sm:p-8 border-b border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#141414]">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white uppercase tracking-widest">Informações Pessoais</h3>
                            <p className="text-[10px] sm:text-xs text-gray-400 dark:text-[#666] uppercase tracking-widest mt-1">Atualize sua foto e detalhes de contato do ERP.</p>
                        </div>

                        <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gray-100 dark:bg-gradient-to-br dark:from-[#1A1A1A] dark:to-[#0A0A0A] border-2 border-gray-300 dark:border-[#333] flex items-center justify-center shadow-lg shrink-0">
                                    <User className="w-7 h-7 sm:w-10 sm:h-10 text-gray-400 dark:text-[#555]" />
                                </div>
                                <div>
                                    <button className="px-3 sm:px-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#333] hover:border-[#A0792E]/50 text-gray-900 dark:text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md">
                                        Alterar Avatar
                                    </button>
                                </div>
                            </div>

                            <hr className="border-gray-200 dark:border-[#222]" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest ml-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        disabled
                                        value="Administrador Global"
                                        className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] text-gray-500 dark:text-[#AAA] rounded-xl py-3 px-4 text-sm font-medium focus:outline-none opacity-70 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest ml-1">E-mail de Acesso</label>
                                    <input
                                        type="email"
                                        disabled
                                        value="admin@formuladoboi.com.br"
                                        className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] text-gray-500 dark:text-[#AAA] rounded-xl py-3 px-4 text-sm font-medium focus:outline-none opacity-70 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest ml-1">Função / Cargo</label>
                                    <input
                                        type="text"
                                        disabled
                                        value="Diretoria / Gestão"
                                        className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] text-gray-500 dark:text-[#AAA] rounded-xl py-3 px-4 text-sm font-medium focus:outline-none opacity-70 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-[#222] bg-gray-50 dark:bg-[#0A0A0A] flex justify-end">
                            <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#A0792E] to-[#9A7209] text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-[#A0792E]/20 hover:scale-105 transition-all opacity-50 cursor-not-allowed">
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
