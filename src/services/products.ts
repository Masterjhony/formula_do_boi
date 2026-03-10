

import { createClient } from '@/utils/supabase/client';

export interface Product {
    id: number;
    name: string;
    category: string;
    classificacao: string;
    modalidade: string;
    logistica: string;
    forma_pagamento: string;
    location: string;
    image: string;
    gallery: string[];
    price: string;
    installments: string;
    tag: string;
    details: any;
    video_object_position?: string;
    old_id?: number;
    // New fields
    registro?: string;
    raca?: string;
    nascimento?: string;
    pai?: string;
    mae?: string;
    peso?: string;
    top?: string;
    status?: string;
    breeder?: string;
    proprietario?: string;
    pdf?: string;
    comissao?: string;
    iabcz?: string;
    mgte?: string;
    iqg?: string;
    special_price?: boolean;
    display_order?: number;
    active?: boolean;
}

// Helper to format currency
const formatPrice = (price: number | string) => {
    if (!price) return 'Sob Consulta';
    if (typeof price === 'string') return price;
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

// Data mapper
const mapProduct = (data: any): Product => ({
    ...data,
    image: data.image_url || data.image || '', // Fallback to image if image_url missing
    price: formatPrice(data.price),
    gallery: data.gallery || [],
    // Map new columns, falling back to details if needed (for safety during migration)
    registro: data.registro || data.details?.registro || '',
    raca: data.raca || data.details?.raca || '',
    nascimento: data.nascimento || data.details?.nascimento || '',
    pai: data.pai || data.details?.pai || '',
    mae: data.mae || data.details?.mae || '',
    peso: data.peso || data.details?.peso || '',
    top: data.top || data.details?.top || '',
    status: data.status || data.details?.status || '',
    breeder: data.breeder || data.details?.breeder || '',
    proprietario: data.proprietario || data.details?.proprietario || '',
    pdf: data.pdf || data.details?.pdf || '',
    comissao: data.comissao || data.details?.comissao || '',
    iabcz: data.iabcz || data.details?.iabcz || '',
    mgte: data.mgte || data.details?.mgte || '',
    iqg: data.iqg || data.details?.iqg || '',
    special_price: data.details?.special_price || false,
    display_order: data.display_order || 0,
    video_object_position: data.details?.video_object_position || '',
    active: data.active ?? true,
});

// For Client Components
export const getProductsClient = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from('products').select('*').eq('active', true).order('id', { ascending: true });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data.map(mapProduct);
};

// Admin functions
export const deleteProduct = async (id: number) => {
    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    return { error };
};
