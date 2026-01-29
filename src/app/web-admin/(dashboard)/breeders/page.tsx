'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Trash2, User, Loader2 } from 'lucide-react';

export default function BreedersPage() {
    const [breeders, setBreeders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newBreederName, setNewBreederName] = useState('');
    const [saving, setSaving] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchBreeders();
    }, []);

    const fetchBreeders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('breeders')
            .select('*')
            .order('name', { ascending: true });

        if (data) setBreeders(data);
        setLoading(false);
    };

    const handleAddBreeder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBreederName.trim()) return;

        setSaving(true);
        const { error } = await supabase
            .from('breeders')
            .insert([{ name: newBreederName }]);

        if (error) {
            alert('Erro ao adicionar criador: ' + error.message);
        } else {
            setNewBreederName('');
            setIsAdding(false);
            fetchBreeders();
        }
        setSaving(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja remover este criador?')) return;

        const { error } = await supabase
            .from('breeders')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao remover criador: ' + error.message);
        } else {
            fetchBreeders();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Criadores e Proprietários</h1>
                    <p className="text-gray-500">Gerencie a lista de criadores disponíveis para cadastro nos animais.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Adicionar Criador
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-top-2">
                    <h3 className="font-bold text-gray-900 mb-4">Novo Cadastro</h3>
                    <form onSubmit={handleAddBreeder} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-1">
                            <label className="text-sm font-medium text-gray-700">Nome do Criador / Fazenda</label>
                            <input
                                autoFocus
                                value={newBreederName}
                                onChange={(e) => setNewBreederName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold/50"
                                placeholder="Ex: Agropecuária Visual"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium text-gray-500 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
                    <div className="w-8 text-center">#</div>
                    <div>Nome</div>
                    <div className="text-right">Ações</div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        Carregando...
                    </div>
                ) : breeders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        Nenhum criador cadastrado.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {breeders.map((breeder, index) => (
                            <div key={breeder.id} className="p-4 grid grid-cols-[auto_1fr_auto] gap-4 items-center hover:bg-gray-50 transition-colors">
                                <div className="w-8 text-center text-gray-400 text-sm">{index + 1}</div>
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    {breeder.name}
                                </div>
                                <div className="text-right">
                                    <button
                                        onClick={() => handleDelete(breeder.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remover"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
