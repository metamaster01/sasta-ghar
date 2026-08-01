// ── /lib/supabase/admin.ts ───────────────────────────────────
// Service-role client. ONLY used in:
//   - Edge Functions (server-side only)
//   - Admin API routes that need to bypass RLS
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser.
// NEVER import this in any client component.
 
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
 
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,   // ← server only, never public
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}