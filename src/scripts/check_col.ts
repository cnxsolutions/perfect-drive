import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crcvtqssiowpttowayqw.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyY3Z0cXNzaW93cHR0b3dheXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDUyNjI5NiwiZXhwIjoyMDg2MTAyMjk2fQ.0Lqjn6qLUuPBO5QpALY-DUHq-l7JO_Ce7G26vMyhs5g'
);

async function main() {
  const { data, error } = await supabase.from('vehicles').select('id, name, allow_unlimited_mileage').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Result:', data);
  }
}
main();
