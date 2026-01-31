import { createClient as createServerClient } from '@/utils/supabase/server';
import { Product } from './products';

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
});

// For Server Components
export const getProductsServer = async () => {
    const supabase = await createServerClient();
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data.map(mapProduct);
};

export const getProductById = async (id: number) => {
    const supabase = await createServerClient();
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

    if (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }

    return mapProduct(data);
};
