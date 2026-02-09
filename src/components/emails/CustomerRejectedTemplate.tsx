
import * as React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

interface CustomerRejectedTemplateProps {
    firstname: string;
    reason?: string;
}

export const CustomerRejectedTemplate = ({
    firstname,
    reason,
}: CustomerRejectedTemplateProps) => {
    return (
        <EmailLayout preview={`Mise à jour concernant votre demande`}>
            <Text className="text-xl font-bold text-white mb-4">
                Concernant votre demande de location
            </Text>

            <Text className="text-gray-300 mb-6">
                Bonjour {firstname},
            </Text>

            <Text className="text-gray-300 mb-6">
                Nous vous remercions pour l&apos;intérêt que vous portez à Perfect Drive.
                Malheureusement, nous ne sommes pas en mesure de donner une suite favorable à votre demande de location pour les dates sélectionnées.
            </Text>

            {reason && (
                <Section className="bg-red-900/10 border border-red-500/20 rounded-lg p-4 mb-6">
                    <Text className="text-red-400 font-bold text-sm mb-2">Raison</Text>
                    <Text className="text-gray-300 m-0">{reason}</Text>
                </Section>
            )}

            <Text className="text-gray-300 mb-6">
                Cela est souvent dû à une indisponibilité du véhicule ou à des critères d&apos;assurance non remplis.
                N&apos;hésitez pas à effectuer une nouvelle demande pour d&apos;autres dates ou un autre véhicule.
            </Text>

            <Section className="text-center mt-6">
                <Button
                    href="https://perfect-drive.fr/catalog"
                    className="bg-white/10 text-white font-bold py-3 px-6 rounded-full text-center hover:bg-white/20 transition-colors border border-white/10"
                >
                    Voir nos autres véhicules
                </Button>
            </Section>

        </EmailLayout>
    );
};

export default CustomerRejectedTemplate;
