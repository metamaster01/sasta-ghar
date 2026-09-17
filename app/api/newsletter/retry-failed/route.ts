// app/api/newsletter/retry-failed/route.ts
//
// Point your existing cron job at this URL every few minutes, e.g.:
//   GET https://yourdomain.com/api/newsletter/retry-failed
//   Header: Authorization: Bearer <CRON_SECRET>
//
// This is the only piece that replaces what pg_cron was doing — a
// safety net for the rare case Resend failed on the first attempt in
// the main /api/newsletter route. Everyone else already got their
// email instantly and is never touched by this route.
//
// Env vars needed:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   RESEND_API_KEY
//   NEWSLETTER_FROM_EMAIL   (optional)
//   SITE_URL                (optional)
//   CRON_SECRET              a random string you invent, so this route
//                            can't be hit by randoms — set the same value
//                            in your cron provider's request headers.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const FROM_EMAIL =
  process.env.NEWSLETTER_FROM_EMAIL ?? "PropertyLink Realty <no-reply@propertylinkreality.com>";
const SITE_URL = process.env.SITE_URL ?? "https://propertylinkreality.com";
const MAX_ATTEMPTS = 5;

async function sendWelcomeEmail(email: string, unsubscribeToken: string) {
  const unsubscribeUrl = `${SITE_URL}/newsletter/unsubscribe?token=${unsubscribeToken}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: email,
      subject: "You're subscribed to PropertyLink Realty updates",
      html: `
        <div style="font-family:Poppins,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#111827;margin-bottom:12px;">Welcome to PropertyLink Realty</h2>
          <p style="color:#374151;line-height:1.6;">
            Thanks for subscribing! You'll now receive property trends, market
            insights, and new listings from PropertyLink Realty at
            <strong>${email}</strong>.
          </p>
          <p style="color:#9ca3af;font-size:12px;margin-top:32px;">
            Didn't sign up for this? <a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe here</a>.
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: pending, error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("id, email, unsubscribe_token, welcome_email_attempts")
    .eq("welcome_email_sent", false)
    .lt("welcome_email_attempts", MAX_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(25);

  if (error) {
    console.error("retry-failed fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch pending subscribers." }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const row of pending ?? []) {
    try {
      await sendWelcomeEmail(row.email, row.unsubscribe_token);
      await supabaseAdmin
        .from("newsletter_subscribers")
        .update({ welcome_email_sent: true, welcome_email_attempts: row.welcome_email_attempts + 1 })
        .eq("id", row.id);
      sent++;
    } catch (err) {
      console.error(`retry-failed: could not email ${row.email}`, err);
      await supabaseAdmin
        .from("newsletter_subscribers")
        .update({ welcome_email_attempts: row.welcome_email_attempts + 1 })
        .eq("id", row.id);
      failed++;
    }
  }

  return NextResponse.json({ checked: pending?.length ?? 0, sent, failed });
}