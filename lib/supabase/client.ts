// ── /lib/supabase/client.ts ──────────────────────────────────
// Browser-side client. Use in Client Components ("use client").
// Creates one shared instance per browser tab.
 
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'   // generated types (see below)
 
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}