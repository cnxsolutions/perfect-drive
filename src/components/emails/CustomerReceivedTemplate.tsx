import * as React from 'react';
import { Text, Hr } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

interface CustomerReceivedTemplateProps {
    firstname: string;
    vehicleBrand: string;
    vehicleModel: string;
}

export const CustomerReceivedTemplate = ({
    firstname,
    vehicleBrand,
    vehicleModel,
}: CustomerReceivedTemplateProps) => {
    return (
        <EmailLayout preview={`Votre demande est bien reçue, ${firstname} !`}>
            <Text style={headingStyle}>
                Merci pour votre demande ! 🙌
            </Text>

            <Text style={paragraphStyle}>
                Bonjour {firstname},
            </Text>

            <Text style={paragraphStyle}>
                Nous avons bien reçu votre demande de location pour le véhicule <strong>{vehicleBrand} {vehicleModel}</strong> chez <strong>Perfect Drive</strong>.
            </Text>

            <Hr style={dividerStyle} />

            <Text style={sectionTitleStyle}>Prochaine étape</Text>
            <Text style={paragraphStyle}>
                Notre équipe va examiner votre dossier (documents et disponibilité du véhicule).
                Vous recevrez une réponse sous <strong>24h maximum</strong>.
            </Text>

            <Hr style={dividerStyle} />

            <Text style={disclaimerStyle}>
                Si votre dossier est validé, vous recevrez un lien pour régler l'acompte et bloquer définitivement le véhicule.
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

const sectionTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#0051ff',
    marginTop: '16px',
    marginBottom: '8px',
};

const dividerStyle: React.CSSProperties = {
    borderColor: '#e5e7eb',
    margin: '24px 0',
};

const disclaimerStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    margin: 0,
};

export default CustomerReceivedTemplate;
