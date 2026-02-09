import * as React from 'react';
import { Text, Hr } from '@react-email/components';
import { EmailLayout } from './EmailLayout';
import { EmailButton } from './EmailButton';

interface CustomerPaymentLinkTemplateProps {
    firstname: string;
    paymentLink: string;
}

export const CustomerPaymentLinkTemplate = ({
    firstname,
    paymentLink,
}: CustomerPaymentLinkTemplateProps) => {
    return (
        <EmailLayout preview="Votre véhicule est disponible 🚗">
            <Text style={headingStyle}>
                Votre dossier est validé ! 🎉
            </Text>

            <Text style={paragraphStyle}>
                Bonjour {firstname},
            </Text>

            <Text style={paragraphStyle}>
                Nous avons le plaisir de vous informer que votre demande de location a été acceptée et que le véhicule est disponible.
            </Text>

            <Text style={paragraphStyle}>
                Pour confirmer définitivement votre réservation, veuillez régler l'acompte via le lien sécurisé ci-dessous :
            </Text>

            <div style={ctaContainerStyle}>
                <EmailButton href={paymentLink}>
                    Régler l'acompte
                </EmailButton>
            </div>

            <Hr style={dividerStyle} />

            <Text style={disclaimerStyle}>
                Ce lien est valable 24h. Passé ce délai, la réservation sera automatiquement annulée.
            </Text>
        </EmailLayout>
    );
};

// Styles
const headingStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 0,
    marginBottom: '16px',
};

const paragraphStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.6',
    margin: '0 0 16px 0',
};

const ctaContainerStyle: React.CSSProperties = {
    textAlign: 'center',
    margin: '32px 0',
};

const dividerStyle: React.CSSProperties = {
    borderColor: '#e5e7eb',
    margin: '24px 0',
};

const disclaimerStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center',
    margin: 0,
};

export default CustomerPaymentLinkTemplate;
