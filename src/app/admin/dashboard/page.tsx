import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { messageErreur } from '@/lib/errors';
import AdminHeader from '@/components/admin/AdminHeader';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function AdminDashboard() {
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/admin/login');

    // La session est verifiee ci-dessus ; la lecture passe ensuite par supabaseAdmin.
    //
    // Avec le client de session (role `authenticated`), une politique RLS filtre les
    // vehicules sur is_visible = true. L'admin ne voyait donc pas ses propres vehicules
    // masques : leurs reservations arrivaient avec vehicles = null et s'affichaient
    // « Vehicule Inconnu », puis calculatePrice recevait vehicle = undefined et retombait
    // sur 60 EUR/jour. L'ecran /admin/vehicles utilisait deja supabaseAdmin : les deux
    // ecrans du back-office ne montraient pas la meme flotte.
    const { data: vehicles, error: erreurVehicules } = await supabaseAdmin
        .from('vehicles')
        .select('*')
        .order('name', { ascending: true });

    const { data: bookings, error: erreurReservations } = await supabaseAdmin
        .from('bookings')
        .select('*, vehicles(*)')
        .order('start_date', { ascending: false });

    const erreurChargement = erreurVehicules ?? erreurReservations;

    return (
        <div className="min-h-screen bg-darkbg text-white font-montserrat p-6 md:p-10">
            <AdminHeader />
            <main>
                {/* Un echec de lecture ne doit pas se confondre avec « aucune reservation ». */}
                {erreurChargement && (
                    <div className="mb-6 p-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300">
                        <p className="font-oswald uppercase tracking-widest text-sm mb-2">
                            Chargement du tableau de bord impossible
                        </p>
                        <p className="text-sm text-red-200/90">{messageErreur(erreurChargement, 'reservation')}</p>
                    </div>
                )}
                <DashboardClient
                    initialBookings={bookings || []}
                    vehicles={vehicles || []}
                />
            </main>
        </div>
    );
}
