import { Metadata } from 'next';
import { getProductsServer } from '@/services/products.server';
import { getIsAuthenticated } from '@/lib/auth-helpers';
import SemenClient from './SemenClient';

export const metadata: Metadata = {
    title: 'Catálogo de Sêmen | Fórmula do Boi',
    description: 'Touros testados e aprovados para produtividade, desempenho e confiabilidade genética.',
    openGraph: {
        title: 'Catálogo de Sêmen | Fórmula do Boi',
        description: 'Touros testados e aprovados para produtividade, desempenho e confiabilidade genética.',
    },
};

export default async function SemenPage() {
    const isAuthenticated = await getIsAuthenticated();
    const products = await getProductsServer(isAuthenticated);
    
    // Filter products for only "Sêmen" category
    const semenProducts = products.filter(p => p.category === 'Sêmen');
    
    return <SemenClient products={semenProducts} />;
}
