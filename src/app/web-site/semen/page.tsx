import { Metadata } from 'next';
import { getProductsServer } from '@/services/products.server';
import SemenClient from './SemenClient';

export const metadata: Metadata = {
    title: 'Catálogo de Sêmen | Fórmula do Boi',
    description: 'O absoluto ápice da genética provada nacional. Aceleradora de Touros Fórmula do Boi.',
    openGraph: {
        title: 'Catálogo de Sêmen | Fórmula do Boi',
        description: 'O absoluto ápice da genética provada nacional. Aceleradora de Touros Fórmula do Boi.',
    },
};

export default async function SemenPage() {
    const products = await getProductsServer(true);
    
    // Filter products for only "Sêmen" category. Sertanejo Terra Brava está desativado.
    const semenProducts = products.filter(
        p => p.category === 'Sêmen' && !p.name?.toUpperCase().includes('SERTANEJO')
    );
    
    return <SemenClient products={semenProducts} />;
}
