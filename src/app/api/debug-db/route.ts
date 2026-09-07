import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Route de diagnostic. Elle lit la base avec la cle service_role, qui contourne
 * les regles RLS : elle ne doit JAMAIS etre atteignable sans session admin.
 * Avant ce garde, un simple GET rendait publiques toutes les reservations,
 * avec nom, email, telephone, adresse et chemins des pieces d'identite.
 */
export async function GET() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json(
            { error: "Acces refuse : cette route de diagnostic exige une session administrateur." },
            { status: 401 }
        );
    }

    const { data: bookings, error: bookingsError } = await supabaseAdmin.from('bookings').select('*');
    const { data: vehicles, error: vehiclesError } = await supabaseAdmin.from('vehicles').select('*');

    if (bookingsError || vehiclesError) {
        return NextResponse.json(
            {
                error: "Lecture impossible en base.",
                details: {
                    bookings: bookingsError?.message ?? null,
                    vehicles: vehiclesError?.message ?? null,
                },
            },
            { status: 502 }
        );
    }

    return NextResponse.json({ bookings, vehicles, today: new Date().toISOString() });
}
