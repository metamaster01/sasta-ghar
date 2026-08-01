
// // ── /middleware.ts (USER SITE — sastaghar.com) ───────────────
// // Protects agent dashboard routes.
// // Reads role from JWT claims (no DB hit needed).
 
// import { createServerClient } from '@supabase/ssr'
// import { NextResponse, type NextRequest } from 'next/server'
 
// export async function middleware(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({ request })
 
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() { return request.cookies.getAll() },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value }) =>
//             request.cookies.set(name, value)
//           )
//           supabaseResponse = NextResponse.next({ request })
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options)
//           )
//         },
//       },
//     }
//   )
 
//   // Refresh session — MUST be called in middleware
//   const { data: { user } } = await supabase.auth.getUser()
 
//   const path = request.nextUrl.pathname
 
//   // ── Protected: Agent dashboard ────────────────────────────
//   if (path.startsWith('/agent')) {
//     if (!user) {
//       return NextResponse.redirect(new URL('/login?redirect=/agent/dashboard', request.url))
//     }
//     // Read role from JWT (injected by custom_access_token_hook)
//     const { data: { session } } = await supabase.auth.getSession()
//     const role = session?.access_token
//       ? JSON.parse(atob(session.access_token.split('.')[1])).user_role
//       : null
 
//     if (role !== 'agent' && role !== 'builder') {
//       return NextResponse.redirect(new URL('/?error=unauthorized', request.url))
//     }
//   }
 
//   // ── Protected: User-only actions ─────────────────────────
//   if (path.startsWith('/saved') || path.startsWith('/alerts')) {
//     if (!user) {
//       return NextResponse.redirect(new URL(`/login?redirect=${path}`, request.url))
//     }
//   }
 
//   // ── Redirect logged-in users away from auth pages ────────
//   if ((path === '/login' || path === '/register') && user) {
//     const { data: { session } } = await supabase.auth.getSession()
//     const role = session?.access_token
//       ? JSON.parse(atob(session.access_token.split('.')[1])).user_role
//       : 'user'
 
//     if (role === 'agent' || role === 'builder') {
//       return NextResponse.redirect(new URL('/agent/dashboard', request.url))
//     }
//     return NextResponse.redirect(new URL('/', request.url))
//   }
 
//   return supabaseResponse
// }
 
// export const config = {
//   matcher: [
//     '/agent/:path*',
//     '/saved/:path*',
//     '/alerts/:path*',
//     '/login',
//     '/register',
//     '/post-property',
//   ],
// }





// middleware.ts
// Place this file at the ROOT of your Next.js project (same level as app/).
// Runs on every matched request BEFORE the page renders.
// Handles: auth checks, role-based redirects, onboarding gate.

// import { createServerClient } from "@supabase/ssr";
// import { NextResponse, type NextRequest } from "next/server";

// export async function middleware(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({ request });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value }) =>
//             request.cookies.set(name, value)
//           );
//           supabaseResponse = NextResponse.next({ request });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options)
//           );
//         },
//       },
//     }
//   );

//   // ── IMPORTANT: Always call getUser() in middleware ────────
//   // This refreshes the session cookie if expired.
//   // Never skip this call — stale sessions cause auth bugs.
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   const path = request.nextUrl.pathname;

//   // ── Helper: read role from JWT (no DB round-trip) ─────────
//   function getRoleFromJWT(): string | null {
//     try {
//       const session = request.cookies.get("sb-access-token")?.value
//         ?? request.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`)?.value;
//       if (!session) return null;
//       const payload = JSON.parse(atob(session.split(".")[1]));
//       return payload.user_role ?? null;
//     } catch {
//       return null;
//     }
//   }

//   const role = getRoleFromJWT();

//   // ================================================================
//   // 1. REDIRECT LOGGED-IN USERS AWAY FROM AUTH PAGES
//   // ================================================================
//   if (user && (path === "/login" || path === "/register")) {
//     if (role === "agent" || role === "builder") {
//       return NextResponse.redirect(new URL("/agent/dashboard", request.url));
//     }
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   // ================================================================
//   // 2. PROTECT AGENT DASHBOARD — must be logged in as agent/builder
//   // ================================================================
//   if (path.startsWith("/agent")) {
//     if (!user) {
//       return NextResponse.redirect(
//         new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url)
//       );
//     }
//     if (role !== "agent" && role !== "builder" && role !== "admin") {
//       return NextResponse.redirect(new URL("/?error=unauthorized", request.url));
//     }
//   }

