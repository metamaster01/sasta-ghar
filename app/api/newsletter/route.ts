// app/api/newsletter/route.ts
//
// Env vars needed (server-only — never prefix these with NEXT_PUBLIC_):
//   NEXT_PUBLIC_SUPABASE_URL     (your existing Supabase URL is fine to reuse)
//   SUPABASE_SERVICE_ROLE_KEY    (Project Settings → API → service_role key)
//   RESEND_API_KEY               (resend.com → API Keys)
//   NEWSLETTER_FROM_EMAIL        (optional, e.g. "PropertyLink Realty <hello@yourdomain.com>")
//   SITE_URL                     (optional, e.g. https://yourdomain.com — used in the unsubscribe link)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM_EMAIL =
  process.env.NEWSLETTER_FROM_EMAIL ?? "PropertyLink Realty <no-reply@propertylinkreality.com>";
const SITE_URL = process.env.SITE_URL ?? "https://propertylinkreality.com";

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
    const errText = await res.text();
    throw new Error(`Resend error: ${errText}`);
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body as { email?: unknown })?.email;

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Insert the subscriber
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("newsletter_subscribers")
    .insert({ email: normalizedEmail, source: "homepage_newsletter" })
    .select("id, unsubscribe_token")
    .single();

  if (insertError) {
    // Postgres unique_violation — they're already on the list.
    // Treat this as a friendly success, don't resend the welcome email.
    if (insertError.code === "23505") {
      return NextResponse.json(
        { message: "You're already subscribed — no action needed." },
        { status: 200 }
      );
    }

    console.error("Newsletter insert error:", insertError);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  // 2. Send the welcome email right here, in the same request
  try {
    await sendWelcomeEmail(normalizedEmail, inserted.unsubscribe_token);

    await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ welcome_email_sent: true, welcome_email_attempts: 1 })
      .eq("id", inserted.id);
  } catch (err) {
    // The row is already saved — just log it and bump the attempt count
    // so your own cron's retry sweep (see /api/newsletter/retry-failed)
    // picks it up later. Don't fail the request over this: the user did
    // successfully subscribe, they just might get the welcome email a
    // few minutes late.
    console.error("Welcome email send failed:", err);
    await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ welcome_email_attempts: 1 })
      .eq("id", inserted.id);
  }

  return NextResponse.json(
    { message: "Subscribed! Check your inbox for a confirmation email." },
    { status: 201 }
  );
}