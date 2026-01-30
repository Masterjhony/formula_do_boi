const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../src/data/bulls_data.json');
const OUTPUT_SQL = path.join(__dirname, '../migrate_touros.sql');

const bulls = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

let sql = `-- Migration to add new Bulls (Touros)
-- Owner: GSOL
-- Generated automatically from extracted PDF data

`;

let startId = 200;

bulls.forEach(bull => {
    const id = startId++;

    // Construct gallery (video + placeholder/pdf image?)
    // Using video for both for now or just video
    const gallery = [bull.video];
    if (bull.video !== bull.video) gallery.push(bull.video); // duplicate just to have array

    // Construct details JSON
    const details = {
        registro: bull.rgd,
        raca: "Nelore",
        nascimento: bull.nascimento || "Sob Consulta",
        pai: bull.pai || "Sob Consulta",
        mae: bull.mae || "Sob Consulta",
        peso: "Sob Consulta", // Not extracted reliably
        iabcz: bull.iabcz || "Sob Consulta",
        mgte: bull.mgte || "Sob Consulta",
        status: "Touro",
        tipo: "Touro",
        comentario: `Touro ${bull.name} - GSOL`,
        pdf: bull.pdf,
        proprietario: "GSOL",
        criador: "GSOL"
    };

    const price = 0; // Consultar
    const installments = "Consultar";

    sql += `INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    ${id},
    '${bull.name.replace(/'/g, "''")}',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Aripuanã - MT', -- Default location for GSOL or unknown? Using generic.
    '${bull.video}',
    ARRAY['${bull.video}'],
    ${price},
    '${installments}',
    'NOVO',
    '${JSON.stringify(details)}'::jsonb
) ON CONFLICT (id) DO NOTHING;

`;
});

fs.writeFileSync(OUTPUT_SQL, sql);
console.log(`Generated SQL for ${bulls.length} bulls at ${OUTPUT_SQL}`);
