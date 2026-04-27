'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Mail, Lock, Info, ArrowRight } from 'lucide-react'

export default function ERPLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) throw signInError

            if (user) {
                // Determine redirect based on role, usually any authenticated user can access ERP depending on the farm setup
                // For now we just let them in if they have credentials.
                router.refresh()
                router.push('/')
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar login')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Ambient Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#A0792E]/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#A0792E]/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '10s' }} />
                <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-[#D4A85C]/5 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-[420px] relative z-10">
                {/* Header Section */}
                <div className="text-center mb-10 transform translate-y-4 hover:-translate-y-0 transition-transform duration-700 ease-out">
                    <div className="inline-flex items-center justify-center mb-6 relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#A0792E]/0 via-[#A0792E]/20 to-[#A0792E]/0 blur-2xl group-hover:via-[#A0792E]/40 transition-all duration-700 -z-10 rounded-full"></div>
                        <Image
                            src="/logo_complete.svg"
                            alt="Fórmula do Boi"
                            width={320}
                            height={110}
                            className="object-contain hover:scale-105 transition-transform duration-700 drop-shadow-2xl"
                            style={{ filter: "brightness(0) saturate(100%) invert(62%) sepia(34%) saturate(762%) hue-rotate(2deg) brightness(89%) contrast(85%)" }}
                            priority
                        />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-extrabold text-white tracking-widest uppercase bg-gradient-to-r from-[#D4A85C] via-[#FFF8DC] to-[#D4A85C] text-transparent bg-clip-text drop-shadow-sm">Acesso Restrito</h2>
                        <p className="text-[#888888] text-sm uppercase tracking-[0.2em] font-medium">Sistema Integrado ERP</p>
                    </div>
                </div>

                {/* Login Form Card */}
                <div className="bg-[#0A0A0A]/80 border border-[#222222]/80 rounded-[28px] p-8 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#A0792E]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    <form onSubmit={handleLogin} className="space-y-7">
                        {error && (
                            <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-4 rounded-2xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-md">
                                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2.5">
                            <label className="text-[11px] font-bold text-[#888888] ml-1.5 uppercase tracking-widest">Credenciais de Acesso</label>
                            <div className="relative group/input">
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#A0792E]/20 to-transparent opacity-0 group-hover/input:opacity-100 blur-md transition-opacity duration-500" />
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-4 w-5 h-5 text-[#666666] group-focus-within/input:text-[#A0792E] transition-colors duration-300 z-10" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#111111] border border-[#2A2A2A] text-[#EEEEEE] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#A0792E]/50 focus:ring-1 focus:ring-[#A0792E]/50 transition-all duration-300 placeholder:text-[#444444] font-medium text-sm relative z-0"
                                        placeholder="usuario@formuladoboi.com.br"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center ml-1.5">
                                <label className="text-[11px] font-bold text-[#888888] uppercase tracking-widest">Senha de Segurança</label>
                            </div>
                            <div className="relative group/input">
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#A0792E]/20 to-transparent opacity-0 group-hover/input:opacity-100 blur-md transition-opacity duration-500" />
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-4 w-5 h-5 text-[#666666] group-focus-within/input:text-[#A0792E] transition-colors duration-300 z-10" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#111111] border border-[#2A2A2A] text-[#EEEEEE] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#A0792E]/50 focus:ring-1 focus:ring-[#A0792E]/50 transition-all duration-300 placeholder:text-[#444444] font-medium text-sm relative z-0"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative group/btn overflow-hidden rounded-2xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_40px_-10px_rgba(160,121,46,0.3)] hover:shadow-[0_0_60px_-15px_rgba(160,121,46,0.5)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#A0792E] via-[#F0E68C] to-[#A0792E] opacity-90 group-hover/btn:opacity-100 group-hover/btn:scale-105 transition-all duration-500" />
                                <div className="relative flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#A0792E]/90 to-[#9A7209]/90 backdrop-blur-sm text-black font-extrabold text-sm uppercase tracking-widest border border-white/20 rounded-2xl">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Autenticando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Entrar no Sistema</span>
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 flex flex-col items-center gap-2 animate-in fade-in duration-1000 delay-500">
                <div className="w-px h-8 bg-gradient-to-b from-[#A0792E]/50 to-transparent" />
                <div className="text-[#444444] text-[10px] font-mono tracking-[0.3em] font-medium">
                    FÓRMULA DO BOI ERP v2.0
                </div>
            </div>
        </div>
    )
}
