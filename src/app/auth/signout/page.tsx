'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LogOut } from 'lucide-react'

export default function SignOutRoute() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const signOut = async () => {
            await supabase.auth.signOut()
            router.push('/login')
            router.refresh()
        }
        signOut()
    }, [router, supabase])

    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <p>Saindo...</p>
        </div>
    )
}
