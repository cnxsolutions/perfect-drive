'use client';

import { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, User, Loader2, Check, ChevronDown } from 'lucide-react';
import { createAdminBooking, getVehicles } from '@/actions/admin';
import { calculatePrice, MileageType } from '@/lib/pricing';
import { useRouter } from 'next/navigation';
import { Vehicle } from '@/types/vehicle';

import Calendar from '@/components/booking/Calendar';

export default function CreateBookingModal({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [availability, setAvailability] = useState<any[]>([]);
    const [minStartTime, setMinStartTime] = useState<string | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [isVehicleMenuOpen, setIsVehicleMenuOpen] = useState(false);
    const [isDepositMenuOpen, setIsDepositMenuOpen] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        startTime: '10:00',
        endTime: '10:00',
        mileage: 'standard' as MileageType,
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        address: '',
        status: 'approved',
        depositMethod: 'imprint' as 'imprint' | 'cash',
        vehicle_id: '',
    });

    // Fetch vehicles on mount
    useEffect(() => {
        const loadVehicles = async () => {
            const res = await getVehicles();
            if (res.success && res.vehicles) {
                setVehicles(res.vehicles);
                if (res.vehicles.length > 0) {
                    setFormData(prev => ({ ...prev, vehicle_id: res.vehicles[0].id }));
                    setSelectedVehicle(res.vehicles[0]);
                }
            }
        };
        loadVehicles();
    }, []);

    // Fetch availability when vehicle changes
    useEffect(() => {
        if (!formData.vehicle_id) return;
        
        const fetchAvailability = async () => {
            const dates = await import('@/actions/booking').then(mod => mod.getBookingAvailability(formData.vehicle_id));
            setAvailability(dates);
        };
        fetchAvailability();
    }, [formData.vehicle_id]);

    // Calculate price as derived state
    const price = (formData.startDate && formData.endDate)
        ? (() => {
            const startParts = formData.startDate.split('-').map(Number);
            const endParts = formData.endDate.split('-').map(Number);

            const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
            const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);

            return calculatePrice(
                start,
                end,
                formData.mileage,
                selectedVehicle || undefined,
                true // isAdmin
            ).totalPrice
        })()
        : 0;

    // Helper to format date as YYYY-MM-DD in local time
    const formatDateLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper to parse "YYYY-MM-DD" to local Date object
    const parseDateLocal = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    // Handle Range Select from Calendar
    const handleRangeSelect = (start: Date | null, end: Date | null) => {
        setFormData(prev => ({
            ...prev,
            startDate: start ? formatDateLocal(start) : '',
            endDate: end ? formatDateLocal(end) : ''
        }));
    };

    // Calculate minimum start time based on partial availability (Same logic as BookingSection)
    const updateMinStartTime = () => {
        if (!formData.startDate) {
            setMinStartTime(null);
            return;
        }

        const dateAvail = availability.find(a => a.date === formData.startDate);

        if (dateAvail && !dateAvail.isFullyBlocked && dateAvail.existingBookings.length > 0) {
            const latestBooking = dateAvail.existingBookings
                .filter((b: any) => b.isEndDate)
                .sort((a: any, b: any) => b.endTime.localeCompare(a.endTime))[0];

            if (latestBooking) {
                const [hours, minutes] = latestBooking.endTime.split(':').map(Number);
                const minHour = hours + 1;
                const minTimeStr = `${minHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                setMinStartTime(minTimeStr);

                if (formData.startTime < minTimeStr) {
                    setFormData(prev => ({ ...prev, startTime: minTimeStr }));
                }
            } else {
                setMinStartTime(null);
            }
        } else {
            setMinStartTime(null);
        }
    };

    // Trigger min time update when startDate or availability changes
    useEffect(() => {
        updateMinStartTime();
    }, [formData.startDate, availability]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData(e.currentTarget as HTMLFormElement); // Automatically grabs inputs including files
        Object.entries(formData).forEach(([key, value]) => {
            if (!data.has(key)) {
                data.append(key, value);
            }
        });

        data.set('startDate', formData.startDate);
        data.set('endDate', formData.endDate);
        data.set('startTime', formData.startTime);
        data.set('endTime', formData.endTime);
        data.set('mileage', formData.mileage);
        data.set('firstname', formData.firstname);
        data.set('lastname', formData.lastname);
        data.set('email', formData.email);
        data.set('phone', formData.phone);
        data.set('status', formData.status);
        data.set('depositMethod', formData.depositMethod);
        data.set('totalPrice', price.toString());

        const res = await createAdminBooking(data);

        if (res.success) {
            router.refresh();
            onClose();
        } else {
            alert(res.error || 'Erreur inconnue');
        }
        setLoading(false);
    };

    // Helper to convert string state to Date object for Calendar
    const calendarStart = formData.startDate ? parseDateLocal(formData.startDate) : null;
    const calendarEnd = formData.endDate ? parseDateLocal(formData.endDate) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-darkbg border border-white/10 w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">

                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="font-oswald text-lg uppercase tracking-widest text-white">Nouvelle Réservation</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    {/* Left Panel: Calendar */}
                    <div className="w-full lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto">
                        <h4 className="text-alpine text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                            <CalendarIcon className="w-3 h-3" /> Disponibilités
                        </h4>

                        {/* Import Calendar dynamically or assuming it's imported at top */}
                        <div className="scale-90 origin-top-left w-full">
                            <div className="mb-6">
                                {/* Only render if availability is loaded to avoid jump */}
                                {availability.length > 0 ? (
                                    <Calendar
                                        selectedStart={calendarStart}
                                        selectedEnd={calendarEnd}
                                        onRangeSelect={handleRangeSelect}
                                        availability={availability}
                                    />
                                ) : (
                                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-alpine" /></div>
                                )}
                            </div>
                        </div>

                        {/* Times */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <h4 className="text-xs text-gray-400 uppercase mb-3">Horaires</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase block mb-1">Départ</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                        min={minStartTime || undefined}
                                        className="w-full p-2 glass-input rounded-lg text-sm text-white"
                                    />
                                    {minStartTime && (
                                        <p className="text-[9px] text-orange-400 mt-1 italic">
                                            Min: {minStartTime}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase block mb-1">Retour</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.endTime}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full p-2 glass-input rounded-lg text-sm text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Form */}
                    <div className="w-full lg:w-1/2 p-6 overflow-y-auto">
                        <form id="create-booking-form" onSubmit={handleSubmit} className="space-y-6">

                            {/* Vehicle Selection */}
                            <div className="space-y-4">
                                <h4 className="text-alpine text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <CalendarIcon className="w-3 h-3" /> Véhicule
                                </h4>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsVehicleMenuOpen(!isVehicleMenuOpen)}
                                        className={`w-full p-4 glass-input rounded-2xl text-left text-sm flex justify-between items-center transition-all ${isVehicleMenuOpen ? 'border-alpine shadow-[0_0_20px_rgba(0,81,255,0.2)]' : ''}`}
                                    >
                                        <span className={selectedVehicle ? 'text-white' : 'text-gray-500'}>
                                            {selectedVehicle 
                                                ? `${selectedVehicle.name} ${selectedVehicle.trim ? `- ${selectedVehicle.trim}` : ''} ${selectedVehicle.color ? `- ${selectedVehicle.color}` : ''}`
                                                : 'Sélectionner un véhicule'}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-alpine transition-transform ${isVehicleMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isVehicleMenuOpen && (
                                        <>
                                            {/* Backdrop to close click-outside overlay style */}
                                            <div className="fixed inset-0 z-10" onClick={() => setIsVehicleMenuOpen(false)}></div>
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-darkbg/90 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl z-20 animate-scale-in">
                                                {vehicles.map(v => (
                                                    <button
                                                        key={v.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, vehicle_id: v.id });
                                                            setSelectedVehicle(v);
                                                            setIsVehicleMenuOpen(false);
                                                        }}
                                                        className={`w-full p-4 text-left text-sm hover:bg-alpine/20 border-b border-white/5 last:border-0 transition-colors flex items-center justify-between ${formData.vehicle_id === v.id ? 'bg-alpine/10 text-white' : 'text-gray-400'}`}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="font-bold">
                                                                {v.name} {v.trim ? `- ${v.trim}` : ''} {v.color ? `- ${v.color}` : ''}
                                                            </span>
                                                        </div>
                                                        {formData.vehicle_id === v.id && <Check className="w-4 h-4 text-alpine" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Client */}
                            <div className="space-y-4">
                                <h4 className="text-alpine text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <User className="w-3 h-3" /> Client
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text" name="firstname" placeholder="Prénom" required
                                        value={formData.firstname}
                                        onChange={e => setFormData({ ...formData, firstname: e.target.value })}
                                        className="p-3 glass-input rounded-lg text-sm"
                                    />
                                    <input
                                        type="text" name="lastname" placeholder="Nom" required
                                        value={formData.lastname}
                                        onChange={e => setFormData({ ...formData, lastname: e.target.value })}
                                        className="p-3 glass-input rounded-lg text-sm"
                                    />
                                    <input
                                        type="email" name="email" placeholder="Email (Optionnel)"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="p-3 glass-input rounded-lg text-sm col-span-2"
                                    />
                                    <input
                                        type="tel" name="phone" placeholder="Téléphone (Optionnel)"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="p-3 glass-input rounded-lg text-sm col-span-2"
                                    />
                                    <input
                                        type="text" name="address" placeholder="Adresse complète (Optionnel)"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="p-3 glass-input rounded-lg text-sm col-span-2"
                                    />
                                </div>
                            </div>

                            {/* Documents (Optional) */}
                            <div className="space-y-4">
                                <h4 className="text-alpine text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Check className="w-3 h-3" /> Documents (Optionnel)
                                </h4>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 uppercase">Pièce d'identité</label>
                                        <input type="file" name="file_id" className="w-full text-xs text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 uppercase">Permis de conduire</label>
                                        <input type="file" name="file_license" className="w-full text-xs text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 uppercase">Justificatif de domicile</label>
                                        <input type="file" name="file_proof" className="w-full text-xs text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" />
                                    </div>
                                </div>
                            </div>

                            {/* Options & Price */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="mb-4">
                                    <label className="text-xs text-gray-400 uppercase mb-3 block">Kilométrage</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Limité Option */}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, mileage: 'standard' })}
                                            className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${formData.mileage === 'standard'
                                                ? 'border-alpine bg-alpine/10 shadow-[0_0_20px_rgba(0,81,255,0.3)]'
                                                : 'border-white/10 bg-white/5 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.mileage === 'standard' ? 'border-alpine' : 'border-white/30'
                                                    }`}>
                                                    {formData.mileage === 'standard' && (
                                                        <div className="w-2 h-2 rounded-full bg-alpine"></div>
                                                    )}
                                                </div>
                                                <span className={`font-oswald text-xs uppercase tracking-wider ${formData.mileage === 'standard' ? 'text-alpine' : 'text-white'
                                                    }`}>
                                                    Limité
                                                </span>
                                                <span className="text-[10px] text-gray-400">150 km/j</span>
                                            </div>
                                        </button>

                                        {/* Illimité Option */}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, mileage: 'unlimited' })}
                                            className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${formData.mileage === 'unlimited'
                                                ? 'border-alpine bg-alpine/10 shadow-[0_0_20px_rgba(0,81,255,0.3)]'
                                                : 'border-white/10 bg-white/5 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.mileage === 'unlimited' ? 'border-alpine' : 'border-white/30'
                                                    }`}>
                                                    {formData.mileage === 'unlimited' && (
                                                        <div className="w-2 h-2 rounded-full bg-alpine"></div>
                                                    )}
                                                </div>
                                                <span className={`font-oswald text-xs uppercase tracking-wider ${formData.mileage === 'unlimited' ? 'text-alpine' : 'text-white'
                                                    }`}>
                                                    Illimité
                                                </span>
                                                <span className="text-[10px] text-gray-400">Sans limite</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-xs text-gray-400 uppercase">Mode de Caution</label>
                                    <div className="relative min-w-[200px]">
                                        <button
                                            type="button"
                                            onClick={() => setIsDepositMenuOpen(!isDepositMenuOpen)}
                                            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white flex justify-between items-center hover:bg-white/10 transition-all ${isDepositMenuOpen ? 'border-alpine' : ''}`}
                                        >
                                            {formData.depositMethod === 'imprint' ? 'Empreinte CB' : 'Espèces (700€)'}
                                            <ChevronDown className={`w-3 h-3 text-alpine/50 transition-transform ${isDepositMenuOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isDepositMenuOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setIsDepositMenuOpen(false)}></div>
                                                <div className="absolute bottom-full mb-2 left-0 right-0 bg-darkbg/95 border border-white/10 backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl z-20 animate-scale-in">
                                                    {[
                                                        { id: 'imprint', label: 'Empreinte CB' },
                                                        { id: 'cash', label: 'Espèces (700€)' }
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({ ...formData, depositMethod: opt.id as any });
                                                                setIsDepositMenuOpen(false);
                                                            }}
                                                            className={`w-full p-3 text-left text-xs hover:bg-white/10 transition-colors ${formData.depositMethod === opt.id ? 'text-alpine' : 'text-gray-400'}`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                                    <span className="text-sm font-bold text-gray-300">Total Estimé</span>
                                    <span className="text-2xl font-oswald text-alpine font-bold">{price}€</span>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 uppercase block">Statut Initial</label>
                                <div className="flex gap-4 flex-wrap">
                                    <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                        <input
                                            type="radio" name="status" value="approved"
                                            checked={formData.status === 'approved'}
                                            onChange={() => setFormData({ ...formData, status: 'approved' })}
                                            className="accent-green-500"
                                        />
                                        Confirmée
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                        <input
                                            type="radio" name="status" value="pending"
                                            checked={formData.status === 'pending'}
                                            onChange={() => setFormData({ ...formData, status: 'pending' })}
                                            className="accent-yellow-500"
                                        />
                                        En Attente
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                        <input
                                            type="radio" name="status" value="awaiting_payment"
                                            checked={formData.status === 'awaiting_payment'}
                                            onChange={() => setFormData({ ...formData, status: 'awaiting_payment' })}
                                            className="accent-blue-500"
                                        />
                                        Paiement Attendu
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                        <input
                                            type="radio" name="status" value="rejected"
                                            checked={formData.status === 'rejected'}
                                            onChange={() => setFormData({ ...formData, status: 'rejected' })}
                                            className="accent-red-500"
                                        />
                                        Refusée
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 bg-white/5 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 text-sm text-gray-400 hover:text-white transition">
                        Annuler
                    </button>
                    <button
                        type="submit"
                        form="create-booking-form"
                        disabled={loading}
                        className="flex-1 py-3 bg-alpine text-white font-bold uppercase tracking-wider text-sm rounded hover:bg-alpine/90 transition flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Créer</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
