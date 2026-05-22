'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Loader2, Save, Upload } from 'lucide-react';
import Link from 'next/link';

export default function NewAdPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);

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
        iabcz: '',
        iqg: '',
        top: '',
        status: 'Disponível',
        reproductive_status: '',
        breeder: '', // Will be auto-filled
        tipo: 'Touro',
        comentario: '',
        pdf: '',
        videoUrl: '',
        special_price: false,
    });

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setUserProfile(data);
                    setFormData(prev => ({
                        ...prev,
                        breeder: data.name || '',
                        location: data.city || '' // Assuming city logic exists, or just empty
                    }));
                }
            }
        };
        fetchUser();
    }, []);

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
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
                alert('Erro ao fazer upload. Verifique se o arquivo não é muito grande.');
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
                alert('Erro ao fazer upload do PDF.');
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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const productPayload = {
                owner_id: user.id, // Explicitly linking to user
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
                tag: formData.tag,
                iabcz: formData.iabcz,
                iqg: formData.iqg,
                mgte: formData.mgte,
                active: true, // Auto-activate or require admin approval? Assuming active for now.
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
                    breeder: formData.breeder, // Auto-filled from profile name
                    tipo: formData.reproductive_status,
                    comentario: formData.comentario,
                    pdf: formData.pdf,
                    special_price: (formData as any).special_price,
                }
            };

            const { error } = await supabase.from('products').insert(productPayload);

            if (error) throw error;

            router.push('/dashboard/ads');
            router.refresh();
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Erro ao criar anúncio. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/ads" className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Novo Anúncio</h1>
                    <p className="text-gray-400 text-sm">Preencha as informações do animal para anunciar.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#121212] rounded-xl shadow-sm border border-gray-100 dark:border-[#333] p-8 space-y-8 transition-colors duration-200">

                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-[#333] pb-2">Informações Básicas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Animal</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#2a2a2a] focus:ring-2 focus:ring-[#A0792E]/50 focus:border-[#A0792E] outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#2a2a2a] outline-none transition-colors"
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
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Registro (RGD)</label>
                            <input
                                name="registro"
                                value={formData.registro}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#2a2a2a] outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Localização</label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Ex: Uberaba - MG"
                                className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#2a2a2a] outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Genetics */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-[#333] pb-2">Genética</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Pai</label>
                            <input
                                name="pai"
                                value={formData.pai}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#2a2a2a] outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mãe</label>
                            <input
                                name="mae"
                                value={formData.mae}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#2a2a2a] outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nascimento</label>
                            <input
                                name="nascimento"
                                value={formData.nascimento}
                                onChange={handleChange}
                                placeholder="DD/MM/AAAA"
                                className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#2a2a2a] outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Raça</label>
                            <input
                                name="raca"
                                value={formData.raca}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#2a2a2a] outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Numbers */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-[#333] pb-2">Números e Valores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4 border-l-4 border-[#A0792E] pl-4 bg-[#A0792E]/5 p-4 rounded-r-lg dark:bg-[#A0792E]/10">
                            <h4 className="font-semibold text-[#A0792E]">Condições de Venda</h4>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preço Total / À Vista</label>
                                <input
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="27.000,00"
                                    className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#222] outline-none transition-colors focus:border-[#A0792E]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Valor da Parcela</label>
                                <input
                                    name="installments"
                                    value={formData.installments}
                                    onChange={handleChange}
                                    placeholder="1.125,00"
                                    className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#222] outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Condições</label>
                                <input
                                    name="forma_pagamento"
                                    value={formData.forma_pagamento}
                                    onChange={handleChange}
                                    list="payment_options"
                                    placeholder="Ex: 30x ou selecione..."
                                    className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#222] outline-none transition-colors"
                                />
                                <datalist id="payment_options">
                                    <option value="parcelado_24x">24x</option>
                                    <option value="parcelado_30x">30x</option>
                                    <option value="parcelado_36x">36x</option>
                                    <option value="a_vista">À Vista</option>
                                </datalist>
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">MGTe</label>
                                <input
                                    name="mgte"
                                    value={formData.mgte}
                                    onChange={handleChange}
                                    placeholder="Ex: 29.69"
                                    className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#2a2a2a] outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">iABCZ</label>
                                <input
                                    name="iabcz"
                                    value={formData.iabcz}
                                    onChange={handleChange}
                                    placeholder="Ex: 29.69"
                                    className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#2a2a2a] outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">IQG</label>
                                <input
                                    name="iqg"
                                    value={formData.iqg}
                                    onChange={handleChange}
                                    placeholder="Ex: 44.17"
                                    className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#2a2a2a] outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">TOP (%)</label>
                                <input
                                    name="top"
                                    value={formData.top}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#2a2a2a] outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Peso</label>
                                <input
                                    name="peso"
                                    value={formData.peso}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-gray-100 dark:bg-[#2a2a2a] outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Media */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-[#333] pb-2">Mídia e Arquivos</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vídeo / Imagem Principal</label>

                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        name="videoUrl"
                                        value={formData.videoUrl}
                                        onChange={handleChange}
                                        placeholder="https://... (ou faça upload abaixo)"
                                        className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white dark:bg-[#2a2a2a] outline-none bg-gray-50 transition-colors"
                                    />
                                    {formData.videoUrl && (
                                        <Link href={formData.videoUrl} target="_blank" className="p-2 text-blue-600 hover:text-blue-500 transition-colors">
                                            Ver
                                        </Link>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="cursor-pointer bg-[#A0792E]/10 hover:bg-[#A0792E]/20 text-[#A0792E] border border-[#A0792E]/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
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
                                    {formData.videoUrl && !uploadingVideo && <span className="text-xs text-green-600 font-medium dark:text-green-400">Mídia anexada!</span>}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Link da Ficha Técnica (PDF)</label>
                            <input
                                name="pdf"
                                value={formData.pdf}
                                onChange={handleChange}
                                placeholder="https://... ou /arquivo.pdf"
                                className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white dark:bg-[#2a2a2a] outline-none transition-colors"
                            />

                            <div className="flex items-center gap-2 mt-2">
                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-[#222] dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border dark:border-[#444]">
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
                                {formData.pdf && <span className="text-xs text-green-600 font-medium dark:text-green-400">Arquivo selecionado!</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-[#333] pb-2">Detalhes Finais</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição Detalhada</label>
                            <textarea
                                name="comentario"
                                value={formData.comentario}
                                onChange={handleChange}
                                rows={6}
                                className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white dark:bg-[#2a2a2a] outline-none transition-colors"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Disponibilidade</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white dark:bg-[#2a2a2a] outline-none transition-colors"
                                >
                                    <option value="Disponível">Disponível</option>
                                    <option value="Vendido">Vendido</option>
                                    <option value="Reservado">Reservado</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Reprodutivo</label>
                                <select
                                    name="reproductive_status"
                                    value={formData.reproductive_status}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 dark:border-[#444] rounded-lg text-gray-900 dark:text-white dark:bg-[#2a2a2a] outline-none transition-colors"
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
                    <Link href="/dashboard/ads" className="px-6 py-2.5 border border-gray-300 dark:border-[#333] text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-[#A0792E] hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                        Publicar Anúncio
                    </button>
                </div>

            </form>
        </div>
    );
}
