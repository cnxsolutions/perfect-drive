'use client';

import { useState } from 'react';
import { X, Calendar, User, Loader2, Check } from 'lucide-react';
import { createAdminBooking } from '@/actions/admin';
import { calculatePrice, MileageType } from '@/lib/pricing';
import { useRouter } from 'next/navigation';

export default function CreateBookingModal({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        startTime: '10:00',
        endTime: '18:00',
        mileage: 'standard' as MileageType,
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        status: 'approved',
        depositMethod: 'imprint' as 'imprint' | 'cash',
    });

    // Calculate price as derived state
    const price = (formData.startDate && formData.endDate)
        ? calculatePrice(
            new Date(formData.startDate),
            new Date(formData.endDate),
            formData.mileage
        ).totalPrice
        : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData(e.currentTarget as HTMLFormElement); // Automatically grabs inputs including files
        Object.entries(formData).forEach(([key, value]) => {
            // Only append state data if not already provided by form inputs (avoid duplicates if names match)
            if (!data.has(key)) {
                data.append(key, value);
            }
        });

        // Ensure state values override or supplement as needed
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-darkbg border border-white/10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="font-oswald text-lg uppercase tracking-widest text-white">Nouvelle Réservation</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Scrollable Form */}
                <div className="overflow-y-auto p-6 space-y-6">
                    <form id="create-booking-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* 1. Dates */}
                        <div className="space-y-4">
                            <h4 className="text-alpine text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Période & Horaires
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-500 uppercase">Départ</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full p-3 glass-input rounded-lg text-sm text-white"
                                    />
                                    <input
                                        type="time"
                                        required
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full p-2 glass-input rounded-lg text-xs text-gray-300"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-500 uppercase">Retour</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full p-3 glass-input rounded-lg text-sm text-white"
                                    />
                                    <input
                                        type="time"
                                        required
                                        value={formData.endTime}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full p-2 glass-input rounded-lg text-xs text-gray-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Client */}
                        <div className="space-y-4">
                            <h4 className="text-alpine text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <User className="w-3 h-3" /> Client
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text" placeholder="Prénom" required
                                    value={formData.firstname}
                                    onChange={e => setFormData({ ...formData, firstname: e.target.value })}
                                    className="p-3 glass-input rounded-lg text-sm"
                                />
                                <input
                                    type="text" placeholder="Nom" required
                                    value={formData.lastname}
                                    onChange={e => setFormData({ ...formData, lastname: e.target.value })}
                                    className="p-3 glass-input rounded-lg text-sm"
                                />
                            </div>
                            <input
                                type="email" placeholder="Email" required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-3 glass-input rounded-lg text-sm"
                            />
                            <input
                                type="tel" placeholder="Téléphone" required
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full p-3 glass-input rounded-lg text-sm"
                            />
                        </div>

                        {/* 3. Documents (Optionnel) */}
                        <div className="space-y-4">
                            <h4 className="text-alpine text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <span>Documents (Optionnel)</span>
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                                <label className="text-xs text-gray-400">Pièce d&apos;identité</label>
                                <input type="file" name="file_id" className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" />

                                <label className="text-xs text-gray-400">Permis de conduire</label>
                                <input type="file" name="file_license" className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" />

                                <label className="text-xs text-gray-400">Justificatif de domicile</label>
                                <input type="file" name="file_proof" className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" />
                            </div>
                        </div>

                        {/* 3. Options & Price */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs text-gray-400 uppercase">Kilométrage</label>
                                <select
                                    value={formData.mileage}
                                    onChange={e => setFormData({ ...formData, mileage: e.target.value as MileageType })}
                                    className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                >
                                    <option value="standard">Standard</option>
                                    <option value="unlimited">Illimité</option>
                                </select>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs text-gray-400 uppercase">Mode de Caution</label>
                                <select
                                    value={formData.depositMethod}
                                    onChange={e => setFormData({ ...formData, depositMethod: e.target.value as 'imprint' | 'cash' })}
                                    className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                >
                                    <option value="imprint">Empreinte CB</option>
                                    <option value="cash">Espèces (700€)</option>
                                </select>
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
                                        type="radio" name="status" value="approved"
                                        checked={formData.status === 'approved'}
                                        onChange={() => setFormData({ ...formData, status: 'approved' })}
                                        className="accent-green-500"
                                    />
                                    Confirmée
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
