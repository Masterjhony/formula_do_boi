'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Trash2, User, Loader2, Edit2, Package } from 'lucide-react';

export default function BreedersPage() {
    const [breeders, setBreeders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [newBreederName, setNewBreederName] = useState('');
    const [saving, setSaving] = useState(false);
    const [productCounts, setProductCounts] = useState<Record<string, number>>({});

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchBreeders(), fetchProductCounts()]);
        setLoading(false);
    };

    const fetchProductCounts = async () => {
        // Fetch all products to count by breeder
        // Since breeder info is in details->breeder or details->proprietario
        const { data: products } = await supabase
            .from('products')
            .select('details');

        if (products) {
            const counts: Record<string, number> = {};
            products.forEach((p: any) => {
                const breederName = p.details?.breeder || p.details?.proprietario;
                if (breederName) {
                    // Normalize for counting (optional, but good for loose matches)
                    // For now, exact match to breeder name
                    const name = breederName.trim();
                    counts[name] = (counts[name] || 0) + 1;
                }
            });
            setProductCounts(counts);
        }
    };

    const fetchBreeders = async () => {
        const { data } = await supabase
            .from('breeders')
            .select('*')
            .order('name', { ascending: true });

        if (data) setBreeders(data);
    };

    const handleAddBreeder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBreederName.trim()) return;

        setSaving(true);
        const { error } = await supabase
            .from('breeders')
            .insert([{ name: newBreederName.trim() }]);

        if (error) {
            alert('Erro ao adicionar criador: ' + error.message);
        } else {
            setNewBreederName('');
            setIsAdding(false);
            fetchBreeders();
        }
        setSaving(false);
    };

    const handleEditInit = (breeder: any) => {
        setIsEditing(breeder.id);
        setEditName(breeder.name);
    };

    const handleUpdateBreeder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName.trim() || !isEditing) return;

        setSaving(true);

        // Get the old name to find affected products
        const oldBreeder = breeders.find(b => b.id === isEditing);
        if (!oldBreeder) return;

        const oldName = oldBreeder.name;
        const newName = editName.trim();

        // 1. Update Breeder Table
        const { error: updateError } = await supabase
            .from('breeders')
            .update({ name: newName })
            .eq('id', isEditing);

        if (updateError) {
            alert('Erro ao atualizar criador: ' + updateError.message);
            setSaving(false);
            return;
        }

        // 2. Sync Products (Soft FK update)
        // Find products with this breeder name in details->breeder OR details->proprietario
        // Note: This is a heavy operation if there are many products, but ok for now.
        // We need to fetch matching products first to upgrade them.

        // Ideally we would use a SQL function or better DB structure, but client-side logic:
        const { data: productsToUpdate } = await supabase
            .from('products')
            .select('id, details')
            .or(`details->>breeder.eq."${oldName}",details->>proprietario.eq."${oldName}"`);

        if (productsToUpdate && productsToUpdate.length > 0) {
            const updates = productsToUpdate.map(p => {
                const newDetails = { ...p.details };
                if (newDetails.breeder === oldName) newDetails.breeder = newName;
                if (newDetails.proprietario === oldName) newDetails.proprietario = newName;

                return supabase
                    .from('products')
                    .update({ details: newDetails })
                    .eq('id', p.id);
            });

            await Promise.all(updates);
        }

        setIsEditing(null);
        setEditName('');
        await fetchData(); // Refresh all
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
                    <h1 className="text-2xl font-bold text-white">Criadores e Proprietários</h1>
                    <p className="text-gray-400">Gerencie a lista de criadores disponíveis para cadastro nos animais.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Adicionar Criador
                </button>
            </div>

            {/* Add Form */}
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

            {/* Edit Modal (Simple Inline or Overlay? Let's do Overlay for clarity) */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h3 className="font-bold text-lg text-gray-900 mb-4">Editar Criador</h3>
                        <form onSubmit={handleUpdateBreeder} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Nome do Criador / Fazenda</label>
                                <input
                                    autoFocus
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold/50"
                                />
                                <p className="text-xs text-yellow-600 mt-1">
                                    Nota: Isso também atualizará o nome nos animais vinculados.
                                </p>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsEditing(null); setEditName(''); }}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Atualizar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium text-gray-500 grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center">
                    <div className="w-12 text-center">#</div>
                    <div>Nome</div>
                    <div className="text-center w-32">Animais</div>
                    <div className="text-right w-24">Ações</div>
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
                            <div key={breeder.id} className="p-4 grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center hover:bg-gray-50 transition-colors">
                                <div className="w-12 text-center text-gray-400 text-sm">{index + 1}</div>
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    {breeder.name}
                                </div>
                                <div className="flex items-center justify-center gap-1.5 w-32">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${(productCounts[breeder.name] || 0) > 0
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {(productCounts[breeder.name] || 0)} lotes
                                    </span>
                                </div>
                                <div className="text-right w-24 flex justify-end gap-1">
                                    <button
                                        onClick={() => handleEditInit(breeder)}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
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
