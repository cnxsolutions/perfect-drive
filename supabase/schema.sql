-- Perfect Drive - Reservation System Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Reservation Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Mileage Option
  mileage_type TEXT CHECK (mileage_type IN ('standard', 'unlimited')) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Status Workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  rejection_reason TEXT,
  payment_link TEXT,
  
  -- Customer Info
  customer_firstname TEXT NOT NULL,
  customer_lastname TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_message TEXT,
  
  -- Documents (Storage Paths)
  document_id_card TEXT NOT NULL,
  document_license TEXT NOT NULL,
  document_proof TEXT NOT NULL
);

-- 2. Blocked Dates Table (Manual + Approved Bookings)
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE
);

-- 3. Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read blocked dates (for availability check)
CREATE POLICY "Public can view blocked dates" 
ON blocked_dates FOR SELECT 
USING (true);

-- Policy: Admins have full access (Supabase handled)
-- Note: Create a trigger or function to sync approved bookings to blocked_dates?
-- No, we will query both tables or handle via application logic for simplicity (KISS).
-- But simpler approach: API query checks both tables.

-- 4. Storage Setup
-- Create a new public bucket 'booking-documents' via Supabase Dashboard manually or via SQL:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('booking-documents', 'booking-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users (Admin) can view all files
CREATE POLICY "Admin Select Access"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'booking-documents' );

-- Policy: Everyone (Anons via API) can upload files
-- This is a bit insecure if public, logic will be handled by secure upload route via Service Role.
-- But for direct client upload (better for bandwidth):
CREATE POLICY "Public Upload Access"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'booking-documents' );
