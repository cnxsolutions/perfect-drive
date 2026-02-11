'use client';

import { useState, useEffect } from 'react';
import Calendar from './Calendar';
import PricingTable from './PricingTable';
import BookingForm from './BookingForm';
import { DateAvailability } from '@/types/booking';

interface BookingSectionProps {
    availability: DateAvailability[];
}

export default function BookingSection({ availability }: BookingSectionProps) {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Initialize time to next 15min slot
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("10:00");
    const [minStartTime, setMinStartTime] = useState<string | null>(null);
    const [maxEndTime, setMaxEndTime] = useState<string | null>(null);

    const handleRangeSelect = (start: Date | null, end: Date | null) => {
        setStartDate(start);
        setEndDate(end);
    };

    // Calculate minimum start time based on partial availability (Turnover check)
    useEffect(() => {
        if (!startDate) {
            setMinStartTime(null);
            return;
        }

        // Format date as YYYY-MM-DD in local time
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const day = String(startDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        const dateAvail = availability.find(a => a.date === dateString);

        if (dateAvail && !dateAvail.isFullyBlocked && dateAvail.existingBookings.length > 0) {
            // Find the latest RETURN time for this date (Previous booking ends)
            const latestReturn = dateAvail.existingBookings
                .filter(b => b.isEndDate)
                .sort((a, b) => b.endTime.localeCompare(a.endTime))[0];

            if (latestReturn) {
                // Add 1 hour to the return time for turnover gap
                const [hours, minutes] = latestReturn.endTime.split(':').map(Number);
                let minHour = hours + 1;
                // Cap at 23:00 to avoid invalid times? Or just let it be.
                const minTimeStr = `${minHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                setMinStartTime(minTimeStr);

                // If current start time is before minimum, update it
                if (startTime < minTimeStr) {
                    setStartTime(minTimeStr);
                }
            } else {
                setMinStartTime(null);
            }
        } else {
            setMinStartTime(null);
        }
    }, [startDate, availability, startTime]);

    // Calculate maximum end time based on partial availability (Turnover check)
    useEffect(() => {
        if (!endDate) {
            setMaxEndTime(null);
            return;
        }

        const year = endDate.getFullYear();
        const month = String(endDate.getMonth() + 1).padStart(2, '0');
        const day = String(endDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        const dateAvail = availability.find(a => a.date === dateString);

        if (dateAvail && !dateAvail.isFullyBlocked && dateAvail.existingBookings.length > 0) {
            // Find the earliest DEPARTURE time for this date (Next booking starts)
            const earliestDepart = dateAvail.existingBookings
                .filter(b => b.isStartDate)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

            if (earliestDepart) {
                // Subtract 1 hour from the start time for turnover gap
                const [hours, minutes] = earliestDepart.startTime.split(':').map(Number);
                let maxHour = hours - 1;
                const maxTimeStr = `${maxHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                setMaxEndTime(maxTimeStr);

                // If current end time is after maximum, update it
                if (endTime > maxTimeStr) {
                    setEndTime(maxTimeStr);
                }
            } else {
                setMaxEndTime(null);
            }
        } else {
            setMaxEndTime(null);
        }
    }, [endDate, availability, endTime]);

    return (
        <section id="booking" className="max-w-7xl mx-auto px-4 lg:px-6 pb-20 pt-10">
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left Column: Calendar & Time */}
                <div className="lg:col-span-7 space-y-6 lg:space-y-8">
                    <Calendar
                        selectedStart={startDate}
                        selectedEnd={endDate}
                        onRangeSelect={handleRangeSelect}
                        availability={availability}
                    />

                    {/* Time Selection - Hidden until dates are selected to reduce clutter */}
                    {(startDate || endDate) && (
                        <div className="glass-panel p-4 lg:p-6 rounded-2xl animate-fade-in-up delay-100">
                            <h3 className="font-oswald text-lg lg:text-xl text-alpine mb-4 tracking-[0.2em] uppercase flex items-center justify-center lg:justify-start gap-3">
                                <span className="text-2xl lg:text-3xl font-bold text-white/20">01.5</span> Horaires
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Heure Départ</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        min={minStartTime || undefined}
                                        step="900"
                                        className="w-full p-3 glass-input rounded-lg text-white font-montserrat [color-scheme:dark]"
                                    />
                                    {minStartTime && (
                                        <p className="text-[9px] text-orange-400 mt-1 italic">
                                            Disponible à partir de {minStartTime}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Heure Retour</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        max={maxEndTime || undefined}
                                        step="900"
                                        className="w-full p-3 glass-input rounded-lg text-white font-montserrat [color-scheme:dark]"
                                    />
                                    {maxEndTime && (
                                        <p className="text-[9px] text-blue-400 mt-1 italic">
                                            Retour max à {maxEndTime}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <PricingTable />
                </div>

                {/* Right Column: Form */}
                <div className="lg:col-span-5">
                    <BookingForm
                        startDate={startDate}
                        endDate={endDate}
                        startTime={startTime}
                        endTime={endTime}
                    />
                </div>
            </div>
        </section>
    );
}
