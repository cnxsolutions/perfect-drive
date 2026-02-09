import { differenceInCalendarDays, isSaturday, isSunday, addDays, isMonday, isFriday } from 'date-fns';

export type MileageType = 'standard' | 'unlimited';

export interface PriceResult {
    totalPrice: number;
    days: number;
    kmLimit: string;
    error: string | null;
}

interface PriceCombination {
    totalPrice: number;
    kmLimit: string;
    breakdown: string;
}

// Helper: Check if a date is weekend (Sat or Sun)
function isWeekend(date: Date): boolean {
    return isSaturday(date) || isSunday(date);
}

// Helper: Get rate for a single weekday
function getWeekdayRate(mileage: MileageType): { price: number; km: number } {
    return mileage === 'unlimited'
        ? { price: 90, km: 0 }
        : { price: 60, km: 150 };
}

// Helper: Get special rate for 5 consecutive weekdays
function getWeekdayPackage(days: number, mileage: MileageType): { price: number; km: number } | null {
    if (days === 5) {
        return mileage === 'unlimited'
            ? { price: 350, km: 0 }
            : { price: 250, km: 700 };
    }
    return null;
}

// Helper: Get weekend package rate
function getWeekendPackage(days: number, mileage: MileageType, endsOnSunday: boolean = false): { price: number; km: number } | null {
    // Friday-Sunday ending exactly on Sunday = 72h package pricing
    if (days === 2 && endsOnSunday) {
        return mileage === 'unlimited'
            ? { price: 280, km: 0 }
            : { price: 200, km: 400 };
    }

    if (days === 2) { // 48h weekend
        return mileage === 'unlimited'
            ? { price: 200, km: 0 }
            : { price: 150, km: 350 };
    }

    if (days === 3) { // 72h weekend
        return mileage === 'unlimited'
            ? { price: 280, km: 0 }
            : { price: 200, km: 400 };
    }
    return null;
}

// Main pricing calculation with optimization
export function calculatePrice(start: Date, end: Date, mileage: MileageType): PriceResult {
    const days = differenceInCalendarDays(end, start);

    // Basic validations
    if (days <= 0) {
        const rate = getWeekdayRate(mileage);
        return {
            totalPrice: rate.price,
            days: 0,
            kmLimit: mileage === 'unlimited' ? 'Illimité' : `${rate.km} km`,
            error: null
        };
    }

    // Check if return is Saturday (blocked)
    if (isSaturday(end)) {
        return {
            totalPrice: 0,
            days,
            kmLimit: '',
            error: "⛔ Retour impossible le samedi. Veuillez inclure le week-end (Retour Lundi)."
        };
    }

    // Check if period includes weekend
    let hasWeekend = false;
    for (let i = 0; i <= days; i++) {
        if (isWeekend(addDays(start, i))) {
            hasWeekend = true;
            break;
        }
    }

    // Pure weekday booking (no weekend)
    if (!hasWeekend) {
        const pkg = getWeekdayPackage(days, mileage);
        if (pkg) {
            return {
                totalPrice: pkg.price,
                days,
                kmLimit: mileage === 'unlimited' ? 'Illimité' : `${pkg.km} km`,
                error: null
            };
        }

        const rate = getWeekdayRate(mileage);
        return {
            totalPrice: days * rate.price,
            days,
            kmLimit: mileage === 'unlimited' ? 'Illimité' : `${days * rate.km} km`,
            error: null
        };
    }

    // Weekend booking - check minimum duration
    if (days < 2) {
        const error = isSunday(start) ? "Pas de location 24h le dimanche." : "Minimum 48h le week-end";
        return { totalPrice: 0, days, kmLimit: '', error };
    }

    // Pure weekend booking
    if (isFriday(start) && (isSunday(end) || isMonday(end))) {
        const endsOnSunday = isSunday(end);
        const pkg = getWeekendPackage(days, mileage, endsOnSunday);
        if (pkg) {
            return {
                totalPrice: pkg.price,
                days,
                kmLimit: mileage === 'unlimited' ? 'Illimité' : `${pkg.km} km`,
                error: null
            };
        }
    }

    // Mixed booking: optimize
    const combinations: PriceCombination[] = [];
    const rate = getWeekdayRate(mileage);

    // Find Friday in range and calculate optimal combinations
    for (let i = 0; i <= days; i++) {
        const currentDay = addDays(start, i);

        if (isFriday(currentDay)) {
            // Try Fri-Sun (2 calendar days)
            const sunday = addDays(currentDay, 2);

            // Check if this Sunday is within our range
            if (differenceInCalendarDays(sunday, start) <= days) {
                const afterDays = differenceInCalendarDays(end, sunday);

                // Special case: if end IS this Sunday, use 72h pricing
                if (afterDays === 0 && isSunday(end)) {
                    const weekendPkg = getWeekendPackage(2, mileage, true); // 72h pricing for Fri-Sun

                    if (weekendPkg) {
                        // Count weekdays BEFORE Friday (excluding Thursday)
                        // If Friday is at i=3, we want 2 days (Tue+Wed), not 3
                        const beforeDays = Math.max(0, i - 1);
                        const beforePrice = beforeDays * rate.price;
                        const beforeKm = beforeDays * rate.km;

                        const totalPrice = beforePrice + weekendPkg.price;
                        const totalKm = mileage === 'unlimited'
                            ? 'Illimité'
                            : `${beforeKm + weekendPkg.km} km`;

                        combinations.push({
                            totalPrice,
                            kmLimit: totalKm,
                            breakdown: `${beforeDays}j sem (${beforePrice}€) + Ven-Dim 72h (${weekendPkg.price}€)`
                        });
                    }
                }
            }

            // Try Fri-Mon (3 calendar days)
            const monday = addDays(currentDay, 3);

            if (differenceInCalendarDays(monday, start) <= days) {
                const weekendPkg = getWeekendPackage(3, mileage, false);

                if (weekendPkg) {
                    const beforeDays = Math.max(0, i - 1); // Same logic: exclude Thursday
                    const afterDays = differenceInCalendarDays(end, monday);

                    const beforePrice = beforeDays * rate.price;
                    const beforeKm = beforeDays * rate.km;
                    const afterPrice = afterDays * rate.price;
                    const afterKm = afterDays * rate.km;

                    const totalPrice = beforePrice + weekendPkg.price + afterPrice;
                    const totalKm = mileage === 'unlimited'
                        ? 'Illimité'
                        : `${beforeKm + weekendPkg.km + afterKm} km`;

                    combinations.push({
                        totalPrice,
                        kmLimit: totalKm,
                        breakdown: `${beforeDays}j sem (${beforePrice}€) + Ven-Lun 72h (${weekendPkg.price}€) + ${afterDays}j sem (${afterPrice}€)`
                    });
                }
            }
        }
    }

    // Fallback: mixed rate
    const mixedRate = mileage === 'unlimited' ? 95 : 70;
    combinations.push({
        totalPrice: days * mixedRate,
        kmLimit: mileage === 'unlimited' ? 'Illimité' : `${days * 150} km`,
        breakdown: `${days}j tarif mixte (${mixedRate}€/j)`
    });

    // Return cheapest
    const best = combinations.reduce((min, combo) =>
        combo.totalPrice < min.totalPrice ? combo : min
    );

    return {
        totalPrice: best.totalPrice,
        days,
        kmLimit: best.kmLimit,
        error: null
    };
}
