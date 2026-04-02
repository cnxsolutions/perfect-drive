-- Add vehicles table

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Vehicle Details
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  color TEXT,
  year INTEGER,
  
  -- Vehicle Specifications
  seats INTEGER DEFAULT 5,
  transmission TEXT CHECK (transmission IN ('manual', 'automatic')) DEFAULT 'automatic',
  fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'hybrid', 'electric')) DEFAULT 'petrol',
  
  -- Pricing
  daily_rate DECIMAL(10,2) NOT NULL,
  weekend_rate DECIMAL(10,2),
  
  -- Mileage Settings
  mileage_standard_limit INTEGER DEFAULT 300,
  mileage_excess_rate DECIMAL(10,2) DEFAULT 0.50,
  
  -- Status
  is_available BOOLEAN DEFAULT true,
  
  -- Insurance & Documents
  insurance_until DATE,
  inspection_until DATE,
  
  -- Notes
  description TEXT,
  image_url TEXT
);

-- Enable RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read available vehicles
CREATE POLICY "Public can view available vehicles"
ON vehicles FOR SELECT
USING (is_available = true);

-- Policy: Admins have full access (via service role)
-- This will be enforced in the application layer
