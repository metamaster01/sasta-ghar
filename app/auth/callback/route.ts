// // app/auth/callback/route.ts
// // Handles Supabase OAuth redirect (Google sign-in callback).
// // Also handles email confirmation links.

// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
//   const { searchParams, origin } = new URL(request.url);
//   const code       = searchParams.get("code");
//   const redirectTo = searchParams.get("redirect") || "/";
//   const role       = searchParams.get("role") || "user";  // passed from Google OAuth

//   if (!code) {
//     return NextResponse.redirect(`${origin}/login?error=no_code`);
//   }

//   const cookieStore = await cookies();
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll()              { return cookieStore.getAll() },
//         setAll(cookiesToSet)  {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             cookieStore.set(name, value, options)
//           );
//         },
//       },
//     }
//   );

//   // Exchange the OAuth code for a session
//   const { data, error } = await supabase.auth.exchangeCodeForSession(code);

//   if (error || !data.user) {
//     console.error("[Auth Callback] Error:", error);
//     return NextResponse.redirect(`${origin}/login?error=auth_failed`);
//   }

//   const userId = data.user.id;

//   // ── Check if this is a new user (Google signup) ───────────
//   // If profile doesn't exist yet or role needs setting:
//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("role")
//     .eq("id", userId)
//     .single();

//   // For new Google signups, update the role if agent was intended
//   if (profile && role === "agent" && profile.role === "user") {
//     await supabase
//       .from("profiles")
//       .update({ role: "agent" })
//       .eq("id", userId);
//   }

//   // ── Determine redirect ────────────────────────────────────
//   const finalRole = role === "agent" ? "agent" : profile?.role || "user";

//   if (finalRole === "agent" || finalRole === "builder") {
//     // Check onboarding progress
//     const { data: ap } = await supabase
//       .from("agent_profiles")
//       .select("onboarding_step")
//       .eq("profile_id", userId)
//       .single();

//     if (!ap || ap.onboarding_step < 3) {
//       const nextStep = ap ? ap.onboarding_step + 1 : 1;
//       return NextResponse.redirect(`${origin}/onboarding/step-${nextStep}`);
//     }

//     return NextResponse.redirect(`${origin}/agent/dashboard`);
//   }

//   return NextResponse.redirect(`${origin}${redirectTo}`);
// }







// app/auth/callback/route.ts
// Handles Google OAuth redirect + email OTP confirmation.
// FIXED: cookies() handling for Next.js 15 Route Handlers.

// import { createServerClient } from "@supabase/ssr";
// import { cookies }            from "next/headers";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
//   const { searchParams, origin } = new URL(request.url);
//   const code       = searchParams.get("code");
//   const redirectTo = searchParams.get("redirect") || "/";
//   const role       = searchParams.get("role")     || "user";

//   if (!code) {
//     return NextResponse.redirect(`${origin}/login?error=no_code`);
//   }
//   console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
//   console.log("CODE:", code?.substring(0, 8));

//   // ── Build response first, attach cookies to it ────────────
//   // In Next.js 15 Route Handlers, you MUST attach cookies to the
//   // response object — not to the read-only cookieStore from cookies().
//   const response = NextResponse.redirect(`${origin}/`); // placeholder, overwritten below

//   const cookieStore = await cookies();

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return cookieStore.getAll();
//         },
//         setAll(cookiesToSet) {
//           // Write cookies to the response, not the read-only store
//           cookiesToSet.forEach(({ name, value, options }) => {
//             response.cookies.set(name, value, options);
//           });
//         },
//       },
//     }
//   );

//   // ── Exchange code for session ─────────────────────────────
//   const { data, error } = await supabase.auth.exchangeCodeForSession(code);

//   if (error || !data.user) {
//     console.error("[Auth Callback] Error:", error);
//     return NextResponse.redirect(`${origin}/login?error=auth_failed`);
//   }

//   const userId = data.user.id;

