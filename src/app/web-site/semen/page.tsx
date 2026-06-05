import { Metadata } from 'next';
import { getProductsServer } from '@/services/products.server';
import SemenClient from './SemenClient';

// Preview social: retrato do reprodutor Atacante (Nelore PO), cabeça centralizada.
// Imagem já em 1200×630 e square-safe — nada é cortado nem no banner nem na
// miniatura quadrada do WhatsApp/Telegram.
const OG_IMAGE = '/cattle/semen-og-atacante.jpg';
const OG_ALT = 'Atacante — Reprodutor Nelore PO · Aceleradora de Touros Fórmula do Boi';
const OG_DESC = 'O absoluto ápice da genética provada nacional. Aceleradora de Touros Fórmula do Boi.';

export const metadata: Metadata = {
    title: 'Catálogo de Sêmen | Fórmula do Boi',
    description: OG_DESC,
    openGraph: {
        title: 'Catálogo de Sêmen | Fórmula do Boi',
        description: OG_DESC,
        type: 'website',
        locale: 'pt_BR',
        url: '/semen',
        siteName: 'Fórmula do Boi',
        images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT, type: 'image/jpeg' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Catálogo de Sêmen | Fórmula do Boi',
        description: OG_DESC,
        images: [OG_IMAGE],
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
