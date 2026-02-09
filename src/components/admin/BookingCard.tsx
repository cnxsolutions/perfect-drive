'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/types/booking';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, FileText, Calendar, Euro, User, MessageSquare, Loader2, CreditCard, Trash2 } from 'lucide-react';
import { approveBooking, rejectBooking, getDocumentUrl, sendPaymentLink, deleteBooking } from '@/actions/admin';

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

    const handleDelete = async () => {
        if (confirm('Supprimer définitivement cette réservation ?')) {
            setLoading(true);
            const result = await deleteBooking(booking.id);
            setLoading(false);
            if (result.success) {
                router.refresh();
            } else {
                alert('Erreur lors de la suppression');
            }
        }
    };





    return (
        <div className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col gap-4 relative">
            {/* Date Range - Top */}
            <div className="flex items-center gap-2 text-alpine">
                <Calendar className="w-5 h-5" />
                <span className="font-oswald text-lg uppercase tracking-wider">
                    {format(new Date(booking.start_date), 'dd MMM', { locale: fr })} - {format(new Date(booking.end_date), 'dd MMM', { locale: fr })}
                </span>
            </div>

            {/* Customer Name - Center */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                </div>
                <h3 className="text-white font-oswald text-xl uppercase tracking-wide">
                    {booking.customer_firstname} {booking.customer_lastname}
                </h3>
            </div>

            {/* Status Badge - Bottom */}
            <div className={`px-4 py-2 rounded-lg text-center text-sm font-bold uppercase tracking-wider ${booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                    booking.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                        booking.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                }`}>
                {booking.status}
            </div>

            {/* Customer Message */}
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

                {/* Delete button for history (rejected or approved) */}
                {(booking.status === 'rejected' || booking.status === 'approved') && (
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="py-2 border border-red-500/50 text-red-500 rounded hover:bg-red-500 hover:text-white transition uppercase text-xs font-bold tracking-wider flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-3 h-3" /> : <><Trash2 className="w-3 h-3" /> Supprimer</>}
                    </button>
                )}
            </div>

            {/* Modal: Send Payment Link (Step 1) */}
            {
                showApprove && (
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
                )
            }

            {/* Reject Modal */}
            {
                showReject && (
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
                )
            }
        </div >
    );
}
