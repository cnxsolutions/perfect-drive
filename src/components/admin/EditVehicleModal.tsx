'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Save, Car } from 'lucide-react';
import { getVehicleById, updateVehicle } from '@/actions/admin';
import { Vehicle } from '@/types/vehicle';
import VehicleForm from './VehicleForm';

export default function EditVehicleModal({ vehicleId, onClose, onSuccess }: { vehicleId: string; onClose: () => void; onSuccess?: () => void }) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);

    useEffect(() => {
        const fetchVehicle = async () => {
            setLoading(true);
            const result = await getVehicleById(vehicleId);
            if (result.success && result.vehicle) {
                setVehicle(result.vehicle);
            } else {
                setError('Impossible de charger le véhicule');
            }
            setLoading(false);
        };
        fetchVehicle();
    }, [vehicleId]);

    const handleSubmit = async (formData: FormData) => {
        setSubmitting(true);
        setError(null);

        try {
            const result = await updateVehicle(vehicleId, formData);
            
            if (!result.success) {
                setError(result.error || 'Une erreur est survenue');
                return;
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            setError('Une erreur inattendue est survenue');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="bg-darkbg p-8 rounded-2xl border border-white/10 flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-alpine" size={40} />
                    <p className="text-gray-400 font-oswald uppercase tracking-widest text-xs">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-darkbg border border-white/10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
                
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 px-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-alpine/20 rounded-lg">
                            <Car className="w-5 h-5 text-alpine" />
                        </div>
                        <h3 className="font-oswald text-lg uppercase tracking-widest text-white">Modifier le véhicule</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition group">
                        <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="m-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {error}
                        </div>
                    )}
                    
                    {vehicle && (
                        <VehicleForm 
                            initialData={vehicle}
                            onSubmit={handleSubmit} 
                            loading={submitting} 
                            buttonText="Enregistrer les modifications"
                        />
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 bg-white/5 flex gap-4">
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-3 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-white transition"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        form="vehicle-form"
                        disabled={submitting}
                        className="flex-[2] py-3 bg-alpine text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-alpine/90 transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,81,255,0.3)] disabled:opacity-50 disabled:shadow-none"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {submitting ? 'Sauvegarde...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    );
}
