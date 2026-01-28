'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { Loader2, Save, User, MapPin, Phone, Mail, FileCheck } from 'lucide-react'

export default function ProfilePage() {
    const [loading, setLoading] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        cpf: '',
        phone: '',
        website: '',
        address_street: '',
        address_city: '',
        address_state: '',
        address_zip: ''
    })

    const supabase = createClient()

    useEffect(() => {
        const getProfile = async () => {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (data) {
                    setFormData({
                        full_name: data.full_name || '',
                        email: data.email || user.email || '',
                        cpf: data.cpf || '',
                        phone: data.phone || '',
                        website: data.website || '',
                        address_street: data.address?.street || '',
                        address_city: data.address?.city || '',
                        address_state: data.address?.state || '',
                        address_zip: data.address?.zip || ''
                    })
                }
            }
            setLoading(false)
        }
        getProfile()
    }, [supabase])

    const updateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)
        setMessage(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user')

            const updates = {
                id: user.id,
                full_name: formData.full_name,
                email: formData.email,
                cpf: formData.cpf,
                phone: formData.phone,
                website: formData.website,
                address: {
                    street: formData.address_street,
                    city: formData.address_city,
                    state: formData.address_state,
                    zip: formData.address_zip
                },
                updated_at: new Date().toISOString(),
            }

            const { error } = await supabase.from('profiles').upsert(updates)
            if (error) throw error
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao atualizar perfil.' })
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#B8860B]" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dados Cadastrais</h1>
                <p className="text-gray-400">Mantenha seus dados atualizados para participar dos leilões</p>
            </div>

            <form onSubmit={updateProfile} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Info */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-[#B8860B]" />
                        Informações Pessoais
                    </h2>

                    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Nome Completo</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl py-3 px-4 focus:border-[#B8860B]/50 focus:ring-1 focus:ring-[#B8860B]/50 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full bg-[#1A1A1A]/50 border border-[#333333] text-gray-400 rounded-xl py-3 pl-10 pr-4 cursor-not-allowed outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">CPF</label>
                                <div className="relative">
                                    <FileCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={formData.cpf}
                                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                        className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl py-3 pl-10 pr-4 focus:border-[#B8860B]/50 focus:ring-1 focus:ring-[#B8860B]/50 transition-all outline-none"
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Telefone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl py-3 pl-10 pr-4 focus:border-[#B8860B]/50 focus:ring-1 focus:ring-[#B8860B]/50 transition-all outline-none"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address Info */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#B8860B]" />
                        Endereço
                    </h2>

                    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Rua / Avenida</label>
                            <input
                                type="text"
                                value={formData.address_street}
                                onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                                className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl py-3 px-4 focus:border-[#B8860B]/50 focus:ring-1 focus:ring-[#B8860B]/50 transition-all outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Cidade</label>
                                <input
                                    type="text"
                                    value={formData.address_city}
                                    onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                                    className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl py-3 px-4 focus:border-[#B8860B]/50 focus:ring-1 focus:ring-[#B8860B]/50 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Estado (UF)</label>
                                <input
                                    type="text"
                                    value={formData.address_state}
                                    onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                                    className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl py-3 px-4 focus:border-[#B8860B]/50 focus:ring-1 focus:ring-[#B8860B]/50 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">CEP</label>
                            <input
                                type="text"
                                value={formData.address_zip}
                                onChange={(e) => setFormData({ ...formData, address_zip: e.target.value })}
                                className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl py-3 px-4 focus:border-[#B8860B]/50 focus:ring-1 focus:ring-[#B8860B]/50 transition-all outline-none"
                                placeholder="00000-000"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={updating}
                        className="w-full bg-gradient-to-r from-[#B8860B] to-[#DAA520] hover:from-[#D4AF37] hover:to-[#FFD700] text-black font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {updating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Salvar Alterações
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
