import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const WHATSAPP_SERVER_URL = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { nome, email, tel, perfil, animais, investimento, interesse, assessoria } = body;

        if (!nome || !email || !tel) {
            return NextResponse.json({ error: 'Campos obrigatórios: nome, email, tel' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        const { data: maxPosData } = await supabase
            .from('crm_leads')
            .select('position')
            .order('position', { ascending: false })
            .limit(1);

        const position = (maxPosData?.[0]?.position || 0) + 1000;

        const notes: string[] = [];
        if (perfil) notes.push(`Perfil: ${perfil === 'experienced' ? 'Criador experiente' : 'Iniciante'}`);
        if (animais) notes.push(`Animais: ${animais}`);
        if (investimento) notes.push(`Investimento: ${investimento}`);
        if (interesse) notes.push(`Interesse: ${interesse}`);
        if (assessoria) notes.push(`Assessoria: ${assessoria}`);

        const { data: lead, error } = await supabase
            .from('crm_leads')
            .insert({
                nome,
                email,
                telefone: tel,
                origem: 'landing-whatsapp',
                stage: 'novo',
                position,
                notes: notes.length > 0 ? notes.join('\n') : null,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao inserir lead:', error);
            return NextResponse.json({ error: 'Erro ao salvar lead' }, { status: 500 });
        }

        // Dispara WhatsApp welcome
        try {
            const phone = tel.replace(/\D/g, '');
            await fetch(`${WHATSAPP_SERVER_URL}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, name: nome }),
            });
        } catch (waErr) {
            console.warn('WhatsApp send falhou (não-crítico):', waErr);
        }

        return NextResponse.json({ success: true, id: lead.id });
    } catch (err) {
        console.error('Erro no endpoint /api/lp/lead:', err);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
