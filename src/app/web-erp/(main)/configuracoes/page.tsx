import { Settings, User, Shield, Bell, Database } from 'lucide-react';

export default function ConfiguracoesPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-wide uppercase bg-gradient-to-r from-[#D4AF37] via-[#FFF8DC] to-[#D4AF37] text-transparent bg-clip-text">
                        Configurações do ERP
                    </h2>
                    <p className="mt-2 text-sm text-[#888] font-medium tracking-wider uppercase">
                        Gerenciamento de acessos, perfil e sistema
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-4">
                {/* Visual Settings Nav (Static for now) */}
                <div className="lg:col-span-1 space-y-2">
                    <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-2 shadow-xl">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#1A1A1A] border border-[#B8860B]/20 rounded-xl text-left transition-all">
                            <User className="w-5 h-5 text-[#D4AF37]" />
                            <span className="text-white font-bold text-sm tracking-wider uppercase">Meu Perfil</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#141414] rounded-xl text-left transition-all group">
                            <Shield className="w-5 h-5 text-[#666] group-hover:text-white transition-colors" />
                            <span className="text-[#888] group-hover:text-white font-bold text-sm tracking-wider uppercase transition-colors">Acessos</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#141414] rounded-xl text-left transition-all group">
                            <Bell className="w-5 h-5 text-[#666] group-hover:text-white transition-colors" />
                            <span className="text-[#888] group-hover:text-white font-bold text-sm tracking-wider uppercase transition-colors">Notificações</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#141414] rounded-xl text-left transition-all group border-t border-[#222] mt-2 pt-4">
                            <Database className="w-5 h-5 text-[#666] group-hover:text-white transition-colors" />
                            <span className="text-[#888] group-hover:text-white font-bold text-sm tracking-wider uppercase transition-colors">Sistema</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-[#0F0F0F] border border-[#222] rounded-2xl shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B8860B]/5 rounded-full blur-[100px] pointer-events-none" />
                        
                        <div className="p-8 border-b border-[#222] bg-[#141414]">
                            <h3 className="text-lg font-bold text-white uppercase tracking-widest">Informações Pessoais</h3>
                            <p className="text-xs text-[#666] uppercase tracking-widest mt-1">Atualize sua foto e detalhes de contato do ERP.</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border-2 border-[#333] flex items-center justify-center shadow-lg">
                                    <User className="w-10 h-10 text-[#555]" />
                                </div>
                                <div>
                                    <button className="px-4 py-2 bg-[#1A1A1A] border border-[#333] hover:border-[#B8860B]/50 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md">
                                        Alterar Avatar
                                    </button>
                                </div>
                            </div>
                            
                            <hr className="border-[#222]" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#888] uppercase tracking-widest ml-1">Nome Completo</label>
                                    <input 
                                        type="text" 
                                        disabled
                                        value="Administrador Global"
                                        className="w-full bg-[#0A0A0A] border border-[#222] text-[#AAA] rounded-xl py-3 px-4 text-sm font-medium focus:outline-none opacity-70 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#888] uppercase tracking-widest ml-1">E-mail de Acesso</label>
                                    <input 
                                        type="email" 
                                        disabled
                                        value="admin@formuladoboi.com.br"
                                        className="w-full bg-[#0A0A0A] border border-[#222] text-[#AAA] rounded-xl py-3 px-4 text-sm font-medium focus:outline-none opacity-70 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#888] uppercase tracking-widest ml-1">Função / Cargo</label>
                                    <input 
                                        type="text" 
                                        disabled
                                        value="Diretoria / Gestão"
                                        className="w-full bg-[#0A0A0A] border border-[#222] text-[#AAA] rounded-xl py-3 px-4 text-sm font-medium focus:outline-none opacity-70 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                        </div>
                        
                        <div className="p-6 border-t border-[#222] bg-[#0A0A0A] flex justify-end">
                            <button className="px-6 py-3 bg-gradient-to-r from-[#B8860B] to-[#9A7209] text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-[#B8860B]/20 hover:scale-105 transition-all opacity-50 cursor-not-allowed">
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
