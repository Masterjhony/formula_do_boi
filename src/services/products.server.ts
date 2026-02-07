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
    iabcz: data.iabcz || data.details?.iabcz || '',
    mgte: data.mgte || data.details?.mgte || '',
    iqg: data.iqg || data.details?.iqg || '',
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

export const getNavigationData = async (currentId: number) => {
    // 1. Get all products (static + DB)
    const supabase = await createServerClient();
    const { data: dbProducts, error } = await supabase.from('products').select('*').order('id', { ascending: true });

    if (error) {
        console.error('Error fetching navigation data:', error);
        return { nextProduct: null, relatedProducts: [] };
    }

    // Import EMBRYOS dynamically to avoid circular deps if any (though here it's fine)
    const { EMBRYOS } = await import('@/data/embryos');

    const mappedDbProducts = dbProducts.map(mapProduct);
    const mappedEmbryos = EMBRYOS.map((e: any) => ({
        ...e,
        // Ensure consistent shape match with Product interface if needed
        image: e.image,
        gallery: e.gallery || [],
        price: e.price,
        // Add other fields if missing in static data but required
    }));

    // Combine and deduplicate by ID
    const allProducts = [...mappedEmbryos, ...mappedDbProducts].reduce((acc: Product[], current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []).sort((a, b) => a.id - b.id);

    // 2. Find current product to know its category
    const currentProduct = allProducts.find(p => p.id === currentId);

    if (!currentProduct) {
        return { nextProduct: null, relatedProducts: [] };
    }

    // 3. Filter by Category
    // Logic: If Matriz -> Matrizes, Touro -> Touros, Embrião -> Embriões, Sêmen -> Sêmen
    // The category field usually contains these strings.
    const category = currentProduct.category || '';
    let categoryFilter = '';

    if (category.includes('Matriz') || currentProduct.classificacao === 'matriz') categoryFilter = 'Matriz';
    else if (category.includes('Touro') || category.includes('Sêmen')) categoryFilter = category.includes('Sêmen') ? 'Sêmen' : 'Touro';
    else if (category.includes('Embrião') || category === 'DOADORA') categoryFilter = 'Embrião'; // DOADORA in embryos.ts

    // Refine filter logic based on observing data
    const sameCategoryProducts = allProducts.filter(p => {
        if (categoryFilter === 'Matriz') return p.category?.includes('Matriz') || p.classificacao === 'matriz';
        if (categoryFilter === 'Touro') return p.category?.includes('Touro') && !p.category?.includes('Sêmen');
        if (categoryFilter === 'Sêmen') return p.category?.includes('Sêmen');
        if (categoryFilter === 'Embrião') return p.category?.includes('Embrião') || p.category === 'DOADORA';
        return false;
    });

    // 4. Find Next Product
    const currentIndex = sameCategoryProducts.findIndex(p => p.id === currentId);
    const nextProduct = currentIndex >= 0 && currentIndex < sameCategoryProducts.length - 1
        ? sameCategoryProducts[currentIndex + 1]
        : null;

    // 5. Get Related Products (4 items, excluding current)
    // Simple strategy: take next 4, or random 4
    const otherProducts = sameCategoryProducts.filter(p => p.id !== currentId);
    // Get 12 related products (excluding current)
    const relatedProducts = otherProducts.slice(0, 12);

    return { nextProduct, relatedProducts };
};
