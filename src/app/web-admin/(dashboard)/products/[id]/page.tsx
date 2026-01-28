import { createClient } from '@/utils/supabase/server';
import EditProductForm from './EditProductForm';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { id } = await params; // Next.js 15+ params are async

    const { data: product, error } = await (await supabase)
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !product) {
        notFound();
    }

    return <EditProductForm product={product} />;
}
