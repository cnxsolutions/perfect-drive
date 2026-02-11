'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { resend, EMAIL_FROM } from '@/lib/resend';
import { CustomerPaymentLinkTemplate } from '@/components/emails/CustomerPaymentLinkTemplate';
import { CustomerRejectedTemplate } from '@/components/emails/CustomerRejectedTemplate';
import { CustomerConfirmedTemplate } from '@/components/emails/CustomerConfirmedTemplate';
import React from 'react';

export async function approveBooking(bookingId: string) {
    try {
        // 1. Update Booking to 'approved' (Final Step)
        const { data: booking, error } = await supabaseAdmin
            .from('bookings')
            .update({
                status: 'approved',
            })
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw error;

        // 2. Send Confirmation Email to Customer
        if (booking && booking.customer_email) {
            try {
                await resend.emails.send({
                    from: EMAIL_FROM,
                    to: booking.customer_email,
                    subject: 'Réservation Confirmée - Perfect Drive',
                    react: CustomerConfirmedTemplate({
                        firstname: booking.customer_firstname,
                        startDate: new Date(booking.start_date).toLocaleDateString('fr-FR'),
                        endDate: new Date(booking.end_date).toLocaleDateString('fr-FR'),
                        totalPrice: booking.total_price,
                    }) as React.ReactElement,
                });
            } catch (emailError) {
                console.error('Confirmation Email Error:', emailError);
            }
        }

        revalidatePath('/admin');
        return { success: true };
    } catch {
        return { success: false, error: 'Failed to approve' };
    }
}

export async function sendPaymentLink(bookingId: string, paymentLink: string) {
    try {
        // 1. Update Booking to 'awaiting_payment'
        const { data: booking, error } = await supabaseAdmin
            .from('bookings')
            .update({
                status: 'awaiting_payment',
                payment_link: paymentLink
            })
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw error;

        // 2. Send Email with Link
        if (booking && booking.customer_email) {
            try {
                await resend.emails.send({
                    from: EMAIL_FROM,
                    to: booking.customer_email,
                    subject: 'Votre lien de paiement - Perfect Drive',
                    react: CustomerPaymentLinkTemplate({
                        firstname: booking.customer_firstname,
                        paymentLink: paymentLink,
                    }) as React.ReactElement,
                });
            } catch (emailError) {
                console.error('Email Error:', emailError);
            }
        }

        revalidatePath('/admin');
        return { success: true };
    } catch {
        return { success: false, error: 'Failed to send link' };
    }
}

export async function rejectBooking(bookingId: string, reason: string) {
    try {
        const { data: booking, error } = await supabaseAdmin
            .from('bookings')
            .update({
                status: 'rejected',
                rejection_reason: reason
            })
            .eq('id', bookingId)
            .select()
            .single();

        if (error) throw error;

        // Send Email
        if (booking && booking.customer_email) {
            try {
                await resend.emails.send({
                    from: EMAIL_FROM,
                    to: booking.customer_email,
                    subject: 'Réservation Refusée - Perfect Drive',
                    react: CustomerRejectedTemplate({
                        firstname: booking.customer_firstname,
                        reason: reason,
                    }) as React.ReactElement,
                });
            } catch (emailError) {
                console.error('Email Error:', emailError);
            }
        }

        revalidatePath('/admin');
        return { success: true };
    } catch {
        return { success: false, error: 'Failed to reject' };
    }
}

export async function getDocumentUrl(path: string) {
    try {
        const { data, error } = await supabaseAdmin
            .storage
            .from('booking-documents')
            .createSignedUrl(path, 60 * 60); // 1 hour expiry

        if (error) throw error;
        return { success: true, url: data.signedUrl };
    } catch (e) {
        console.error('Error signing URL:', e);
        return { success: false, error: 'Could not generate link' };
    }
}

// Move randomUUID import to top of file or use require if target allows, 
// but since this is a server action file, we should keep it clean.
// However, 'crypto' is a Node module. 
// Let's use the top-level import for randomUUID at the beginning of the file.

export async function deleteBooking(bookingId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('bookings')
            .delete()
            .eq('id', bookingId);

        if (error) throw error;

        revalidatePath('/admin');
        return { success: true };
    } catch {
        return { success: false, error: 'Échec de la suppression' };
    }
}

