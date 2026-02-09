import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Html,
    Link,
    Section,
    Text,
    Font,
    Preview,
} from '@react-email/components';

interface EmailLayoutProps {
    children: React.ReactNode;
    heading?: string;
    preview?: string;
}

export const EmailLayout = ({ children, heading, preview }: EmailLayoutProps) => {
    return (
        <Html lang="fr">
            <Head>
                <Font
                    fontFamily="Montserrat"
                    fallbackFontFamily="Verdana"
                    webFont={{
                        url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap',
                        format: 'woff2',
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
                <style>{`
          body {
            background-color: #070b13;
            color: #ffffff;
            font-family: 'Montserrat', Verdana, sans-serif;
          }
          .bg-darkbg { background-color: #070b13; }
          .bg-panel { background-color: #1a1f2e; }
          .bg-alpine { background-color: #0051ff; }
          .text-white { color: #ffffff; }
          .text-alpine { color: #0051ff; }
          .text-gray-300 { color: #d1d5db; }
          .text-gray-400 { color: #9ca3af; }
          
          .glass-panel {
            background-color: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }
        `}</style>
            </Head>
            {preview && <Preview>{preview}</Preview>}
            <Body className="bg-darkbg text-white m-0 p-0" style={{ backgroundColor: '#070b13', color: '#ffffff', fontFamily: "'Montserrat', Verdana, sans-serif" }}>
                <Container className="mx-auto my-0 p-4 max-w-[600px]">
                    {/* Header */}
                    <Section className="mt-8 mb-8 text-center">
                        <Text className="text-2xl font-bold tracking-widest uppercase text-white m-0" style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ffffff', margin: 0 }}>
                            Perfect <span className="text-alpine" style={{ color: '#0051ff' }}>Drive</span>
                        </Text>
                    </Section>

                    {/* Main Content Card */}
                    <Section className="bg-panel rounded-2xl border border-white/10 p-8 shadow-lg" style={{ backgroundColor: '#1a1f2e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}>
                        {heading && (
                            <Text className="text-xl font-bold text-white mb-4" style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', marginBottom: '16px' }}>
                                {heading}
                            </Text>
                        )}
                        {children}
                    </Section>

                    {/* Footer */}
                    <Section className="mt-8 text-center text-gray-400 text-xs">
                        <Text className="m-0 mb-4" style={{ margin: '0 0 16px 0', color: '#9ca3af', fontSize: '12px' }}>
                            © {new Date().getFullYear()} Perfect Drive. Tous droits réservés.
                        </Text>
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <Link href="https://perfect-drive.fr" className="text-alpine hover:underline mx-2" style={{ color: '#0051ff', margin: '0 8px', textDecoration: 'none' }}>
                                Site Web
                            </Link>
                            <Link href="mailto:contact@perfect-drive.fr" className="text-alpine hover:underline mx-2" style={{ color: '#0051ff', margin: '0 8px', textDecoration: 'none' }}>
                                Nous contacter
                            </Link>
                        </div>
                        <Text className="m-0 text-gray-600" style={{ margin: 0, color: '#4b5563', fontSize: '12px' }}>
                            Vous recevez cet email car vous avez effectué une demande sur notre site.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default EmailLayout;
