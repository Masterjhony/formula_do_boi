require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateRecords() {
  // Fetch existing records first to just merge details
  const { data: records, error } = await supabase
    .from('products')
    .select('id, details, avaliacao_genetica_json, status')
    .in('id', [346, 347]);

  if (error) {
    console.error("Fetch Error:", error);
    return;
  }

  for (const record of records) {
    // Merge new details
    // ID 347: BRASILIA FIV DA FAR (BNSE 4)
    if (record.id === 347) {
      const newDetails = {
        ...record.details,
        iabcz: "1,92",
        status: "Prenhe",
        touro_prenhez: "LEGITIMO FIV GC DA SL",
        previsao_parto: "26/10/2026",
      };
      
      let newAvaliacao = record.avaliacao_genetica_json;
      if (newAvaliacao) {
        newAvaliacao.iabcz = 1.92;
      }

      await supabase.from('products').update({
        details: newDetails,
        avaliacao_genetica_json: newAvaliacao,
        status: "Prenhe"
      }).eq('id', 347);
      console.log("Updated ID 347 (BNSE 4)");
    }

    // ID 346: BRAGANCA FIV DA FAR (BNSE 5)
    if (record.id === 346) {
      const newDetails = {
        ...record.details,
        iabcz: "-5,35",
        status: "Prenhe",
        touro_prenhez: "DIVISOR FIV V3",
        previsao_parto: "19/09/2026",
      };

      let newAvaliacao = record.avaliacao_genetica_json;
      if (newAvaliacao) {
        newAvaliacao.iabcz = -5.35;
      }

      await supabase.from('products').update({
        details: newDetails,
        avaliacao_genetica_json: newAvaliacao,
        status: "Prenhe"
      }).eq('id', 346);
      console.log("Updated ID 346 (BNSE 5)");
    }
  }
}
updateRecords();
