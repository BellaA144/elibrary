"use server"

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type CookieOptions, createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/oauth-redirect'

    if (!code) {
        return NextResponse.redirect(`${origin}/login?message=Invalid OAuth response`);
    }

    if (code) {
        const cookieStore = await cookies(); 
        console.log("🔍 Existing cookies:", cookieStore.getAll());

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.delete({ name, ...options })
                    },
                },
            }
        )

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        console.log("🔍 Exchange Code for Session result:", exchangeError);
        if (exchangeError) {
            console.error("❌ Error exchanging code:", exchangeError);
            return NextResponse.redirect(`${origin}/login?message=${exchangeError.message}`);
        }

        // ✅ Cek session setelah exchange
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
            console.error("❌ No session after exchange:", sessionError)
            return NextResponse.redirect(`${origin}/login?message=Session failed`)
        }

        console.log("✅ Session after exchange:", sessionData.session)

        return NextResponse.redirect(`${origin}${next}`)
    }

    return NextResponse.redirect(`${origin}/login?message=Could not login with provider`)
}
