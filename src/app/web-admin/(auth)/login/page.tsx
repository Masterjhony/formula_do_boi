'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Mail, Lock, Info, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
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
                // Determine redirect based on role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile?.role !== 'admin') {
                    // If not admin, sign out and show error
                    await supabase.auth.signOut()
                    throw new Error('Acesso não autorizado. Apenas administradores podem acessar este painel.')
                }

                // Redirect to Admin Dashboard
                router.refresh()
                router.push('/')
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar login')
            setLoading(false) // Only stop loading on error, otherwise we are navigating
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements - Slightly different for Admin */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[#B8860B]/5 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-8 relative group">
                        <Image
                            src="/logo_complete.svg"
                            alt="Fórmula do Boi"
                            width={300}
                            height={100}
                            className="object-contain hover:scale-105 transition-transform duration-500"
                            priority
                        />
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-32 bg-[#B8860B]/10 blur-3xl group-hover:blur-[100px] transition-all duration-500 -z-10 rounded-full opacity-60"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-wide uppercase">Painel Administrativo</h2>
                    <p className="text-gray-500 text-sm">Acesso restrito a gestores</p>
                </div>

                <div className="bg-[#0F0F0F] border border-[#222222] rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-900/10 border border-red-900/20 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
                                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Email Corporativo</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#141414] border border-[#333333] text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#B8860B]/30 focus:ring-1 focus:ring-[#B8860B]/30 transition-all placeholder:text-gray-700 font-mono text-sm"
                                    placeholder="admin@formuladoboi.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Credencial</label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#141414] border border-[#333333] text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#B8860B]/30 focus:ring-1 focus:ring-[#B8860B]/30 transition-all placeholder:text-gray-700 font-mono text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Autenticando...
                                </>
                            ) : (
                                'Acessar Painel'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="absolute bottom-6 text-[#333333] text-xs font-mono">
                SECURE SATELLITE ACCESS v2.0
            </div>
        </div>
    )
}
