import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Html,
    Link,
    Section,
    Text,
    Preview,
} from '@react-email/components';

interface EmailLayoutProps {
    children: React.ReactNode;
    preview?: string;
}

export const EmailLayout = ({ children, preview }: EmailLayoutProps) => {
    return (
        <Html lang="fr">
            <Head />
            {preview && <Preview>{preview}</Preview>}
            <Body style={bodyStyle}>
                <Container style={containerStyle}>
                    {/* Header */}
                    <Section style={headerStyle}>
                        <Text style={logoStyle}>
                            Perfect <span style={logoAccentStyle}>Drive</span>
                        </Text>
                    </Section>

                    {/* Main Content */}
                    <Section style={contentStyle}>
                        {children}
                    </Section>

                    {/* Footer */}
                    <Section style={footerStyle}>
                        <Text style={footerTextStyle}>
                            © {new Date().getFullYear()} Perfect Drive. Tous droits réservés.
                        </Text>
                        <div style={footerLinksStyle}>
                            <Link href="https://perfect-drive.fr" style={linkStyle}>
                                Site Web
                            </Link>
                            {' • '}
                            <Link href="mailto:contact.perfectdrive@gmail.com" style={linkStyle}>
                                Contact
                            </Link>
                        </div>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

// Styles (centralized, following DRY)
const bodyStyle: React.CSSProperties = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: 0,
};

const containerStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
};

const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '32px',
    paddingTop: '20px',
};

const logoStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: 0,
    letterSpacing: '0.05em',
};

const logoAccentStyle: React.CSSProperties = {
    color: '#0051ff',
};

const contentStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
};

const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    paddingTop: '20px',
    paddingBottom: '20px',
};

const footerTextStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0 0 8px 0',
};

const footerLinksStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6b7280',
};

const linkStyle: React.CSSProperties = {
    color: '#0051ff',
    textDecoration: 'none',
};

export default EmailLayout;
