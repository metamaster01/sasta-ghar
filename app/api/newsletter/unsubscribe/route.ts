// app/api/newsletter/unsubscribe/route.ts
//
// GET  /api/newsletter/unsubscribe?token=...   → marks the subscriber unsubscribed
// POST /api/newsletter/unsubscribe?token=...   → marks them subscribed again
//
// Both are idempotent: calling GET twice, or POST when already
// subscribed, just returns success without erroring.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function findSubscriberByToken(token: string) {
  return supabaseAdmin
    .from("newsletter_subscribers")
    .select("id, email, status")
    .eq("unsubscribe_token", token)
    .maybeSingle();
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing unsubscribe token." }, { status: 400 });
  }

  const { data: subscriber, error: fetchError } = await findSubscriberByToken(token);

  if (fetchError) {
    console.error("Unsubscribe lookup error:", fetchError);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  if (!subscriber) {
    return NextResponse.json({ error: "Invalid or expired unsubscribe link." }, { status: 404 });
  }

  if (subscriber.status === "unsubscribed") {
    return NextResponse.json({
      message: "You're already unsubscribed.",
      email: subscriber.email,
    });
  }

  const { error: updateError } = await supabaseAdmin
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed", updated_at: new Date().toISOString() })
    .eq("id", subscriber.id);

  if (updateError) {
    console.error("Unsubscribe update error:", updateError);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({
    message: "You've been unsubscribed.",
    email: subscriber.email,
  });
}

export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const { data: subscriber, error: fetchError } = await findSubscriberByToken(token);

  if (fetchError || !subscriber) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 404 });
  }

  const { error: updateError } = await supabaseAdmin
    .from("newsletter_subscribers")
    .update({ status: "subscribed", updated_at: new Date().toISOString() })
    .eq("id", subscriber.id);

  if (updateError) {
    console.error("Resubscribe update error:", updateError);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({
    message: "You're resubscribed.",
    email: subscriber.email,
  });
}