-- Migration: Fix Time Availability and Vehicle Disabling
-- Date: 2026-04-03

CREATE OR REPLACE FUNCTION get_booking_availability(p_vehicle_id UUID)
RETURNS TABLE (
    date DATE,
    is_fully_blocked BOOLEAN,
    existing_bookings JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_available BOOLEAN;
BEGIN
    SELECT is_available INTO v_is_available FROM vehicles WHERE id = p_vehicle_id;

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
            WHEN v_is_available = FALSE THEN TRUE
            WHEN bd.blocked_date IS NOT NULL THEN TRUE
            WHEN EXISTS (
                SELECT 1 FROM bookings_by_date bbd 
                WHERE bbd.booking_date = dr.check_date
                AND bbd.start_date < bbd.booking_date
                AND bbd.end_date > bbd.booking_date
            ) THEN TRUE
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
                AND (
                    (bbd.start_date = bbd.end_date)
                    OR (bbd.start_date = bbd.booking_date OR bbd.end_date = bbd.booking_date)
                )
            ),
            '[]'::JSONB
        ) AS existing_bookings
    FROM date_range dr
    LEFT JOIN blocked_dates_list bd ON bd.blocked_date = dr.check_date;
END;
$$;

CREATE OR REPLACE FUNCTION get_unavailable_dates(p_vehicle_id UUID)
RETURNS TABLE (date DATE)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_available BOOLEAN;
BEGIN
    SELECT is_available INTO v_is_available FROM vehicles WHERE id = p_vehicle_id;

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
        v_is_available = FALSE
        OR EXISTS (SELECT 1 FROM blocked_dates bd WHERE bd.blocked_date = dr.check_date)
        OR EXISTS (
            SELECT 1 
            FROM bookings b, generate_series(b.start_date, b.end_date, '1 day'::INTERVAL) d
            WHERE b.status IN ('approved', 'paid') AND b.vehicle_id = p_vehicle_id AND d::DATE = dr.check_date
            AND b.start_date < d::DATE AND b.end_date > d::DATE
        );
END;
$$;
