-- Migration: Add color to vehicles table
-- Date: 2026-04-03

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicles' AND column_name='color') THEN
        ALTER TABLE vehicles ADD COLUMN color TEXT;
    END IF;
END $$;
