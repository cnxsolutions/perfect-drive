'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DateAvailability } from '@/types/booking';

interface CalendarProps {
    selectedStart: Date | null;
    selectedEnd: Date | null;
    onRangeSelect: (start: Date | null, end: Date | null) => void;
    availability: DateAvailability[];
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function Calendar({ selectedStart, selectedEnd, onRangeSelect, availability }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Adjust for Monday start
    };

    const handleDayClick = (day: number) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        clickedDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (clickedDate < today) return;

        if (!selectedStart || (selectedStart && selectedEnd)) {
            onRangeSelect(clickedDate, null);
        } else {
            if (clickedDate < selectedStart) {
                onRangeSelect(clickedDate, selectedStart);
            } else {
                onRangeSelect(selectedStart, clickedDate);
            }
        }
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const formatDateLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getAvailabilityForDate = (dateString: string): DateAvailability | undefined => {
        return availability.find(a => a.date === dateString);
    };

    const renderDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDayParam = getFirstDayOfMonth(currentDate);
        const blanks = Array.from({ length: firstDayParam }, (_, i) => <div key={`blank-${i}`} />);

        const days = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            date.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isPast = date < today;

            let isSelected = false;
            let isRange = false;

            if (selectedStart) {
                const start = new Date(selectedStart);
                start.setHours(0, 0, 0, 0);
                if (date.getTime() === start.getTime()) isSelected = true;

                if (selectedEnd) {
                    const end = new Date(selectedEnd);
                    end.setHours(0, 0, 0, 0);
                    if (date.getTime() === end.getTime()) isSelected = true;
                    if (date > start && date < end) isRange = true;
                }
            }

            // Check availability
            const dateString = formatDateLocal(date);
            const dateAvailability = getAvailabilityForDate(dateString);
            const isFullyBlocked = dateAvailability?.isFullyBlocked || false;

            // Only show partial availability for END dates (isEndDate = true)
            // Start and middle dates should remain fully blocked
            const hasEndDateBooking = dateAvailability?.existingBookings.some(b => b.isEndDate) || false;
            const hasStartDateBooking = dateAvailability?.existingBookings.some(b => b.isStartDate) || false;

            // Block if day has BOTH return and departure (Turnover day)
            const isTurnoverDay = hasEndDateBooking && hasStartDateBooking;

            // If there are bookings but none are end dates, treat as fully blocked
            const hasNonEndDateBookings = dateAvailability?.existingBookings.some(b => !b.isEndDate) || false;

            // Block if:
            // 1. Fully blocked by admin/full day
            // 2. Has bookings but is NOT an end date (i.e. start or middle day)
            // 3. Is a turnover day (both end and start)
            const shouldBeBlocked = isFullyBlocked || (hasNonEndDateBookings && !hasEndDateBooking) || isTurnoverDay;

            const hasPartialAvailability = !isFullyBlocked && hasEndDateBooking && !isTurnoverDay;

            // Get return and departure times for partial availability display
            let returnTimeText = '';
            let departTimeText = '';

            if (dateAvailability && !isFullyBlocked) {
                // Return Time (for end dates)
                const latestReturn = dateAvailability.existingBookings
                    .filter(b => b.isEndDate)
                    .sort((a, b) => b.endTime.localeCompare(a.endTime))[0];

                if (latestReturn) {
                    returnTimeText = latestReturn.endTime.substring(0, 5);
                }

                // Departure Time (for start dates)
                const earliestDepart = dateAvailability.existingBookings
                    .filter(b => b.isStartDate)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

                if (earliestDepart) {
                    departTimeText = earliestDepart.startTime.substring(0, 5);
                }
            }

