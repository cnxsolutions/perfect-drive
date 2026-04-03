require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log("Checking DB bookings...");
    const { data: bookings } = await supabaseAdmin.from('bookings').select('start_date, end_date, status, vehicle_id');
    const today = new Date().toISOString().substring(0, 10);
    console.log("Today:", today);
    for (const b of bookings) {
        if(b.status === 'approved' || b.status === 'paid') {
            console.log(`Booking: ${b.start_date} to ${b.end_date} (Vehicle ${b.vehicle_id}) | Covers today? ${b.start_date <= today && b.end_date >= today}`);
        } else {
            console.log(`Pending/Rejected: ${b.start_date} to ${b.end_date}`);
        }
    }
}
run();
