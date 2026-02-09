import { differenceInCalendarDays, isSaturday, isSunday, addDays } from 'date-fns';

export type MileageType = 'standard' | 'unlimited';

export interface PriceResult {
    totalPrice: number;
    days: number;
    kmLimit: string;
    error: string | null;
}

export function calculatePrice(start: Date, end: Date, mileage: MileageType): PriceResult {
    const days = differenceInCalendarDays(end, start);

    // Basic validations
    if (days <= 0) {
        return {
            totalPrice: mileage === 'unlimited' ? 90 : 60,
            days: 0,
            kmLimit: mileage === 'unlimited' ? "Illimité" : "150 km",
            error: null
        };
    }

    let isWeekendBooking = false;
    const endIsSaturday = isSaturday(end);

    // Check if range includes weekend
    for (let i = 0; i <= days; i++) {
        const d = addDays(start, i);
        if (isSaturday(d) || isSunday(d)) isWeekendBooking = true;
    }

    if (endIsSaturday) {
        return { totalPrice: 0, days, kmLimit: '', error: "⛔ Retour impossible le samedi. Veuillez inclure le week-end (Retour Lundi)." };
    }

    if (isWeekendBooking) {
        if (days < 2) {
            const error = isSunday(start) ? "Pas de location 24h le dimanche." : "Minimum 48h le week-end";
            return { totalPrice: 0, days, kmLimit: '', error };
        }

        if (days === 2) { // 48h
            return {
                totalPrice: mileage === 'unlimited' ? 200 : 150,
                days,
                kmLimit: mileage === 'unlimited' ? "Illimité" : "350 km",
                error: null
            };
        }

        if (days === 3) { // 72h
            return {
                totalPrice: mileage === 'unlimited' ? 280 : 200,
                days,
                kmLimit: mileage === 'unlimited' ? "Illimité" : "400 km",
                error: null
            };
        }

        // Weekend + Extra days (Custom rate for now falls back to daily)
        const rate = mileage === 'unlimited' ? 95 : 70;
        return {
            totalPrice: days * rate,
            days,
            kmLimit: mileage === 'unlimited' ? "Illimité" : `${days * 150} km`,
            error: null
        };
    }

    // Weekdays
    if (days === 5) {
        return {
            totalPrice: mileage === 'unlimited' ? 350 : 250,
            days,
            kmLimit: mileage === 'unlimited' ? "Illimité" : "700 km",
            error: null
        };
    }

    const rate = mileage === 'unlimited' ? 90 : 60;
    return {
        totalPrice: days * rate,
        days,
        kmLimit: mileage === 'unlimited' ? "Illimité" : `${days * 150} km`,
        error: null
    };
}
