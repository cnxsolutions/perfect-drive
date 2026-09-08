'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { resend, EMAIL_FROM } from '@/lib/resend';
import { CustomerPaymentLinkTemplate } from '@/components/emails/CustomerPaymentLinkTemplate';
import { CustomerRejectedTemplate } from '@/components/emails/CustomerRejectedTemplate';
import { CustomerConfirmedTemplate } from '@/components/emails/CustomerConfirmedTemplate';
import { CustomerReceivedTemplate } from '@/components/emails/CustomerReceivedTemplate';
import { AdminNewBookingTemplate } from '@/components/emails/AdminNewBookingTemplate';
import React from 'react';
import { echec } from '@/lib/errors';

export async function approveBooking(bookingId: string) {
    try {
        // 1. Update Booking to 'approved' (Final Step)
        const { data: booking, error } = await supabaseAdmin
            .from('bookings')
            .update({
                status: 'approved',
            })
            .eq('id', bookingId)
            .select('*, vehicles(*)')
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
                        vehicleBrand: `${(booking.vehicles as any)?.name || 'Véhicule'} ${(booking.vehicles as any)?.trim || ''}`.replace(/Default/g, '').trim(),
                        vehicleModel: '',
                    }) as React.ReactElement,
                });
            } catch (emailError) {
                console.error('Confirmation Email Error:', emailError);
            }
        }

        revalidatePath('/admin');
        return { success: true as const };
    } catch (error) {
        return echec('approveBooking', error, 'reservation');
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
            .select('*, vehicles(*)')
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
                        vehicleBrand: `${(booking.vehicles as any)?.name || 'Véhicule'} ${(booking.vehicles as any)?.trim || ''}`.replace(/Default/g, '').trim(),
                        vehicleModel: '',
                    }) as React.ReactElement,
                });
            } catch (emailError) {
                console.error('Email Error:', emailError);
            }
        }

        revalidatePath('/admin');
        return { success: true as const };
    } catch (error) {
        return echec('sendPaymentLink', error, 'reservation');
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
            .select('*, vehicles(*)')
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
                        vehicleBrand: `${(booking.vehicles as any)?.name || 'Véhicule'} ${(booking.vehicles as any)?.trim || ''}`.replace(/Default/g, '').trim(),
                        vehicleModel: '',
                    }) as React.ReactElement,
                });
            } catch (emailError) {
                console.error('Email Error:', emailError);
            }
        }

        revalidatePath('/admin');
        return { success: true as const };
    } catch (error) {
        return echec('rejectBooking', error, 'reservation');
    }
}

export async function getDocumentUrl(path: string) {
    try {
        const { data, error } = await supabaseAdmin
            .storage
            .from('booking-documents')
            .createSignedUrl(path, 60 * 60); // 1 hour expiry

        if (error) throw error;
        return { success: true as const, url: data.signedUrl };
    } catch (e) {
        return echec('getDocumentUrl', e, 'document');
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
        return { success: true as const };
    } catch (error) {
        return echec('deleteBooking', error, 'reservation');
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
            vehicleId: formData.get('vehicle_id') as string,
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
                vehicle_id: rawData.vehicleId,
            });

        if (insertError) {
            return echec('createAdminBooking.insert', insertError, 'reservation');
        }

        // 3. Send Confirmation Email to Customer (if email provided)
        if (rawData.email) {
            try {
                // Fetch vehicle info for email
                const { data: vehicle } = await supabaseAdmin
                    .from('vehicles')
                    .select('*')
                    .eq('id', rawData.vehicleId)
                    .single();

                if (vehicle) {
                    await resend.emails.send({
                        from: EMAIL_FROM,
                        to: rawData.email,
                        subject: 'Votre réservation - Perfect Drive',
                        react: CustomerReceivedTemplate({
                            firstname: rawData.firstname,
                            vehicleName: vehicle.name || 'Véhicule',
                            vehicleBrand: vehicle.brand || '',
                            vehicleModel: vehicle.model || '',
                            vehicleTrim: vehicle.trim || '',
                            vehicleColor: vehicle.color || '',
                        }) as React.ReactElement,
                    });
                }
            } catch (emailError) {
                console.error('Admin manual booking email error:', emailError);
            }
        }

        revalidatePath('/admin');
        return { success: true as const };

    } catch (error) {
        return echec('createAdminBooking', error, 'reservation');
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
            vehicleId: formData.get('vehicle_id') as string,
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

        if (rawData.vehicleId) {
            updateData.vehicle_id = rawData.vehicleId;
        }

        // Only update document paths if new files were uploaded
        if (filePaths.idCard) updateData.document_id_card = filePaths.idCard;
        if (filePaths.license) updateData.document_license = filePaths.license;
        if (filePaths.proof) updateData.document_proof = filePaths.proof;

        const { error: updateError } = await supabaseAdmin
            .from('bookings')
            .update(updateData)
            .eq('id', bookingId);

        if (updateError) {
            return echec('updateAdminBooking.update', updateError, 'reservation');
        }

        revalidatePath('/admin');
        return { success: true as const };

    } catch (error) {
        return echec('updateAdminBooking', error, 'reservation');
    }
}
// ============================================
// VEHICLE MANAGEMENT ACTIONS
// ============================================

