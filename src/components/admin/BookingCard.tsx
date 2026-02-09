'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/types/booking';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, FileText, Calendar, DollarSign, User, MessageSquare, Loader2 } from 'lucide-react';
import { approveBooking, rejectBooking, getDocumentUrl, sendPaymentLink } from '@/actions/admin';

function DocumentLink({ path, label }: { path: string, label: string }) {
    const [loading, setLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await getDocumentUrl(path);
        setLoading(false);
        if (res.success && res.url) {
            window.open(res.url, '_blank');
        } else {
            alert('Erreur: Impossible d\'ouvrir le document');
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center gap-2 text-xs text-gray-300 transition-colors disabled:opacity-50"
        >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
            {label}
        </button>
    );
}
export default function BookingCard({ booking }: { booking: Booking }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showReject, setShowReject] = useState(false);
    const [showApprove, setShowApprove] = useState(false); // Used for "Send Link" modal

    // Inputs
    const [rejectReason, setRejectReason] = useState('');
    const [paymentLink, setPaymentLink] = useState('');

    const handleSendLink = async () => {
        if (!paymentLink) return alert('Lien de paiement requis');
        setLoading(true);
        const result = await sendPaymentLink(booking.id, paymentLink);
        setLoading(false);
        setShowApprove(false);
        if (result.success) {
            router.refresh(); // Auto-refresh dashboard
        }
    };

    const handleApprove = async () => {
        // Final approval (Payment Confirmed)
        if (confirm('Confirmer que le paiement a été reçu ? Cela bloquera les dates.')) {
            setLoading(true);
            const result = await approveBooking(booking.id);
            setLoading(false);
            if (result.success) {
                router.refresh(); // Auto-refresh dashboard
            }
        }
    };

    const handleReject = async () => {
        if (!rejectReason) return alert('Motif requis');
        setLoading(true);
        const result = await rejectBooking(booking.id, rejectReason);
        setLoading(false);
        setShowReject(false);
        if (result.success) {
            router.refresh(); // Auto-refresh dashboard
        }
    };



    return (
        <div className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col gap-4 relative">
            {/* Status Badge */}
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                booking.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                    booking.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                }`}>
                {booking.status}
            </div>

            {/* Client Info */}
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <User className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-white font-oswald text-lg uppercase">{booking.customer_firstname} {booking.customer_lastname}</h3>
                    <p className="text-gray-400 text-sm">{booking.customer_email}</p>
                    <p className="text-gray-400 text-sm">{booking.customer_phone}</p>
                </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                <div className="bg-white/5 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-alpine mb-1">
                        <Calendar className="w-4 h-4" /> <span className="text-[10px] uppercase">Période</span>
                    </div>
                    <div className="text-white font-bold">
                        {format(new Date(booking.start_date), 'dd MMM', { locale: fr })} - {format(new Date(booking.end_date), 'dd MMM', { locale: fr })}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                        {booking.start_time} - {booking.end_time}
                    </div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-alpine mb-1">
                        <DollarSign className="w-4 h-4" /> <span className="text-[10px] uppercase">Prix & KM</span>
                    </div>
                    <div className="text-white font-bold">
                        {booking.total_price}€
                    </div>
                    <div className="text-gray-500 text-xs mt-1 uppercase">
                        {booking.mileage_type}
                    </div>
                </div>
            </div>

            {booking.customer_message && (
                <div className="bg-white/5 p-3 rounded-lg text-sm text-gray-300 italic">
                    <MessageSquare className="w-3 h-3 inline mr-2 text-gray-500" />
                    &ldquo;{booking.customer_message}&rdquo;
                </div>
            )}

            {/* Documents */}
            <div className="flex gap-2 mt-2">
                {(['id_card', 'license', 'proof'] as const).map(doc => {
                    const docKey = `document_${doc}` as keyof Booking;
                    return (
                        <DocumentLink
                            key={doc}
                            label={doc.replace('_', ' ').toUpperCase()}
                            path={booking[docKey] as string}
                        />
                    );
                })}
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-white/10">
                {booking.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setShowReject(true)}
                            className="py-2 border border-red-500/50 text-red-500 rounded hover:bg-red-500 hover:text-white transition uppercase text-xs font-bold tracking-wider"
                        >
                            Refuser
                        </button>
                        <button
                            onClick={() => setShowApprove(true)}
                            className="py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition uppercase text-xs font-bold tracking-wider"
                        >
                            Envoyer Lien
                        </button>
                    </div>
                )}

                {booking.status === 'awaiting_payment' && (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setShowReject(true)}
                            className="py-2 border border-red-500/50 text-red-500 rounded hover:bg-red-500 hover:text-white transition uppercase text-xs font-bold tracking-wider"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleApprove}
                            className="py-2 bg-green-500 text-white rounded hover:bg-green-600 transition uppercase text-xs font-bold tracking-wider flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-3 h-3" /> : <><Check className="w-3 h-3" /> Confirmer Payement</>}
                        </button>
                    </div>
                )}
            </div>

            {/* Modal: Send Payment Link (Step 1) */}
            {showApprove && (
                <div className="absolute inset-0 z-10 bg-darkbg/95 backdrop-blur-sm p-4 rounded-xl flex flex-col justify-center">
                    <h4 className="text-blue-500 font-bold uppercase mb-4 text-center">Envoyer Lien Paiement</h4>
                    <p className="text-xs text-gray-400 mb-2 text-center">Cela passera le statut à &quot;En attente de paiement&quot;.</p>
                    <input
                        type="text"
                        placeholder="Lien de paiement..."
                        className="w-full p-2 glass-input rounded mb-4 text-sm"
                        value={paymentLink}
                        onChange={e => setPaymentLink(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <button onClick={() => setShowApprove(false)} className="flex-1 py-2 text-gray-400 text-xs">Annuler</button>
                        <button onClick={handleSendLink} disabled={loading} className="flex-1 py-2 bg-blue-500 text-white rounded text-xs font-bold">
                            {loading ? '...' : 'Envoyer'}
                        </button>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showReject && (
                <div className="absolute inset-0 z-10 bg-darkbg/95 backdrop-blur-sm p-4 rounded-xl flex flex-col justify-center">
                    <h4 className="text-red-500 font-bold uppercase mb-4 text-center">Motif de refus</h4>
                    <textarea
                        placeholder="Raison..."
                        className="w-full p-2 glass-input rounded mb-4 text-sm resize-none"
                        rows={3}
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <button onClick={() => setShowReject(false)} className="flex-1 py-2 text-gray-400 text-xs">Annuler</button>
                        <button onClick={handleReject} disabled={loading} className="flex-1 py-2 bg-red-500 text-white rounded text-xs font-bold">
                            {loading ? '...' : 'Refuser'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
