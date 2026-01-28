'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Loader2, Save, Upload } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function NewProductPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category: 'Touro PO',
        classificacao: 'touro',
        modalidade: 'venda_direta',
        logistica: 'retira_fazenda',
        forma_pagamento: 'parcelado_24x',
        location: '',
        price: '',
        installments: '',
        tag: 'NOVO',
        // Details fields
        registro: '',
        raca: 'Nelore',
        nascimento: '',
        pai: '',
        mae: '',
        peso: '',
        mgte: '',
        top: '',
        status: 'Disponível',
        tipo: 'Touro',
        comentario: '',
        pdf: '',
        videoUrl: '', // For now just a URL input, later file upload
    });

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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                image: formData.videoUrl, // Using video URL as 'image' for now as per current structure
                gallery: [formData.videoUrl],
                price: formData.price,
                installments: formData.installments,
                tag: formData.tag,
                details: {
                    registro: formData.registro,
                    raca: formData.raca,
                    nascimento: formData.nascimento,
                    pai: formData.pai,
                    mae: formData.mae,
                    peso: formData.peso,
                    mgte: formData.mgte,
                    top: formData.top,
                    status: formData.status,
                    tipo: formData.tipo,
                    comentario: formData.comentario,
                    pdf: formData.pdf,
                }
            };

            const { error } = await supabase.from('products').insert(productPayload);

            if (error) throw error;

            router.push('/products');
            router.refresh();
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Erro ao criar produto. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Novo Card</h1>
                    <p className="text-gray-500 text-sm">Preencha as informações do animal.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">

                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informações Básicas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nome do Animal</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Categoria</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            >
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
                            <label className="text-sm font-medium text-gray-700">Registro (RGD)</label>
                            <input
                                name="registro"
                                value={formData.registro}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Localização</label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Ex: Uberaba - MG"
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Genetics */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Genética</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Pai</label>
                            <input
                                name="pai"
                                value={formData.pai}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Mãe</label>
                            <input
                                name="mae"
                                value={formData.mae}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nascimento</label>
                            <input
                                name="nascimento"
                                value={formData.nascimento}
                                onChange={handleChange}
                                placeholder="DD/MM/AAAA"
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Raça</label>
                            <input
                                name="raca"
                                value={formData.raca}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Numbers */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Números e Valores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Preço Total</label>
                            <input
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="27.000,00"
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Parcelas</label>
                            <input
                                name="installments"
                                value={formData.installments}
                                onChange={handleChange}
                                placeholder="1.125,00"
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">MGTe / iABCZ</label>
                            <input
                                name="mgte"
                                value={formData.mgte}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">TOP (%)</label>
                            <input
                                name="top"
                                value={formData.top}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Peso</label>
                            <input
                                name="peso"
                                value={formData.peso}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Media (Simplified for now) */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Mídia e Arquivos</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Link do Vídeo/Imagem (Cloudinary/S3)</label>
                            <input
                                name="videoUrl"
                                value={formData.videoUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            />
                            <p className="text-xs text-gray-500">Cole aqui o link direto do arquivo de mídia.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Link da Ficha Técnica (PDF)</label>
                            <input
                                name="pdf"
                                value={formData.pdf}
                                onChange={handleChange}
                                placeholder="https://... ou /arquivo.pdf"
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            />
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
                            <label className="text-sm font-medium text-gray-700">Comentários</label>
                            <textarea
                                name="comentario"
                                value={formData.comentario}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg text-gray-900 outline-none"
                            >
                                <option value="Disponível">Disponível</option>
                                <option value="Vendido">Vendido</option>
                                <option value="Reservado">Reservado</option>
                                <option value="Matriz Parida e Prenha">Matriz Parida e Prenha</option>
                                <option value="Prenha">Prenha</option>
                            </select>
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
                        Salvar Card
                    </button>
                </div>

            </form>
        </div>
    );
}
