import type { Metadata } from 'next'
import './conan.css'

const OG_IMAGE = '/conan/assets/conan-frontal.jpg'

export const metadata: Metadata = {
  title: 'CONAN FIV TresMar | Fórmula do Boi',
  description:
    'CONAN FIV TresMar — RG LCF 1265. Touro Nelore PO superprecoce. MGTe 35,12 · TOP 0,1% ANCP. iABCZg 36,5 · DECA 1 PMGZ. IQGg 38,25 · TOP 0,5% GenePlus. Elite em Peso, AOL e Precocidade. Pré-reserva de sêmen aberta — Aceleradora 2026.',
  openGraph: {
    type: 'website',
    url: 'https://formuladoboi.com/conan',
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
