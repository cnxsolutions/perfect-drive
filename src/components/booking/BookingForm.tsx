'use client';

import { useState, useEffect } from 'react';
import { Check, Car, Home, CreditCard, Loader2 } from 'lucide-react';
import clsx from 'clsx';
// import { twMerge } from 'tailwind-merge'; // Unused
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
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
                <h3 className="font-oswald text-xl text-alpine tracking-[0.2em] uppercase flex items-center gap-3">
                    <span className="text-3xl font-bold text-white/20">02.</span> Option
                </h3>
                <div>
                    <label className="block text-sm font-oswald uppercase tracking-widest mb-2 text-gray-400">Kilométrage</label>
                    <select
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value as 'standard' | 'unlimited')}
                        className="w-full p-4 glass-input rounded-lg font-montserrat text-white cursor-pointer bg-black/50"
                    >
                        <option value="standard" className="bg-black text-white">Standard</option>
                        <option value="unlimited" className="bg-black text-white">Illimité</option>
                    </select>
                </div>

                <div className="mt-4 p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl text-center relative overflow-hidden transition-all duration-300">
                    <div className="absolute top-0 left-0 w-1 h-full bg-alpine"></div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Estimation Prix</p>
                    <div className="font-oswald text-4xl font-bold text-white">
                        {typeof price === 'number' ? `${price}€` : price}
                    </div>
                    <div className={clsx("text-xs font-bold uppercase tracking-wider mt-1", mileage === 'unlimited' ? 'text-alpine' : 'text-gray-400')}>
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
                    <label className="block text-sm font-oswald uppercase tracking-widest mb-2 text-gray-400">Mode de Dépôt de Garantie (700€)</label>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="cursor-pointer">
                            <input type="radio" name="deposit_method" value="imprint" className="peer hidden" defaultChecked />
                            <div className="border border-white/10 peer-checked:border-alpine peer-checked:bg-alpine/10 rounded-lg p-3 text-center transition-all">
                                <span className="block text-xs font-bold text-white uppercase">Empreinte CB</span>
                                <span className="text-[10px] text-gray-500">Non débité</span>
                            </div>
                        </label>
                        <label className="cursor-pointer">
                            <input type="radio" name="deposit_method" value="cash" className="peer hidden" />
                            <div className="border border-white/10 peer-checked:border-alpine peer-checked:bg-alpine/10 rounded-lg p-3 text-center transition-all">
                                <span className="block text-xs font-bold text-white uppercase">Espèces</span>
                                <span className="text-[10px] text-gray-500">Sur place</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Context: Documents */}
            <div className="glass-panel p-6 md:p-8 rounded-2xl">
                <h3 className="font-oswald text-xl text-alpine mb-8 tracking-[0.2em] uppercase flex items-center gap-3">
                    <span className="text-3xl font-bold text-white/20">03.</span> Documents
                </h3>
                <div className="grid grid-cols-2 gap-4">
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
                                    "flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all h-full min-h-[100px]",
                                    files[type as keyof typeof files]
                                        ? "border-green-500 bg-green-500/10"
                                        : "border-white/10 hover:border-alpine hover:bg-alpine/5"
                                )}
                            >
                                {files[type as keyof typeof files] ? <Check className="text-green-500 w-6 h-6" /> : (
                                    type === 'id' ? <CreditCard className="text-gray-400 w-6 h-6 mb-2" /> :
                                        type === 'license' ? <Car className="text-gray-400 w-6 h-6 mb-2" /> :
                                            <Home className="text-gray-400 w-6 h-6 mb-2" />
                                )}
                                <span className={clsx("font-oswald text-[10px] uppercase tracking-wider", files[type as keyof typeof files] ? "text-green-400" : "text-gray-300")}>
                                    {type === 'id' ? 'Identité' : type === 'license' ? 'Permis' : 'Justificatif Domicile (-3 mois)'}
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Confirmation Form */}
            <div className="glass-panel p-6 md:p-8 rounded-2xl flex-1 flex flex-col">
                <h3 className="font-oswald text-xl text-alpine mb-8 tracking-[0.2em] uppercase flex items-center gap-3">
                    <span className="text-3xl font-bold text-white/20">04.</span> Confirmation
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6 font-montserrat flex-1" suppressHydrationWarning>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="firstname" required placeholder="PRÉNOM" className="w-full p-4 glass-input rounded-lg text-white placeholder:text-gray-500" suppressHydrationWarning />
                        <input type="text" name="lastname" required placeholder="NOM" className="w-full p-4 glass-input rounded-lg text-white placeholder:text-gray-500" suppressHydrationWarning />
                    </div>
                    <input type="email" name="email" required placeholder="EMAIL" className="w-full p-4 glass-input rounded-lg text-white placeholder:text-gray-500" suppressHydrationWarning />
                    <input type="tel" name="phone" required placeholder="TÉLÉPHONE" className="w-full p-4 glass-input rounded-lg text-white placeholder:text-gray-500" suppressHydrationWarning />
                    <textarea name="message" rows={3} placeholder="MESSAGE (OPTIONNEL)" className="w-full p-4 glass-input rounded-lg text-white placeholder:text-gray-500" suppressHydrationWarning></textarea>

                    {serverError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                            {serverError}
                        </div>
                    )}

                    <div className="pt-2 border-t border-white/10 mt-auto text-center">
                        <button
                            type="submit"
                            disabled={!!alertMessage || loading}
                            className="w-full py-4 mb-3 alpine-btn font-bold text-lg rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'CONFIRMER MA DEMANDE'}
                        </button>
                        <p className="text-[10px] text-gray-500 italic">Vos demandes sont traitées dans les plus brefs délais.</p>
                    </div>
                </form>
            </div>

            {/* Success Modal */}
            {success && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in-up">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSuccess(false)}></div>
                    <div className="glass-panel p-8 md:p-12 rounded-2xl relative z-10 max-w-md w-full text-center border border-alpine/30 shadow-[0_0_50px_rgba(0,81,255,0.2)]">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 border border-green-500/50">
                            <Check className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="font-oswald text-3xl uppercase text-white mb-2">Demande Envoyée !</h2>
                        <p className="font-montserrat text-gray-300 text-sm mb-8 leading-relaxed">
                            Votre demande de réservation a bien été transmise à notre équipe. Vous recevrez une réponse très rapidement.
                        </p>
                        <button onClick={() => window.location.reload()} className="w-full py-4 bg-white hover:bg-alpine hover:text-white text-black font-oswald font-bold uppercase tracking-widest rounded transition-all duration-300">
                            Fermer
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
