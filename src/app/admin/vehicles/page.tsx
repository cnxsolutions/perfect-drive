import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VehiclesPageClient from './VehiclesPageClient';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function VehiclesPage() {
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/admin/login');

    // Fetch vehicles
    const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-darkbg text-white font-montserrat p-6 md:p-10">
            <AdminHeader />
            <main>
                <VehiclesPageClient initialVehicles={vehicles || []} />
            </main>
        </div>
    );
}
