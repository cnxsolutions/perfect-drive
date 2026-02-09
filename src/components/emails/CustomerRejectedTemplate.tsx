import * as React from 'react';
import { Text, Hr } from '@react-email/components';
import { EmailLayout } from './EmailLayout';
import { EmailButton } from './EmailButton';

interface CustomerRejectedTemplateProps {
    firstname: string;
    reason?: string;
}

export const CustomerRejectedTemplate = ({
    firstname,
    reason,
}: CustomerRejectedTemplateProps) => {
    return (
        <EmailLayout preview="Mise à jour concernant votre demande">
            <Text style={headingStyle}>
                Concernant votre demande de location
            </Text>

            <Text style={paragraphStyle}>
                Bonjour {firstname},
            </Text>

            <Text style={paragraphStyle}>
                Nous vous remercions pour l'intérêt que vous portez à Perfect Drive.
                Malheureusement, nous ne sommes pas en mesure de donner une suite favorable à votre demande de location pour les dates sélectionnées.
            </Text>

            {reason && (
                <>
                    <Hr style={dividerStyle} />
                    <Text style={reasonTitleStyle}>Raison</Text>
                    <Text style={reasonTextStyle}>{reason}</Text>
                </>
            )}

            <Hr style={dividerStyle} />

            <Text style={paragraphStyle}>
                Cela est souvent dû à une indisponibilité du véhicule ou à des critères d'assurance non remplis.
                N'hésitez pas à effectuer une nouvelle demande pour d'autres dates ou un autre véhicule.
            </Text>

            <div style={ctaContainerStyle}>
                <EmailButton href="https://perfect-drive.fr">
                    Voir nos véhicules
                </EmailButton>
            </div>
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

const reasonTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: '16px',
    marginBottom: '8px',
};

const reasonTextStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#4b5563',
    margin: '0 0 16px 0',
};

const dividerStyle: React.CSSProperties = {
    borderColor: '#e5e7eb',
    margin: '24px 0',
};

const ctaContainerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: '32px',
};

export default CustomerRejectedTemplate;
