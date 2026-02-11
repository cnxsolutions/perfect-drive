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

    const handleRangeSelect = (start: Date | null, end: Date | null) => {
        setStartDate(start);
        setEndDate(end);
    };

    // Calculate minimum start time based on partial availability
    useEffect(() => {
        if (!startDate) {
            setMinStartTime(null);
            return;
        }

        const dateString = startDate.toISOString().split('T')[0];
        const dateAvail = availability.find(a => a.date === dateString);

        if (dateAvail && !dateAvail.isFullyBlocked && dateAvail.existingBookings.length > 0) {
            // Find the latest return time for this date
            const latestBooking = dateAvail.existingBookings
                .filter(b => b.isEndDate)
                .sort((a, b) => b.endTime.localeCompare(a.endTime))[0];

            if (latestBooking) {
                // Add 1 hour to the return time
                const [hours, minutes] = latestBooking.endTime.split(':').map(Number);
                const minHour = hours + 1;
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
                                    step="900"
                                    className="w-full p-3 glass-input rounded-lg text-white font-montserrat [color-scheme:dark]"
                                />
                            </div>
                        </div>
                    </div>

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
