-- 1. Add deposit_method column
ALTER TABLE bookings 
ADD COLUMN deposit_method TEXT CHECK (deposit_method IN ('cash', 'imprint'));

-- 2. Update status check constraint to include 'awaiting_payment'
ALTER TABLE bookings DROP CONSTRAINT bookings_status_check;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'awaiting_payment', 'approved', 'rejected', 'paid'));

-- 3. Update get_unavailable_dates RPC (already fine, but good to double check logic)
-- Current RPC blocks: bookings WHERE status IN ('approved', 'paid')
-- This matches the requirement: 'pending' and 'awaiting_payment' do NOT block dates.