async function uploadVehicleImages(formData: FormData): Promise<string[]> {
    const images = formData.getAll('images') as File[];
    const uploadedUrls: string[] = [];
    const { randomUUID } = await import('crypto');

    for (const image of images) {
        if (image && image.size > 0) {
            const fileExt = image.name.split('.').pop();
            const fileName = `vehicle_${randomUUID()}.${fileExt}`;
            const arrayBuffer = await image.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const { data, error } = await supabaseAdmin
                .storage
                .from('vehicle-images')
                .upload(fileName, buffer, {
                    contentType: image.type,
                    upsert: false
                });

            if (error) {
                console.error('Upload Error:', error);
                continue;
            }

            const { data: { publicUrl } } = supabaseAdmin
                .storage
                .from('vehicle-images')
                .getPublicUrl(data.path);

            uploadedUrls.push(publicUrl);
        }
    }

    return uploadedUrls;
}

export async function createVehicle(formData: FormData) {
    try {
        const uploadedUrls = await uploadVehicleImages(formData);
        
        const vehicleName = (formData.get('name') as string) || '';
        const vehicleTrim = (formData.get('trim') as string) || '';

        const data = {
            name: vehicleName,
            trim: vehicleTrim,
            color: (formData.get('color') as string) || '',
            brand: (formData.get('brand') as string) || vehicleName,
            model: (formData.get('model') as string) || vehicleTrim,
            registration_number: formData.get('registration_number') as string,
            daily_rate: parseFloat(formData.get('daily_rate') as string) || 0,
            weekend_rate: parseFloat(formData.get('weekend_rate') as string) || 0,
            unlimited_rate: parseFloat(formData.get('unlimited_rate') as string) || 0,
            weekend_unlimited_rate: parseFloat(formData.get('weekend_unlimited_rate') as string) || 0,
            // Les colonnes weekend_72h_rate / weekend_72h_unlimited_rate ont ete
            // supprimees par la migration 20260403_drop_72h_rates.sql. Les envoyer,
            // meme a null, faisait rejeter TOUTE creation de vehicule par PostgREST
            // (PGRST204), sous le message opaque « Echec de la creation du vehicule ».
            description: (formData.get('description') as string) || '',
            is_available: formData.get('is_available') === 'true',
            allow_unlimited_mileage: formData.get('allow_unlimited_mileage') !== 'false',
            deposit_amount: formData.get('deposit_amount') ? parseInt(formData.get('deposit_amount') as string, 10) : 700,
            accounting_cycle_day: formData.get('accounting_cycle_day') ? parseInt(formData.get('accounting_cycle_day') as string, 10) : 26,
            image_url: uploadedUrls[0] || '',
            images: uploadedUrls
        };

        const { data: vehicle, error } = await supabaseAdmin
            .from('vehicles')
            .insert([data])
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true as const, vehicle };
    } catch (error) {
        return echec('createVehicle', error, 'vehicule');
    }
}

export async function getVehicles() {
    try {
        const { data: vehicles, error } = await supabaseAdmin
            .from('vehicles')
            .select(`
                *,
                bookings (
                    start_date,
                    end_date,
                    start_time,
                    end_time,
                    status,
                    total_price
                )
            `)
            .order('name', { ascending: true });

        if (error) throw error;

        // Calcul du statut en temps réel incluant les heures d'arrivée et départ
        const now = new Date();
        
        const enrichedVehicles = vehicles?.map((vehicle: any) => {
            const activeBookings = vehicle.bookings || [];
            
            // Determine the start and end of the accounting period for this specific vehicle
            const cycleDay = vehicle.accounting_cycle_day || 26;
            let periodStart = new Date(now.getFullYear(), now.getMonth(), cycleDay, 0, 0, 0);
            let periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, cycleDay, 0, 0, 0);

            if (now.getDate() < cycleDay) {
                periodStart = new Date(now.getFullYear(), now.getMonth() - 1, cycleDay, 0, 0, 0);
                periodEnd = new Date(now.getFullYear(), now.getMonth(), cycleDay, 0, 0, 0);
            }
            
            let rentalState = 'available';
            let monthlyRevenue = 0;

            for (const b of activeBookings) {
                if (b.status !== 'approved' && b.status !== 'paid') continue;
                
                // Format time string to handle Postgres "HH:mm:ss" vs normal "HH:mm"
                const sTime = b.start_time ? b.start_time.substring(0, 5) : '00:00';
                const eTime = b.end_time ? b.end_time.substring(0, 5) : '23:59';
                
                // Construct Date objects from date and time
                const startDateTime = new Date(`${b.start_date}T${sTime}:00`);
                const endDateTime = new Date(`${b.end_date}T${eTime}:59`);
                
                // Add to monthly revenue if it starts in the current accounting period AND has already started
                if (
                    startDateTime >= periodStart && 
                    startDateTime < periodEnd &&
                    startDateTime <= now
                ) {
                    monthlyRevenue += Number(b.total_price || 0);
                }

                const isStartToday = startDateTime.toDateString() === now.toDateString();
                const isEndToday = endDateTime.toDateString() === now.toDateString();

                // Si on a dépassé l'heure de début et on n'a pas encore dépassé l'heure de fin
                if (now >= startDateTime && now <= endDateTime) {
                    if (isEndToday) {
                        rentalState = 'return_today';
                    } else {
                        rentalState = 'rented';
                    }
                    // Do not break here because we need to calculate total monthlyRevenue for all activeBookings
                    // Or we could break if we did a separated loop for revenue.
                    // Let's not break!
                }
                
                // Si la réservation commence aujourd'hui mais l'heure de départ n'est pas encore passée
                if (isStartToday && now < startDateTime && rentalState === 'available') {
                    if (isEndToday) {
                        rentalState = 'departure_and_return_today';
                    } else {
                        rentalState = 'departure_today';
                    }
                }
            }

            // Supprimer le tableau lourd des réservations pour la réponse
            delete vehicle.bookings;

            return {
                ...vehicle,
                is_currently_rented: rentalState !== 'available' && rentalState !== 'departure_today' && rentalState !== 'departure_and_return_today',
                current_rental_state: rentalState,
                monthly_revenue: monthlyRevenue
            };
        });

        return { success: true as const, vehicles: enrichedVehicles };
    } catch (error) {
        return echec('getVehicles', error, 'vehicule');
    }
}

