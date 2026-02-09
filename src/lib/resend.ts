import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = 'Perfect Drive <noreply@p-drive.fr>'; // Replace with verified domain

export const EMAIL_ADMIN = ['contact.perfectdrive@gmail.com', 'sammahdb170@gmail.com']; // Admin emails for notifications
export const EMAIL_SUPPORT = 'contact.perfectdrive@gmail.com'; // Public support email
