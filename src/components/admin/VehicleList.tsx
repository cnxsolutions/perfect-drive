'use client';

import { useState } from 'react';
import { Edit2, Trash2, Eye, EyeOff, Car } from 'lucide-react';
import { Vehicle } from '@/types/vehicle';
import { deleteVehicle, toggleVehicleAvailability } from '@/actions/admin';
import EditVehicleModal from './EditVehicleModal';

interface VehicleListProps {
    vehicles: Vehicle[];
    onRefresh: () => void;
}

export default function VehicleList({ vehicles, onRefresh }: VehicleListProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule?')) return;
        
        setLoading(true);
        const result = await deleteVehicle(id);
        setLoading(false);
        
        if (result.success) {
            onRefresh();
        } else {
            alert(result.error);
        }
    };

    const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
        setLoading(true);
        const result = await toggleVehicleAvailability(id, !isAvailable);
        setLoading(false);
        
        if (result.success) {
            onRefresh();
        } else {
            alert(result.error);
        }
    };

    return (
        <div className="space-y-4">
            {vehicles.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 bg-white/5">
                    <p className="text-gray-400 font-oswald tracking-widest uppercase">Aucun véhicule disponible</p>
                </div>
            ) : (
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-2xl">
                    {/* Header Row (Desktop only) */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-white/5 border-b border-white/10 text-[10px] font-semibold text-gray-400 uppercase tracking-widest sticky top-0 z-10">
                        <div className="col-span-5">Véhicule</div>
                        <div className="col-span-3">Tarifs (Std / Illimité)</div>
                        <div className="col-span-2 text-center">Statut</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>
                    
                    {/* List */}
                    <div className="flex flex-col divide-y divide-white/5">
                        {vehicles.map(vehicle => (
                            <div key={vehicle.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-4 md:px-6 py-3 hover:bg-white/[0.02] transition-colors group">
                                
                                {/* Voiture */}
                                <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                                    <div className="w-12 h-12 relative rounded-md border border-white/10 flex-shrink-0 bg-[#222] overflow-hidden">
                                        {vehicle.image_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={vehicle.image_url} alt={vehicle.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center opacity-30">
                                                <Car className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {vehicle.name}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-gray-500">
                                            {vehicle.trim && (
                                                <span className="truncate max-w-[120px]">{vehicle.trim}</span>
                                            )}
                                            {vehicle.trim && vehicle.color && <span>•</span>}
                                            {vehicle.color && (
                                                <span className="truncate">{vehicle.color}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tarifs */}
                                <div className="col-span-1 md:col-span-3 flex flex-col justify-center text-xs text-gray-400 gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 text-gray-600 font-mono text-[10px]">24H</span>
                                        <span className="text-gray-300 w-8">{vehicle.daily_rate}€</span>
                                        <span className="text-gray-700">/</span>
                                        <span className="text-white font-medium">{vehicle.unlimited_rate || (vehicle.daily_rate + 30)}€</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 text-gray-600 font-mono text-[10px]">48H</span>
                                        <span className="text-gray-300 w-8">{vehicle.weekend_rate || 0}€</span>
                                        <span className="text-gray-700">/</span>
                                        <span className="text-white font-medium">{vehicle.weekend_unlimited_rate || ((vehicle.weekend_rate || 0) + 50)}€</span>
                                    </div>
                                </div>

                                {/* Disponibilité / Statut */}
                                <div className="col-span-1 md:col-span-2 flex flex-col md:items-center justify-center gap-2">
                                    <div className="flex items-center gap-2">
                                        {vehicle.current_rental_state === 'rented' && (
                                            <><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span><span className="text-[11px] text-red-500 font-medium">En location</span></>
                                        )}
                                        {vehicle.current_rental_state === 'departure_today' && (
                                            <><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span><span className="text-[11px] text-blue-500 font-medium">Départ Auj.</span></>
                                        )}
                                        {vehicle.current_rental_state === 'return_today' && (
                                            <><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span><span className="text-[11px] text-orange-500 font-medium">Retour Auj.</span></>
                                        )}
                                        {vehicle.current_rental_state === 'departure_and_return_today' && (
                                            <><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span><span className="text-[11px] text-purple-400 font-medium">Dép. & Ret.</span></>
                                        )}
                                        {(!vehicle.current_rental_state || vehicle.current_rental_state === 'available') && (
                                            <><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span><span className="text-[11px] text-gray-300 font-medium">Disponible</span></>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => handleToggleAvailability(vehicle.id, vehicle.is_available)}
                                        disabled={loading}
                                        className={`text-[10px] flex items-center gap-1.5 transition-colors ${
                                            vehicle.is_available 
                                                ? 'text-gray-500 hover:text-gray-300' 
                                                : 'text-red-500/80 hover:text-red-400'
                                        }`}
                                    >
                                        {vehicle.is_available ? <><Eye className="w-3 h-3"/> Visible</> : <><EyeOff className="w-3 h-3"/> Masqué</>}
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 md:col-span-2 flex items-center md:justify-end gap-2 mt-3 md:mt-0 pt-3 md:pt-0 border-t border-white/5 md:border-none">
                                    <button
                                        onClick={() => setEditingId(vehicle.id)}
                                        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                        title="Modifier"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    
                                    <button
                                        onClick={() => handleDelete(vehicle.id)}
                                        disabled={loading}
                                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingId && (
                <EditVehicleModal
                    vehicleId={editingId}
                    onClose={() => setEditingId(null)}
                    onSuccess={() => {
                        setEditingId(null);
                        onRefresh();
                    }}
                />
            )}
        </div>
    );
}