export async function getVehicleById(id: string) {
    try {
        const { data: vehicle, error } = await supabaseAdmin
            .from('vehicles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return { success: true as const, vehicle };
    } catch (error) {
        return echec('getVehicleById', error, 'vehicule');
    }
}

export async function updateVehicle(id: string, formData: FormData) {
    try {
        const existingImages = JSON.parse(formData.get('existingImages') as string || '[]');
        const newUploadedUrls = await uploadVehicleImages(formData);
        
        const allImages = [...existingImages, ...newUploadedUrls];

        const data = {
            name: formData.get('name') as string,
            trim: formData.get('trim') as string,
            color: formData.get('color') as string,
            brand: formData.get('brand') as string,
            model: formData.get('model') as string,
            registration_number: formData.get('registration_number') as string,
            daily_rate: parseFloat(formData.get('daily_rate') as string) || 0,
            weekend_rate: parseFloat(formData.get('weekend_rate') as string) || 0,
            unlimited_rate: parseFloat(formData.get('unlimited_rate') as string) || 0,
            weekend_unlimited_rate: parseFloat(formData.get('weekend_unlimited_rate') as string) || 0,
            // Colonnes supprimees par 20260403_drop_72h_rates.sql : voir createVehicle.
            description: formData.get('description') as string,
            is_available: formData.get('is_available') === 'true',
            allow_unlimited_mileage: formData.get('allow_unlimited_mileage') !== 'false',
            deposit_amount: formData.get('deposit_amount') ? parseInt(formData.get('deposit_amount') as string, 10) : 700,
            accounting_cycle_day: formData.get('accounting_cycle_day') ? parseInt(formData.get('accounting_cycle_day') as string, 10) : 26,
            image_url: allImages[0] || '',
            images: allImages,
            updated_at: new Date().toISOString()
        };

        const { data: vehicle, error } = await supabaseAdmin
            .from('vehicles')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true as const, vehicle };
    } catch (error) {
        return echec('updateVehicle', error, 'vehicule');
    }
}

export async function deleteVehicle(id: string) {
    try {
        const { error } = await supabaseAdmin
            .from('vehicles')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin');
        return { success: true as const };
    } catch (error) {
        return echec('deleteVehicle', error, 'vehicule');
    }
}

/**
 * Visibilite du vehicule sur le site public.
 *
 * A ne pas confondre avec `is_available`, qui dit si le vehicule est louable.
 * L'ecran Vehicules affichait un bouton « Visible / Masque » qui lisait et
 * ecrivait `is_available` : un vehicule masque aux clients s'y annoncait
 * « Visible », et aucun ecran ne permettait de modifier `is_visible`.
 */
export async function toggleVehicleVisibility(id: string, isVisible: boolean) {
    try {
        const { data: vehicle, error } = await supabaseAdmin
            .from('vehicles')
            .update({ is_visible: isVisible })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true as const, vehicle };
    } catch (error) {
        return echec('toggleVehicleVisibility', error, 'vehicule');
    }
}

export async function toggleVehicleAvailability(id: string, isAvailable: boolean) {
    try {
        const { data: vehicle, error } = await supabaseAdmin
            .from('vehicles')
            .update({ is_available: isAvailable })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/admin');
        return { success: true as const, vehicle };
    } catch (error) {
        return echec('toggleVehicleAvailability', error, 'vehicule');
    }
}