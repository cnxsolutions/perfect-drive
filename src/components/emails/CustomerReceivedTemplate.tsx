
import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

interface CustomerReceivedTemplateProps {
    firstname: string;
}

export const CustomerReceivedTemplate = ({
    firstname,
}: CustomerReceivedTemplateProps) => {
    return (
        <EmailLayout preview={`Votre demande est bien reçue, ${firstname} !`}>
            <Text className="text-xl font-bold text-white mb-4">
                Merci pour votre demande ! 🙌
            </Text>

            <Text className="text-gray-300 mb-6">
                Bonjour {firstname},
            </Text>

            <Text className="text-gray-300 mb-6">
                Nous avons bien reçu votre demande de location chez <strong>Perfect Drive</strong>.
            </Text>

            <Section className="bg-alpine/10 border border-alpine/20 rounded-lg p-6 mb-6">
                <Text className="text-alpine font-bold text-lg mb-2">Prochaine étape</Text>
                <Text className="text-gray-300 m-0">
                    Notre équipe va examiner votre dossier (documents et disponibilité du véhicule).
                    Vous recevrez une réponse sous <strong>24h maximum</strong>.
                </Text>
            </Section>

            <Text className="text-gray-400 text-sm text-center italic">
                Si votre dossier est validé, vous recevrez un lien pour régler l&apos;acompte et bloquer définitivement le véhicule.
            </Text>

        </EmailLayout>
    );
};

export default CustomerReceivedTemplate;
