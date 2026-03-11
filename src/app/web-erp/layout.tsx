import { ReactNode } from 'react'

export const metadata = {
    title: 'ERP | Fórmula do Boi',
    description: 'Sistema ERP Integrado Fórmula do Boi',
}

interface ERpLayoutProps {
    children: ReactNode
}

export default function ERPRootLayout({ children }: ERpLayoutProps) {
    return (
        <>
            {children}
        </>
    )
}
