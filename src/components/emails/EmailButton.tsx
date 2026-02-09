import * as React from 'react';
import { Button } from '@react-email/components';

interface EmailButtonProps {
    href: string;
    children: React.ReactNode;
}

export const EmailButton = ({ href, children }: EmailButtonProps) => {
    return (
        <Button
            href={href}
            style={{
                backgroundColor: '#0051ff',
                color: '#ffffff',
                padding: '12px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '16px',
                display: 'inline-block',
                textAlign: 'center',
            }}
        >
            {children}
        </Button>
    );
};

export default EmailButton;
