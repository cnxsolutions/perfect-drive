export interface Vehicle {
    id: string;
    created_at: string;
    updated_at: string;
    name: string;
    trim?: string; // e.g. "Esprit Alpine"
    brand: string;
    model: string;
    registration_number: string;
    color?: string;
    year?: number;
    seats: number;
    transmission: 'manual' | 'automatic';
    fuel_type: 'petrol' | 'diesel' | 'hybrid' | 'electric';
    daily_rate: number;
    weekend_rate?: number;
    mileage_standard_limit: number;
    mileage_excess_rate: number;
    is_available: boolean;
    insurance_until?: string;
    inspection_until?: string;
    description?: string;
    image_url?: string; // Main image
    images?: string[]; // Gallery images
    unlimited_rate?: number;
    weekend_unlimited_rate?: number;
    is_currently_rented?: boolean; // Attribut dynamique pour l'administration
    current_rental_state?: 'available' | 'rented' | 'departure_today' | 'return_today' | 'departure_and_return_today';
}

export interface CreateVehicleDTO {
    name: string;
    trim?: string;
    brand: string;
    model: string;
    registration_number: string;
    color?: string;
    year?: number;
    seats: number;
    transmission: 'manual' | 'automatic';
    fuel_type: 'petrol' | 'diesel' | 'hybrid' | 'electric';
    daily_rate: number;
    weekend_rate?: number;
    unlimited_rate?: number;
    weekend_unlimited_rate?: number;
    mileage_standard_limit: number;
    mileage_excess_rate: number;
    is_available: boolean;
    insurance_until?: string;
    inspection_until?: string;
    description?: string;
    image_url?: string;
    images?: string[];
}

export interface UpdateVehicleDTO extends Partial<CreateVehicleDTO> {
    id: string;
}
