'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Mail, Phone, Instagram, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <header className="fixed w-full z-50 glass-panel border-b-0 top-0 rounded-b-2xl">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-4 group z-50 relative">
                    <div className="w-12 h-12 md:w-16 md:h-16 relative flex items-center justify-center transition-transform group-hover:scale-105">
                        <Image
                            src="/logo.jpeg"
                            alt="Perfect Drive Logo"
                            width={80}
                            height={80}
                            className="object-contain mix-blend-screen filter brightness-125"
                        />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="font-oswald text-lg md:text-2xl font-bold tracking-widest text-white uppercase leading-none mb-1 group-hover:text-alpine transition-colors">
                            Perfect Drive
                        </h1>
                        <p className="font-montserrat text-[8px] md:text-[10px] font-bold text-alpine tracking-[0.3em] uppercase leading-none hidden md:block">
                            Location Premium
                        </p>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-8 font-oswald text-sm tracking-widest text-gray-300 items-center">
                    <Link href="#showroom" className="hover:text-alpine transition duration-300 relative group">
                        VÉHICULES
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-alpine transition-all group-hover:w-full"></span>
                    </Link>
                    <Link href="#booking" className="hover:text-alpine transition duration-300 relative group">
                        AGENCE
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-alpine transition-all group-hover:w-full"></span>
                    </Link>

                    <div className="relative group">
                        <button className="hover:text-alpine transition duration-300 flex items-center gap-1 py-4">
                            CONTACT <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                        </button>

                        <div className="absolute right-0 top-full w-72 glass-panel rounded-xl p-2 hidden group-hover:block animate-fade-in-up border border-white/10 shadow-2xl">
                            {/* Whatsapp */}
                            <a href="https://wa.me/33762711498" target="_blank" className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg transition group/item">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 group-hover/item:bg-green-500 group-hover/item:text-white transition">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-white text-xs font-montserrat">WhatsApp</span>
                                    <span className="text-[10px] text-gray-400 font-montserrat">07 62 71 14 98</span>
                                </div>
                            </a>

                            {/* Email */}
                            <a href="mailto:contact.perfectdrive@gmail.com" className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg transition group/item">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover/item:bg-blue-500 group-hover/item:text-white transition">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-white text-xs font-montserrat">Email</span>
                                    <span className="text-[10px] text-gray-400 font-montserrat">contact...</span>
                                </div>
                            </a>

                            {/* Snapchat */}
                            <a href="https://www.snapchat.com/add/perfectdrivee" target="_blank" className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg transition group/item">
                                <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 group-hover/item:bg-yellow-400 group-hover/item:text-black transition">
                                    {/* Snapchat SVG */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15.943 11.526c-.111-.303-.323-.465-.564-.599a1.416 1.416 0 0 0-.123-.064l-.023-.011-2.46-.967a.38.38 0 0 1-.22-.447l.045-.23c.307-1.579.362-2.318.362-2.67 0-3.322-2.327-4.478-4.88-4.478-2.617 0-4.957 1.2-4.957 4.478 0 .351.055 1.09.362 2.669l.046.23a.383.383 0 0 1-.22.447l-2.462.967-.022.01c-.04.022-.083.044-.124.065-.24.133-.452.295-.563.598-.12.327-.068.746.262 1.066.27.262.65.37 1.033.37.195 0 .393-.028.58-.085l.173-.05.163-.047c.72-.206 1.63-.466 2.376-.466.575 0 1.13.155 1.554.437.388.258.742.65 1.346.65.6 0 .956-.391 1.345-.65.424-.28.98-.436 1.554-.436.746 0 1.656.26 2.377.466l.163.047.172.05c.188.057.386.085.581.085.383 0 .764-.108 1.034-.37.33-.32.381-.74.262-1.066z" /></svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-white text-xs font-montserrat">Snapchat</span>
                                    <span className="text-[10px] text-gray-400 font-montserrat">@perfectdrivee</span>
                                </div>
                            </a>

                            {/* Instagram */}
                            <a href="https://www.instagram.com/perfectdrive10" target="_blank" className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg transition group/item">
                                <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 group-hover/item:bg-pink-500 group-hover/item:text-white transition">
                                    <Instagram className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-white text-xs font-montserrat">Instagram</span>
                                    <span className="text-[10px] text-gray-400 font-montserrat">@perfectdrive10</span>
                                </div>
                            </a>

                            {/* TikTok */}
                            <a href="https://www.tiktok.com/@rayandrv" target="_blank" className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg transition group/item">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover/item:bg-white group-hover/item:text-black transition">
                                    {/* TikTok SVG */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z" /></svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-white text-xs font-montserrat">TikTok</span>
                                    <span className="text-[10px] text-gray-400 font-montserrat">@rayandrv</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden text-white hover:text-alpine transition-colors z-[60] relative p-2"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-[#070b13] z-50 flex flex-col items-center justify-center"
                        >
                            <nav className="flex flex-col gap-8 text-center">
                                <Link
                                    href="#showroom"
                                    onClick={toggleMobileMenu}
                                    className="text-3xl font-oswald font-bold text-white pb-4"
                                >
                                    VÉHICULES
                                </Link>
                                <Link
                                    href="#booking"
                                    onClick={toggleMobileMenu}
                                    className="text-3xl font-oswald font-bold text-white pb-4"
                                >
                                    AGENCE
                                </Link>

                                <div className="mt-8 flex flex-col items-center">
                                    <p className="text-gray-400 text-sm font-montserrat mb-6 uppercase tracking-widest">Nous contacter</p>
                                    <div className="flex gap-6">
                                        <a href="https://wa.me/33762711498" target="_blank" className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-colors">
                                            <Phone size={24} />
                                        </a>
                                        <a href="https://www.instagram.com/perfectdrive10" target="_blank" className="w-14 h-14 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-colors">
                                            <Instagram size={24} />
                                        </a>
                                        <a href="mailto:contact.perfectdrive@gmail.com" className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-colors">
                                            <Mail size={24} />
                                        </a>
                                    </div>
                                </div>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