            // Check if selection overlaps with blocked dates
            let isRangeBlocked = false;
            if (selectedStart && !selectedEnd && !isPast && !isFullyBlocked) {
                const start = new Date(selectedStart);
                start.setHours(0, 0, 0, 0);

                // If hovering or clicking a date after start
                if (date > start) {
                    // Check all days between start and current date
                    const daysDiff = (date.getTime() - start.getTime()) / (1000 * 3600 * 24);
                    for (let i = 1; i < daysDiff; i++) {
                        const checkDate = new Date(start);
                        checkDate.setDate(checkDate.getDate() + i);
                        const checkString = formatDateLocal(checkDate);
                        const checkAvail = getAvailabilityForDate(checkString);

                        // If any day in between is fully blocked (or is a start/middle day of another booking), the range is invalid
                        if (checkAvail?.isFullyBlocked) {
                            isRangeBlocked = true;
                            break;
                        }
                        // Check if it's a middle day (has bookings but neither start nor end) - should be blocked
                        const isMiddleDay = checkAvail?.existingBookings.some(b => !b.isStartDate && !b.isEndDate);
                        if (isMiddleDay) {
                            isRangeBlocked = true;
                            break;
                        }
                    }
                }
            }

            const isDisabled = shouldBeBlocked || isRangeBlocked;

            return (
                <div
                    key={day}
                    onClick={() => !isPast && !isDisabled && handleDayClick(day)}
                    className={twMerge(
                        clsx(
                            "relative aspect-square flex flex-col items-center justify-center rounded-lg font-montserrat text-sm font-medium transition-all duration-200",
                            {
                                "opacity-30 cursor-not-allowed text-gray-500": isPast || (isRangeBlocked && !isFullyBlocked), // Visual blocked state for invalid ranges
                                "cursor-pointer hover:bg-white/10 border border-white/5 bg-white/5": !isPast && !isDisabled && !hasPartialAvailability,
                                "bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed": isDisabled && !isPast,
                                "cursor-pointer hover:bg-orange-500/10 border border-orange-500/30 bg-orange-500/5": hasPartialAvailability && !isDisabled && !isPast,
                                "bg-alpine border-blue-500 text-white shadow-[0_0_15px_rgba(0,81,255,0.6)] font-bold": isSelected,
                                "bg-alpine/20 text-blue-200 border-alpine/30": isRange,
                                "bg-red-900/20 border-red-500/50 opacity-50": isRangeBlocked && !isPast // Specific style for blocked range attempt
                            }
                        )
                    )}
                >
                    <span>{day}</span>
                    {!isSelected && !isRange && (
                        <div className="absolute bottom-0.5 left-0 right-0 flex flex-col items-center justify-center gap-0 leading-none">
                            {returnTimeText && (
                                <span className="text-[7px] md:text-[8px] text-orange-400 font-bold">Retour {returnTimeText}</span>
                            )}
                            {departTimeText && (
                                <span className="text-[7px] md:text-[8px] text-blue-400 font-bold">Départ {departTimeText}</span>
                            )}
                        </div>
                    )}
                </div>
            );
        });

        return [...blanks, ...days];
    };

    return (
        <div className="glass-panel p-4 lg:p-6 md:p-8 rounded-2xl animate-fade-in-up">
            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end mb-6 lg:mb-8 gap-4">
                <h3 className="font-oswald text-lg lg:text-xl text-alpine tracking-[0.2em] uppercase flex items-center gap-3">
                    <span className="text-2xl lg:text-3xl font-bold text-white/20">01.</span> Disponibilités
                </h3>
                <div className="flex gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition text-white">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-oswald text-lg capitalize py-1 px-3 min-w-[140px] text-center text-white">
                        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition text-white">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-alpine uppercase">
                {DAYS.map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {renderDays()}
            </div>

            <div className="flex flex-wrap justify-center gap-4 lg:gap-6 mt-6 text-[9px] lg:text-[10px] uppercase tracking-widest font-oswald text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-white/10 border border-white/20"></div>
                    <span>Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-500/10 border border-orange-500/30"></div>
                    <span className="text-orange-400">Dispo partielle</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-alpine border border-blue-500 shadow-[0_0_8px_rgba(0,81,255,0.6)]"></div>
                    <span className="text-white">Votre Sélection</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50"></div>
                    <span className="text-red-400">Réservé</span>
                </div>
            </div>
        </div>
    );
}
