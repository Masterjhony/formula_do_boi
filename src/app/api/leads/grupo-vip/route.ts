import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/leads/grupo-vip
 *
 * Recebe submissão do formulário de qualificação do Grupo VIP (/grupo-vip).
 * Insere o lead em crm_leads com origem='grupo-vip' e salva a qualificação
 * (etapa 2 do form) em extra_data JSONB.
 *
 * Resposta de sucesso inclui o link do grupo no WhatsApp para redirect
 * client-side. O link vem da env NEXT_PUBLIC_GRUPO_VIP_URL ou de site_settings.
 *
 * Spam: usa honeypot field "_hp" — se vier preenchido, retorna 200 silencioso.
 */

const WA_GROUP_FALLBACK = "https://chat.whatsapp.com/PLACEHOLDER-GRUPO-VIP-FDB";

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, serviceKey);
}

function normalizePhone(input: string): string {
    return input.replace(/\D/g, "");
}

function isEmail(s: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

type Body = {
    nome?: string;
    email?: string;
    whatsapp?: string;
    estado?: string;
    cidade?: string;
    perfil_pecuarista?: string;
    nelore_po?: string;
    quantidade_animais?: string;
    faixa_investimento?: string;
    interesses?: string[];
    como_conheceu?: string;
    lgpd?: boolean;
    landing_url?: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    _hp?: string;
};

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as Body;

        if (body._hp && body._hp.trim() !== "") {
            return NextResponse.json({ success: true, redirect: WA_GROUP_FALLBACK });
        }

        const nome = (body.nome || "").trim();
        const email = (body.email || "").trim().toLowerCase();
        const whatsapp = normalizePhone(body.whatsapp || "");
        const estado = (body.estado || "").trim().toUpperCase();
        const cidade = (body.cidade || "").trim();

        const errors: string[] = [];
        if (!nome || nome.length < 2) errors.push("nome");
        if (!email || !isEmail(email)) errors.push("email");
        if (!whatsapp || whatsapp.length < 10) errors.push("whatsapp");
        if (!estado || estado.length !== 2) errors.push("estado");
        if (!cidade) errors.push("cidade");
        if (!body.perfil_pecuarista) errors.push("perfil_pecuarista");
        if (!body.nelore_po) errors.push("nelore_po");
        if (!body.quantidade_animais) errors.push("quantidade_animais");
        if (!body.faixa_investimento) errors.push("faixa_investimento");
        if (!body.interesses || body.interesses.length === 0) errors.push("interesses");
        if (!body.lgpd) errors.push("lgpd");

        if (errors.length > 0) {
            return NextResponse.json(
                { error: "Campos inválidos ou faltantes", fields: errors },
                { status: 400 },
            );
        }

        const supabase = getSupabaseAdmin();

        const { data: maxPosData } = await supabase
            .from("crm_leads")
            .select("position")
            .order("position", { ascending: false })
            .limit(1);
        const position = (maxPosData?.[0]?.position || 0) + 1000;

        const nomeFormatado =
            cidade && estado ? `[${cidade}/${estado}][${nome}]` : nome;

        const interesseLabel = (body.interesses || []).join(", ");

        const extraData = {
            perfil_pecuarista: body.perfil_pecuarista || null,
            nelore_po: body.nelore_po || null,
            quantidade_animais: body.quantidade_animais || null,
            faixa_investimento: body.faixa_investimento || null,
            interesses: body.interesses || [],
            como_conheceu: body.como_conheceu || null,
            lgpd_aceito: !!body.lgpd,
            lgpd_aceito_em: new Date().toISOString(),
        };

        const record = {
            nome: nomeFormatado,
            status: "Lead",
            stage: "novo",
            telefone: whatsapp,
            email: email,
            estado: estado,
            cidade: cidade,
            interesse: interesseLabel,
            quantidade_animais: body.quantidade_animais || null,
            origem: "grupo-vip",
            source_page: "/grupo-vip",
            source: body.utm_source || "formuladoboi.com",
            medium: body.utm_medium || "organic",
            campaign: body.utm_campaign || "grupo-vip",
            utm_content: body.utm_content || null,
            utm_term: body.utm_term || null,
            landing_url: body.landing_url || null,
            referrer: body.referrer || null,
            extra_data: extraData,
            responsavel: "Matheus Amormino",
            position,
            funnel_id: "default",
        };

        const { data, error } = await supabase
            .from("crm_leads")
            .insert([record])
            .select()
            .single();

        if (error) {
            console.error("[grupo-vip] Insert error:", error);
            return NextResponse.json(
                { error: "Falha ao salvar lead", details: error.message },
                { status: 500 },
            );
        }

        const groupUrl = process.env.NEXT_PUBLIC_GRUPO_VIP_URL || WA_GROUP_FALLBACK;

        return NextResponse.json({
            success: true,
            id: data.id,
            redirect: groupUrl,
            placeholder: groupUrl === WA_GROUP_FALLBACK,
        });
    } catch (e) {
        const err = e as Error;
        console.error("[grupo-vip] Route error:", err);
        return NextResponse.json(
            { error: "Erro interno", message: err.message },
            { status: 500 },
        );
    }
}

export async function GET() {
    return NextResponse.json({
        status: "ok",
        endpoint: "leads/grupo-vip",
        accepts: "POST application/json",
    });
}
