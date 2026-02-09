
import * as React from 'react';
import { Section, Text, Button, Row, Column, Hr } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

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
    idDocumentPath?: string;
    licenseDocumentPath?: string;
    proofDocumentPath?: string;
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
}: AdminNewBookingTemplateProps) => {
    return (
        <EmailLayout preview={`Nouvelle demande de ${firstname} ${lastname}`}>
            <Text className="text-xl font-bold text-white mb-4">
                Nouvelle Demande de Location 🚗
            </Text>
            <Text className="text-gray-300 mb-6">
                Une nouvelle demande de réservation a été effectuée sur le site. Voici les détails :
            </Text>

            <Section className="bg-black/20 rounded-lg p-4 mb-6 border border-white/5">
                <Text className="text-alpine font-bold text-sm tracking-wider uppercase mb-2">Client</Text>
                <Text className="text-white m-0"><strong>Nom :</strong> {firstname} {lastname}</Text>
                <Text className="text-white m-0"><strong>Email :</strong> {email}</Text>
                <Text className="text-white m-0"><strong>Téléphone :</strong> {phone}</Text>
            </Section>

            <Section className="bg-black/20 rounded-lg p-4 mb-6 border border-white/5">
                <Text className="text-alpine font-bold text-sm tracking-wider uppercase mb-2">Réservation</Text>

                <Row className="mb-2">
                    <Column>
                        <Text className="text-gray-400 text-xs uppercase m-0">Départ</Text>
                        <Text className="text-white font-bold m-0">{startDate} {startTime && `à ${startTime}`}</Text>
                    </Column>
                    <Column>
                        <Text className="text-gray-400 text-xs uppercase m-0">Retour</Text>
                        <Text className="text-white font-bold m-0">{endDate} {endTime && `à ${endTime}`}</Text>
                    </Column>
                </Row>

                <Hr className="border-white/10 my-3" />

                <Row>
                    <Column>
                        <Text className="text-gray-400 text-xs uppercase m-0">Kilométrage</Text>
                        <Text className="text-white m-0">{mileage === 'unlimited' ? 'Illimité' : 'Standard'}</Text>
                    </Column>
                    <Column>
                        <Text className="text-gray-400 text-xs uppercase m-0">Caution</Text>
                        <Text className="text-white m-0">{depositMethod === 'transfer' ? 'Virement' : 'Empreinte CB'}</Text>
                    </Column>
                </Row>
            </Section>

            <Section className="bg-black/20 rounded-lg p-4 mb-6 border border-white/5">
                <Text className="text-alpine font-bold text-sm tracking-wider uppercase mb-2">Documents Reçus</Text>
                <Text className="text-white m-0">
                    {hasIdDocument ? '✅' : '❌'} Pièce d&apos;identité<br />
                    {hasLicenseDocument ? '✅' : '❌'} Permis de conduire<br />
                    {hasProofDocument ? '✅' : '❌'} Justificatif de domicile
                </Text>
            </Section>

            {customerMessage && (
                <Section className="bg-black/20 rounded-lg p-4 mb-6 border border-white/5">
                    <Text className="text-alpine font-bold text-sm tracking-wider uppercase mb-2">Message du client</Text>
                    <Text className="text-white italic m-0">&quot;{customerMessage}&quot;</Text>
                </Section>
            )}

            <Section className="text-center mt-6">
                <Text className="text-3xl font-bold text-alpine mb-6">
                    {totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </Text>

                <Button
                    href="https://perfect-drive.fr/admin" // Replace with actual admin URL
                    className="bg-alpine text-white font-bold py-3 px-8 rounded-full text-center hover:bg-alpine/90 transition-colors w-full"
                >
                    Gérer la demande
                </Button>
            </Section>

        </EmailLayout>
    );
};

export default AdminNewBookingTemplate;
