
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Prefer service ID for schema changes if available, otherwise just try.

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log('Starting migration...');

    // 1. Add column if not exists (using a raw SQL query if possible, or just checking/updating)
    // Since we can't easily run DDL via the JS client without a stored procedure or direct SQL access,
    // we will try to update and see if it fails, or assumes the user usually runs SQL manually. 
    // However, I can use the rpc method if there's a SQL runner, but usually there isn't one by default.
    // Wait, if I cannot run DDL, I should ask the user to run it. 
    // BUT: often I can just rely on the user having the column or I can try to use a "query" function if I have one setup?
    // Let's check if there is a way to run raw SQL.
    // Actually, standard Supabase JS client doesn't support raw SQL from client unless enabled via RPC.

    // Alternative: The user has many .sql files in the root. 
    // I should PROPOSE a .sql file for them to run in their Supabase dashboard SQL editor.
    // AND I can try to update the DATA via the client, assuming the column exists.
    // If the column doesn't exist, the update will fail.

    // Strategy:
    // 1. Create the .sql file for the schema change.
    // 2. Ask user to run it OR assume I can't and just provide the file.
    // 3. Wait... the prompt says "Code relating to the user's requests should be written in the locations listed above."
    // I will write a SQL file `update_video_framing.sql` in the workspace root.
    // Then I will try to run the DATA updates via this script, catching the error if the column is missing.

    const updates = [
        { name: 'PERFEICAO', position: 'center top' },
        { name: '1443', position: 'center top' },
        { name: 'CIMENTO', position: 'center top' },
        { name: 'GARFIELD', position: 'center top' },
        { name: 'PONTO', position: 'center top' },
        { name: 'URI', position: 'center top' },
        { name: 'LEGENDARIO', position: 'center top' },
        { name: 'CORROSIVO', position: 'center top' },
    ];

    for (const update of updates) {
        // We need to find the product ID first or update by name (which is risky if not unique, but names look unique enough here or we search first).
        // Actually, names in the screenshots match.

        // Search for the product
        const { data: products, error: searchError } = await supabase
            .from('products')
            .select('id, name')
            .ilike('name', `%${update.name}%`);

        if (searchError) {
            console.error(`Error searching for ${update.name}:`, searchError);
            continue;
        }

        if (products && products.length > 0) {
            for (const product of products) {
                console.log(`Updating product ${product.name} (ID: ${product.id})...`);
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ video_object_position: update.position })
                    .eq('id', product.id);

                if (updateError) {
                    console.error(`Failed to update ${product.name}:`, updateError);
                    if (updateError.message.includes('column "video_object_position" of relation "products" does not exist')) {
                        console.error("CRITICAL: The 'video_object_position' column does not exist. Please run the provided SQL script first.");
                        process.exit(1);
                    }
                } else {
                    console.log(`Success!`);
                }
            }
        } else {
            console.log(`Product ${update.name} not found.`);
        }
    }
}

runMigration();
