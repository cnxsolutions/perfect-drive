import * as React from 'react';
import { Section, Text, Hr } from '@react-email/components';
import { EmailLayout } from './EmailLayout';
import { EmailButton } from './EmailButton';

interface AdminNewBookingTemplateProps {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    totalPrice: number;
    mileage: string;
    depositMethod: string;
    hasIdDocument: boolean;
    hasLicenseDocument: boolean;
    hasProofDocument: boolean;
    customerMessage?: string;
    vehicleBrand: string;
    vehicleModel: string;
    vehicleTrim?: string;
}

export const AdminNewBookingTemplate = ({
    firstname,
    lastname,
    email,
    phone,
    startDate,
    endDate,
    startTime,
    endTime,
    totalPrice,
    mileage,
    depositMethod,
    hasIdDocument,
    hasLicenseDocument,
    hasProofDocument,
    customerMessage,
    vehicleBrand,
    vehicleModel,
    vehicleTrim,
}: AdminNewBookingTemplateProps) => {
    return (
        <EmailLayout preview={`Nouvelle demande de ${firstname} ${lastname}`}>
            <Text style={headingStyle}>
                Nouvelle Demande de Location 🚗
            </Text>

            <Text style={paragraphStyle}>
                Une nouvelle demande de réservation a été effectuée.
            </Text>

            <Hr style={dividerStyle} />

            {/* Client Info */}
            <Text style={sectionTitleStyle}>Client</Text>
            <Text style={infoTextStyle}>
                <strong>Nom :</strong> {firstname} {lastname}<br />
                <strong>Email :</strong> {email}<br />
                <strong>Téléphone :</strong> {phone}
            </Text>

            <Hr style={dividerStyle} />

            {/* Booking Info */}
            <Text style={sectionTitleStyle}>Véhicule & Réservation</Text>
            <Text style={infoTextStyle}>
                <strong>Véhicule :</strong> {vehicleBrand} {vehicleModel} {vehicleTrim && `(${vehicleTrim})`}<br />
                <strong>Départ :</strong> {startDate} {startTime && `à ${startTime}`}<br />
                <strong>Retour :</strong> {endDate} {endTime && `à ${endTime}`}<br />
                <strong>Kilométrage :</strong> {mileage === 'unlimited' ? 'Illimité' : 'Standard'}<br />
                <strong>Caution :</strong> {depositMethod === 'transfer' ? 'Virement' : 'Empreinte CB'}
            </Text>

            <Hr style={dividerStyle} />

            {/* Documents */}
            <Text style={sectionTitleStyle}>Documents Reçus</Text>
            <Text style={infoTextStyle}>
                {hasIdDocument ? '✅' : '❌'} Pièce d'identité<br />
                {hasLicenseDocument ? '✅' : '❌'} Permis de conduire<br />
                {hasProofDocument ? '✅' : '❌'} Justificatif de domicile
            </Text>

            {customerMessage && (
                <>
                    <Hr style={dividerStyle} />
                    <Text style={sectionTitleStyle}>Message du client</Text>
                    <Text style={messageStyle}>
                        "{customerMessage}"
                    </Text>
                </>
            )}

            <Hr style={dividerStyle} />

            {/* Price and CTA */}
            <Section style={ctaSectionStyle}>
                <Text style={priceStyle}>
                    {totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </Text>
                <EmailButton href="https://perfect-drive.fr/admin">
                    Gérer la demande
                </EmailButton>
            </Section>
        </EmailLayout>
    );
};

// Styles (centralized, following DRY)
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
    margin: '0 0 24px 0',
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#0051ff',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '16px',
    marginBottom: '8px',
};

const infoTextStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#1a1a1a',
    lineHeight: '1.8',
    margin: '0 0 16px 0',
};

const messageStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#4b5563',
    fontStyle: 'italic',
    lineHeight: '1.6',
    margin: '0 0 16px 0',
};

const dividerStyle: React.CSSProperties = {
    borderColor: '#e5e7eb',
    margin: '24px 0',
};

const ctaSectionStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: '32px',
};

const priceStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#0051ff',
    margin: '0 0 24px 0',
};

export default AdminNewBookingTemplate;
