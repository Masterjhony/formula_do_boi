'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Mail, Lock, Info } from 'lucide-react'

export default function LoginPage() {
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
                // Fetch profile to check role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                const searchParams = new URLSearchParams(window.location.search);
                const next = searchParams.get('next');

                router.refresh();

                if (next) {
                    router.push(next);
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#B8860B]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#B8860B]/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-6">
                        <Image
                            src="/logo_complete.svg"
                            alt="Fórmula do Boi"
                            width={300}
                            height={100}
                            className="h-28 w-auto"
                        />
                    </Link>
                    <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h2>
                    <p className="text-gray-400">Acesse sua conta para gerenciar seu rebanho</p>
                </div>

                <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 backdrop-blur-sm shadow-xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
                                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#B8860B]/50 focus:ring-1 focus:ring-[#B8860B]/50 transition-all placeholder:text-gray-600"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-gray-300">Senha</label>
                                <Link href="#" className="text-xs text-[#B8860B] hover:text-[#D4AF37] transition-colors">
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#B8860B]/50 focus:ring-1 focus:ring-[#B8860B]/50 transition-all placeholder:text-gray-600"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#B8860B] to-[#DAA520] hover:from-[#D4AF37] hover:to-[#FFD700] text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_20px_-5px_rgba(184,134,11,0.3)] hover:shadow-[0_6px_25px_-5px_rgba(184,134,11,0.4)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar na Plataforma'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            Não tem uma conta?{' '}
                            <Link href="/auth/signup" className="text-[#B8860B] font-semibold hover:text-[#D4AF37] transition-colors">
                                Criar conta gratuita
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
