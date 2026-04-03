import { differenceInCalendarDays, isSaturday, isSunday, addDays, isMonday, isFriday } from 'date-fns';
import { Vehicle } from '@/types/vehicle';

export type MileageType = 'standard' | 'unlimited';

export interface PriceResult {
    totalPrice: number;
    days: number;
    kmLimit: string;
    error: string | null;
}

// Helper: Get rate for a single weekday
function getWeekdayRate(mileage: MileageType, vehicle?: Vehicle): { price: number; km: number } {
    const dailyRate = Number(vehicle?.daily_rate || 60);
    const standardLimit = vehicle?.mileage_standard_limit || 150;

    if (mileage === 'unlimited') {
        const price = vehicle?.unlimited_rate || (dailyRate + 30);
        return { price, km: 0 };
    }
    return { price: dailyRate, km: standardLimit };
}

// Helper: Get weekend package rate
function getWeekendPackage(days: number, mileage: MileageType, vehicle?: Vehicle): { price: number; km: number } | null {
    const weekendRate = Number(vehicle?.weekend_rate || 150);
    const weekendUnlimitedRate = vehicle?.weekend_unlimited_rate || (weekendRate + 50);

    // 48h weekend (Fri-Sun)
    if (days === 2) {
        if (mileage === 'unlimited') {
            return { price: Number(weekendUnlimitedRate), km: 0 };
        }
        return { price: weekendRate, km: 350 };
    }

    return null;
}

// Main pricing calculation with optimization
export function calculatePrice(start: Date, end: Date, mileage: MileageType, vehicle?: Vehicle, isAdmin: boolean = false): PriceResult {
    // Validate inputs
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return {
            totalPrice: 0,
            days: 0,
            kmLimit: '',
            error: "Dates invalides."
        };
    }

    const days = differenceInCalendarDays(end, start);

    // Calculate precise duration in hours to enforce 20h minimum
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();
    const durationHours = (endTimestamp - startTimestamp) / (1000 * 60 * 60);

    if (durationHours < 0) {
        return {
            totalPrice: 0,
            days: 0,
            kmLimit: '',
            error: "Dates invalides."
        };
    }

    if (days <= 0) {
        const isWeekendDay = isFriday(start) || isSaturday(start) || isSunday(start);
        
        let rate: { price: number; km: number };
        if (isAdmin && isWeekendDay) {
            const weekendRate = Number(vehicle?.weekend_rate || 150);
            const weekendUnlimitedRate = vehicle?.weekend_unlimited_rate || (weekendRate + 50);
            if (mileage === 'unlimited') {
                rate = { price: weekendUnlimitedRate / 2, km: 0 };
            } else {
                rate = { price: weekendRate / 2, km: 350 / 2 };
            }
        } else {
            rate = getWeekdayRate(mileage, vehicle);
        }

        return {
            totalPrice: rate.price,
            days: 1, // Count as 1 day
            kmLimit: mileage === 'unlimited' ? 'Illimité' : `${rate.km} km`,
            error: null
        };
    }

    // Check if start is Saturday (blocked except for admin)
    if (!isAdmin && isSaturday(start)) {
        return {
            totalPrice: 0,
            days,
            kmLimit: '',
            error: "⛔ Départ impossible le samedi. Veuillez commencer le vendredi ou dimanche."
        };
    }

    // Check if return is Saturday (blocked except for admin)
    if (!isAdmin && isSaturday(end)) {
        return {
            totalPrice: 0,
            days,
            kmLimit: '',
            error: "⛔ Retour impossible le samedi. Veuillez inclure le week-end (Retour Lundi)."
        };
    }

    // Recursive function to find the optimal price path
    const memo = new Map<number, { price: number; breakdown: string; km: number }>();

    function solve(currentDate: Date): { price: number; breakdown: string; km: number } | null {
        const currentTimestamp = currentDate.getTime();
        if (memo.has(currentTimestamp)) {
            return memo.get(currentTimestamp)!;
        }

        const remainingDays = differenceInCalendarDays(end, currentDate);

        // Base case: Reached the end
        if (remainingDays === 0) {
            return { price: 0, breakdown: '', km: 0 };
        }

        // Base case: Overshot (invalid path)
        if (remainingDays < 0) {
            return null;
        }

        const options: { price: number; breakdown: string; km: number }[] = [];
        let dayRate = getWeekdayRate(mileage, vehicle);

        // --- Option 1: Weekday (1 day) ---
        const nextDay = addDays(currentDate, 1);

        if (isAdmin || !isSaturday(nextDay)) {
            if (isAdmin && (isFriday(currentDate) || isSaturday(currentDate) || isSunday(currentDate))) {
                const weekendRate = Number(vehicle?.weekend_rate || 150);
                const weekendUnlimitedRate = vehicle?.weekend_unlimited_rate || (weekendRate + 50);
                dayRate = mileage === 'unlimited' 
                    ? { price: weekendUnlimitedRate / 2, km: 0 }
                    : { price: weekendRate / 2, km: 350 / 2 };
            }

            const res = solve(nextDay);
            if (res) {
                options.push({
                    price: dayRate.price + res.price,
                    breakdown: `1j (${dayRate.price}€) + ` + res.breakdown,
                    km: dayRate.km + res.km
                });
            }
        }

        // --- Option 2: Weekend Package 48h (Fri-Sun) ---
        if (isFriday(currentDate) && remainingDays >= 2) {
            const target = addDays(currentDate, 2);
            const pkg = getWeekendPackage(2, mileage, vehicle);

            if (pkg) {
                const res = solve(target);
                if (res) {
                    options.push({
                        price: pkg.price + res.price,
                        breakdown: `Ven-Dim 48h (${pkg.price}€) + ` + res.breakdown,
                        km: pkg.km + res.km
                    });
                }
            }
        }


        let bestOption: { price: number; breakdown: string; km: number } | null = null;
        if (options.length > 0) {
            bestOption = options.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
        }

        if (bestOption) {
            memo.set(currentTimestamp, bestOption);
        }

        return bestOption;
    }

    const result = solve(start);

    if (!result) {
        return {
            totalPrice: 0,
            days,
            kmLimit: '',
            error: "Durée ou période invalide (combinaison impossible)."
        };
    }

    return {
        totalPrice: result.price,
        days,
        kmLimit: mileage === 'unlimited' ? 'Illimité' : `${result.km} km`,
        error: null
    };
}
