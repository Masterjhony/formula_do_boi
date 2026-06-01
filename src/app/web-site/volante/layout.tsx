import type { Metadata } from 'next'
import './volante.css'

const OG_IMAGE = '/volante/volante-corpo.jpg'

export const metadata: Metadata = {
  title: 'Volante MRA | Fórmula do Boi',
  description:
    'Volante MRA — MRA 10701. Touro Nelore PO superprecoce. MGTe 27,01 · TOP 6%. iABCZ 22,53 · IQG 25,18. Elite em Peso, ACAB e STAY. Pré-reserva de sêmen aberta — Aceleradora 2026.',
  openGraph: {
    type: 'website',
    url: 'https://formuladoboi.com/volante',
    siteName: 'Fórmula do Boi',
    title: 'Volante MRA | Fórmula do Boi',
    description:
      'Touro Nelore PO superprecoce. MGTe 27,01 · TOP 6%. Resultado direto no campo, na balança e no bolso. Doses a partir de R$ 23,50 — pré-reserva aberta.',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Volante MRA — MRA 10701 · Nelore PO',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volante MRA | Fórmula do Boi',
    description: 'Touro Nelore PO superprecoce · MGTe 27,01 · TOP 6%. Pré-reserva aberta.',
    images: [OG_IMAGE],
  },
}

export default function VolanteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
