import { createClient } from '@/lib/supabase/server';
import AdminHeader from '@/components/admin/AdminHeader';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function AdminDashboard() {
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/admin/login');

    // Fetch all vehicles for the filter
    const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .order('name');

    // Fetch all bookings with vehicle details
    const { data: bookings } = await supabase
        .from('bookings')
        .select('*, vehicles(*)')
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-darkbg text-white font-montserrat p-6 md:p-10">
            <AdminHeader />
            <main>
                <DashboardClient 
                    initialBookings={bookings || []} 
                    vehicles={vehicles || []} 
                />
            </main>
        </div>
    );
}
