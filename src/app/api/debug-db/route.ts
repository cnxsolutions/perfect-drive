import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase/admin';

export async function GET() {
    const { data: bookings } = await supabaseAdmin.from('bookings').select('*');
    const { data: vehicles } = await supabaseAdmin.from('vehicles').select('*');
    return NextResponse.json({ bookings, vehicles, today: new Date().toISOString() });
}
