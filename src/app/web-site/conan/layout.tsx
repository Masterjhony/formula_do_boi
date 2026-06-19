import type { Metadata } from 'next'
import './conan.css'

// OG dedicada 1200×630 (~58 KB). A foto full-res conan-frontal.jpg tem
// 4680×3120 / 5,4 MB — acima do limite de preview do WhatsApp (o iOS, mais
// rígido, simplesmente não renderizava a miniatura). Imagem leve garante o
// preview em todos os clientes.
const OG_IMAGE = '/conan/assets/og-conan.jpg'

export const metadata: Metadata = {
  title: 'CONAN FIV TresMar | Fórmula do Boi',
  description:
    'CONAN FIV TresMar — RG LCF 1265. Touro Nelore PO superprecoce. MGTe 35,12 · TOP 0,1% ANCP. iABCZg 36,5 · DECA 1 PMGZ. IQGg 38,25 · TOP 0,5% GenePlus. Elite em Peso, AOL e Precocidade. Pré-reserva de sêmen aberta — Aceleradora 2026.',
  openGraph: {
    type: 'website',
    url: 'https://www.formuladoboi.com/conan',
    siteName: 'Fórmula do Boi',
    title: 'CONAN FIV TresMar | Fórmula do Boi',
    description:
      'Touro Nelore PO superprecoce. MGTe 35,12 · TOP 0,1% ANCP · DECA 1 PMGZ. Doses a partir de R$ 23,50 — pré-reserva aberta na Aceleradora 2026.',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'CONAN FIV TresMar — RG LCF 1265 · Nelore PO',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CONAN FIV TresMar | Fórmula do Boi',
    description: 'Touro Nelore PO superprecoce · MGTe 35,12 · TOP 0,1% ANCP. Pré-reserva aberta.',
    images: [OG_IMAGE],
  },
}

export default function ConanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
