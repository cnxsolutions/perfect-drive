-- Migration: Create vehicle-images bucket and set public access policies
-- Date: 2026-04-02

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS Policies for the bucket
-- Allow public read access
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'vehicle-images' );

-- Allow authenticated uploads
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'vehicle-images' );

-- Allow authenticated updates
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
WITH CHECK ( bucket_id = 'vehicle-images' );

-- Allow authenticated deletes
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'vehicle-images' );
