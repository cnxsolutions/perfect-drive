'use client';

import { useState } from 'react';
import Calendar from './Calendar';
import PricingTable from './PricingTable';
import BookingForm from './BookingForm';

interface BookingSectionProps {
    blockedDates?: string[];
}

export default function BookingSection({ blockedDates }: BookingSectionProps) {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Initialize time to next 15min slot
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("18:00");

    const handleRangeSelect = (start: Date | null, end: Date | null) => {
        setStartDate(start);
        setEndDate(end);
    };

    return (
        <section id="booking" className="max-w-7xl mx-auto px-6 pb-20 pt-10">
            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left Column: Calendar & Time */}
                <div className="lg:col-span-7 space-y-8">
                    <Calendar
                        selectedStart={startDate}
                        selectedEnd={endDate}
                        onRangeSelect={handleRangeSelect}
                        blockedDates={blockedDates}
                    />

                    <div className="glass-panel p-6 rounded-2xl animate-fade-in-up delay-100">
                        <h3 className="font-oswald text-xl text-alpine mb-4 tracking-[0.2em] uppercase flex items-center gap-3">
                            <span className="text-3xl font-bold text-white/20">01.5</span> Horaires
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Heure Départ</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    step="900"
                                    className="w-full p-3 glass-input rounded-lg text-white font-montserrat [color-scheme:dark]"
                                />
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
