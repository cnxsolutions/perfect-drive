import { createClient } from '@/lib/supabase/server';
import BookingList from '@/components/admin/BookingList';
import AdminHeader from '@/components/admin/AdminHeader';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/admin/login');

    // Fetch bookings by status
    const { data: pendingBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    const { data: awaitingPaymentBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'awaiting_payment')
        .order('created_at', { ascending: false });

    const { data: approvedBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'approved')
        .order('start_date', { ascending: true });

    const { data: rejectedBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'rejected')
        .order('created_at', { ascending: false })
        .limit(20);

    return (
        <div className="min-h-screen bg-darkbg text-white font-montserrat p-6 md:p-10">
            <AdminHeader />

            <main className="grid gap-8">
                {/* Pending Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></span>
                        <h2 className="text-xl font-oswald text-yellow-500 uppercase tracking-widest">
                            En Attente
                        </h2>
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold">
                            {pendingBookings?.length || 0}
                        </span>
                    </div>
                    <BookingList bookings={pendingBookings || []} type="pending" />
                </section>

                {/* Awaiting Payment Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                        <h2 className="text-xl font-oswald text-blue-500 uppercase tracking-widest">
                            Paiement Attendu
                        </h2>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs font-bold">
                            {awaitingPaymentBookings?.length || 0}
                        </span>
                    </div>
                    <BookingList bookings={awaitingPaymentBookings || []} type="awaiting_payment" />
                </section>

                {/* Approved Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <h2 className="text-xl font-oswald text-green-500 uppercase tracking-widest">
                            Confirmées
                        </h2>
                        <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-bold">
                            {approvedBookings?.length || 0}
                        </span>
                    </div>
                    <div className="opacity-90">
                        <BookingList bookings={approvedBookings || []} type="approved" />
                    </div>
                </section>

                {/* Rejected Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <h2 className="text-xl font-oswald text-red-500 uppercase tracking-widest">
                            Refusées
                        </h2>
                        <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-bold">
                            {rejectedBookings?.length || 0}
                        </span>
                    </div>
                    <div className="opacity-60">
                        <BookingList bookings={rejectedBookings || []} type="rejected" />
                    </div>
                </section>
            </main>
        </div>
    );
}
