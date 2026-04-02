'use client';

import { useState } from 'react';
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
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
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Aucun véhicule disponible</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Véhicule</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Immatriculation</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Tarif jour</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Disponibilité</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map(vehicle => (
                                <tr key={vehicle.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-gray-900">{vehicle.name}</p>
                                            <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{vehicle.registration_number}</td>
                                    <td className="px-4 py-3 text-gray-700">{vehicle.daily_rate}€</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                            vehicle.is_available 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {vehicle.is_available ? 'Disponible' : 'Indisponible'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleToggleAvailability(vehicle.id, vehicle.is_available)}
                                                disabled={loading}
                                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition"
                                                title={vehicle.is_available ? 'Marquer comme indisponible' : 'Marquer comme disponible'}
                                            >
                                                {vehicle.is_available ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                            <button
                                                onClick={() => setEditingId(vehicle.id)}
                                                className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded transition"
                                                title="Modifier"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vehicle.id)}
                                                disabled={loading}
                                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded transition"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
