import type { Metadata } from 'next';

const OG_IMAGE = '/assets/atacante/atacante_photo.jpg';

export const metadata: Metadata = {
  title: 'Atacante da Matinha | Fórmula do Boi',
  description: 'Atacante da Matinha — RDM B 3224 MAT. Touro Jovem Nelore PO. MGTe 42,38 · TOP 0,1%. Pré-reserva de sêmen aberta. Fórmula do Boi × Nelore Visual.',
  openGraph: {
    type: 'website',
    url: 'https://app.formuladoboi.com/atacante',
    siteName: 'Fórmula do Boi',
    title: 'Atacante da Matinha | Fórmula do Boi',
    description: 'Touro jovem Nelore PO. Resultado direto no campo, na balança e no bolso. Pacotes de sêmen exclusivos para o lançamento — pré-reserva aberta.',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Atacante da Matinha — RDM B 3224 MAT.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atacante da Matinha | Fórmula do Boi',
    description: 'Touro jovem Nelore PO · MGTe 42,38 · TOP 0,1%. Pré-reserva aberta.',
    images: [OG_IMAGE],
  },
};

export default function AtacanteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
