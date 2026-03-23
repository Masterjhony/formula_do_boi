const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data: data2, error: err2 } = await supabase
    .from('products')
    .select('*');

  if (err2) console.error(err2);
  else {
    const bnseRecords = data2.filter(row => 
      (row.name && row.name.includes('BNSE')) || 
      (row.registro && row.registro.includes('BNSE')) || 
      (row.details && row.details.registro && row.details.registro.includes('BNSE')) ||
      (row.name && row.name.includes('BRASILIA')) ||
      (row.name && row.name.includes('Braganca')) ||
      (row.name && row.name.includes('BRAGANCA'))
    );
    fs.writeFileSync('bnse_out.json', JSON.stringify(bnseRecords, null, 2));
  }
}
main();
