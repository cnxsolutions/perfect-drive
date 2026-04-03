const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2];
});

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: vehicles } = await supabaseAdmin.from('vehicles').select('*, bookings(start_date, end_date, status)');
    const today = new Date().toISOString().substring(0, 10);
    console.log("Today:", today);
    for (const vehicle of vehicles) {
        const activeBookings = vehicle.bookings || [];
        const isCurrentlyRented = activeBookings.some((b) => {
            if (b.status !== 'approved' && b.status !== 'paid') return false;
            console.log("Checking booking:", b.start_date, b.end_date, "against", today);
            return b.start_date <= today && b.end_date >= today;
        });
        console.log(vehicle.name, "isCurrentlyRented:", isCurrentlyRented);
    }
}
run();
