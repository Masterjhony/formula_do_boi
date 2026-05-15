export interface Account {
    id: string;
    name: string;
    type: string;
    current_balance: number;
    initial_balance: number;
}

export interface Category {
    id: string;
    name: string;
    type: string;
}

export interface Transaction {
    id: string;
    account_id: string;
    category_id?: string | null;
    type: string;
    amount: number;
    description: string;
    observacao?: string | null;
    transaction_date: string;
    status: string;
    account?: { id: string; name: string; type?: string } | null;
    category?: { id: string; name: string; type?: string } | null;
}

export interface BulaLeilao {
    id: string;
    nome: string;
    data: string | null;
    criador: string | null;
    status: string | null;
    comissao: string | null;
    comissao_receber: string | null;
    recebido: string | null;
    faturamento_realizado: number | null;
    venda_bula: number | null;
    realizado_bula: number | null;
}

export interface FechamentoLite {
    id: string;
    nome: string;
    data: string;
    vgv_total: number | null;
    faturamento_total_leilao?: number | null;
    comissao_assessoria: number | null;
    receita_bula: number | null;
    sobra_bruta: number | null;
    por_assessor: Array<{ nome?: string; empresa?: string; vgv?: number; transacoes?: number; animais?: number; pct_total?: number }> | null;
    lances: Array<{ lote?: string | number; fazenda?: string; comprador?: string; uf?: string; assessor?: string; empresa?: string; animais?: number; parcela?: number; vgv?: number }> | null;
}

// Item unificado exibido na lista de contas (veio do ERP ou virtual de leilão).
export type UnifiedItem = {
    key: string;
    sourceTag: string | null;
    source: 'erp' | 'leilao' | 'fechamento';
    txId: string | null;
    status: 'pending' | 'completed' | 'cancelled' | 'virtual';
    type: 'income' | 'expense';
    title: string;
    subtitle: string;
    party: string;           // cliente/fornecedor (origem/destino)
    dueDate: string;         // YYYY-MM-DD
    amount: number;
    paid: number;
    balance: number;
    accountId: string | null;
    accountName: string | null;
    categoryId: string | null;
    categoryName: string | null;
    observacao: string | null;
    refId: string | null;    // id de leilão/fechamento
};
