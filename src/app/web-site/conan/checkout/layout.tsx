import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pré-reserva · CONAN FIV TresMar — Fórmula do Boi',
  description:
    'Pré-reserva de sêmen do CONAN FIV TresMar · Aceleradora 2026. Sem custo — o curador retorna em até 24h com proposta técnica e cronograma para a sua estação reprodutiva.',
  robots: { index: false, follow: true },
}

export default function ConanCheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