//   // ================================================================
//   // 3. PROTECT ONBOARDING — must be logged in as agent/builder
//   //    AND onboarding must not be complete (step < 3)
//   // ================================================================
//   if (path.startsWith("/onboarding")) {
//     // Not logged in → send to login, come back after
//     if (!user) {
//       return NextResponse.redirect(
//         new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url)
//       );
//     }

//     // Not an agent/builder → shouldn't be here
//     if (role !== "agent" && role !== "builder") {
//       return NextResponse.redirect(new URL("/", request.url));
//     }

//     // If they're on /onboarding/complete that's always fine
//     if (path === "/onboarding/complete") {
//       return supabaseResponse;
//     }

//     // Check their actual onboarding step from DB
//     // (DB call here is acceptable — onboarding pages are not frequent)
//     const { data: ap } = await supabase
//       .from("agent_profiles")
//       .select("onboarding_step")
//       .eq("profile_id", user.id)
//       .single();

//     const currentStep = ap?.onboarding_step ?? 0;

//     // Parse which step they're trying to reach
//     const stepMatch = path.match(/\/onboarding\/step-(\d)/);
//     const targetStep = stepMatch ? parseInt(stepMatch[1]) : 1;

//     // Prevent skipping steps forward
//     // (They can go back to earlier steps to edit)
//     if (targetStep > currentStep + 1) {
//       return NextResponse.redirect(
//         new URL(`/onboarding/step-${currentStep + 1}`, request.url)
//       );
//     }

//     // If onboarding is already complete, redirect to dashboard
//     if (currentStep >= 3) {
//       return NextResponse.redirect(new URL("/agent/dashboard", request.url));
//     }
//   }

//   // ================================================================
//   // 4. PROTECT USER-ONLY ROUTES — must be logged in (any role)
//   // ================================================================
//   if (
//     path.startsWith("/saved") ||
//     path.startsWith("/alerts") ||
//     path.startsWith("/my-account")
//   ) {
//     if (!user) {
//       return NextResponse.redirect(
//         new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url)
//       );
//     }
//   }

//   // ================================================================
//   // 5. PROTECT POST-PROPERTY — must be agent/builder
//   // ================================================================
//   if (path.startsWith("/post-property") || path.startsWith("/edit-property")) {
//     if (!user) {
//       return NextResponse.redirect(
//         new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url)
//       );
//     }
//     if (role !== "agent" && role !== "builder" && role !== "admin") {
//       // Regular user trying to post — send them to become-agent page
//       return NextResponse.redirect(
//         new URL("/register?intent=agent", request.url)
//       );
//     }
//   }

//   return supabaseResponse;
// }

// // ── Matcher: which routes this middleware runs on ─────────────
// // Excludes: static files, images, Next.js internals, favicon
// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
//   ],
// };








