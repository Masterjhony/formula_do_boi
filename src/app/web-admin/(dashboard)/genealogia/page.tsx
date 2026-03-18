'use client';

import { useState } from 'react';
import { Loader2, RefreshCw, Search, CheckCircle, XCircle, AlertCircle, Dna } from 'lucide-react';

interface ProductStatus {
    id: number;
    name: string;
    pdfUrl: string;
    hasGenealogia: boolean;
    ancestralCount: number;
}

interface AvaliacaoStatus {
    id: number;
    name: string;
    pdfUrl: string;
    hasAvaliacao: boolean;
    hasIabcz: boolean;
}

interface BatchResult {
    id: number;
    name: string;
    status: 'ok' | 'error';
    ancestralCount?: number;
    hasIabcz?: boolean;
    error?: string;
}

export default function GenealogiaBatchPage() {
    // ── Genealogia state ──
    const [products, setProducts] = useState<ProductStatus[]>([]);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [processingGen, setProcessingGen] = useState(false);
    const [resultsGen, setResultsGen] = useState<BatchResult[]>([]);
    const [summaryGen, setSummaryGen] = useState<{ processed: number; ok: number; errors: number } | null>(null);

    // ── Avaliação Genética state ──
    const [avaliacaoProducts, setAvaliacaoProducts] = useState<AvaliacaoStatus[]>([]);
    const [loadingAvalStatus, setLoadingAvalStatus] = useState(false);
    const [processingAval, setProcessingAval] = useState(false);
    const [resultsAval, setResultsAval] = useState<BatchResult[]>([]);
    const [summaryAval, setSummaryAval] = useState<{ processed: number; ok: number; errors: number } | null>(null);

    // ── Debug state ──
    const [debugId, setDebugId] = useState('');
    const [debugLoading, setDebugLoading] = useState(false);
    const [debugText, setDebugText] = useState('');
    const [debugSection, setDebugSection] = useState('');
    const [debugGenealogia, setDebugGenealogia] = useState<any>(null);
    const [debugAvalSection, setDebugAvalSection] = useState('');
    const [debugAvaliacao, setDebugAvaliacao] = useState<any>(null);

    // ── Genealogia functions ──
    async function loadGenStatus() {
        setLoadingStatus(true);
        try {
            const res = await fetch('/api/parse-genealogy/batch');
            const data = await res.json();
            if (data.error) { alert(data.error); return; }
            setProducts(data.products ?? []);
        } finally {
            setLoadingStatus(false);
        }
    }

    async function runGenBatch(onlyMissing: boolean) {
        setProcessingGen(true);
        setResultsGen([]);
        setSummaryGen(null);
        try {
            const res = await fetch('/api/parse-genealogy/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ onlyMissing }),
            });
            const data = await res.json();
            if (data.error) { alert(data.error); return; }
            setResultsGen(data.results ?? []);
            setSummaryGen({ processed: data.processed, ok: data.ok, errors: data.errors });
            await loadGenStatus();
        } finally {
            setProcessingGen(false);
        }
    }

    // ── Avaliação Genética functions ──
    async function loadAvalStatus() {
        setLoadingAvalStatus(true);
        try {
            const res = await fetch('/api/parse-avaliacao-genetica/batch');
            const data = await res.json();
            if (data.error) { alert(data.error); return; }
            setAvaliacaoProducts(data.products ?? []);
        } finally {
            setLoadingAvalStatus(false);
        }
    }

    async function runAvalBatch(onlyMissing: boolean) {
        setProcessingAval(true);
        setResultsAval([]);
        setSummaryAval(null);
        try {
            const res = await fetch('/api/parse-avaliacao-genetica/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ onlyMissing }),
            });
            const data = await res.json();
            if (data.error) { alert(data.error); return; }
            setResultsAval(data.results ?? []);
            setSummaryAval({ processed: data.processed, ok: data.ok, errors: data.errors });
            await loadAvalStatus();
        } finally {
            setProcessingAval(false);
        }
    }

    // ── Debug ──
    async function debugProduct() {
        const id = parseInt(debugId);
        if (!id) { alert('Informe um ID válido.'); return; }
        setDebugLoading(true);
        setDebugText('');
        setDebugSection('');
        setDebugGenealogia(null);
        setDebugAvalSection('');
        setDebugAvaliacao(null);
        try {
            // Genealogia
            const resGen = await fetch('/api/parse-genealogy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: id, debug: true }),
            });
            const dataGen = await resGen.json();
            if (!dataGen.error) {
                setDebugText(dataGen.rawText ?? '');
                setDebugSection(dataGen.section ?? '');
                setDebugGenealogia(dataGen.genealogia ?? null);
            }

            // Avaliação Genética
            const resAval = await fetch('/api/parse-avaliacao-genetica', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: id, debug: true }),
            });
            const dataAval = await resAval.json();
            if (!dataAval.error) {
                setDebugAvalSection(dataAval.section ?? '');
                setDebugAvaliacao(dataAval.avaliacao ?? null);
                if (!dataGen.rawText && dataAval.rawText) setDebugText(dataAval.rawText);
            }

            if (dataGen.error && dataAval.error) {
                alert(dataGen.error || dataAval.error);
            }
        } finally {
            setDebugLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Extração de Dados do PDF</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Processa os PDFs das fichas técnicas e salva genealogia e avaliação genética no banco de dados.
                </p>
            </div>

            {/* ── GENEALOGIA ── */}
            <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-100 dark:border-[#222222] shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
                            <path d="M12 7v4M8.5 17.5l3.5-6.5M15.5 17.5L12 11" />
                        </svg>
                        Genealogia (Árvore Genealógica)
                    </h2>
                    <button
                        onClick={loadGenStatus}
                        disabled={loadingStatus}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {loadingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Carregar Status
                    </button>
                </div>

                {products.length > 0 && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-4 text-center mb-4">
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-3">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
                                <p className="text-xs text-gray-500">Total com PDF</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{products.filter(p => p.hasGenealogia).length}</p>
                                <p className="text-xs text-green-600 dark:text-green-500">Com genealogia</p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{products.filter(p => !p.hasGenealogia).length}</p>
                                <p className="text-xs text-amber-600 dark:text-amber-500">Sem genealogia</p>
                            </div>
                        </div>

                        <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 text-sm border border-gray-100 dark:border-[#222222] rounded-lg">
                            {products.map(p => (
                                <div key={p.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]">
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">#{p.id} {p.name}</span>
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

                <div className="flex flex-wrap gap-3 pt-2">
                    <button onClick={() => runGenBatch(true)} disabled={processingGen}
                        className="flex items-center gap-2 bg-brand-gold hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                        {processingGen ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Extrair apenas os pendentes
                    </button>
                    <button onClick={() => runGenBatch(false)} disabled={processingGen}
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm">
                        {processingGen ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Re-extrair todos
                    </button>
                </div>

                {summaryGen && (
                    <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-3">
                                <p className="text-xl font-bold">{summaryGen.processed}</p>
                                <p className="text-xs text-gray-500">Processados</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                <p className="text-xl font-bold text-green-700">{summaryGen.ok}</p>
                                <p className="text-xs text-green-600">Sucesso</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                                <p className="text-xl font-bold text-red-700">{summaryGen.errors}</p>
                                <p className="text-xs text-red-600">Erros</p>
                            </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto divide-y divide-gray-50 text-sm border border-gray-100 dark:border-[#222222] rounded-lg">
                            {resultsGen.map(r => (
                                <div key={r.id} className="flex items-start justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]">
                                    <div>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">#{r.id} {r.name}</span>
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
            </div>

            {/* ── AVALIAÇÃO GENÉTICA ── */}
            <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-100 dark:border-[#222222] shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Dna className="w-4 h-4 text-emerald-500" />
                        Avaliação Genética (DEPs)
                    </h2>
                    <button
                        onClick={loadAvalStatus}
                        disabled={loadingAvalStatus}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {loadingAvalStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Carregar Status
                    </button>
                </div>

                {avaliacaoProducts.length > 0 && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-4 text-center mb-4">
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-3">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{avaliacaoProducts.length}</p>
                                <p className="text-xs text-gray-500">Total com PDF</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{avaliacaoProducts.filter(p => p.hasAvaliacao).length}</p>
                                <p className="text-xs text-green-600 dark:text-green-500">Com avaliação</p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{avaliacaoProducts.filter(p => !p.hasAvaliacao).length}</p>
                                <p className="text-xs text-amber-600 dark:text-amber-500">Sem avaliação</p>
                            </div>
                        </div>

                        <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 text-sm border border-gray-100 dark:border-[#222222] rounded-lg">
                            {avaliacaoProducts.map(p => (
                                <div key={p.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]">
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">#{p.id} {p.name}</span>
                                    <span className={`flex items-center gap-1 text-xs font-medium ${p.hasAvaliacao ? 'text-green-600' : 'text-amber-600'}`}>
                                        {p.hasAvaliacao
                                            ? <><CheckCircle className="w-3.5 h-3.5" /> {p.hasIabcz ? 'com iABCZ' : 'extraído'}</>
                                            : <><AlertCircle className="w-3.5 h-3.5" /> pendente</>
                                        }
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                    <button onClick={() => runAvalBatch(true)} disabled={processingAval}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                        {processingAval ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Extrair apenas os pendentes
                    </button>
                    <button onClick={() => runAvalBatch(false)} disabled={processingAval}
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm">
                        {processingAval ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Re-extrair todos
                    </button>
                </div>

                {summaryAval && (
                    <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-3">
                                <p className="text-xl font-bold">{summaryAval.processed}</p>
                                <p className="text-xs text-gray-500">Processados</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                <p className="text-xl font-bold text-green-700">{summaryAval.ok}</p>
                                <p className="text-xs text-green-600">Sucesso</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                                <p className="text-xl font-bold text-red-700">{summaryAval.errors}</p>
                                <p className="text-xs text-red-600">Erros</p>
                            </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto divide-y divide-gray-50 text-sm border border-gray-100 dark:border-[#222222] rounded-lg">
                            {resultsAval.map(r => (
                                <div key={r.id} className="flex items-start justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]">
                                    <div>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">#{r.id} {r.name}</span>
                                        {r.error && <p className="text-xs text-red-500 mt-0.5">{r.error}</p>}
                                    </div>
                                    <span className={`flex items-center gap-1 text-xs font-medium shrink-0 ml-4 ${r.status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                                        {r.status === 'ok'
                                            ? <><CheckCircle className="w-3.5 h-3.5" /> ok</>
                                            : <><XCircle className="w-3.5 h-3.5" /> erro</>
                                        }
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Debug: inspecionar texto do PDF ── */}
            <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-100 dark:border-[#222222] shadow-sm p-6 space-y-4">
                <h2 className="font-semibold text-gray-800 dark:text-gray-200">Diagnóstico por Lote</h2>
                <p className="text-sm text-gray-500">
                    Inspeciona o texto extraído do PDF e mostra o que cada parser identificou. Use para ajustar os parsers se necessário.
                </p>

                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="ID do lote"
                        value={debugId}
                        onChange={e => setDebugId(e.target.value)}
                        className="border border-gray-300 dark:border-[#333333] dark:bg-[#1A1A1A] dark:text-white rounded-lg px-3 py-2 text-sm w-36 outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
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

                {(debugGenealogia || debugAvaliacao) && (
                    <div className="space-y-3">
                        {debugGenealogia && (
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Genealogia extraída</p>
                                <pre className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800 overflow-x-auto whitespace-pre-wrap">
                                    {JSON.stringify(debugGenealogia, null, 2)}
                                </pre>
                            </div>
                        )}

                        {debugSection && (
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Seção GENEALOGIA detectada</p>
                                <pre className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 overflow-x-auto whitespace-pre-wrap max-h-48">
                                    {debugSection || '(seção não encontrada)'}
                                </pre>
                            </div>
                        )}

                        {debugAvaliacao && (
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Avaliação Genética extraída</p>
                                <pre className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 overflow-x-auto whitespace-pre-wrap">
                                    {JSON.stringify(debugAvaliacao, null, 2)}
                                </pre>
                            </div>
                        )}

                        {debugAvalSection && (
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Seção AVALIAÇÃO GENÉTICA detectada</p>
                                <pre className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 overflow-x-auto whitespace-pre-wrap max-h-48">
                                    {debugAvalSection || '(seção não encontrada)'}
                                </pre>
                            </div>
                        )}

                        {debugText && (
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Texto bruto completo do PDF</p>
                                <pre className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-lg p-3 text-xs text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-96">
                                    {debugText}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
