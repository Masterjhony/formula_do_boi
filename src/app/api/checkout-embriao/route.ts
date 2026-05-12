import { NextResponse } from "next/server";
import { google } from "googleapis";

/**
 * POST /api/checkout-embriao
 *
 * Recebe submissão do checkout de pacote de embriões (doadora × cruzamento)
 * e append na planilha Google Sheets (aba "Checkout-Embriao").
 *
 * Estrutura espelha /api/checkout-semen com adaptação para embriões:
 *   - doadora/cruzamento/pacotes/embrioes_total em vez de "doses"
 *   - matrizes_receptoras em vez de "rebanho" (animais)
 *   - valor_estimado calculado server-side (defesa)
 *
 * TODO operacional: criar a aba "Checkout-Embriao" na planilha
 *   1quOwhQEqT4kthdxPTZ0aHH9XRNhfquuJrBOcS6-QgZk com cabeçalhos:
 *   nome | fazenda | cpf | telefone | matrizes_receptoras | cidade |
 *   doadora | cruzamento | pacotes | embrioes_total | valor_estimado |
 *   parcelamento | data_hora | utm_source | utm_medium | utm_campaign | utm_content
 */

const SPREADSHEET_ID = "1quOwhQEqT4kthdxPTZ0aHH9XRNhfquuJrBOcS6-QgZk";
const SHEET_NAME = "Checkout-Embriao";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            nome, fazenda, cpf, telefone,
            matrizes_receptoras, cidade,
            doadora, cruzamento,
            pacotes, embrioes_total, valor_estimado,
            parcelamento,
            utm_source, utm_medium, utm_campaign, utm_content,
        } = body;

        if (!nome || !fazenda || !cpf || !cidade || !doadora || !pacotes || !parcelamento) {
            return NextResponse.json(
                { error: "Campos obrigatórios faltando" },
                { status: 400 },
            );
        }

        const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        if (!serviceAccountJson) {
            return NextResponse.json(
                { error: "Credenciais Google não configuradas" },
                { status: 500 },
            );
        }

        const credentials = JSON.parse(serviceAccountJson);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        const dataHora = new Date().toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
        });

        const parcelamentoLabel: Record<string, string> = {
            avista: "À Vista",
            "10x-boleto": "10× sem juros (1 entrada + 9)",
            "12x-cartao": "12× no Cartão",
            conversar: "Vai conversar com o consultor",
        };

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:Q`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[
                    nome,
                    fazenda,
                    cpf,
                    telefone || "",
                    matrizes_receptoras || "",
                    cidade,
                    doadora,
                    cruzamento || "",
                    pacotes,
                    embrioes_total || (Number(pacotes) * 12),
                    valor_estimado || "",
                    parcelamentoLabel[parcelamento] ?? parcelamento,
                    dataHora,
                    utm_source || "site",
                    utm_medium || "organic",
                    utm_campaign || "embrioes/checkout",
                    utm_content || "formulario_principal",
                ]],
            },
        });

        // Adiciona contato ao grupo WhatsApp (mesmo padrão do Sertanejo checkout)
        if (telefone) {
            const whatsappUrl = process.env.WHATSAPP_SERVER_URL || "http://localhost:3001";
            try {
                await fetch(`${whatsappUrl}/add-to-group`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone: telefone }),
                });
            } catch (err) {
                console.error("[checkout-embriao] Erro ao adicionar ao grupo WhatsApp:", err);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[checkout-embriao] Erro ao salvar:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
