import { Calculator, ArrowRight, FileText, BarChart, BookOpen, Download } from 'lucide-react';

export default function ContabilPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-wide uppercase bg-gradient-to-r from-[#D4AF37] via-[#FFF8DC] to-[#D4AF37] text-transparent bg-clip-text">
                        Contábil Base
                    </h2>
                    <p className="mt-2 text-sm text-[#888] font-medium tracking-wider uppercase">
                        Plano de contas integradas e relatórios gerenciais
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#111] border border-[#333] hover:border-indigo-500/50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20">
                        <Download className="w-4 h-4 text-indigo-500" /> Exportar Balanço
                    </button>
                </div>
            </div>

            {/* Coming Soon State / Overview */}
            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-10 md:p-16 text-center shadow-xl relative overflow-hidden group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-1000" />
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                        <Calculator className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-widest mb-3">
                        Módulo em Desenvolvimento
                    </h3>
                    <p className="text-[#888] max-w-xl mx-auto leading-relaxed text-sm font-medium">
                        O módulo contábil completo está sendo integrado. Em breve, você terá acesso ao Balanço Patrimonial, DRE, Livro Razão e Diário com integrações automáticas do Financeiro e Estoque.
                    </p>
                </div>
            </div>

            {/* Quick Actions / Future Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="bg-[#0F0F0F] border border-[#222] hover:border-indigo-500/30 rounded-2xl p-6 shadow-lg transition-all duration-300 group cursor-not-allowed opacity-80">
                    <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-[#555]" />
                    </div>
                    <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-2">Plano de Contas</h4>
                    <p className="text-[#666] text-xs leading-relaxed">Estrutura organizacional de ativos, passivos, patrimônio, receitas e despesas.</p>
                </div>

                <div className="bg-[#0F0F0F] border border-[#222] hover:border-indigo-500/30 rounded-2xl p-6 shadow-lg transition-all duration-300 group cursor-not-allowed opacity-80">
                    <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6 text-[#555]" />
                    </div>
                    <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-2">Lançamentos em Diário</h4>
                    <p className="text-[#666] text-xs leading-relaxed">Registro de partidas dobradas e movimentações específicas.</p>
                </div>

                <div className="bg-[#0F0F0F] border border-[#222] hover:border-indigo-500/30 rounded-2xl p-6 shadow-lg transition-all duration-300 group cursor-not-allowed opacity-80">
                    <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <BarChart className="w-6 h-6 text-[#555]" />
                    </div>
                    <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-2">Relatórios Gerenciais</h4>
                    <p className="text-[#666] text-xs leading-relaxed">Geração automática de Balanços e Demonstrações de Resultados (DRE).</p>
                </div>
            </div>
        </div>
    );
}
