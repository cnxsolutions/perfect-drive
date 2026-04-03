-- Migration: Remove unused 72h weekend rates
-- Date: 2026-04-03

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicles' AND column_name='weekend_72h_rate') THEN
        ALTER TABLE vehicles DROP COLUMN weekend_72h_rate;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicles' AND column_name='weekend_72h_unlimited_rate') THEN
        ALTER TABLE vehicles DROP COLUMN weekend_72h_unlimited_rate;
    END IF;
END $$;
