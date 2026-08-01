// app/api/contact/route.ts
// Handles contact form submission:
//   1. Saves to Supabase public.contact table
//   2. Sends notification email to admin via Resend
// Both happen server-side — no keys exposed to browser.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ── Supabase admin client (bypasses RLS for insert) ──────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Rate limiting (simple in-memory, good enough for Phase 1) ─
const rateLimit = new Map<string, number>();
const RATE_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS   = 3;      // max 3 submissions per IP per minute

function isRateLimited(ip: string): boolean {
  const now   = Date.now();
  const count = rateLimit.get(ip) ?? 0;

  if (count === 0) {
    rateLimit.set(ip, 1);
    setTimeout(() => rateLimit.delete(ip), RATE_WINDOW_MS);
    return false;
  }
  if (count >= MAX_REQUESTS) return true;
  rateLimit.set(ip, count + 1);
  return false;
}

export async function POST(req: NextRequest) {
  // ── IP rate limit ─────────────────────────────────────────
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  // ── Parse + validate body ────────────────────────────────
  let body: { name: string; email: string; message: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, message } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Name, email and message are all required." },
      { status: 400 }
    );
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  if (name.trim().length > 100 || message.trim().length > 2000) {
    return NextResponse.json(
      { error: "Name or message exceeds maximum length." },
      { status: 400 }
    );
  }

  // ── 1. Save to Supabase ──────────────────────────────────
  const { error: dbError } = await supabase
    .from("contact")
    .insert({
      name:    name.trim(),
      email:   email.trim().toLowerCase(),
      message: message.trim(),
    });

  if (dbError) {
    console.error("[Contact] Supabase insert error:", dbError);
    return NextResponse.json(
      { error: "Failed to save your message. Please try again." },
      { status: 500 }
    );
  }

  // ── 2. Send email via Resend ─────────────────────────────
  const RESEND_API_KEY   = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL      = process.env.ADMIN_CONTACT_EMAIL ?? "contact@sastaghar.com";
  const FROM_EMAIL       = process.env.RESEND_FROM_EMAIL  ?? "noreply@sastaghar.com";

  if (!RESEND_API_KEY) {
    // Don't fail the request if Resend isn't configured yet
    console.warn("[Contact] RESEND_API_KEY not set — skipping email.");
    return NextResponse.json({ success: true });
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Poppins', Arial, sans-serif; background: #f5f5f0; margin: 0; padding: 0; }
          .wrapper { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: #1B4FD8; padding: 28px 32px; }
          .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; }
          .header p  { color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 13px; }
          .body { padding: 28px 32px; }
          .field { margin-bottom: 20px; }
          .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9CA3AF; margin-bottom: 4px; }
          .value { font-size: 15px; color: #111827; font-weight: 500; }
          .message-box { background: #F9FAFB; border-left: 3px solid #1B4FD8; padding: 14px 16px; border-radius: 0 8px 8px 0; font-size: 14px; color: #374151; line-height: 1.7; white-space: pre-wrap; }
          .footer { background: #F9FAFB; padding: 16px 32px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF; text-align: center; }
          .badge { display: inline-block; background: #EEF2FF; color: #1B4FD8; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>New Contact Inquiry</h1>
            <p>Received via Sastaghar.com contact form</p>
          </div>
          <div class="body">
            <span class="badge">New Message</span>
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${name.trim()}</div>
            </div>
            <div class="field">
              <div class="label">Email</div>
              <div class="value">
                <a href="mailto:${email.trim()}" style="color:#1B4FD8;text-decoration:none;">${email.trim()}</a>
              </div>
            </div>
            <div class="field">
              <div class="label">Message</div>
              <div class="message-box">${message.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            </div>
          </div>
          <div class="footer">
            Sastaghar.com &nbsp;·&nbsp; Vindhya Enterprises LLP &nbsp;·&nbsp;
            ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
          </div>
        </div>
      </body>
    </html>
  `;

  const resendRes = await fetch("https://api.resend.com/emails", {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      from:    `Sastaghar Contact <${FROM_EMAIL}>`,
      to:      [ADMIN_EMAIL],
      reply_to: email.trim(),        // clicking Reply goes to the visitor
      subject: `New inquiry from ${name.trim()} — Sastaghar`,
      html:    emailHtml,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    // DB insert succeeded — don't fail the user over email issue
    console.error("[Contact] Resend error:", err);
  }

  return NextResponse.json({ success: true });
}