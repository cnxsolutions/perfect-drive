
import * as React from 'react';
import { Section, Text, Button, Row, Column, Hr } from '@react-email/components';
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
        <EmailLayout preview={`Réservation confirmée ✅ - Préparez votre départ !`}>
            <Text className="text-xl font-bold text-white mb-4">
                C'est tout bon ! 🏎️
            </Text>

            <Text className="text-gray-300 mb-6">
                Félicitations {firstname}, votre réservation est officiellement confirmée.
            </Text>

            <Section className="bg-black/20 rounded-lg p-6 mb-6 border border-alpine/30">
                <Text className="text-alpine font-bold text-lg mb-4 text-center">Récapitulatif</Text>

                <Row className="mb-4">
                    <Column>
                        <Text className="text-gray-400 text-xs uppercase m-0">Départ</Text>
                        <Text className="text-white font-bold m-0">{startDate}</Text>
                    </Column>
                    <Column>
                        <Text className="text-gray-400 text-xs uppercase m-0">Retour</Text>
                        <Text className="text-white font-bold m-0">{endDate}</Text>
                    </Column>
                </Row>
                <Row>
                    <Column>
                        <Text className="text-gray-400 text-xs uppercase m-0">Total</Text>
                        <Text className="text-white font-bold m-0">{totalPrice}€</Text>
                    </Column>
                </Row>
            </Section>

            <Section>
                <Text className="text-white font-bold mb-2">📍 Lieu de rendez-vous</Text>
                <Text className="text-gray-300 m-0 mb-4">
                    Un membre de notre équipe vous contactera sous peu pour convenir des détails exacts de la remise des clés.
                </Text>

                <Text className="text-white font-bold mb-2">📞 Une question ?</Text>
                <Text className="text-gray-300 m-0">
                    N'hésitez pas à nous contacter par réponse à cet email ou par téléphone.
                </Text>
            </Section>

        </EmailLayout>
    );
};

export default CustomerConfirmedTemplate;
