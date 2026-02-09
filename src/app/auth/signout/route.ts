import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        await supabase.auth.signOut();
    }

    return NextResponse.redirect(new URL('/', req.url), {
        status: 302,
    });
}
