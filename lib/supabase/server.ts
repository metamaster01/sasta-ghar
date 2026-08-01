// ── /lib/supabase/server.ts ──────────────────────────────────
// Server-side client. Use in Server Components, Route Handlers,
// Server Actions, and middleware.
// Each request gets its own instance (reads cookies per request).
 
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
 
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
 
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies can't be set, ignore
          }
        },
      },
    }
  )
}