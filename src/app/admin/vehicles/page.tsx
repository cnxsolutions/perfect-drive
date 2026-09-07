import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VehiclesPageClient from './VehiclesPageClient';
import AdminHeader from '@/components/admin/AdminHeader';
import { getVehicles } from '@/actions/admin';

export const dynamic = 'force-dynamic';

export default async function VehiclesPage() {
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/admin/login');

    // Fetch vehicles with real-time rental status enrichment
    const resultat = await getVehicles();

    return (
        <div className="min-h-screen bg-darkbg text-white font-montserrat p-6 md:p-10">
            <AdminHeader />
            <main>
                {/* Un echec de chargement ne doit pas se confondre avec une flotte vide :
                    avant ce garde, l'ecran affichait « Aucun vehicule » dans les deux cas. */}
                {!resultat.success ? (
                    <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300">
                        <p className="font-oswald uppercase tracking-widest text-sm mb-2">
                            Chargement de la flotte impossible
                        </p>
                        <p className="text-sm text-red-200/90 font-montserrat">{resultat.error}</p>
                        <p className="text-xs text-red-200/60 mt-3 font-montserrat">
                            Aucun vehicule n&apos;a pu etre lu : cet ecran est vide a cause de cette erreur,
                            et non parce que la flotte le serait.
                        </p>
                    </div>
                ) : (
                    <VehiclesPageClient initialVehicles={resultat.vehicles || []} />
                )}
            </main>
        </div>
    );
}
