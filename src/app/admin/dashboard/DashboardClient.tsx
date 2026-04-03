'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Booking } from '@/types/booking';
import { Vehicle } from '@/types/vehicle';
import BookingList from '@/components/admin/BookingList';
import { ChevronDown, Calendar as CalendarIcon, LayoutGrid, Check } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface DashboardClientProps {
    initialBookings: Booking[];
    vehicles: Vehicle[];
}

const MonthAccordion = ({ month, bookings, type }: { month: string, bookings: Booking[], type: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const mLabel = useMemo(() => {
        if (month === 'unknown') return 'Date Inconnue';
        const [year, m] = month.split('-');
        const d = new Date(parseInt(year), parseInt(m) - 1, 1);
        return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }, [month]);

    return (
        <div className="border border-white/5 rounded-xl overflow-hidden bg-darkbg">
            <div 
                className="px-4 py-3 bg-white/5 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <CalendarIcon className="w-4 h-4 text-alpine" />
                    <span className="font-oswald uppercase tracking-widest text-sm text-white capitalize">{mLabel}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/50">{bookings.length}</span>
                    <ChevronDown className={clsx("w-4 h-4 text-alpine transition-transform", isOpen ? "rotate-180" : "")} />
                </div>
            </div>
            {isOpen && (
                <div className="p-4 border-t border-white/5">
                    <BookingList bookings={bookings} type={type as any} />
                </div>
            )}
        </div>
    );
};

const VehicleAccordion = ({ vehicle, bookings, type }: { vehicle: Vehicle | undefined, bookings: Booking[], type: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    const groupedByMonth = useMemo(() => {
        const acc: Record<string, Booking[]> = {};
        bookings.forEach(b => {
             const m = b.start_date ? b.start_date.substring(0, 7) : 'unknown';
             if (!acc[m]) acc[m] = [];
             acc[m].push(b);
        });
        return acc;
    }, [bookings]);

    return (
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 mb-4 animate-fade-in-up">
            <div 
                className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-alpine/20 flex items-center justify-center border border-alpine/30">
                        <LayoutGrid className="w-5 h-5 text-alpine" />
                    </div>
                    <div>
                        <h3 className="text-lg font-oswald uppercase text-white truncate">
                            {vehicle ? `${vehicle.name} ${vehicle.trim ? `- ${vehicle.trim}` : ''} ${vehicle.color ? `- ${vehicle.color}` : ''}` : 'Véhicule Inconnu'}
                        </h3>
                        <p className="text-xs text-gray-400 font-montserrat mt-1">{bookings.length} réservation(s)</p>
                    </div>
                </div>
                <ChevronDown className={clsx("w-6 h-6 text-alpine transition-transform", isOpen ? "rotate-180" : "")} />
            </div>
            {isOpen && (
                <div className="p-4 bg-black/20 border-t border-white/10 space-y-3">
                    {Object.entries(groupedByMonth).sort((a,b) => b[0].localeCompare(a[0])).map(([m, mBookings]) => (
                        <MonthAccordion key={m} month={m} bookings={mBookings} type={type} />
                    ))}
                </div>
            )}
        </div>
    );
};

const GroupedBookingList = ({ bookings, vehicles, type }: { bookings: Booking[], vehicles: Vehicle[], type: string }) => {
    const groupedByVehicle = useMemo(() => {
        const acc: Record<string, Booking[]> = {};
        bookings.forEach(b => {
            const vid = b.vehicle_id || 'unknown';
            if (!acc[vid]) acc[vid] = [];
            acc[vid].push(b);
        });
        return acc;
    }, [bookings]);

    return (
        <div>
            {Object.entries(groupedByVehicle).map(([vid, vBookings]) => {
                const vehicle = vehicles.find(v => v.id === vid);
                return <VehicleAccordion key={vid} vehicle={vehicle} bookings={vBookings} type={type} />;
            })}
        </div>
    );
};

export default function DashboardClient({ initialBookings, vehicles }: DashboardClientProps) {
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
    const [isVehicleOpen, setIsVehicleOpen] = useState(false);
    const vehicleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (vehicleRef.current && !vehicleRef.current.contains(event.target as Node)) {
                setIsVehicleOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredBookings = useMemo(() => {
        return initialBookings.filter(booking => {
            const matchVehicle = selectedVehicleId === 'all' || booking.vehicle_id === selectedVehicleId;
            return matchVehicle;
        });
    }, [initialBookings, selectedVehicleId]);

    const pendingBookings = filteredBookings.filter(b => b.status === 'pending');
    const awaitingPaymentBookings = filteredBookings.filter(b => b.status === 'awaiting_payment');
    const approvedBookings = filteredBookings.filter(b => b.status === 'approved');
    const rejectedBookings = filteredBookings.filter(b => b.status === 'rejected');

    const currentVehicle = vehicles.find(v => v.id === selectedVehicleId);

    const getVehicleDisplay = (v: Vehicle | undefined) => {
        if (!v) return 'Véhicule Inconnu';
        return `${v.name} ${v.trim ? `- ${v.trim}` : ''} ${v.color ? `- ${v.color}` : ''}`;
    };

    return (
        <div className="animate-fade-in-up pb-10">
            {/* Filtres Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md relative z-20">
                <div className="relative flex-1 max-w-sm" ref={vehicleRef}>
                    <label className="block text-xs font-bold text-alpine uppercase tracking-widest mb-2 pl-2">Véhicule</label>
                    <div 
                        className="w-full bg-darkbg border border-white/10 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-white/30 transition-all text-white font-oswald text-lg md:text-xl uppercase tracking-wide"
                        onClick={() => {
                            setIsVehicleOpen(!isVehicleOpen);
                        }}
                    >
                        <div className="flex items-center gap-3 truncate">
                            <LayoutGrid className="w-5 h-5 text-alpine flex-shrink-0" />
                            <span className="truncate">{selectedVehicleId === 'all' ? 'Tous les véhicules' : getVehicleDisplay(currentVehicle)}</span>
                        </div>
                        <ChevronDown className={clsx("w-5 h-5 text-alpine transition-transform", isVehicleOpen ? "rotate-180" : "")} />
                    </div>

                    {isVehicleOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1C1C1C] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                            <div className="max-h-60 overflow-y-auto">
                                <div 
                                    className={clsx("p-4 flex items-center justify-between cursor-pointer border-b border-white/5 hover:bg-white/5 text-white font-oswald uppercase tracking-wide", selectedVehicleId === 'all' && "bg-alpine/10 text-alpine")}
                                    onClick={() => { setSelectedVehicleId('all'); setIsVehicleOpen(false); }}
                                >
                                    <span>Tous les véhicules</span>
                                    {selectedVehicleId === 'all' && <Check className="w-4 h-4 text-alpine" />}
                                </div>
                                {vehicles.map(v => (
                                    <div 
                                        key={v.id}
                                        className={clsx("p-4 flex items-center justify-between cursor-pointer border-b border-white/5 hover:bg-white/5 text-white font-oswald uppercase tracking-wide", selectedVehicleId === v.id && "bg-alpine/10 text-alpine")}
                                        onClick={() => { setSelectedVehicleId(v.id); setIsVehicleOpen(false); }}
                                    >
                                        <span>{getVehicleDisplay(v)}</span>
                                        {selectedVehicleId === v.id && <Check className="w-4 h-4 text-alpine" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="grid gap-12 relative z-10">
                {pendingBookings.length > 0 && (
                    <section className="animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
                            <h2 className="text-xl font-oswald text-yellow-500 uppercase tracking-widest">En Attente</h2>
                            <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold">{pendingBookings.length}</span>
                        </div>
                        <GroupedBookingList bookings={pendingBookings} vehicles={vehicles} type="pending" />
                    </section>
                )}

                {awaitingPaymentBookings.length > 0 && (
                    <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                            <h2 className="text-xl font-oswald text-blue-500 uppercase tracking-widest">Paiement Attendu</h2>
                            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full text-xs font-bold">{awaitingPaymentBookings.length}</span>
                        </div>
                        <GroupedBookingList bookings={awaitingPaymentBookings} vehicles={vehicles} type="awaiting_payment" />
                    </section>
                )}

                {approvedBookings.length > 0 && (
                    <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                            <h2 className="text-xl font-oswald text-green-500 uppercase tracking-widest">Confirmées</h2>
                            <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full text-xs font-bold">{approvedBookings.length}</span>
                        </div>
                        <div className="opacity-90">
                            <GroupedBookingList bookings={approvedBookings} vehicles={vehicles} type="approved" />
                        </div>
                    </section>
                )}

                {rejectedBookings.length > 0 && (
                    <section className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                            <h2 className="text-xl font-oswald text-red-500 uppercase tracking-widest">Refusées</h2>
                            <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-xs font-bold">{rejectedBookings.length}</span>
                        </div>
                        <div className="opacity-60">
                            <GroupedBookingList bookings={rejectedBookings} vehicles={vehicles} type="rejected" />
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {filteredBookings.length === 0 && (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl glass-panel animate-fade-in-up">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <CalendarIcon className="w-8 h-8 text-white/40" />
                        </div>
                        <h3 className="text-xl font-oswald uppercase tracking-widest text-white mb-2">Aucune réservation</h3>
                        <p className="text-gray-400 font-montserrat">Aucun dossier ne correspond à ce que vous cherchez.</p>
                        <button 
                            onClick={() => setSelectedVehicleId('all')}
                            className="mt-6 px-6 py-2 bg-alpine text-white rounded-lg font-montserrat text-sm font-bold hover:bg-blue-600 transition-colors"
                        >
                            Afficher toutes les réservations
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