export async function createAdminBooking(formData: FormData) {
    try {
        const rawData = {
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            startTime: formData.get('startTime') as string,
            endTime: formData.get('endTime') as string,
            mileage: formData.get('mileage') as 'standard' | 'unlimited',
            firstname: formData.get('firstname') as string,
            lastname: formData.get('lastname') as string,
            email: (formData.get('email') as string) || '',
            phone: (formData.get('phone') as string) || '',
            address: (formData.get('address') as string) || '',
            status: formData.get('status') as string || 'approved',
            depositMethod: (formData.get('depositMethod') as string) || 'imprint',
            totalPrice: parseFloat(formData.get('totalPrice') as string) || 0,
        };

        // Handle Optional Files
        const files = {
            idCard: formData.get('file_id') as File,
            license: formData.get('file_license') as File,
            proof: formData.get('file_proof') as File,
        };

        const filePaths: Record<string, string> = {
            idCard: 'admin_manual',
            license: 'admin_manual',
            proof: 'admin_manual',
        };

        const { randomUUID } = await import('crypto');

        for (const [key, file] of Object.entries(files)) {
            if (file && file.size > 0) {
                const fileExt = file.name.split('.').pop();
                const fileName = `ADMIN_${rawData.lastname}_${key}_${randomUUID()}.${fileExt}`;
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const { data: uploadData, error: uploadError } = await supabaseAdmin
                    .storage
                    .from('booking-documents')
                    .upload(fileName, buffer, {
                        contentType: file.type,
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Admin Upload Error:', uploadError);
                } else {
                    filePaths[key] = uploadData.path;
                }
            }
        }

        const { error: insertError } = await supabaseAdmin
            .from('bookings')
            .insert({
                start_date: rawData.startDate,
                end_date: rawData.endDate,
                start_time: rawData.startTime,
                end_time: rawData.endTime,
                mileage_type: rawData.mileage,
                total_price: rawData.totalPrice,
                status: rawData.status,
                customer_firstname: rawData.firstname,
                customer_lastname: rawData.lastname,
                customer_email: rawData.email,
                customer_phone: rawData.phone,
                customer_address: rawData.address,
                deposit_method: rawData.depositMethod,
                document_id_card: filePaths.idCard,
                document_license: filePaths.license,
                document_proof: filePaths.proof,
            });

        if (insertError) {
            console.error('DB Insert Error:', insertError);
            return { success: false, error: "Erreur lors de la création." };
        }

        revalidatePath('/admin');
        return { success: true };

    } catch (error) {
        console.error('Admin Create Action Error:', error);
        return { success: false, error: "Une erreur inattendue est survenue." };
    }
}
// ... (existing code for createAdminBooking)

export async function updateAdminBooking(bookingId: string, formData: FormData) {
    try {
        const startDateStr = formData.get('startDate') as string;
        const endDateStr = formData.get('endDate') as string;

        // Validations
        if (!startDateStr || !endDateStr) {
            return { success: false, error: "Dates manquantes." };
        }

        const rawData = {
            startDate: startDateStr,
            endDate: endDateStr,
            startTime: formData.get('startTime') as string,
            endTime: formData.get('endTime') as string,
            mileage: formData.get('mileage') as 'standard' | 'unlimited',
            firstname: formData.get('firstname') as string,
            lastname: formData.get('lastname') as string,
            email: (formData.get('email') as string) || '',
            phone: (formData.get('phone') as string) || '',
            address: (formData.get('address') as string) || '',
            status: formData.get('status') as string || 'approved',
            depositMethod: (formData.get('depositMethod') as string) || 'imprint',
            totalPrice: parseFloat(formData.get('totalPrice') as string) || 0,
        };

        // Handle Optional Files (Only if new files are uploaded)
        const files = {
            idCard: formData.get('file_id') as File,
            license: formData.get('file_license') as File,
            proof: formData.get('file_proof') as File,
        };

        const filePaths: Record<string, string | undefined> = {};
        const { randomUUID } = await import('crypto');

        for (const [key, file] of Object.entries(files)) {
            if (file && file.size > 0) {
                const fileExt = file.name.split('.').pop();
                const fileName = `ADMIN_${rawData.lastname}_${key}_${randomUUID()}.${fileExt}`;
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const { data: uploadData, error: uploadError } = await supabaseAdmin
                    .storage
                    .from('booking-documents')
                    .upload(fileName, buffer, {
                        contentType: file.type,
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Admin Upload Error:', uploadError);
                } else {
                    filePaths[key] = uploadData.path;
                }
            }
        }

        // prepare update object
        const updateData: any = {
            start_date: rawData.startDate,
            end_date: rawData.endDate,
            start_time: rawData.startTime,
            end_time: rawData.endTime,
            mileage_type: rawData.mileage,
            total_price: rawData.totalPrice,
            status: rawData.status,
            customer_firstname: rawData.firstname,
            customer_lastname: rawData.lastname,
            customer_email: rawData.email,
            customer_phone: rawData.phone,
            customer_address: rawData.address,
            deposit_method: rawData.depositMethod,
        };

        // Only update document paths if new files were uploaded
        if (filePaths.idCard) updateData.document_id_card = filePaths.idCard;
        if (filePaths.license) updateData.document_license = filePaths.license;
        if (filePaths.proof) updateData.document_proof = filePaths.proof;

        const { error: updateError } = await supabaseAdmin
            .from('bookings')
            .update(updateData)
            .eq('id', bookingId);

        if (updateError) {
            console.error('DB Update Error:', updateError);
            return { success: false, error: "Erreur lors de la modification." };
        }

        revalidatePath('/admin');
        return { success: true };

    } catch (error) {
        console.error('Admin Update Action Error:', error);
        return { success: false, error: "Une erreur inattendue est survenue." };
    }
}
