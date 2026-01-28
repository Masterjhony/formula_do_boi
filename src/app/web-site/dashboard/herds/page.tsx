'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { Loader2, Beef, Plus, Trash2, Edit } from 'lucide-react'

export default function HerdsPage() {
    const [herds, setHerds] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [newHerd, setNewHerd] = useState({ name: '', breed: '', quantity: 0, description: '' })

    const supabase = createClient()

    useEffect(() => {
        fetchHerds()
    }, [])

    const fetchHerds = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase
                .from('herds')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (data) setHerds(data)
        }
        setLoading(false)
    }

    const handleAddHerd = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { error } = await supabase
                .from('herds')
                .insert([{
                    user_id: user.id,
                    ...newHerd
                }])

            if (!error) {
                setIsAdding(false)
                setNewHerd({ name: '', breed: '', quantity: 0, description: '' })
                fetchHerds()
            }
        }
        setLoading(false)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja remover este rebanho?')) return

        const { error } = await supabase
            .from('herds')
            .delete()
            .eq('id', id)

        if (!error) fetchHerds()
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Dados do Rebanho</h1>
                    <p className="text-gray-400">Gerencie o cadastro dos seus animais</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#B8860B] hover:bg-[#D4AF37] text-black font-bold rounded-xl transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Adicionar Rebanho
                </button>
            </div>

            {isAdding && (
                <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 mb-8 animate-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-white mb-4">Novo Cadastro</h3>
                    <form onSubmit={handleAddHerd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Nome do Lote/Rebanho</label>
                            <input
                                required
                                type="text"
                                value={newHerd.name}
                                onChange={e => setNewHerd({ ...newHerd, name: e.target.value })}
                                className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl px-4 py-2"
                                placeholder="Ex: Lote Reprodução 2024"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Raça Predominante</label>
                            <input
                                type="text"
                                value={newHerd.breed}
                                onChange={e => setNewHerd({ ...newHerd, breed: e.target.value })}
                                className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl px-4 py-2"
                                placeholder="Ex: Nelore"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Quantidade de Cabeças</label>
                            <input
                                type="number"
                                value={newHerd.quantity}
                                onChange={e => setNewHerd({ ...newHerd, quantity: Number(e.target.value) })}
                                className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl px-4 py-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Observações</label>
                            <input
                                type="text"
                                value={newHerd.description}
                                onChange={e => setNewHerd({ ...newHerd, description: e.target.value })}
                                className="w-full bg-[#1A1A1A] border border-[#333333] text-white rounded-xl px-4 py-2"
                                placeholder="Informações adicionais..."
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-[#B8860B] text-black font-bold rounded-xl hover:bg-[#D4AF37] transition-colors"
                            >
                                Salvar Cadastro
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {herds.map((herd) => (
                    <div key={herd.id} className="bg-[#111111] border border-[#222222] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 group">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="p-4 bg-[#1A1A1A] rounded-xl text-[#B8860B]">
                                <Beef className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">{herd.name}</h3>
                                <p className="text-gray-400 text-sm">
                                    {herd.quantity} animais • {herd.breed || 'Raça não informada'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 w-full md:w-auto justify-between md:justify-end">
                            <span>Cadastrado em {new Date(herd.created_at).toLocaleDateString('pt-BR')}</span>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-[#1A1A1A] rounded-lg text-gray-400 hover:text-white transition-colors">
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(herd.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {herds.length === 0 && !loading && (
                    <div className="text-center py-12 bg-[#111111] border border-[#222222] rounded-2xl">
                        <Beef className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Nenhum rebanho cadastrado</h3>
                        <p className="text-gray-500">Cadastre seus animais para ter um controle melhor do seu estoque.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
