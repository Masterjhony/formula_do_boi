'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Shield, User, Search } from 'lucide-react';

interface Profile {
    id: string;
    email: string;
    role: 'admin' | 'user';
    created_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const supabase = createClient();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setUsers(data as Profile[]);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Erro ao carregar usuários.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'user') => {
        if (!confirm(`Tem certeza que deseja alterar o nível deste usuário para ${newRole.toUpperCase()}?`)) return;

        setUpdating(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Erro ao atualizar permissão do usuário.');
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Usuários do Sistema</h1>
                    <p className="text-gray-400">Gerencie os usuários e suas permissões de acesso.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-[#1A1A1A] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold w-full md:w-64"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium text-gray-500 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
                    <div>Email / ID</div>
                    <div className="text-center w-32">Data Cadastro</div>
                    <div className="text-center w-24">Função</div>
                    <div className="text-right w-32">Ações</div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        Carregando usuários...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        Nenhum usuário encontrado.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => (
                            <div key={user.id} className="p-4 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center hover:bg-gray-50 transition-colors">
                                <div className="space-y-1 overflow-hidden">
                                    <div className="font-medium text-gray-900 flex items-center gap-2 truncate" title={user.email}>
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500">
                                            <User className="w-4 h-4" />
                                        </div>
                                        {user.email || 'Sem email'}
                                    </div>
                                    <div className="text-xs text-gray-400 pl-10 truncate font-mono">ID: {user.id}</div>
                                </div>

                                <div className="text-center text-sm text-gray-600 w-32">
                                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                </div>

                                <div className="flex justify-center w-24">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1
                                        ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                                        }`}>
                                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                        {user.role === 'admin' ? 'ADMIN' : 'USER'}
                                    </span>
                                </div>

                                <div className="text-right w-32 flex justify-end gap-2">
                                    {updating === user.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                    ) : (
                                        user.role === 'user' ? (
                                            <button
                                                onClick={() => handleRoleUpdate(user.id, 'admin')}
                                                className="text-xs font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
                                            >
                                                Tornar Admin
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRoleUpdate(user.id, 'user')}
                                                className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                                            >
                                                Remover Admin
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
