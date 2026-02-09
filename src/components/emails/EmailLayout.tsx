
// @ts-nocheck
import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Hr,
} from '@react-email/components';

interface EmailLayoutProps {
    preview?: string;
    children: React.ReactNode;
}

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => {
    const HtmlComponent = Html as any;
    const BodyComponent = Body as any;

    return (
        <HtmlComponent>
            <Head>
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
          
          body {
            background-color: #070b13;
            color: #ffffff;
            font-family: 'Montserrat', Verdana, sans-serif;
          }
          
          .bg-darkbg { background-color: #070b13; }
          .bg-panel { background-color: #1a1f2e; }
          .bg-alpine { background-color: #0051ff; }
          .bg-alpine-10 { background-color: rgba(0, 81, 255, 0.1); }
          .bg-white-10 { background-color: rgba(255, 255, 255, 0.1); }
          .bg-black-20 { background-color: rgba(0, 0, 0, 0.2); }
          .bg-red-900-10 { background-color: rgba(127, 29, 29, 0.1); }

          .text-white { color: #ffffff; }
          .text-alpine { color: #0051ff; }
          .text-gray-300 { color: #d1d5db; }
          .text-gray-400 { color: #9ca3af; }
          .text-gray-600 { color: #4b5563; }
          .text-red-400 { color: #f87171; }
          
          .border { border-width: 1px; border-style: solid; }
          .border-white-10 { border-color: rgba(255, 255, 255, 0.1); }
          .border-white-5 { border-color: rgba(255, 255, 255, 0.05); }
          .border-alpine-20 { border-color: rgba(0, 81, 255, 0.2); }
          .border-alpine-30 { border-color: rgba(0, 81, 255, 0.3); }
          .border-red-500-20 { border-color: rgba(239, 68, 68, 0.2); }

          .rounded-lg { border-radius: 0.5rem; }
          .rounded-2xl { border-radius: 1rem; }
          .rounded-full { border-radius: 9999px; }
          .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
          
          .p-4 { padding: 1rem; }
          .p-6 { padding: 1.5rem; }
          .p-8 { padding: 2rem; }
          .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          .px-8 { padding-left: 2rem; padding-right: 2rem; }
          .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
          .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
          
          .m-0 { margin: 0; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mt-6 { margin-top: 1.5rem; }
          .mt-8 { margin-top: 2rem; }
          .mx-2 { margin-left: 0.5rem; margin-right: 0.5rem; }
          .my-3 { margin-top: 0.75rem; margin-bottom: 0.75rem; }
          .my-6 { margin-top: 1.5rem; margin-bottom: 1.5rem; }
          
          .text-xs { font-size: 0.75rem; line-height: 1rem; }
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
          .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .text-2xl { font-size: 1.5rem; line-height: 2rem; }
          .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
          
          .font-bold { font-weight: 700; }
          .uppercase { text-transform: uppercase; }
          .tracking-wider { letter-spacing: 0.05em; }
          .tracking-widest { letter-spacing: 0.1em; }
          .italic { font-style: italic; }
          .text-center { text-align: center; }
          .flex { display: flex; }
          .justify-center { justify-content: center; }
          .gap-4 { gap: 1rem; }
          
          .w-full { width: 100%; }
          .hover-underline:hover { text-decoration: underline; }
          
          /* Glassmorphism utils */
          .glass-panel {
            background-color: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }
        `}</style>
            </Head>
            {/* <Preview>{preview}</Preview> */}
            <BodyComponent className="bg-darkbg text-white m-0 p-0" style={{ backgroundColor: '#070b13', color: '#ffffff', fontFamily: "'Montserrat', Verdana, sans-serif" }}>
                <Container className="mx-auto my-0 p-4 max-w-[600px]">
                    {/* Header */}
                    <Section className="mt-8 mb-8 text-center">
                        <Text className="text-2xl font-bold tracking-widest uppercase text-white m-0" style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ffffff', margin: 0 }}>
                            Perfect <span className="text-alpine" style={{ color: '#0051ff' }}>Drive</span>
                        </Text>
                    </Section>

                    {/* Main Content Card */}
                    <Section className="bg-panel rounded-2xl border border-white-10 p-8 shadow-lg" style={{ backgroundColor: '#1a1f2e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '32px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}>
                        {children}
                    </Section>

                    {/* Footer */}
                    <Section className="mt-8 text-center text-gray-400 text-xs">
                        <Text className="m-0 mb-4" style={{ margin: '0 0 16px 0', color: '#9ca3af', fontSize: '12px' }}>
                            © {new Date().getFullYear()} Perfect Drive due. Tous droits réservés.
                        </Text>
                        <div className="flex justify-center gap-4 mb-4" style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <Link href="https://perfect-drive.fr" className="text-alpine hover-underline mx-2" style={{ color: '#0051ff', margin: '0 8px', textDecoration: 'none' }}>
                                Site Web
                            </Link>
                            <Link href="mailto:contact@perfect-drive.fr" className="text-alpine hover-underline mx-2" style={{ color: '#0051ff', margin: '0 8px', textDecoration: 'none' }}>
                                Nous contacter
                            </Link>
                        </div>
                        <Text className="m-0 text-gray-600" style={{ margin: 0, color: '#4b5563', fontSize: '12px' }}>
                            Vous recevez cet email car vous avez effectué une demande sur notre site.
                        </Text>
                    </Section>
                </Container>
            </BodyComponent>
        </HtmlComponent>
    );
};

export default EmailLayout;
