import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Fórmula do Boi',
        short_name: 'Fórmula do Boi',
        description: 'Comercialização de Nelore PO',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#F4B400',
        icons: [
            {
                src: '/logo_icon_brand.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    }
}
