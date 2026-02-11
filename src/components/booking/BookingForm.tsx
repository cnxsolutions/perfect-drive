'use client';

import { useState, useEffect } from 'react';
import { Check, Car, Home, CreditCard, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { calculatePrice, MileageType } from '@/lib/pricing';
import { createBookingAction } from '@/actions/booking';

interface BookingFormProps {
    startDate: Date | null;
    endDate: Date | null;
    startTime: string;
    endTime: string;
}

export default function BookingForm({ startDate, endDate, startTime, endTime }: BookingFormProps) {
    const [mileage, setMileage] = useState<MileageType>('standard');
    const [price, setPrice] = useState<number | string>(0);
    const [kmLimit, setKmLimit] = useState('');
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    // Files
    const [files, setFiles] = useState<{ id: File | null; license: File | null; proof: File | null }>({
        id: null, license: null, proof: null
    });

    // Calculate Price
    useEffect(() => {
        if (!startDate || !endDate) {
            setPrice(mileage === 'unlimited' ? 90 : 60);
            setKmLimit(mileage === 'unlimited' ? "Kilométrage Illimité" : "Inclus : 150 km");
            setAlertMessage(null);
            return;
        }

        const { totalPrice, kmLimit: limit, error } = calculatePrice(startDate, endDate, mileage);

        setPrice(error ? "--" : totalPrice);
        setKmLimit(error ? "Indisponible" : limit);
        setAlertMessage(error);

    }, [startDate, endDate, mileage]);

    const handleFileChange = (type: 'id' | 'license' | 'proof', e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFiles(prev => ({ ...prev, [type]: file }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setServerError(null);

        if (price === "--" || alertMessage) return;
        if (!startDate || !endDate) return;

        // Check files
        if (!files.id || !files.license || !files.proof) {
            setServerError("Veuillez télécharger tous les documents requis.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);

            // Append extra data NOT in inputs if needed
            formData.set('startDate', startDate.toISOString());
            formData.set('endDate', endDate.toISOString());
            formData.set('startTime', startTime);
            formData.set('endTime', endTime);
            formData.set('mileage', mileage);

            // Append Files manually
            formData.append('file_id', files.id);
            formData.append('file_license', files.license);
            formData.append('file_proof', files.proof);

            const result = await createBookingAction(formData);

            if (result.success) {
                setSuccess(true);
            } else {
                setServerError(result.error as string);
            }
        } catch {
            setServerError("Une erreur est survenue lors de l'envoi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-6 animate-fade-in-up delay-300">

                {/* Date Summary */}
                {(startDate || endDate) && (
                    <div className="bg-gradient-to-r from-blue-900/50 to-blue-600/20 border border-blue-500/30 p-6 rounded-xl">
                        <p className="font-oswald text-blue-300 text-sm uppercase tracking-widest mb-3">Période choisie</p>
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Départ</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold font-montserrat text-white">
                                        {startDate ? startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '--/--'}
                                    </span>
                                    <span className="text-sm text-alpine font-bold">{startTime}</span>
                                </div>
                            </div>
                            {/* Arrow Icon */}
                            <div className="text-gray-500">→</div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Retour</p>
                                <div className="flex items-baseline gap-2 justify-end">
                                    <span className="text-sm text-alpine font-bold">{endTime}</span>
                                    <span className="text-xl font-bold font-montserrat text-white">
                                        {endDate ? endDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '--/--'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Options Panel */}
                <div className="glass-panel p-4 lg:p-6 rounded-2xl flex flex-col gap-4">
                    <h3 className="font-oswald text-lg lg:text-xl text-alpine tracking-[0.2em] uppercase flex items-center justify-center lg:justify-start gap-3">
                        <span className="text-2xl lg:text-3xl font-bold text-white/20">02.</span> Option
                    </h3>
                    <div>
                        <label className="block text-xs lg:text-sm font-oswald uppercase tracking-widest mb-3 text-gray-400 text-center lg:text-left">Kilométrage</label>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Limité Option */}
                            <button
                                type="button"
                                onClick={() => setMileage('standard')}
                                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${mileage === 'standard'
                                    ? 'border-alpine bg-alpine/10 shadow-[0_0_20px_rgba(0,81,255,0.3)]'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${mileage === 'standard' ? 'border-alpine' : 'border-white/30'
                                        }`}>
                                        {mileage === 'standard' && (
                                            <div className="w-3 h-3 rounded-full bg-alpine"></div>
                                        )}
                                    </div>
                                    <span className={`font-oswald text-sm uppercase tracking-wider ${mileage === 'standard' ? 'text-alpine' : 'text-white'
                                        }`}>
                                        Limité
                                    </span>
                                    <span className="text-xs text-gray-400">150 km/jour</span>
                                    <span className="text-[9px] text-gray-500 italic mt-1">0,50€/km si dépassé</span>
                                </div>
                            </button>

                            {/* Illimité Option */}
                            <button
                                type="button"
                                onClick={() => setMileage('unlimited')}
                                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${mileage === 'unlimited'
                                    ? 'border-alpine bg-alpine/10 shadow-[0_0_20px_rgba(0,81,255,0.3)]'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${mileage === 'unlimited' ? 'border-alpine' : 'border-white/30'
                                        }`}>
                                        {mileage === 'unlimited' && (
                                            <div className="w-3 h-3 rounded-full bg-alpine"></div>
                                        )}
                                    </div>
                                    <span className={`font-oswald text-sm uppercase tracking-wider ${mileage === 'unlimited' ? 'text-alpine' : 'text-white'
                                        }`}>
                                        Illimité
                                    </span>
                                    <span className="text-xs text-gray-400">Sans limite</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="mt-2 lg:mt-4 p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl text-center relative overflow-hidden transition-all duration-300">
                        <div className="absolute top-0 left-0 w-1 h-full bg-alpine"></div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Estimation Prix</p>
                        <div className="font-oswald text-3xl lg:text-4xl font-bold text-white">
                            {typeof price === 'number' ? `${price}€` : price}
                        </div>
                        <div className={clsx("text-[10px] lg:text-xs font-bold uppercase tracking-wider mt-1", mileage === 'unlimited' ? 'text-alpine' : 'text-gray-400')}>
                            {kmLimit}
                        </div>
                        {alertMessage && (
                            <div className="mt-2 text-xs text-red-400 font-bold bg-red-500/10 p-2 rounded border border-red-500/20">
                                {alertMessage}
                            </div>
                        )}
                    </div>

                    {/* Deposit Method */}
                    <div className="mt-2">
                        <label className="block text-xs lg:text-sm font-oswald uppercase tracking-widest mb-2 text-gray-400 text-center lg:text-left">Mode de Dépôt de Garantie (700€)</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="cursor-pointer">
                                <input type="radio" name="deposit_method" value="imprint" className="peer hidden" defaultChecked />
                                <div className="border border-white/10 peer-checked:border-alpine peer-checked:bg-alpine/10 rounded-lg p-3 text-center transition-all">
                                    <span className="block text-[10px] lg:text-xs font-bold text-white uppercase">Empreinte CB</span>
                                    <span className="text-[8px] lg:text-[10px] text-gray-500">Non débité</span>
                                </div>
                            </label>
                            <label className="cursor-pointer">
                                <input type="radio" name="deposit_method" value="cash" className="peer hidden" />
                                <div className="border border-white/10 peer-checked:border-alpine peer-checked:bg-alpine/10 rounded-lg p-3 text-center transition-all">
                                    <span className="block text-[10px] lg:text-xs font-bold text-white uppercase">Espèces</span>
                                    <span className="text-[8px] lg:text-[10px] text-gray-500">Sur place</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Context: Documents */}
                <div className="glass-panel p-4 md:p-8 rounded-2xl">
                    <h3 className="font-oswald text-lg lg:text-xl text-alpine mb-6 lg:mb-8 tracking-[0.2em] uppercase flex items-center justify-center lg:justify-start gap-3">
                        <span className="text-2xl lg:text-3xl font-bold text-white/20">03.</span> Documents
                    </h3>
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                        {['id', 'license', 'proof'].map((type) => (
                            <div key={type} className={clsx("relative group", type === 'proof' ? "col-span-2" : "")}>
                                <input
                                    type="file"
                                    id={`file-${type}`}
                                    name={`file_${type}`}
                                    className="hidden"
                                    onChange={(e) => handleFileChange(type as 'id' | 'license' | 'proof', e)}
                                    accept="image/*,.pdf"
                                />
                                <label
                                    htmlFor={`file-${type}`}
                                    className={clsx(
                                        "flex flex-col items-center justify-center p-3 lg:p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all h-full min-h-[80px] lg:min-h-[100px]",
                                        files[type as keyof typeof files]
                                            ? "border-green-500 bg-green-500/10"
                                            : "border-white/10 hover:border-alpine hover:bg-alpine/5"
                                    )}
                                >
                                    {files[type as keyof typeof files] ? <Check className="text-green-500 w-5 h-5 lg:w-6 lg:h-6" /> : (
                                        type === 'id' ? <CreditCard className="text-gray-400 w-5 h-5 lg:w-6 lg:h-6 mb-1 lg:mb-2" /> :
                                            type === 'license' ? <Car className="text-gray-400 w-5 h-5 lg:w-6 lg:h-6 mb-1 lg:mb-2" /> :
                                                <Home className="text-gray-400 w-5 h-5 lg:w-6 lg:h-6 mb-1 lg:mb-2" />
                                    )}
                                    <span className={clsx("font-oswald text-[9px] lg:text-[10px] uppercase tracking-wider text-center", files[type as keyof typeof files] ? "text-green-400" : "text-gray-300")}>
                                        {type === 'id' ? 'Identité' : type === 'license' ? 'Permis' : 'Justif. Domicile (-3 mois)'}
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Confirmation Form */}
                <div className="glass-panel p-4 md:p-8 rounded-2xl flex-1 flex flex-col">
                    <h3 className="font-oswald text-lg lg:text-xl text-alpine mb-6 lg:mb-8 tracking-[0.2em] uppercase flex items-center justify-center lg:justify-start gap-3">
                        <span className="text-2xl lg:text-3xl font-bold text-white/20">04.</span> Confirmation
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6 font-montserrat flex-1" suppressHydrationWarning>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="firstname" required placeholder="PRÉNOM" className="w-full p-3 lg:p-4 glass-input rounded-lg text-white placeholder:text-gray-500 text-sm" suppressHydrationWarning />
                            <input type="text" name="lastname" required placeholder="NOM" className="w-full p-3 lg:p-4 glass-input rounded-lg text-white placeholder:text-gray-500 text-sm" suppressHydrationWarning />
                        </div>
                        <input type="email" name="email" required placeholder="EMAIL" className="w-full p-3 lg:p-4 glass-input rounded-lg text-white placeholder:text-gray-500 text-sm" suppressHydrationWarning />
                        <input type="tel" name="phone" required placeholder="TÉLÉPHONE" className="w-full p-3 lg:p-4 glass-input rounded-lg text-white placeholder:text-gray-500 text-sm" suppressHydrationWarning />
                        <input type="text" name="address" required placeholder="ADRESSE COMPLÈTE" className="w-full p-3 lg:p-4 glass-input rounded-lg text-white placeholder:text-gray-500 text-sm" suppressHydrationWarning />
                        <textarea name="message" rows={3} placeholder="MESSAGE (OPTIONNEL)" className="w-full p-3 lg:p-4 glass-input rounded-lg text-white placeholder:text-gray-500 text-sm" suppressHydrationWarning></textarea>

                        {serverError && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                                {serverError}
                            </div>
                        )}

                        <div className="pt-2 border-t border-white/10 mt-auto text-center">
                            <button
                                type="submit"
                                disabled={!!alertMessage || loading}
                                className="w-full py-3 lg:py-4 mb-3 alpine-btn font-bold text-base lg:text-lg rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'CONFIRMER MA DEMANDE'}
                            </button>
                            <p className="text-[10px] text-gray-500 italic">Vos demandes sont traitées dans les plus brefs délais.</p>
                        </div>
                    </form>
                </div>

            </div>

            {/* Success Modal - Fullscreen Overlay */}
            {success && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-lg" />
                    <div className="glass-panel p-12 md:p-16 rounded-3xl relative z-10 max-w-2xl w-full text-center border-2 border-alpine shadow-[0_0_80px_rgba(0,81,255,0.3)] animate-fade-in-up">
                        <div className="w-32 h-32 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-8 border-4 border-green-500">
                            <Check className="w-16 h-16 text-green-500" />
                        </div>
                        <h2 className="font-oswald text-5xl uppercase text-white mb-4">Demande Envoyée !</h2>
                        <p className="font-montserrat text-gray-300 text-lg mb-12 leading-relaxed max-w-md mx-auto">
                            Votre demande de réservation a bien été transmise. Vous recevrez une réponse très rapidement.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full max-w-sm mx-auto py-6 bg-alpine hover:bg-alpine/90 text-white font-oswald font-bold uppercase tracking-widest rounded-xl transition text-xl"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}

        </>
    );
}
