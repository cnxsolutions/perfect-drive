'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import CreateBookingModal from './CreateBookingModal';
// import { useRouter } from 'next/navigation'; // Unused

export default function AdminHeader() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-white/10 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-oswald uppercase tracking-widest text-white">Dashboard</h1>
                    <p className="text-gray-400 text-sm mt-1">Gérez vos réservations et disponibilités</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex-1 md:flex-none px-6 py-2 bg-alpine text-white rounded font-bold uppercase tracking-wider text-sm hover:bg-alpine/90 transition flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Nouvelle
                    </button>

                    <form action="/auth/signout" method="post">
                        <button className="h-full px-4 py-2 border border-white/10 rounded hover:bg-white/10 text-sm text-gray-300">
                            Déconnexion
                        </button>
                    </form>
                </div>
            </header>

            {showModal && <CreateBookingModal onClose={() => setShowModal(false)} />}
        </>
    );
}
