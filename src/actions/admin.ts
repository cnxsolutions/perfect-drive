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
            console.error('DB Insert Error:', insertError);
            return { success: false, error: "Erreur lors de la création." };
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
                            vehicleBrand: `${vehicle.name || 'Véhicule'} ${vehicle.trim || ''}`.replace(/Default/g, '').trim(),
                            vehicleModel: '',
                        }) as React.ReactElement,
                    });
                }
            } catch (emailError) {
                console.error('Admin manual booking email error:', emailError);
            }
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
            vehicle_id: rawData.vehicleId,
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
            weekend_72h_rate: formData.get('weekend_72h_rate') ? parseFloat(formData.get('weekend_72h_rate') as string) : null,
            weekend_72h_unlimited_rate: formData.get('weekend_72h_unlimited_rate') ? parseFloat(formData.get('weekend_72h_unlimited_rate') as string) : null,
            description: formData.get('description') as string,
            is_available: formData.get('is_available') === 'true',
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
        return { success: true, vehicle };
    } catch (error) {
        console.error('Error creating vehicle:', error);
        return { success: false, error: 'Échec de la création du véhicule' };
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
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Calcul du statut en temps réel incluant les heures d'arrivée et départ
        const now = new Date();
        // Determine the start and end of the current accounting period (from 26th to 26th)
        let periodStart = new Date(now.getFullYear(), now.getMonth(), 26, 0, 0, 0);
        let periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 26, 0, 0, 0);

        if (now.getDate() < 26) {
            periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 26, 0, 0, 0);
            periodEnd = new Date(now.getFullYear(), now.getMonth(), 26, 0, 0, 0);
        }
        
        const enrichedVehicles = vehicles?.map((vehicle: any) => {
            const activeBookings = vehicle.bookings || [];
            
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

        return { success: true, vehicles: enrichedVehicles };
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        return { success: false, error: 'Échec du chargement des véhicules' };
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

        return { success: true, vehicle };
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        return { success: false, error: 'Véhicule non trouvé' };
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
            brand: formData.get('brand') as string,
            model: formData.get('model') as string,
            registration_number: formData.get('registration_number') as string,
            daily_rate: parseFloat(formData.get('daily_rate') as string) || 0,
            weekend_rate: parseFloat(formData.get('weekend_rate') as string) || 0,
            unlimited_rate: parseFloat(formData.get('unlimited_rate') as string) || 0,
            weekend_unlimited_rate: parseFloat(formData.get('weekend_unlimited_rate') as string) || 0,
            weekend_72h_rate: formData.get('weekend_72h_rate') ? parseFloat(formData.get('weekend_72h_rate') as string) : null,
            weekend_72h_unlimited_rate: formData.get('weekend_72h_unlimited_rate') ? parseFloat(formData.get('weekend_72h_unlimited_rate') as string) : null,
            description: formData.get('description') as string,
            is_available: formData.get('is_available') === 'true',
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
        return { success: true, vehicle };
    } catch (error) {
        console.error('Error updating vehicle:', error);
        return { success: false, error: 'Échec de la modification du véhicule' };
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
        return { success: true };
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        return { success: false, error: 'Échec de la suppression du véhicule' };
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
        return { success: true, vehicle };
    } catch (error) {
        console.error('Error updating vehicle availability:', error);
        return { success: false, error: 'Échec de la mise à jour' };
    }
}