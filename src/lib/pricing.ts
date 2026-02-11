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
    // 48h weekend
    if (days === 2) {
        return mileage === 'unlimited'
            ? { price: 200, km: 0 }
            : { price: 150, km: 350 };
    }

    // 72h weekend
    if (days === 3) {
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
    if (days < 0) { // Should be days <= 0? Wait, differenceInCalendarDays returns integer days.
        // If same day, days = 0.
    }

    // Calculate precise duration in hours to enforce 20h minimum
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();
    const durationHours = (endTimestamp - startTimestamp) / (1000 * 60 * 60);

    if (durationHours < 20) {
        return {
            totalPrice: 0,
            days: 0,
            kmLimit: '',
            error: "⚠️ La durée pour une location est de 20h minimum."
        };
    }

    if (days <= 0 && durationHours < 24) {
        // Handle same-day or <24h but >20h logic if needed, 
        // currently covered by getWeekdayRate or handled as 1 day.
        // If days=0 (same calendar day), differenceInCalendarDays is 0.
        // But we might have 20h on same day? (e.g. 02:00 to 23:00).
        // The existing logic used `if (days <= 0)`.
    }

    if (days <= 0) {
        // If it's less than 24h (and passed 20h check), we charge 1 day rate?
        const rate = getWeekdayRate(mileage);
        return {
            totalPrice: rate.price,
            days: 1, // Count as 1 day
            kmLimit: mileage === 'unlimited' ? 'Illimité' : `${rate.km} km`,
            error: null
        };
    }

    // Check if start is Saturday (blocked)
    if (isSaturday(start)) {
        return {
            totalPrice: 0,
            days,
            kmLimit: '',
            error: "⛔ Départ impossible le samedi. Veuillez commencer le vendredi ou dimanche."
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

    // Recursive function to find the optimal price path
    // Memoization map: date string -> result
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

        let bestOption: { price: number; breakdown: string; km: number } | null = null;
        const rate = getWeekdayRate(mileage);

        // --- Option 1: Weekday (1 day) ---
        const nextDay = addDays(currentDate, 1);

        // Allowed if:
        // 1. We don't land on Saturday (blocked return)
        // 2. OR Exception: Sun->Mon (24h) is allowed.

        if (!isSaturday(nextDay)) {
            const res = solve(nextDay);
            if (res) {
                const optionPrice = rate.price + res.price;
                const option = {
                    price: optionPrice,
                    breakdown: `1j (${rate.price}€) + ` + res.breakdown,
                    km: rate.km + res.km
                };

                if (!bestOption) {
                    bestOption = option;
                } else if (option.price < bestOption.price) {
                    bestOption = option;
                }
            }
        }

        // --- Option 2: Weekend Package 48h (Fri-Sun) ---
        if (isFriday(currentDate) && remainingDays >= 2) {
            const target = addDays(currentDate, 2);
            const pkg = getWeekendPackage(2, mileage, true); // 48h

            if (pkg) {
                const res = solve(target);
                if (res) {
                    const price = pkg.price + res.price;
                    const option = {
                        price,
                        breakdown: `Ven-Dim 48h (${pkg.price}€) + ` + res.breakdown,
                        km: pkg.km + res.km
                    };
                    if (!bestOption) {
                        bestOption = option;
                    } else if (price < bestOption.price) {
                        bestOption = option;
                    }
                }
            }
        }

        // --- Option 3: Weekend Package 72h (Fri-Mon) ---
        if (isFriday(currentDate) && remainingDays >= 3) {
            const target = addDays(currentDate, 3);
            const pkg = getWeekendPackage(3, mileage, false); // 72h
            if (pkg) {
                const res = solve(target);
                if (res) {
                    const price = pkg.price + res.price;
                    const option = {
                        price,
                        breakdown: `Ven-Lun 72h (${pkg.price}€) + ` + res.breakdown,
                        km: pkg.km + res.km
                    };
                    if (!bestOption) {
                        bestOption = option;
                    } else if (price < bestOption.price) {
                        bestOption = option;
                    }
                }
            }
        }

        memo.set(currentTimestamp, bestOption!);
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
