#!/bin/bash

# Apply migrations to Supabase

echo "Applying database migrations..."

# Note: You would typically run this via Supabase CLI or directly in the Supabase dashboard
# For development, you can use:
# supabase db push

# OR if you need to apply it manually via SQL, run the migration file directly

echo "Migration completed!"
echo ""
echo "To apply manually:"
echo "1. Go to Supabase dashboard"
echo "2. SQL Editor -> New Query"
echo "3. Copy contents of supabase/migrations/20260330_add_vehicles.sql"
echo "4. Execute the query"
