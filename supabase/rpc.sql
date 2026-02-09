-- Function to get all unavailable dates (blocked + bookings)
CREATE OR REPLACE FUNCTION get_unavailable_dates()
RETURNS TABLE (date DATE)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    -- 1. Manual Blocked Dates
    SELECT blocked_date::DATE FROM blocked_dates
    UNION
    -- 2. Booked Ranges (Expanded)
    SELECT
        d::DATE
    FROM
        bookings,
        generate_series(start_date, end_date, '1 day'::interval) AS d
    WHERE
        status IN ('approved', 'paid');
END;
$$;
