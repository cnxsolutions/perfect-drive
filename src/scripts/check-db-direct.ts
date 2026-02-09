
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing Supabase keys.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    console.log('Checking ...');

    // Check blocked_dates table
    const { count: blockedCount, error: blockedError } = await supabase
        .from('blocked_dates')
        .select('*', { count: 'exact', head: true });

    if (blockedError) console.error('Error checking blocked_dates:', blockedError);
    else console.log(`Rows in blocked_dates: ${blockedCount}`);

    // Check bookings table
    const { count: bookingsCount, error: bookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

    if (bookingsError) console.error('Error checking bookings:', bookingsError);
    else console.log(`Rows in bookings: ${bookingsCount}`);

    // Check RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_unavailable_dates');
    if (rpcError) console.error('Error checking RPC:', rpcError);
    else console.log(`RPC get_unavailable_dates returned ${rpcData?.length || 0} dates.`);
}

check();
