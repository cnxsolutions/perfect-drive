-- Migration: Unique Multi-vehicle Dynamic Pricing (No Stock)
-- Date: 2026-04-02

-- 1. Add pricing columns to vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS unlimited_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS weekend_unlimited_rate DECIMAL(10,2);

-- 2. Add vehicle_id to bookings table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='vehicle_id') THEN
        ALTER TABLE bookings ADD COLUMN vehicle_id UUID REFERENCES vehicles(id);
    END IF;
END $$;

-- 3. Update check_booking_conflict to handle unique vehicle_id
CREATE OR REPLACE FUNCTION check_booking_conflict(
    p_vehicle_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_start_time TIME,
    p_end_time TIME
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_overlapping_count INTEGER;
BEGIN
    -- Count overlapping approved/paid bookings for this specific vehicle
    SELECT COUNT(*) INTO v_overlapping_count
    FROM bookings
    WHERE 
        vehicle_id = p_vehicle_id
        AND status IN ('approved', 'paid')
        AND (
            -- Case 1: Same day booking - check time overlap
            (start_date = p_start_date AND end_date = p_end_date AND start_date = end_date)
            AND (
                (p_start_time >= start_time::TIME AND p_start_time < end_time::TIME)
                OR (p_end_time > start_time::TIME AND p_end_time <= end_time::TIME)
                OR (p_start_time <= start_time::TIME AND p_end_time >= end_time::TIME)
            )
            OR
            -- Case 2: Multi-day booking - check date range overlap
            (
                (start_date != end_date OR p_start_date != p_end_date)
                AND (
                    (p_start_date <= end_date AND p_end_date >= start_date)
                    AND (
                        (p_start_date = start_date AND p_start_time < end_time::TIME)
                        OR (p_end_date = end_date AND p_end_time > start_time::TIME)
                        OR (p_start_date > start_date AND p_end_date < end_date)
                        OR (p_start_date < start_date AND p_end_date > end_date)
                        OR (p_start_date != start_date AND p_end_date != end_date AND p_start_date < end_date AND p_end_date > start_date)
                    )
                )
            )
        );
    
    -- Conflict exists if ANY booking overlaps
    RETURN v_overlapping_count > 0;
END;
$$;

-- 4. Update get_booking_availability to handle unique vehicle_id
CREATE OR REPLACE FUNCTION get_booking_availability(p_vehicle_id UUID)
RETURNS TABLE (
    date DATE,
    is_fully_blocked BOOLEAN,
    existing_bookings JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH date_range AS (
        SELECT generate_series(
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '3 months',
            '1 day'::INTERVAL
        )::DATE AS check_date
    ),
    bookings_by_date AS (
        SELECT 
            d::DATE AS booking_date,
            b.start_time,
            b.end_time,
            b.start_date,
            b.end_date
        FROM bookings b,
        generate_series(b.start_date, b.end_date, '1 day'::INTERVAL) AS d
        WHERE b.status IN ('approved', 'paid')
        AND b.vehicle_id = p_vehicle_id
    ),
    blocked_dates_list AS (
        SELECT blocked_date::DATE AS blocked_date
        FROM blocked_dates
    )
    SELECT 
        dr.check_date AS date,
        CASE 
            WHEN bd.blocked_date IS NOT NULL THEN TRUE
            WHEN EXISTS (SELECT 1 FROM bookings_by_date bbd WHERE bbd.booking_date = dr.check_date) THEN TRUE
            ELSE FALSE
        END AS is_fully_blocked,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'startTime', bbd.start_time,
                        'endTime', bbd.end_time,
                        'isStartDate', bbd.start_date = bbd.booking_date,
                        'isEndDate', bbd.end_date = bbd.booking_date
                    )
                )
                FROM bookings_by_date bbd
                WHERE bbd.booking_date = dr.check_date
            ),
            '[]'::JSONB
        ) AS existing_bookings
    FROM date_range dr
    LEFT JOIN blocked_dates_list bd ON bd.blocked_date = dr.check_date;
END;
$$;

-- 5. Update get_unavailable_dates for unique vehicle
CREATE OR REPLACE FUNCTION get_unavailable_dates(p_vehicle_id UUID)
RETURNS TABLE (date DATE)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH date_range AS (
        SELECT generate_series(
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '3 months',
            '1 day'::INTERVAL
        )::DATE AS check_date
    )
    SELECT dr.check_date
    FROM date_range dr
    WHERE 
        EXISTS (SELECT 1 FROM blocked_dates bd WHERE bd.blocked_date = dr.check_date)
        OR EXISTS (
            SELECT 1 
            FROM bookings b, generate_series(b.start_date, b.end_date, '1 day'::INTERVAL) d
            WHERE b.status IN ('approved', 'paid') AND b.vehicle_id = p_vehicle_id AND d::DATE = dr.check_date
        );
END;
$$;
