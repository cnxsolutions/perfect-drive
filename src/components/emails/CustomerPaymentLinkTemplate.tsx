
import * as React from 'react';
import { Section, Text, Button, Hr } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

interface CustomerPaymentLinkTemplateProps {
    firstname: string;
    paymentLink: string;
}

export const CustomerPaymentLinkTemplate = ({
    firstname,
    paymentLink,
}: CustomerPaymentLinkTemplateProps) => {
    return (
        <EmailLayout preview={`Bonne nouvelle ! Votre véhicule est disponible 🚗`}>
            <Text className="text-xl font-bold text-white mb-4">
                Votre dossier est validé ! 🎉
            </Text>

            <Text className="text-gray-300 mb-6">
                Bonjour {firstname},
            </Text>

            <Text className="text-gray-300 mb-6">
                Nous avons le plaisir de vous informer que votre demande de location a été acceptée et que le véhicule est disponible.
            </Text>

            <Section className="text-center my-8">
                <Text className="text-white mb-4">
                    Pour confirmer définitivement votre réservation, veuillez régler l&apos;acompte via le lien sécurisé ci-dessous :
                </Text>

                <Button
                    href={paymentLink}
                    className="bg-alpine text-white font-bold py-4 px-8 rounded-full text-center hover:bg-alpine/90 transition-colors text-lg" // Larger button for CTA
                >
                    Régler l&apos;acompte
                </Button>
            </Section>

            <Hr className="border-white/10 my-6" />

            <Text className="text-gray-400 text-xs text-center">
                Ce lien est valable 24h. Passé ce délai, la réservation sera automatiquement annulée.
            </Text>

        </EmailLayout>
    );
};

export default CustomerPaymentLinkTemplate;
