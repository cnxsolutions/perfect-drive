
import React from 'react';
import { render } from '@react-email/render';
import AdminNewBookingTemplate from '@/components/emails/AdminNewBookingTemplate';
import CustomerReceivedTemplate from '@/components/emails/CustomerReceivedTemplate';
import CustomerPaymentLinkTemplate from '@/components/emails/CustomerPaymentLinkTemplate';
import CustomerConfirmedTemplate from '@/components/emails/CustomerConfirmedTemplate';
import CustomerRejectedTemplate from '@/components/emails/CustomerRejectedTemplate';

async function testEmails() {
    console.log('Testing AdminNewBookingTemplate...');
    const adminHtml = await render(AdminNewBookingTemplate({
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        phone: '0600000000',
        startDate: '01/01/2024',
        endDate: '05/01/2024',
        startTime: '10:00',
        endTime: '18:00',
        totalPrice: 500,
        mileage: 'standard',
        depositMethod: 'imprint',
        hasIdDocument: true,
        hasLicenseDocument: true,
        hasProofDocument: true,
        customerMessage: 'Hello world',
    }));
    console.log('AdminNewBookingTemplate rendered successfully (length: ' + adminHtml.length + ')');

    console.log('Testing CustomerReceivedTemplate...');
    const receivedHtml = await render(CustomerReceivedTemplate({
        firstname: 'John',
    }));
    console.log('CustomerReceivedTemplate rendered successfully (length: ' + receivedHtml.length + ')');

    console.log('Testing CustomerPaymentLinkTemplate...');
    const paymentHtml = await render(CustomerPaymentLinkTemplate({
        firstname: 'John',
        paymentLink: 'https://stripe.com/pay/123',
    }));
    console.log('CustomerPaymentLinkTemplate rendered successfully (length: ' + paymentHtml.length + ')');

    console.log('Testing CustomerConfirmedTemplate...');
    const confirmedHtml = await render(CustomerConfirmedTemplate({
        firstname: 'John',
        startDate: '01/01/2024',
        endDate: '05/01/2024',
        totalPrice: 500,
    }));
    console.log('CustomerConfirmedTemplate rendered successfully (length: ' + confirmedHtml.length + ')');

    console.log('Testing CustomerRejectedTemplate...');
    const rejectedHtml = await render(CustomerRejectedTemplate({
        firstname: 'John',
        reason: 'Vehicle unavailable',
    }));
    console.log('CustomerRejectedTemplate rendered successfully (length: ' + rejectedHtml.length + ')');

    console.log('All templates rendered successfully!');
}

testEmails().catch(console.error);
