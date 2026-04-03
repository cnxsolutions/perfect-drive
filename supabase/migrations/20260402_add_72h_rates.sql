-- Migration to add manual 72h weekend pricing fields to the vehicles table
ALTER TABLE public.vehicles 
ADD COLUMN weekend_72h_rate numeric,
ADD COLUMN weekend_72h_unlimited_rate numeric;
