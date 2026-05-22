'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Lock, Info, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
    const router = useRouter()
    const supabase = createClient()
    const [ready, setReady] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [done, setDone] = useState(false)

    useEffect(() => {
        // Supabase, ao processar o link de recovery, dispara um evento PASSWORD_RECOVERY
        // que coloca a sessão temporária no client. Aguardamos isso antes de habilitar o form.
        const { data: sub } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
                setReady(true)
            }
        })

        // Caso já exista sessão (link já processado), libera direto.
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) setReady(true)
        })

        return () => sub.subscription.unsubscribe()
    }, [supabase])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (password.length < 8) return setError('A senha deve ter pelo menos 8 caracteres.')
        if (password !== confirmPassword) return setError('As senhas não coincidem.')

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            setDone(true)
            await supabase.auth.signOut()
            setTimeout(() => router.push('/login'), 2500)
        } catch (err: any) {
            setError(err?.message || 'Falha ao atualizar a senha.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[#A0792E]/5 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-8 relative group">
                        <Image
                            src="/logo_complete.svg"
                            alt="Fórmula do Boi"
                            width={300}
                            height={100}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-wide uppercase">Redefinir senha</h2>
                    <p className="text-gray-500 text-sm">
                        {done ? 'Senha atualizada' : 'Defina sua nova senha de acesso'}
                    </p>
                </div>

                <div className="bg-[#1B1B1B] border border-[#2e2e2e] rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
                    {error && (
                        <div className="mb-5 bg-red-900/10 border border-red-900/20 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
                            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {done ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-[#A0792E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8 text-[#A0792E]" />
                            </div>
                            <p className="text-gray-300">Senha redefinida com sucesso.</p>
                            <p className="text-gray-500 text-sm mt-2">Redirecionando para o login...</p>
                        </div>
                    ) : !ready ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
                            Validando link de redefinição...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Nova senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={inputClass}
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">Confirmar nova senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={inputClass}
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
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
                                        Atualizando...
                                    </>
                                ) : (
                                    'Salvar nova senha'
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {!done && (
                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                            Voltar para login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

const inputClass =
    'w-full bg-[#202020] border border-[#3f3f3f] text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#A0792E]/30 focus:ring-1 focus:ring-[#A0792E]/30 transition-all placeholder:text-gray-700 font-mono text-sm'
