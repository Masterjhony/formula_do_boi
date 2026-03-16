import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkLeads() {
  const { data, error } = await supabase
    .from('crm_leads')
    .select('id, nome, data_entrada, created_at, telefone')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error('Error fetching leads:', error);
  } else {
    fs.writeFileSync('leads_output.json', JSON.stringify(data, null, 2), 'utf8');
    console.log('Successfully wrote to leads_output.json');
  }
}
checkLeads();
