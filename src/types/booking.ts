export type BookingStatus = 'pending' | 'awaiting_payment' | 'approved' | 'rejected' | 'paid';
export type MileageType = 'standard' | 'unlimited';

export interface Booking {
    id: string;
    created_at: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    mileage_type: MileageType;
    total_price: number;
    status: BookingStatus;
    rejection_reason?: string;
    payment_link?: string;
    customer_firstname: string;
    customer_lastname: string;
    customer_email: string;
    customer_phone: string;
    customer_address?: string;
    customer_message?: string;
    document_id_card: string;
    document_license: string;
    document_proof: string;
    deposit_method?: string;
}

export interface CreateBookingDTO {
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    mileageType: MileageType;
    customer: {
        firstname: string;
        lastname: string;
        email: string;
        phone: string;
        message?: string;
    };
    documents: {
        idCardPath: string;
        licensePath: string;
        proofPath: string;
    };
}
