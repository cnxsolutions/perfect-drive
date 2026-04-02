'use client';

import { useState } from 'react';
import { Plus, Car, Calendar } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CreateBookingModal from './CreateBookingModal';

export default function AdminHeader() {
    const [showModal, setShowModal] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { name: 'Réservations', href: '/admin/dashboard', icon: Calendar },
        { name: 'Véhicules', href: '/admin/vehicles', icon: Car },
    ];

    return (
        <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-white/10 pb-6 gap-4">
                <div className="flex flex-col gap-4">
                    <nav className="flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                                    pathname === item.href 
                                        ? 'text-alpine border-b-2 border-alpine pb-1' 
                                        : 'text-gray-500 hover:text-white pb-1 border-b-2 border-transparent'
                                }`}
                            >
                                <item.icon className="w-3.5 h-3.5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                    <div>
                        <h1 className="text-3xl font-oswald uppercase tracking-widest text-white">
                            {pathname.includes('vehicles') ? 'Gestion Véhicules' : 'Dashboard'}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {pathname.includes('vehicles') 
                                ? 'Gérez votre flotte et les détails techniques' 
                                : 'Gérez vos réservations et disponibilités'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto self-end">
                    {pathname === '/admin/dashboard' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex-1 md:flex-none px-6 py-2 bg-alpine text-white rounded font-bold uppercase tracking-wider text-sm hover:bg-alpine/90 transition flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Nouvelle
                        </button>
                    )}

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
