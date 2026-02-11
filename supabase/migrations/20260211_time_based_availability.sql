-- Migration: Time-based availability system
-- This migration adds functions to check booking conflicts based on time slots
-- instead of blocking entire days

-- 1. Function to check if a booking conflicts with existing bookings
CREATE OR REPLACE FUNCTION check_booking_conflict(
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
    v_conflict_count INTEGER;
BEGIN
    -- Check for any approved or paid bookings that overlap with the requested time slot
    SELECT COUNT(*) INTO v_conflict_count
    FROM bookings
    WHERE 
        status IN ('approved', 'paid')
        AND (
            -- Case 1: Same day booking - check time overlap
            (start_date = p_start_date AND end_date = p_end_date AND start_date = end_date)
            AND (
                -- Requested start time falls within existing booking
                (p_start_time >= start_time::TIME AND p_start_time < end_time::TIME)
                OR
                -- Requested end time falls within existing booking
                (p_end_time > start_time::TIME AND p_end_time <= end_time::TIME)
                OR
                -- Requested booking completely encompasses existing booking
                (p_start_time <= start_time::TIME AND p_end_time >= end_time::TIME)
            )
            OR
            -- Case 2: Multi-day booking - check date range overlap
            (
                (start_date != end_date OR p_start_date != p_end_date)
                AND (
                    -- Date ranges overlap
                    (p_start_date <= end_date AND p_end_date >= start_date)
                    AND (
                        -- If same start date, check start time
                        (p_start_date = start_date AND p_start_time < end_time::TIME)
                        OR
                        -- If same end date, check end time
                        (p_end_date = end_date AND p_end_time > start_time::TIME)
                        OR
                        -- If different dates in the middle, always conflict
                        (p_start_date > start_date AND p_end_date < end_date)
                        OR
                        (p_start_date < start_date AND p_end_date > end_date)
                        OR
                        -- If neither start nor end dates match, check if dates are in between
                        (p_start_date != start_date AND p_end_date != end_date AND p_start_date < end_date AND p_end_date > start_date)
                    )
                )
            )
        );
    
    RETURN v_conflict_count > 0;
END;
$$;

-- 2. Function to get partial availability information
CREATE OR REPLACE FUNCTION get_booking_availability()
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
        -- Get all dates from today to 3 months ahead
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
    ),
    blocked_dates_list AS (
        SELECT blocked_date::DATE AS blocked_date
        FROM blocked_dates
    )
    SELECT 
        dr.check_date AS date,
        -- A date is fully blocked if it's in blocked_dates OR if it's a middle day of a multi-day booking
        CASE 
            WHEN bd.blocked_date IS NOT NULL THEN TRUE
            WHEN EXISTS (
                SELECT 1 FROM bookings_by_date bbd
                WHERE bbd.booking_date = dr.check_date
                AND bbd.start_date < bbd.booking_date
                AND bbd.end_date > bbd.booking_date
            ) THEN TRUE
            ELSE FALSE
        END AS is_fully_blocked,
        -- Get existing bookings for this date (only for same-day bookings or edge days)
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
                AND (
                    -- Same day booking
                    (bbd.start_date = bbd.end_date)
                    OR
                    -- Start or end date of multi-day booking
                    (bbd.start_date = bbd.booking_date OR bbd.end_date = bbd.booking_date)
                )
            ),
            '[]'::JSONB
        ) AS existing_bookings
    FROM date_range dr
    LEFT JOIN blocked_dates_list bd ON bd.blocked_date = dr.check_date;
END;
$$;
