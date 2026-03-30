import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
        return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 })
    }

    if (password.length < 6) {
        return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
    }

    const supabase = await createClient()
    const origin = request.headers.get('origin') ?? 'https://adminbula.formuladoboi.com'
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: name },
            emailRedirectTo: `${origin}/sistema`,
        },
    })

    if (error) {
        if (error.message.includes('already registered')) {
            return NextResponse.json({ error: 'Este email já está cadastrado.' }, { status: 409 })
        }
        return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 400 })
    }

    // If user already exists, Supabase returns success but with identities = []
    if (data.user && data.user.identities?.length === 0) {
        return NextResponse.json({ error: 'Este email já está cadastrado.' }, { status: 409 })
    }

    return NextResponse.json({ ok: true })
}
