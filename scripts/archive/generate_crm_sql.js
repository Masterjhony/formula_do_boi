const fs = require('fs');
const readline = require('readline');

const csvPath = 'crm_formula_content/CRM de vendas 2f1d6988813c819d9413f3de29d0fbe1.csv';
const outputPath = 'database/import_notion_crm.sql';

const parseCSVLine = (text) => {
    let ret = [''], i = 0, p = '', s = true;
    for (let l in text) {
        l = text[l];
        if ('"' === l) {
            s = !s;
            if ('"' === p) {
                ret[i] += '"';
                l = '-';
            } else if (p === '') {
                l = '-';
            }
        } else if (s && ',' === l) {
            l = ret[++i] = '';
        } else {
            ret[i] += l;
        }
        p = l;
    }
    return ret;
};

const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        return d.toISOString();
    } catch (e) {
        return null;
    }
};

const escapeSql = (str) => {
    if (str === null || str === undefined || str === '') return 'NULL';
    str = str.replace(/'/g, "''"); // Escape single quotes
    return `'${str}'`;
};

async function processLineByLine() {
    const fileStream = fs.createReadStream(csvPath);
    let outputSQL = '-- Script de Importação dos dados do CRM do Notion\n\n';

    // Deletar dados antigos se desejar recomeçar limpo, ou só inserir
    outputSQL += 'TRUNCATE TABLE public.crm_leads;\n\n';

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let isFirstLine = true;
    let index = 1;

    for await (const line of rl) {
        if (isFirstLine) {
            isFirstLine = false;
            // Headers: Nome, Status, Prioridade, Interesse, Empresa, Último contato, Data estimada do fechamento, Telefone, Celular, Responsável pela conta, Adicionado em, Botão de contato
            continue;
        }

        const data = parseCSVLine(line);
        if (data.length < 2 || !data[0]) continue; // Pular linhas vazias

        const nome = data[0];
        const status = data[1] || 'Lead';
        const prioridade = data[2] || '';
        const interesse = data[3] || '';
        const empresa = data[4] || '';
        const ultimo_contato = formatDate(data[5]);
        const data_fechamento = formatDate(data[6]);
        const telefone = data[7] || '';
        const celular = data[8] || '';
        const responsavel = data[9] || '';

        // Definindo a posição para o Kanban (incrementando para manter a ordem se estiver na mesma coluna)
        const position = index * 1000;

        const sql = `INSERT INTO public.crm_leads (nome, status, prioridade, interesse, empresa, ultimo_contato, data_estimada_fechamento, telefone, celular, responsavel, position) VALUES (${escapeSql(nome)}, ${escapeSql(status)}, ${escapeSql(prioridade)}, ${escapeSql(interesse)}, ${escapeSql(empresa)}, ${ultimo_contato ? escapeSql(ultimo_contato) : 'NULL'}, ${data_fechamento ? escapeSql(data_fechamento) : 'NULL'}, ${escapeSql(telefone)}, ${escapeSql(celular)}, ${escapeSql(responsavel)}, ${position});\n`;

        outputSQL += sql;
        index++;
    }

    fs.writeFileSync(outputPath, outputSQL);
    console.log(`Gerado com sucesso em ${outputPath}`);
}

processLineByLine();
