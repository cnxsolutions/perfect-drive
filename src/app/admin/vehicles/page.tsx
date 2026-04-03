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
    const { vehicles } = await getVehicles();

    return (
        <div className="min-h-screen bg-darkbg text-white font-montserrat p-6 md:p-10">
            <AdminHeader />
            <main>
                <VehiclesPageClient initialVehicles={vehicles || []} />
            </main>
        </div>
    );
}
