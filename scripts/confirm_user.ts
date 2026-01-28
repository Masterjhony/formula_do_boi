import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const targetEmail = 'formuladoboi@gmail.com';

async function confirmUser() {
    console.log(`Looking for user: ${targetEmail}`);

    // 1. List users to find the ID (Admin API not allow getByEmail directly usually, but list works)
    // or use listUsers
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email === targetEmail);

    if (!user) {
        console.error('User not found!');
        return;
    }

    console.log(`Found user ID: ${user.id}`);

    // 2. Update user to confirm email
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
    );

    if (updateError) {
        console.error('Error confirming user:', updateError);
    } else {
        // Also explicitly set confirmed_at if email_confirm doesn't do it instantly (it usually does)
        console.log(`Success! User ${targetEmail} confirmed.`);
        console.log('User data:', data);
    }
}

confirmUser();
