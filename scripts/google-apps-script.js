// ============================================
// CONFIGURAÇÃO - Altere estes valores
// ============================================
const WEBHOOK_URL = 'https://admin.formuladoboi.com/api/webhooks/google-sheets';
const WEBHOOK_SECRET = '78e82b1aaeff0ac98b6436ead95f91930c7d5321a8c26c83219';
const SHEET_NAME = 'Leads-GP'; // Nome da aba da planilha

// Número fixo de colunas de dados (A até O = 15 colunas).
// Ajuste se adicionar ou remover colunas na planilha.
const DATA_COLS = 15;

// ============================================
// NÃO ALTERE NADA ABAIXO DESTA LINHA
// ============================================

/**
 * Retorna o número da coluna usada como marcador "ENVIADO".
 * Procura pelo cabeçalho "ENVIADO" na linha 1; se não existir, cria.
 * Desta forma o marcador fica sempre na mesma coluna, mesmo após múltiplas execuções.
 */
function getMarkerCol(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol > 0) {
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] === 'ENVIADO') return i + 1; // 1-indexed
    }
  }
  // Ainda não existe — cria o cabeçalho na coluna seguinte às colunas de dados
  const markerCol = DATA_COLS + 1;
  sheet.getRange(1, markerCol).setValue('ENVIADO');
  return markerCol;
}

/**
 * Função chamada pelo acionador "Ao enviar formulário".
 */
function onFormSubmit(e) {
  sendNewLeads();
}

/**
 * Envia todas as linhas novas (não marcadas como ENVIADO) para o CRM.
 */
function sendNewLeads() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    Logger.log('Aba não encontrada: ' + SHEET_NAME);
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    Logger.log('Nenhuma linha de dados (apenas cabeçalho ou planilha vazia).');
    return;
  }

  // Coluna de marcador — sempre a mesma, independente de execuções anteriores
  const MARKER_COL = getMarkerCol(sheet);

  // Lê apenas as colunas de dados (DATA_COLS), ignorando a coluna de marcador
  const dataRange = sheet.getRange(2, 1, lastRow - 1, DATA_COLS);
  const data = dataRange.getValues();

  // Lê todos os marcadores de uma vez (mais eficiente que ler célula por célula)
  const markerRange = sheet.getRange(2, MARKER_COL, lastRow - 1, 1);
  const markers = markerRange.getValues();

  const leadsToSend = [];
  const rowsToMark = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2; // +2 porque pula header e é 1-indexed

    // Verifica se já foi enviado
    if (markers[i][0] === 'ENVIADO') continue;

    // Verifica se a linha tem pelo menos nome (coluna C = índice 2)
    const nomeCompleto = row[2];
    if (!nomeCompleto || nomeCompleto.toString().trim() === '') continue;

    // Monta o objeto do lead
    const lead = {
      data: formatDate(row[0]),                            // A - Data
      hora: formatTime(row[1]),                            // B - Hora
      nome_completo: row[2],                               // C - Nome Completo
      celular: row[3] ? row[3].toString() : '',            // D - Celular
      instagram: row[4],                                   // E - Instagram
      nome_fazenda: row[5],                                // F - Nome da Fazenda
      estado: row[6],                                      // G - Estado
      cidade: row[7],                                      // H - Cidade
      momento_pecuaria: row[8],                            // I - Momento Pecuária
      o_que_busca: row[9],                                 // J - O que você busca
      quantidade_animais: row[10],                         // K - Quantidade de animais
      page: row[11],                                       // L - Page
      source: row[12],                                     // M - Source
      medium: row[13],                                     // N - Medium
      campaign: row[14],                                   // O - Campaign
    };

    leadsToSend.push(lead);
    rowsToMark.push(i); // índice no array markers (0-based)
  }

  if (leadsToSend.length === 0) {
    Logger.log('Nenhum lead novo para enviar.');
    return;
  }

  // Envia os leads para o webhook
  try {
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-webhook-secret': WEBHOOK_SECRET,
      },
      payload: JSON.stringify({ leads: leadsToSend }),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    Logger.log('Status: ' + responseCode);
    Logger.log('Resposta: ' + responseBody);

    if (responseCode === 200) {
      // Marca as linhas como enviadas usando setValues em lote (mais eficiente)
      for (const idx of rowsToMark) {
        sheet.getRange(idx + 2, MARKER_COL).setValue('ENVIADO');
      }
      Logger.log(leadsToSend.length + ' lead(s) enviado(s) com sucesso!');
    } else {
      Logger.log('Erro ao enviar: HTTP ' + responseCode + ' — ' + responseBody);
    }
  } catch (error) {
    Logger.log('Erro na requisição: ' + error.toString());
  }
}

/**
 * Formata a data para string no formato YYYY-MM-DD
 */
function formatDate(value) {
  if (!value) return '';
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return value.toString();
}

/**
 * Formata a hora para string no formato HH:mm
 */
function formatTime(value) {
  if (!value) return '';
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'HH:mm');
  }
  return value.toString();
}

/**
 * Função de teste — execute manualmente no editor do Apps Script
 * para verificar se o webhook está funcionando.
 */
function testWebhook() {
  const testLead = {
    leads: [{
      data: '2026-03-12',
      hora: '15:00',
      nome_completo: 'TESTE Apps Script',
      celular: '5531999999999',
      instagram: '@teste',
      nome_fazenda: 'Fazenda Teste',
      estado: 'MG',
      cidade: 'Belo Horizonte',
      momento_pecuaria: 'Teste de integração',
      o_que_busca: 'Touro',
      quantidade_animais: '0 a 100',
      page: '/grupo-whats',
      source: 'teste',
      medium: 'teste',
      campaign: 'CA - TESTE',
    }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-webhook-secret': WEBHOOK_SECRET,
    },
    payload: JSON.stringify(testLead),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
  const code = response.getResponseCode();
  const body = response.getContentText();
  Logger.log('Status: ' + code);
  Logger.log('Resposta: ' + body);

  if (code === 200) {
    try {
      const parsed = JSON.parse(body);
      const wa = parsed.details ? '' : (parsed.inserted > 0 ? '\n\nWhatsApp: ' + JSON.stringify(parsed.details || (parsed.inserted && parsed.inserted[0] && parsed.inserted[0].whatsapp) || 'ver logs') : '');
      Browser.msgBox('✅ CRM OK (inseridos: ' + parsed.inserted + ')', body + wa, Browser.Buttons.OK);
    } catch(_) {
      Browser.msgBox('✅ Sucesso', body, Browser.Buttons.OK);
    }
  } else {
    Browser.msgBox('❌ Erro HTTP ' + code, body, Browser.Buttons.OK);
  }
}
