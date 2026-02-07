'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Loader2, Save, Trash2, Upload, Plus } from 'lucide-react';
import Link from 'next/link';

export default function EditProductForm({ product }: { product: any }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [breeders, setBreeders] = useState<any[]>([]);

    useEffect(() => {
        const fetchBreeders = async () => {
            const { data } = await supabase
                .from('breeders')
                .select('*')
                .order('name', { ascending: true });
            if (data) setBreeders(data);
        };
        fetchBreeders();
    }, []);

    const [formData, setFormData] = useState({
        name: product.name,
        category: product.category,
        classificacao: product.classificacao,
        modalidade: product.modalidade,
        logistica: product.logistica,
        forma_pagamento: product.forma_pagamento || 'parcelado_24x',
        location: product.location,
        price: product.price,
        installments: product.installments,
        tag: product.tag,
        featured: product.tag === 'DESTAQUE',
        // Details
        registro: product.details?.registro || '',
        raca: product.details?.raca || '',
        nascimento: product.details?.nascimento || '',
        pai: product.details?.pai || '',
        mae: product.details?.mae || '',
        peso: product.details?.peso || '',
        mgte: product.mgte || product.details?.mgte || '',
        iabcz: product.iabcz || product.details?.iabcz || '',
        iqg: product.iqg || product.details?.iqg || '',
        top: product.details?.top || '',
        status: product.details?.status || 'Disponível',
        reproductive_status: product.details?.reproductive_status || '',
        breeder: product.details?.breeder || '',
        tipo: product.details?.tipo || '',
        comentario: product.details?.comentario || '',
        pdf: product.details?.pdf || '',
        videoUrl: product.image,
    });


    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        // Basic check
        if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
            alert('Por favor, selecione um arquivo de vídeo ou imagem.');
            return;
        }

        setUploadingVideo(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('videos')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Upload Error:', uploadError);
                if (uploadError.message.includes('Bucket not found')) {
                    alert('Erro: Bucket "videos" não encontrado. Crie o bucket "videos" no Supabase e torne-o público.');
                } else {
                    alert('Erro ao fazer upload do arquivo.');
                }
                return;
            }

            const { data } = supabase.storage.from('videos').getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, videoUrl: data.publicUrl }));
        } catch (error) {
            console.error('Error uploading video:', error);
            alert('Erro inesperado ao fazer upload.');
        } finally {
            setUploadingVideo(false);
        }
    };


    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (file.type !== 'application/pdf') {
            alert('Por favor, selecione um arquivo PDF.');
            return;
        }

        setUploadingPdf(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('pdfs')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Upload Error:', uploadError);
                if (uploadError.message.includes('Bucket not found')) {
                    alert('Erro: Bucket "pdfs" não encontrado no Supabase. Crie-o ou contate o administrador.');
                } else {
                    alert('Erro ao fazer upload do arquivo.');
                }
                return;
            }

            const { data } = supabase.storage.from('pdfs').getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, pdf: data.publicUrl }));
        } catch (error) {
            console.error('Error uploading pdf:', error);
            alert('Erro inesperado ao fazer upload.');
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const productPayload = {
                name: formData.name,
                category: formData.category,
                classificacao: formData.classificacao,
                modalidade: formData.modalidade,
                logistica: formData.logistica,
                forma_pagamento: formData.forma_pagamento,
                location: formData.location,
                image: formData.videoUrl,
                gallery: [formData.videoUrl],
                price: formData.price,
                installments: formData.installments,
                tag: formData.featured ? 'DESTAQUE' : (formData.tag === 'DESTAQUE' ? 'NOVO' : formData.tag),
                iabcz: formData.iabcz,
                mgte: formData.mgte,
                iqg: formData.iqg,
                details: {
                    registro: formData.registro,
                    raca: formData.raca,
                    nascimento: formData.nascimento,
                    pai: formData.pai,
                    mae: formData.mae,
                    peso: formData.peso,
                    mgte: formData.mgte,
                    iabcz: formData.iabcz,
                    iqg: formData.iqg,
                    top: formData.top,
                    status: formData.status,
                    reproductive_status: formData.reproductive_status,
                    breeder: formData.breeder,
                    tipo: formData.reproductive_status, // Sync type with reproductive status
                    comentario: formData.comentario,
                    pdf: formData.pdf,
                }
            };

            const { error } = await supabase.from('products').update(productPayload).eq('id', product.id);

            if (error) throw error;

            router.push('/products');
            router.refresh();
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Erro ao atualizar produto.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) return;

        setDeleteLoading(true);
        try {
            const { error } = await supabase.from('products').delete().eq('id', product.id);
            if (error) throw error;
            router.push('/products');
            router.refresh();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Erro ao excluir produto.');
        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Editar Card</h1>
                        <p className="text-gray-400 text-sm">Atualize as informações do animal.</p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                    {deleteLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Trash2 size={20} />}
                    Excluir
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
                {/* Same form fields as NewProductPage - we could abstract this but for now copy-paste is safer for quick delivery */}

                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informações Básicas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nome do Animal</label>
                            <input name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Categoria</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none">
                                <option value="Touro PO">Touro PO</option>
                                <option value="Touro">Touro</option>
                                <option value="Matriz PO">Matriz PO</option>
                                <option value="Matriz">Matriz</option>
                                <option value="Novilha PO">Novilha PO</option>
                                <option value="Novilha">Novilha</option>
                                <option value="Doadora">Doadora</option>
                                <option value="Sêmen">Sêmen</option>
                                <option value="Embrião">Embrião</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Classificação (Sistema)</label>
                            <select name="classificacao" value={formData.classificacao} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none bg-yellow-50">
                                <option value="touro">Touro</option>
                                <option value="matriz">Matriz</option>
                                <option value="semen">Sêmen</option>
                                <option value="embriao">Embrião</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Registro (RGD)</label>
                            <input name="registro" value={formData.registro} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Localização</label>
                            <input name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Criador / Proprietário</label>
                            <div className="flex gap-2">
                                <select
                                    name="breeder"
                                    value={formData.breeder}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                                >
                                    <option value="">Selecione um criador...</option>
                                    {breeders.map((b) => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                    ))}
                                </select>
                                <Link
                                    href="/breeders"
                                    target="_blank"
                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                                    title="Gerenciar Criadores"
                                >
                                    <Plus className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                id="featured"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleChange}
                                className="w-5 h-5 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
                            />
                            <label htmlFor="featured" className="text-sm font-medium text-gray-900 cursor-pointer select-none">
                                Marcar como DESTAQUE
                            </label>
                        </div>
                    </div>
                </div>

                {/* Genetics */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Genética</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Pai</label>
                            <input name="pai" value={formData.pai} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Mãe</label>
                            <input name="mae" value={formData.mae} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nascimento</label>
                            <input name="nascimento" value={formData.nascimento} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none" placeholder="DD/MM/AAAA" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Raça</label>
                            <input name="raca" value={formData.raca} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none" />
                        </div>
                    </div>
                </div>

                {/* Numbers */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Números e Valores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Preço Total</label>
                            <input name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Parcelas (Valor)</label>
                            <input name="installments" value={formData.installments} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Condições de Pagamento</label>
                            <select
                                name="forma_pagamento"
                                value={formData.forma_pagamento}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            >
                                <option value="parcelado_24x">24x</option>
                                <option value="parcelado_30x">30x</option>
                                <option value="parcelado_36x">36x</option>
                                <option value="parcelado_15x">15x</option>
                                <option value="parcelado_12x">12x</option>
                                <option value="parcelado_10x">10x</option>
                                <option value="a_vista">À Vista</option>
                                <option value="consultar">Consultar</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">MGTe</label>
                            <input name="mgte" value={formData.mgte} onChange={handleChange} placeholder="Ex: 29.69" className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">iABCZ</label>
                            <input name="iabcz" value={formData.iabcz} onChange={handleChange} placeholder="Ex: 15.54" className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">IQG</label>
                            <input name="iqg" value={formData.iqg} onChange={handleChange} placeholder="Ex: 10.5" className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">TOP (%)</label>
                            <input name="top" value={formData.top} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Peso</label>
                            <input name="peso" value={formData.peso} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none" />
                        </div>
                    </div>
                </div>

                {/* Media */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Mídia e Arquivos</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Vídeo / Imagem Principal</label>

                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        name="videoUrl"
                                        value={formData.videoUrl}
                                        onChange={handleChange}
                                        placeholder="https://... (ou faça upload abaixo)"
                                        className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none bg-gray-50"
                                        readOnly
                                    />
                                    {formData.videoUrl && (
                                        <Link href={formData.videoUrl} target="_blank" className="p-2 text-blue-600 hover:text-blue-800">
                                            Ver
                                        </Link>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="cursor-pointer bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold border border-brand-gold/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                        {uploadingVideo ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                        {uploadingVideo ? 'Enviando Mídia...' : 'Fazer Upload de Vídeo/Imagem'}
                                        <input
                                            type="file"
                                            accept="video/*,image/*"
                                            className="hidden"
                                            onChange={handleVideoUpload}
                                            disabled={uploadingVideo}
                                        />
                                    </label>
                                    {formData.videoUrl && !uploadingVideo && <span className="text-xs text-green-600 font-medium">Mídia anexada!</span>}
                                </div>
                                <p className="text-xs text-gray-500">Faça upload do vídeo/imagem ou cole o link direto.</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Link da Ficha Técnica (PDF)</label>
                            <input name="pdf" value={formData.pdf} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none" placeholder="https://... ou /arquivo.pdf" />
                            <p className="text-xs text-gray-500">Cole aqui o link do PDF ou o caminho relativo.</p>

                            <div className="flex items-center gap-2 mt-2">
                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                    {uploadingPdf ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                    {uploadingPdf ? 'Enviando...' : 'Fazer Upload de PDF'}
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        onChange={handlePdfUpload}
                                        disabled={uploadingPdf}
                                    />
                                </label>
                                {formData.pdf && <span className="text-xs text-green-600 font-medium">Arquivo selecionado!</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Detalhes Finais</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Descrição Detalhada</label>
                            <textarea name="comentario" value={formData.comentario} onChange={handleChange} rows={6} className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Disponibilidade</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none">
                                    <option value="Disponível">Disponível</option>
                                    <option value="Vendido">Vendido</option>
                                    <option value="Reservado">Reservado</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Status Reprodutivo / Tipo</label>
                                <select
                                    name="reproductive_status"
                                    value={formData.reproductive_status}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Touro">Touro</option>
                                    <option value="Matriz">Matriz</option>
                                    <option value="Matriz Parida">Matriz Parida</option>
                                    <option value="Matriz Prenha">Matriz Prenha</option>
                                    <option value="Doadora">Doadora</option>
                                    <option value="Sêmen">Sêmen</option>
                                    <option value="Embrião">Embrião</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                    <Link href="/products" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-brand-gold hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                        Salvar Alterações
                    </button>
                </div>

            </form>
        </div>
    );
}
