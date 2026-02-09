'use client';

import { Booking } from '@/types/booking';
import BookingCard from '@/components/admin/BookingCard';

interface BookingListProps {
    bookings: Booking[];
    type: 'pending' | 'awaiting_payment' | 'approved' | 'rejected' | 'history';
}

export default function BookingList({ bookings, type }: BookingListProps) {
    if (!bookings || bookings.length === 0) {
        return (
            <div className="text-gray-500 italic text-sm p-4 border border-dashed border-white/10 rounded">
                Aucune réservation {type === 'pending' ? 'en attente' : 'dans l\'historique'}.
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
            ))}
        </div>
    );
}
