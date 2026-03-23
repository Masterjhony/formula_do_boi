import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sertanejo Terra Brava | Fórmula do Boi',
  description: 'O touro que está transformando o rebanho brasileiro. Sertanejo Terra Brava — Nelore PO, MGTe TOP 16%, iABCZ 11,37 (DECA 2).',
  openGraph: {
    title: 'Sertanejo Terra Brava | Fórmula do Boi',
    description: 'Conheça o Sertanejo, o touro que está transformando o rebanho brasileiro com genética Nelore PO comprovada.',
    images: [
      {
        url: 'https://res.cloudinary.com/dkh2nsugb/image/upload/v1774271580/sertanejo-04_a2avtq.jpg',
        width: 1200,
        height: 630,
        alt: 'Touro Sertanejo Terra Brava',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sertanejo Terra Brava | Fórmula do Boi',
    description: 'Conheça o Sertanejo, o touro que está transformando o rebanho brasileiro com genética Nelore PO comprovada.',
    images: ['https://res.cloudinary.com/dkh2nsugb/image/upload/v1774271580/sertanejo-04_a2avtq.jpg'],
  },
};

export default function SertanejoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
