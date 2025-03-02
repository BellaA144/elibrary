import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  console.log('[API] Login request received');
  
  try {
    const supabase = await createClient();
    
    const { email, password } = await req.json();
    console.log(`[API] Trying login with email: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[API] Supabase login error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.log('[API] Login success:', data.session);

    return NextResponse.json({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
    });
  } catch (err: any) {
    console.error('[API] Internal Error:', err.message || err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
