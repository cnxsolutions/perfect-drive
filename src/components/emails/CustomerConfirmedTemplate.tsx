import * as React from 'react';
import { Text, Hr } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

interface CustomerConfirmedTemplateProps {
    firstname: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
}

export const CustomerConfirmedTemplate = ({
    firstname,
    startDate,
    endDate,
    totalPrice,
}: CustomerConfirmedTemplateProps) => {
    return (
        <EmailLayout preview="Réservation confirmée ✅">
            <Text style={headingStyle}>
                C'est tout bon ! 🏎️
            </Text>

            <Text style={paragraphStyle}>
                Félicitations {firstname}, votre réservation est officiellement confirmée.
            </Text>

            <Hr style={dividerStyle} />

            <Text style={sectionTitleStyle}>Récapitulatif</Text>
            <Text style={infoTextStyle}>
                <strong>Départ :</strong> {startDate}<br />
                <strong>Retour :</strong> {endDate}<br />
                <strong>Total :</strong> {totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </Text>

            <Hr style={dividerStyle} />

            <Text style={sectionTitleStyle}>📍 Lieu de rendez-vous</Text>
            <Text style={paragraphStyle}>
                Un membre de notre équipe vous contactera sous peu pour convenir des détails exacts de la remise des clés.
            </Text>

            <Text style={sectionTitleStyle}>📞 Une question ?</Text>
            <Text style={paragraphStyle}>
                N'hésitez pas à nous contacter par réponse à cet email ou par téléphone.
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

const infoTextStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#1a1a1a',
    lineHeight: '1.8',
    margin: '0 0 16px 0',
};

const dividerStyle: React.CSSProperties = {
    borderColor: '#e5e7eb',
    margin: '24px 0',
};

export default CustomerConfirmedTemplate;
