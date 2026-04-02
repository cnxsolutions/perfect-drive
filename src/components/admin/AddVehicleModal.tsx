'use client';

import { useState } from 'react';
import { X, Loader2, Plus, Car } from 'lucide-react';
import { createVehicle } from '@/actions/admin';
import VehicleForm from './VehicleForm';

export default function AddVehicleModal({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);

        try {
            const result = await createVehicle(formData);
            
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
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-darkbg border border-white/10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
                
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 px-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-alpine/20 rounded-lg">
                            <Car className="w-5 h-5 text-alpine" />
                        </div>
                        <h3 className="font-oswald text-lg uppercase tracking-widest text-white">Nouveau Véhicule</h3>
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
                    
                    <VehicleForm 
                        onSubmit={handleSubmit} 
                        loading={loading} 
                        buttonText="Ajouter le véhicule"
                    />
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
                        disabled={loading}
                        className="flex-[2] py-3 bg-alpine text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-alpine/90 transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,81,255,0.3)] disabled:opacity-50 disabled:shadow-none"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        {loading ? 'Création en cours...' : 'Ajouter le véhicule'}
                    </button>
                </div>
            </div>
        </div>
    );
}
