'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, Info, User, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react'

type Step = 'form' | 'code' | 'done'

export default function AdminSignupPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>('form')

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [code, setCode] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [info, setInfo] = useState<string | null>(null)

    async function handleSendCode(e?: React.FormEvent) {
        e?.preventDefault()
        setError(null)
        setInfo(null)

        if (!fullName.trim()) return setError('Informe seu nome completo.')
        if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Email inválido.')
        if (password.length < 8) return setError('A senha deve ter pelo menos 8 caracteres.')
        if (password !== confirmPassword) return setError('As senhas não coincidem.')

        setLoading(true)
        try {
            const res = await fetch('/api/admin/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), fullName: fullName.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error || 'Não foi possível enviar o código.')
            setStep('code')
            setInfo(`Enviamos um código de 6 dígitos para ${email.trim().toLowerCase()}. Confira sua caixa de entrada (e o spam).`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setInfo(null)

        if (!/^\d{6}$/.test(code.trim())) return setError('O código deve ter 6 dígitos.')

        setLoading(true)
        try {
            const res = await fetch('/api/admin/auth/verify-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    code: code.trim(),
                    password,
                    fullName: fullName.trim(),
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error || 'Falha ao validar o código.')
            setStep('done')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleResend() {
        setError(null)
        setInfo(null)
        setLoading(true)
        try {
            const res = await fetch('/api/admin/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), fullName: fullName.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error || 'Não foi possível reenviar o código.')
            setInfo('Novo código enviado.')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
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
                            className="object-contain hover:scale-105 transition-transform duration-500"
                            priority
                        />
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-32 bg-[#A0792E]/10 blur-3xl group-hover:blur-[100px] transition-all duration-500 -z-10 rounded-full opacity-60"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-wide uppercase">
                        {step === 'done' ? 'Cadastro Concluído' : 'Criar Conta'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {step === 'form' && 'Solicite um código de verificação por email'}
                        {step === 'code' && 'Digite o código que enviamos'}
                        {step === 'done' && 'Sua conta foi criada com sucesso'}
                    </p>
                </div>

                <div className="bg-[#0F0F0F] border border-[#222222] rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
                    {error && (
                        <div className="mb-5 bg-red-900/10 border border-red-900/20 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
                            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    {info && (
                        <div className="mb-5 bg-emerald-900/10 border border-emerald-900/20 text-emerald-400 p-4 rounded-xl text-sm flex items-start gap-3">
                            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{info}</span>
                        </div>
                    )}

                    {step === 'form' && (
                        <form onSubmit={handleSendCode} className="space-y-5">
                            <Field icon={<User className="w-5 h-5 text-gray-600" />} label="Nome completo">
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className={inputClass}
                                    placeholder="João da Silva"
                                    required
                                />
                            </Field>
                            <Field icon={<Mail className="w-5 h-5 text-gray-600" />} label="Email Corporativo">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClass}
                                    placeholder="voce@formuladoboi.com"
                                    required
                                />
                            </Field>
                            <Field icon={<Lock className="w-5 h-5 text-gray-600" />} label="Senha (mín. 8 caracteres)">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputClass}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                />
                            </Field>
                            <Field icon={<Lock className="w-5 h-5 text-gray-600" />} label="Confirmar senha">
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={inputClass}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                />
                            </Field>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Enviando código...
                                    </>
                                ) : (
                                    'Enviar código por email'
                                )}
                            </button>
                        </form>
                    )}

                    {step === 'code' && (
                        <form onSubmit={handleVerify} className="space-y-5">
                            <Field icon={<KeyRound className="w-5 h-5 text-gray-600" />} label="Código de 6 dígitos">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    className={`${inputClass} tracking-[0.5em] text-center text-lg`}
                                    placeholder="000000"
                                    required
                                    autoFocus
                                />
                            </Field>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Validando...
                                    </>
                                ) : (
                                    'Confirmar e criar conta'
                                )}
                            </button>

                            <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setStep('form'); setCode(''); setError(null); setInfo(null) }}
                                    className="inline-flex items-center gap-1 hover:text-gray-300 transition-colors"
                                >
                                    <ArrowLeft className="w-3 h-3" /> Alterar dados
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={loading}
                                    className="hover:text-gray-300 transition-colors disabled:opacity-50"
                                >
                                    Reenviar código
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 'done' && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-[#A0792E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8 text-[#A0792E]" />
                            </div>
                            <p className="text-gray-300 mb-2">Sua conta foi criada com sucesso.</p>
                            <p className="text-gray-500 text-sm mb-8">
                                O acesso ao painel administrativo precisa ser liberado por um administrador existente.
                            </p>
                            <button
                                onClick={() => router.push('/login')}
                                className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3.5 rounded-xl transition-all shadow-lg"
                            >
                                Ir para login
                            </button>
                        </div>
                    )}
                </div>

                {step !== 'done' && (
                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            Já tem uma conta?{' '}
                            <Link href="/login" className="text-[#A0792E] font-semibold hover:text-[#D4A85C] transition-colors">
                                Fazer login
                            </Link>
                        </p>
                    </div>
                )}
            </div>

            <div className="absolute bottom-6 text-[#333333] text-xs font-mono">
                SECURE SATELLITE ACCESS v2.0
            </div>
        </div>
    )
}

const inputClass =
    'w-full bg-[#141414] border border-[#333333] text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#A0792E]/30 focus:ring-1 focus:ring-[#A0792E]/30 transition-all placeholder:text-gray-700 font-mono text-sm'

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">{label}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
                {children}
            </div>
        </div>
    )
}
