import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getVehicles } from '@/actions/admin';

/**
 * Route de diagnostic. getVehicles() remonte la flotte complete, y compris les
 * vehicules masques et le detail des reservations (donc le chiffre d'affaires).
 * Reservee a une session admin authentifiee.
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

    const data = await getVehicles();
    return NextResponse.json(data, { status: data.success ? 200 : 502 });
}
