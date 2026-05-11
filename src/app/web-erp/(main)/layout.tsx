import { ReactNode } from 'react'
import ERPNavbarLayout from '@/components/erp/ERPNavbarLayout'

export const dynamic = 'force-dynamic';

interface ERpLayoutProps {
    children: ReactNode
}

export default function ERPMainLayout({ children }: ERpLayoutProps) {
    return (
        <ERPNavbarLayout>
            {children}
        </ERPNavbarLayout>
    )
}
