'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { calculatePrice, MileageType } from '@/lib/pricing';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { resend, EMAIL_FROM, EMAIL_ADMIN } from '@/lib/resend';
import { AdminNewBookingTemplate } from '@/components/emails/AdminNewBookingTemplate';
import { CustomerReceivedTemplate } from '@/components/emails/CustomerReceivedTemplate';

export async function createBookingAction(formData: FormData) {
    try {
        const rawData = {
            startDate: new Date(formData.get('startDate') as string),
            endDate: new Date(formData.get('endDate') as string),
            startTime: formData.get('startTime') as string,
            endTime: formData.get('endTime') as string,
            mileage: formData.get('mileage') as MileageType,
            firstname: formData.get('firstname') as string,
            lastname: formData.get('lastname') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            message: formData.get('message') as string,
        };

        // Calculate Price Server-Side
        const priceResult = calculatePrice(rawData.startDate, rawData.endDate, rawData.mileage);
        if (priceResult.error) {
            return { success: false, error: priceResult.error };
        }

        // Handle Files
        const files = {
            idCard: formData.get('file_id') as File,
            license: formData.get('file_license') as File,
            proof: formData.get('file_proof') as File,
        };

        const filePaths: Record<string, string> = {};

        for (const [key, file] of Object.entries(files)) {
            if (!file || file.size === 0) return { success: false, error: `Document manquante: ${key}` };

            const fileExt = file.name.split('.').pop();
            const fileName = `${rawData.lastname}_${key}_${randomUUID()}.${fileExt}`;
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
                console.error('Upload Error:', uploadError);
                return { success: false, error: "Erreur lors de l'upload des documents." };
            }

            filePaths[key] = uploadData.path;
        }

        // Insert to DB
        const { error: insertError } = await supabaseAdmin
            .from('bookings')
            .insert({
                start_date: rawData.startDate,
                end_date: rawData.endDate,
                start_time: rawData.startTime,
                end_time: rawData.endTime,
                mileage_type: rawData.mileage,
                total_price: priceResult.totalPrice,
                status: 'pending',
                customer_firstname: rawData.firstname,
                customer_lastname: rawData.lastname,
                customer_email: rawData.email,
                customer_phone: rawData.phone,
                customer_message: rawData.message,
                deposit_method: formData.get('deposit_method') as string || 'imprint',
                document_id_card: filePaths.idCard,
                document_license: filePaths.license,
                document_proof: filePaths.proof,
            });

        if (insertError) {
            console.error('DB Insert Error:', insertError);
            return { success: false, error: "Erreur lors de l'enregistrement." };
        }

        // Send Emails via Resend
        try {
            // 1. Alert Admin
            await resend.emails.send({
                from: EMAIL_FROM,
                to: EMAIL_ADMIN,
                subject: 'Nouvelle Demande de Location - Perfect Drive',
                react: AdminNewBookingTemplate({
                    firstname: rawData.firstname,
                    lastname: rawData.lastname,
                    email: rawData.email,
                    phone: rawData.phone,
                    startDate: rawData.startDate.toLocaleDateString('fr-FR'),
                    endDate: rawData.endDate.toLocaleDateString('fr-FR'),
                    startTime: rawData.startTime,
                    endTime: rawData.endTime,
                    totalPrice: priceResult.totalPrice,
                    mileage: rawData.mileage,
                    depositMethod: formData.get('deposit_method') as string || 'imprint',
                    hasIdDocument: !!filePaths.idCard,
                    hasLicenseDocument: !!filePaths.license,
                    hasProofDocument: !!filePaths.proof,
                    customerMessage: rawData.message,
                }) as React.ReactElement,
            });

            // 2. Confirm to Customer
            await resend.emails.send({
                from: EMAIL_FROM,
                to: rawData.email,
                subject: 'Votre demande de location - Perfect Drive',
                react: CustomerReceivedTemplate({
                    firstname: rawData.firstname,
                }) as React.ReactElement,
            });
        } catch (emailError) {
            console.error('Email Error:', emailError);
            // Don't fail the booking if emails fail, just log it
        }

        revalidatePath('/admin');
        return { success: true };

    } catch (error) {
        console.error('Server Action Error:', error);
        return { success: false, error: "Une erreur inattendue est survenue." };
    }
}

export async function getUnavailableDates(): Promise<string[]> {
    try {
        const { data, error } = await supabaseAdmin.rpc('get_unavailable_dates');

        if (error) {
            console.error('RPC Error:', error);
            return [];
        }

        // data is array of objects { date: "yyyy-mm-dd" }
        return (data as Array<{ date: string }>)?.map((d) => d.date) || [];
    } catch (e) {
        console.error('Error fetching unavailable dates:', e);
        return [];
    }
}
