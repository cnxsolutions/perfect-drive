'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
    '/voiture1.jpeg',
    '/voiture2.JPG',
    '/voiture3.JPG',
    '/voiture4.JPG',
];

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % images.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);

    return (
        <section id="showroom" className="relative pt-32 pb-10 px-4 md:px-6 overflow-hidden min-h-[80vh] flex items-center">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-900/20 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="z-10 text-center lg:text-left flex flex-col items-center lg:items-start pt-4 lg:pt-0"
                >
                    <div className="inline-block px-3 py-1 border border-blue-500/30 bg-blue-500/10 rounded mb-4 lg:mb-6">
                        <span className="text-blue-400 text-[10px] lg:text-xs font-bold tracking-widest font-oswald">FLOTTE 2026</span>
                    </div>
                    <h2 className="font-oswald text-4xl sm:text-5xl md:text-7xl font-bold uppercase leading-[0.9] mb-4 lg:mb-6 text-white text-center lg:text-left">
                        Clio V <br />
                        <span className="text-alpine">Esprit Alpine</span>
                    </h2>
                    <p className="font-montserrat text-gray-400 text-sm sm:text-base lg:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed mb-8 text-center lg:text-left lg:border-l-2 lg:border-alpine lg:pl-4">
                        Finition Black Edition. Hybride E-Tech 145ch. <br />
                        L&apos;élégance radicale.
                    </p>
                </motion.div>

                {/* Carousel */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative group z-20"
                >
                    <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3] md:aspect-[16/10]">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0"
                            >
                                <Image
                                    src={images[currentSlide]}
                                    alt={`Car view ${currentSlide + 1}`}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 pointer-events-none" />
                        <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 z-20 pointer-events-none">
                            <p className="font-oswald text-white text-lg lg:text-xl uppercase tracking-widest drop-shadow-md">Noir Étoilé</p>
                            <p className="text-alpine text-[10px] lg:text-xs font-bold uppercase tracking-wider mt-1">Perfect Drive Edition</p>
                        </div>

                        {/* Controls - Always visible on mobile, hover on desktop */}
                        <button onClick={prevSlide} className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-alpine/80 rounded-full text-white transition opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-30 backdrop-blur-sm">
                            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                        </button>
                        <button onClick={nextSlide} className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-alpine/80 rounded-full text-white transition opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-30 backdrop-blur-sm">
                            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
                        </button>

                        {/* Indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 lg:gap-3 z-30">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`h-1.5 lg:h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 lg:w-8 bg-alpine shadow-[0_0_15px_rgba(0,81,255,0.6)]' : 'w-1.5 lg:w-2 bg-white/30 hover:bg-white/50'}`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
