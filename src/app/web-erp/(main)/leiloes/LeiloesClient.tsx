'use client';

import { useRouter } from 'next/navigation';
import { Gavel } from 'lucide-react';
import { LeiloesIntegracao } from '../financeiro/FinanceiroClient';
import type { Account, Category, Transaction, BulaLeilao, FechamentoLite } from '../financeiro/_lib/types';

export default function LeiloesClient({
    accounts, transactions, categories, leiloes, fechamentos,
}: {
    accounts: Account[];
    transactions: Transaction[];
    categories: Category[];
    leiloes: BulaLeilao[];
    fechamentos: FechamentoLite[];
}) {
    const router = useRouter();
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B8860B] to-[#9A7209] flex items-center justify-center shadow-lg">
                    <Gavel className="w-6 h-6 text-black" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Leilões</h1>
                    <p className="text-sm text-gray-500 dark:text-[#888] uppercase tracking-widest mt-1">
                        Receita, comissão e conciliação financeira
                    </p>
                </div>
            </div>

            <LeiloesIntegracao
                accounts={accounts}
                categories={categories}
                transactions={transactions}
                leiloes={leiloes}
                fechamentos={fechamentos}
                onDone={() => router.refresh()}
            />
        </div>
    );
}