// middleware.ts
// ROOT of Next.js project — same level as app/
// FIXED VERSION — resolves all 5 auth bugs.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ── Step 1: Refresh session (ALWAYS do this first) ────────
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // ── Step 2: Get role — JWT first, DB fallback ─────────────
  // BUG FIX 3 & 4: JWT role can be null if custom_access_token_hook
  // isn't registered yet. We fall back to DB to never block users.
  let role: string | null = null;

  if (user) {
    // Try JWT first (fast path)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const payload = JSON.parse(
          Buffer.from(session.access_token.split(".")[1], "base64").toString()
        );
        role = payload.user_role ?? null;
      }
    } catch { role = null; }

    // DB fallback if JWT has no role claim (hook not registered)
    if (!role) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      role = profile?.role ?? "user";
    }
  }

  const isAgent = role === "agent" || role === "builder";
  const isAdmin = role === "admin";
  const intent  = searchParams.get("intent");

  // ================================================================
  // RULE 1: Auth pages — redirect already-logged-in users away
  // BUG FIX 5: Allow logged-in role=user on /register?intent=agent
  //            so they can upgrade to agent without logging out.
  // ================================================================
  if (path === "/login") {
    if (user) {
      if (isAgent) return NextResponse.redirect(new URL("/agent/dashboard", request.url));
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (path === "/register") {
    if (user) {
      // Allow role=user through if they want to become an agent
      if (intent === "agent" && !isAgent) {
        // Let them through — register page will handle the role upgrade
        return supabaseResponse;
      }
      // Already an agent → send to dashboard
      if (isAgent) return NextResponse.redirect(new URL("/agent/dashboard", request.url));
      // Regular user trying to register again → home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // /verify-otp is always open (needed right after signup before session)
  if (path === "/verify-otp") {
    return supabaseResponse;
  }

  // ================================================================
  // RULE 2: Agent dashboard — must be logged in as agent/builder/admin
  // ================================================================
  if (path.startsWith("/agent")) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url)
      );
    }
    if (!isAgent && !isAdmin) {
      return NextResponse.redirect(new URL("/?error=unauthorized", request.url));
    }
  }

  // ================================================================
  // RULE 3: Onboarding — agent/builder only, step-skipping blocked
  // BUG FIX 3 & 4: Previously blocked because role was null from JWT.
  //                Now uses DB fallback above so role is always correct.
  // ================================================================
  if (path.startsWith("/onboarding")) {
    // Not logged in → send to login
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url)
      );
    }

    // Not an agent → shouldn't be here
    // But allow role=user who just completed agent signup to pass through
    // to /onboarding/step-1 (role update may not have propagated yet)
    // We check agent_profiles existence as a secondary confirmation
    if (!isAgent && !isAdmin) {
      // Give benefit of doubt — check if they just created an agent account
      const { data: ap } = await supabase
        .from("agent_profiles")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (!ap) {
        // Truly not an agent — redirect home
        return NextResponse.redirect(new URL("/", request.url));
      }
      // They have an agent_profile (just created) — let them through
    }

    // /onboarding/complete always accessible
    if (path === "/onboarding/complete") {
      return supabaseResponse;
    }

    // Check DB step to prevent skipping
    const { data: ap } = await supabase
      .from("agent_profiles")
      .select("onboarding_step")
      .eq("profile_id", user.id)
      .single();

    const currentStep = ap?.onboarding_step ?? 0;
    const stepMatch   = path.match(/\/onboarding\/step-(\d)/);
    const targetStep  = stepMatch ? parseInt(stepMatch[1]) : 1;

    // Can't skip ahead
    if (targetStep > currentStep + 1) {
      return NextResponse.redirect(
        new URL(`/onboarding/step-${currentStep + 1}`, request.url)
      );
    }

    // Already done → dashboard
    if (currentStep >= 3) {
      return NextResponse.redirect(new URL("/agent/dashboard", request.url));
    }
  }

  // ================================================================
  // RULE 4: Saved / alerts / account — any logged-in user
  // ================================================================
  if (
    path.startsWith("/saved") ||
    path.startsWith("/alerts") ||
    path.startsWith("/my-account") ||
    path.startsWith("/my-enquiries")
  ) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(path)}`, request.url)
      );
    }
  }

  // ================================================================
  // RULE 5: Post property
  // BUG FIX 1: Previously redirected logged-in user to /register
  //            which middleware then blocked. Now goes to /onboarding
  //            directly (handled in Navbar, not middleware).
  // Middleware just ensures non-agents can't access the listing form.
  // ================================================================
  if (path.startsWith("/post-property") || path.startsWith("/edit-property")) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=/post-property`, request.url)
      );
    }
    // Agent with complete onboarding → allow
    if (isAgent || isAdmin) {
      return supabaseResponse;
    }
    // Regular user → they need to go through agent onboarding
    // This shouldn't be hit since Navbar handles this redirect,
    // but as a safety net:
    return NextResponse.redirect(
      new URL("/register?intent=agent", request.url)
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};