//   // ── Handle new Google user profile ───────────────────────
//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("role")
//     .eq("id", userId)
//     .single();

//   // Update role if Google signup was as agent
//   if (profile && role === "agent" && profile.role === "user") {
//     await supabase
//       .from("profiles")
//       .update({ role: "agent" })
//       .eq("id", userId);
//   }

//   // ── Determine where to send them ─────────────────────────
//   const finalRole = role === "agent" ? "agent" : (profile?.role || "user");
//   let destination = redirectTo;

//   if (finalRole === "agent" || finalRole === "builder") {
//     const { data: ap } = await supabase
//       .from("agent_profiles")
//       .select("onboarding_step")
//       .eq("profile_id", userId)
//       .single();

//     if (!ap || ap.onboarding_step < 3) {
//       destination = `/onboarding/step-${ap ? ap.onboarding_step + 1 : 1}`;
//     } else {
//       destination = "/agent/dashboard";
//     }
//   }

//   // ── Redirect with session cookies attached ────────────────
//   const finalResponse = NextResponse.redirect(`${origin}${destination}`);

//   // Copy all cookies from our supabase response to the final redirect
//   response.cookies.getAll().forEach(cookie => {
//     finalResponse.cookies.set(cookie.name, cookie.value, {
//       path:     cookie.path,
//       domain:   cookie.domain,
//       maxAge:   cookie.maxAge,
//       httpOnly: cookie.httpOnly,
//       secure:   cookie.secure,
//       sameSite: cookie.sameSite as any,
//     });
//   });

//   return finalResponse;
// }






// app/auth/callback/route.ts
// THE CORRECT pattern for Next.js 15 App Router + Supabase SSR.
// Key fix: cookies are set on the RESPONSE not on cookieStore.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient }        from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code       = searchParams.get("code");
  const redirectTo = searchParams.get("redirect") || "/";
  const role       = searchParams.get("role")     || "user";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  // ── Create the response FIRST ─────────────────────────────
  // All cookie writes go onto this response object.
  // This is the only correct pattern in Next.js 15 Route Handlers.
  const response = NextResponse.redirect(`${origin}${redirectTo}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Read from the incoming request
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write onto the outgoing response
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

// console.log("About to exchange code:", code?.substring(0, 8));
// console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
// console.log("Anon key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
// console.log("Verifier cookie:", request.cookies.get("sb-hvkayrwayjjcxpjkpxkh-auth-token-code-verifier")?.value?.substring(0, 10));
  // Exchange code — cookies are now read from request, written to response
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  // if (error || !data.user) {
  //   console.error("[Auth Callback] Error:", error?.message);
  //   return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  // }

  if (error || !data.user) {
  console.error("[Auth Callback] message:", error?.message);
  console.error("[Auth Callback] status:", error?.status);
  console.error("[Auth Callback] full:", JSON.stringify(error, null, 2));
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

  const userId = data.user.id;

  // ── Read profile to determine where to send them ──────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  // Update role for Google agent signups
  if (role === "agent" && profile?.role === "user") {
    await supabase
      .from("profiles")
      .update({ role: "agent" })
      .eq("id", userId);
  }

  // ── Determine destination ─────────────────────────────────
  const finalRole = role === "agent" ? "agent" : (profile?.role ?? "user");

  if (finalRole === "agent" || finalRole === "builder") {
    const { data: ap } = await supabase
      .from("agent_profiles")
      .select("onboarding_step")
      .eq("profile_id", userId)
      .single();

    const dest = (!ap || ap.onboarding_step < 3)
      ? `/onboarding/step-${ap ? ap.onboarding_step + 1 : 1}`
      : "/agent/dashboard";

    // Rewrite the redirect on the response we already created
    response.headers.set("location", `${origin}${dest}`);
    return response;
  }

  // response already points to redirectTo — just return it
  response.headers.set("location", `${origin}${redirectTo}`);
  return response;
}