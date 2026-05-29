import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pré-reserva · Volante MRA — Fórmula do Boi',
  description:
    'Pré-reserva de sêmen do Volante MRA · Aceleradora 2026. Sem custo — o curador retorna em até 24h com proposta técnica e cronograma.',
  robots: { index: false, follow: true },
}

export default function VolanteCheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
