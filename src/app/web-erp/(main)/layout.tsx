import { ReactNode } from 'react'
import ERPSidebarLayout from '@/components/erp/ERPSidebarLayout'

interface ERpLayoutProps {
    children: ReactNode
}

export default function ERPMainLayout({ children }: ERpLayoutProps) {
    return (
        <ERPSidebarLayout>
            {children}
        </ERPSidebarLayout>
    )
}
