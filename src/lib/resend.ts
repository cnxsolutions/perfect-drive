import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = 'Perfect Drive <noreply@p-drive.fr>'; // Replace with verified domain
export const EMAIL_ADMIN = 'chemlalnassim3@gmail.com'; // Replace with actual admin email
