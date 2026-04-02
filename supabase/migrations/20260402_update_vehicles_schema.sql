-- Migration: Add trim (Finition) and images (Gallery) to vehicles table
-- Date: 2026-04-02

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicles' AND column_name='trim') THEN
        ALTER TABLE vehicles ADD COLUMN trim TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicles' AND column_name='images') THEN
        ALTER TABLE vehicles ADD COLUMN images TEXT[] DEFAULT '{}';
    END IF;
END $$;
