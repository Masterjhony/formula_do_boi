'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Mail, Lock, User, Info, CheckCircle2, Phone, Home, MapPin, ChevronDown } from 'lucide-react'

const ESTADOS_BR = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
    'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
    'RS','RO','RR','SC','SP','SE','TO'
]

const MOMENTO_OPTIONS = [
    'Iniciando na pecuária',
    'Já tenho rebanho estabelecido',
    'Quero melhorar minha genética',
    'Expando meu plantel',
    'Procuro parceria comercial',
]

const BUSCA_OPTIONS = [
    'Comprar touros Nelore PO',
    'Comprar matrizes Nelore PO',
    'Comprar sêmen / embriões',
    'Vender animais',
    'Acompanhar o mercado',
]

const QUANTIDADE_OPTIONS = [
    'Nenhum ainda',
    'Até 50 cabeças',
    '50 a 100 cabeças',
    '100 a 300 cabeças',
    'Acima de 300 cabeças',
]

const inputClass = "w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#B8860B]/50 focus:ring-1 focus:ring-[#B8860B]/50 transition-all placeholder:text-gray-600"
const selectClass = "w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#B8860B]/50 focus:ring-1 focus:ring-[#B8860B]/50 transition-all appearance-none"

export default function SignupPage() {
    return (
        <Suspense>
            <SignupPageInner />
        </Suspense>
    )
}

function SignupPageInner() {
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect') || ''
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        farmName: '',
        estado: '',
        cidade: '',
        momento: '',
        busca: '',
        quantidade: '',
        password: '',
        confirmPassword: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const supabase = createClient()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (formData.password !== formData.confirmPassword) {
            setError("As senhas não coincidem")
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=B8860B&color=fff`,
                        phone: formData.phone,
                        farm_name: formData.farmName,
                        estado: formData.estado,
                        cidade: formData.cidade,
                        momento_pecuaria: formData.momento,
                        o_que_busca: formData.busca,
                        quantidade_animais: formData.quantidade,
                    }
                }
            })

            if (error) throw error
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
                <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 backdrop-blur-sm shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-[#B8860B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-[#B8860B]" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Conta Criada com Sucesso!</h2>
                    <p className="text-gray-400 mb-8">Por favor, verifique seu email para confirmar seu cadastro antes de fazer login.</p>
                    <Link
                        href={redirect ? `/login?next=${encodeURIComponent(redirect)}` : '/login'}
                        className="inline-flex items-center justify-center w-full bg-[#B8860B] hover:bg-[#D4AF37] text-black font-bold py-3.5 rounded-xl transition-all"
                    >
                        Voltar para Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#B8860B]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#B8860B]/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-lg relative z-10 py-10">
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
                    <h2 className="text-3xl font-bold text-white mb-2">Criar Nova Conta</h2>
                    <p className="text-gray-400">Junte-se à maior plataforma de leilões da região</p>
                </div>

                <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 backdrop-blur-sm shadow-xl">
                    <form onSubmit={handleSignup} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
                                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Nome Completo */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Ex: João da Silva"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Celular */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Celular</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="(00) 00000-0000"
                                    required
                                />
                            </div>
                        </div>

                        {/* Nome da Fazenda */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Nome da Fazenda</label>
                            <div className="relative">
                                <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    name="farmName"
                                    value={formData.farmName}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Ex: Fazenda Santa Maria"
                                />
                            </div>
                        </div>

                        {/* Estado + Cidade */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Estado</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    <select
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                        className={selectClass}
                                        required
                                    >
                                        <option value="">Selecione</option>
                                        {ESTADOS_BR.map(uf => (
                                            <option key={uf} value={uf}>{uf}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Cidade</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        name="cidade"
                                        value={formData.cidade}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="Sua cidade"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Momento na Pecuária */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Descreva seu momento na pecuária</label>
                            <div className="relative">
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                <select
                                    name="momento"
                                    value={formData.momento}
                                    onChange={handleChange}
                                    className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl py-3 px-4 focus:outline-none focus:border-[#B8860B]/50 focus:ring-1 focus:ring-[#B8860B]/50 transition-all appearance-none"
                                    required
                                >
                                    <option value="">Selecione uma opção</option>
                                    {MOMENTO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* O que você busca */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">O que você busca?</label>
                            <div className="relative">
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                <select
                                    name="busca"
                                    value={formData.busca}
                                    onChange={handleChange}
                                    className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl py-3 px-4 focus:outline-none focus:border-[#B8860B]/50 focus:ring-1 focus:ring-[#B8860B]/50 transition-all appearance-none"
                                    required
                                >
                                    <option value="">Selecione uma opção</option>
                                    {BUSCA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Quantidade de Animais */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Quantidade de animais na fazenda</label>
                            <div className="relative">
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                <select
                                    name="quantidade"
                                    value={formData.quantidade}
                                    onChange={handleChange}
                                    className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl py-3 px-4 focus:outline-none focus:border-[#B8860B]/50 focus:ring-1 focus:ring-[#B8860B]/50 transition-all appearance-none"
                                    required
                                >
                                    <option value="">Selecione uma opção</option>
                                    {QUANTIDADE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Senha */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {/* Confirmar Senha */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Confirmar Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#B8860B] to-[#DAA520] hover:from-[#D4AF37] hover:to-[#FFD700] text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_20px_-5px_rgba(184,134,11,0.3)] hover:shadow-[0_6px_25px_-5px_rgba(184,134,11,0.4)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Criando conta...
                                </>
                            ) : (
                                'Criar Conta'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            Já tem uma conta?{' '}
                            <Link href={redirect ? `/login?next=${encodeURIComponent(redirect)}` : '/login'} className="text-[#B8860B] font-semibold hover:text-[#D4AF37] transition-colors">
                                Fazer login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
