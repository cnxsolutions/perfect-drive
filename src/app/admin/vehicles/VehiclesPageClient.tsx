'use client';

import { useState } from 'react';
import { Plus, Car } from 'lucide-react';
import { Vehicle } from '@/types/vehicle';
import { getVehicles } from '@/actions/admin';
import AddVehicleModal from '@/components/admin/AddVehicleModal';
import VehicleList from '@/components/admin/VehicleList';

export default function VehiclesPageClient({ initialVehicles }: { initialVehicles: Vehicle[] }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRefresh = async () => {
        setLoading(true);
        const result = await getVehicles();
        if (result.success && result.vehicles) {
            setVehicles(result.vehicles);
        }
        setLoading(false);
    };

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-8">
                <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <p className="text-gray-400 text-sm">
                        Total: <span className="text-white font-bold">{vehicles.length}</span> véhicule{vehicles.length > 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-alpine text-white rounded font-bold uppercase tracking-wider text-sm hover:bg-alpine/90 transition"
                >
                    <Plus size={18} />
                    Ajouter un véhicule
                </button>
            </div>

            {/* Vehicle List */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <VehicleList vehicles={vehicles} onRefresh={handleRefresh} />
            </div>

            {/* Add Vehicle Modal */}
            {showAddModal && (
                <AddVehicleModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleRefresh}
                />
            )}
        </div>
    );
}
