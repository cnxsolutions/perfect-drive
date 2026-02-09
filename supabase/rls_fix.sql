-- 1. Enable RLS (Ensure it's on)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Allow Public to Insert (Create Booking)
-- Essential for the public booking form to work
CREATE POLICY "Public can insert bookings"
ON bookings FOR INSERT
TO public
WITH CHECK (true);

-- 3. Policy: Allow Admins (Authenticated) to Select (View Dashboard)
CREATE POLICY "Admins can view bookings"
ON bookings FOR SELECT
TO authenticated
USING (true);

-- 4. Policy: Allow Admins to Update (Approve/Reject)
CREATE POLICY "Admins can update bookings"
ON bookings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Policy: Allow Admins to Delete
CREATE POLICY "Admins can delete bookings"
ON bookings FOR DELETE
TO authenticated
USING (true);
