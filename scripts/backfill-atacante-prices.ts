// One-shot: aplica unit_price/total_value nas reservas vindas da LP
// /atacante-matinha que ainda estão sem valor (`origin='site-atacante'`).
// Convencional → R$ 25,50/dose (alinhado com os cards RSV-1001/1002).
// Sexado/ambos/indef ficam null — sem preço público confirmado.
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadDotenv(file: string) {
    const p = path.resolve(process.cwd(), file);
    if (!fs.existsSync(p)) return;
    for (const line of fs.readFileSync(p, 'utf-8').split(/\r?\n/)) {
        const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
        if (!m) continue;
        const [, key, valRaw] = m;
        if (process.env[key]) continue;
        let val = valRaw;
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
        process.env[key] = val;
    }
}
loadDotenv('.env.local');

const UNIT_PRICE_CONVENCIONAL = 25.5;

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

(async () => {
    const { data, error } = await supabase
        .from('product_reservations')
        .select('id, seq, product_name, customer_name, quantity, unit_price, total_value, notes')
        .eq('origin', 'site-atacante')
        .is('unit_price', null);
    if (error) { console.error(error); process.exit(1); }

    console.log(`Cards sem preço: ${data?.length || 0}`);
    for (const r of data || []) {
        const isConvencional = /\(Convencional\)/i.test(r.product_name || '');
        if (!isConvencional) {
            console.log(`  RSV-${String(r.seq).padStart(4, '0')} ${r.customer_name} — pulei (não é Convencional)`);
            continue;
        }
        const unit = UNIT_PRICE_CONVENCIONAL;
        const total = Number((unit * r.quantity).toFixed(2));
        const { error: upErr } = await supabase
            .from('product_reservations')
            .update({ unit_price: unit, total_value: total })
            .eq('id', r.id);
        if (upErr) {
            console.error(`  RSV-${String(r.seq).padStart(4, '0')} FALHA — ${upErr.message}`);
        } else {
            console.log(`  RSV-${String(r.seq).padStart(4, '0')} ${r.customer_name} — ${r.quantity} × R$ ${unit.toFixed(2)} = R$ ${total.toFixed(2)}`);
        }
    }
})();
