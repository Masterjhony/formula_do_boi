
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { PRODUCTS } from '../src/data/products';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Starting seed process...');
    console.log(`Found ${PRODUCTS.length} products to insert.`);

    for (const product of PRODUCTS) {
        const { id, ...productData } = product;

        // Check if product exists by name or some unique field to avoid duplicates if re-run
        // Ideally we use the old_id
        const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('old_id', id)
            .single();

        if (existing) {
            console.log(`Product ${product.name} (ID: ${id}) already exists. Skipping...`);
            continue;
        }

        const { error } = await supabase.from('products').insert({
            old_id: id,
            name: product.name,
            category: product.category,
            classificacao: product.classificacao,
            modalidade: product.modalidade,
            logistica: product.logistica,
            forma_pagamento: product.forma_pagamento,
            location: product.location,
            image: product.image,
            gallery: product.gallery,
            price: product.price,
            installments: product.installments,
            tag: product.tag,
            details: product.details,
        });

        if (error) {
            console.error(`Error inserting ${product.name}:`, error);
        } else {
            console.log(`Inserted ${product.name}`);
        }
    }

    console.log('Seed completed.');
}

seed();
