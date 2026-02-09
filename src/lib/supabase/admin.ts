import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create client only if keys are present (avoids build crash)
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : createClient('https://placeholder.supabase.co', 'placeholder', {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }); // Fallback to avoid null reference, but operations will fail gracefully
