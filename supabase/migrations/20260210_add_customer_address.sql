-- Add customer_address column to bookings table
-- This field will store the customer's full address collected during confirmation

ALTER TABLE bookings 
ADD COLUMN customer_address TEXT;
