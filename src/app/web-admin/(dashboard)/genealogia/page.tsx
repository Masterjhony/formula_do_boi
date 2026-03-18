'use client';

import { useState } from 'react';
import { Loader2, RefreshCw, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ProductStatus {
    id: number;
    name: string;
    pdfUrl: string;
    hasGenealogia: boolean;
    ancestralCount: number;
}

interface BatchResult {
    id: number;
    name: string;
    status: 'ok' | 'error';
    ancestralCount: number;
    error?: string;
    genealogia?: Record<string, any>;
}

export default function GenealogiaBatchPage() {
    const [products, setProducts] = useState<ProductStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState<BatchResult[]>([]);
    const [summary, setSummary] = useState<{ processed: number; ok: number; errors: number } | null>(null);

    // ── Debug: texto bruto de um PDF ──
    const [debugId, setDebugId] = useState('');
    const [debugLoading, setDebugLoading] = useState(false);
    const [debugText, setDebugText] = useState('');
    const [debugSection, setDebugSection] = useState('');
    const [debugGenealogia, setDebugGenealogia] = useState<any>(null);

    async function loadStatus() {
        setLoading(true);
        try {
            const res = await fetch('/api/parse-genealogy/batch');
            const data = await res.json();
            if (data.error) { alert(data.error); return; }
            setProducts(data.products ?? []);
        } finally {
            setLoading(false);
        }
    }

    async function runBatch(onlyMissing: boolean) {
        setProcessing(true);
        setResults([]);
        setSummary(null);
        try {
            const res = await fetch('/api/parse-genealogy/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ onlyMissing }),
            });
            const data = await res.json();
            if (data.error) { alert(data.error); return; }
            setResults(data.results ?? []);
            setSummary({ processed: data.processed, ok: data.ok, errors: data.errors });
            // Recarrega status
            await loadStatus();
        } finally {
            setProcessing(false);
        }
    }

    async function debugProduct() {
        const id = parseInt(debugId);
        if (!id) { alert('Informe um ID válido.'); return; }
        setDebugLoading(true);
        setDebugText('');
        setDebugSection('');
        setDebugGenealogia(null);
        try {
            const res = await fetch('/api/parse-genealogy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: id, debug: true }),
            });
            const data = await res.json();
            if (data.error) { alert(data.error); return; }
            setDebugText(data.rawText ?? '');
            setDebugSection(data.section ?? '');
            setDebugGenealogia(data.genealogia ?? null);
        } finally {
            setDebugLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Extração de Genealogia</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Processa os PDFs das fichas técnicas e salva a árvore genealógica no banco de dados.
                </p>
            </div>

            {/* ── Status dos produtos ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">Status dos Lotes</h2>
                    <button
                        onClick={loadStatus}
                        disabled={loading}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Carregar Status
                    </button>
                </div>

                {products.length > 0 && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-4 text-center mb-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                                <p className="text-xs text-gray-500">Total com PDF</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <p className="text-2xl font-bold text-green-700">{products.filter(p => p.hasGenealogia).length}</p>
                                <p className="text-xs text-green-600">Com genealogia</p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3">
                                <p className="text-2xl font-bold text-amber-700">{products.filter(p => !p.hasGenealogia).length}</p>
                                <p className="text-xs text-amber-600">Sem genealogia</p>
                            </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 text-sm border border-gray-100 rounded-lg">
                            {products.map(p => (
                                <div key={p.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                                    <span className="text-gray-800 font-medium">#{p.id} {p.name}</span>
                                    <span className={`flex items-center gap-1 text-xs font-medium ${p.hasGenealogia ? 'text-green-600' : 'text-amber-600'}`}>
                                        {p.hasGenealogia
                                            ? <><CheckCircle className="w-3.5 h-3.5" /> {p.ancestralCount} ancestrais</>
                                            : <><AlertCircle className="w-3.5 h-3.5" /> pendente</>
                                        }
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Botões de ação ── */}
                <div className="flex flex-wrap gap-3 pt-2">
                    <button
                        onClick={() => runBatch(true)}
                        disabled={processing}
                        className="flex items-center gap-2 bg-brand-gold hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Extrair apenas os pendentes
                    </button>
                    <button
                        onClick={() => runBatch(false)}
                        disabled={processing}
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                    >
                        {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Re-extrair todos
                    </button>
                </div>
            </div>

            {/* ── Resultados do batch ── */}
            {summary && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <h2 className="font-semibold text-gray-800">Resultado da Extração</h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-2xl font-bold">{summary.processed}</p>
                            <p className="text-xs text-gray-500">Processados</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-2xl font-bold text-green-700">{summary.ok}</p>
                            <p className="text-xs text-green-600">Sucesso</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3">
                            <p className="text-2xl font-bold text-red-700">{summary.errors}</p>
                            <p className="text-xs text-red-600">Erros</p>
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 text-sm border border-gray-100 rounded-lg">
                        {results.map(r => (
                            <div key={r.id} className="flex items-start justify-between px-3 py-2 hover:bg-gray-50">
                                <div>
                                    <span className="font-medium text-gray-800">#{r.id} {r.name}</span>
                                    {r.error && <p className="text-xs text-red-500 mt-0.5">{r.error}</p>}
                                </div>
                                <span className={`flex items-center gap-1 text-xs font-medium shrink-0 ml-4 ${r.status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                                    {r.status === 'ok'
                                        ? <><CheckCircle className="w-3.5 h-3.5" /> {r.ancestralCount} ancestrais</>
                                        : <><XCircle className="w-3.5 h-3.5" /> erro</>
                                    }
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Debug: inspecionar texto do PDF ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="font-semibold text-gray-800">Diagnóstico por Lote</h2>
                <p className="text-sm text-gray-500">
                    Use para inspecionar o texto bruto extraído do PDF e ver o que o parser identificou.
                    Se o parser estiver errando, o texto aqui é o que precisa ser ajustado.
                </p>

                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="ID do lote"
                        value={debugId}
                        onChange={e => setDebugId(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-36 outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                    />
                    <button
                        onClick={debugProduct}
                        disabled={debugLoading}
                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        {debugLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Inspecionar PDF
                    </button>
                </div>

                {debugGenealogia && (
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Genealogia extraída</p>
                            <pre className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(debugGenealogia, null, 2)}
                            </pre>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Seção GENEALOGIA detectada no PDF</p>
                            <pre className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 overflow-x-auto whitespace-pre-wrap max-h-64">
                                {debugSection || '(seção não encontrada — parser usou documento completo)'}
                            </pre>
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Texto bruto completo do PDF</p>
                            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap max-h-96">
                                {debugText}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
