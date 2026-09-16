// app/api/help-center/route.ts
// Receives the Help Centre query form and emails it to the admin via Resend.
//
// Requires: npm install resend
// Env vars (.env.local):
//   RESEND_API_KEY=re_xxxxxxxx
//   HELP_CENTER_ADMIN_EMAIL=admin@sastaghar.com      (where queries land)
//   RESEND_FROM_EMAIL="Sastaghar Help Center <help@sastaghar.com>"
//   (the FROM domain must be a domain you've verified in Resend)

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const ADMIN_EMAIL = process.env.HELP_CENTER_ADMIN_EMAIL || "v.miracle2008@gmail.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "PropertyLink Help Center <help@propertylink.com>";

interface HelpCenterPayload {
  name: string;
  email: string;
  category: string;
  message: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<HelpCenterPayload> = await req.json();

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    const category = (body.category ?? "General").trim();
    const message = (body.message ?? "").trim();

    // ── Validation ──────────────────────────────────────────
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required." },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }
    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long. Please keep it under 5000 characters." },
        { status: 400 }
      );
    }
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "Email service is not configured yet. Please try again later." },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `[Help Centre] ${category} — ${name}`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #111827; max-width: 520px;">
          <h2 style="margin: 0 0 4px; font-size: 16px;">New Help Centre Query</h2>
          <p style="margin: 0 0 20px; color: #6b7280; font-size: 12px;">Submitted from the agent Help Centre</p>

          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <td style="padding: 4px 12px 4px 0; color: #9ca3af; width: 90px;">Name</td>
              <td style="padding: 4px 0; font-weight: 600;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 12px 4px 0; color: #9ca3af;">Email</td>
              <td style="padding: 4px 0;">${escapeHtml(email)}</td>
            </tr>
            <tr>
              <td style="padding: 4px 12px 4px 0; color: #9ca3af;">Category</td>
              <td style="padding: 4px 0;">
                <span style="background: #2EAE8820; color: #1d8a6a; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600;">
                  ${escapeHtml(category)}
                </span>
              </td>
            </tr>
          </table>

          <p style="margin: 20px 0 6px; color: #9ca3af; font-size: 12px;">Message</p>
          <p style="white-space: pre-wrap; border-left: 3px solid #2EAE88; padding-left: 12px; margin: 0; line-height: 1.6;">
            ${escapeHtml(message)}
          </p>

          <p style="margin-top: 24px; color: #9ca3af; font-size: 11px;">
            Reply directly to this email to respond to ${escapeHtml(name)}.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send your message. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Help center API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}