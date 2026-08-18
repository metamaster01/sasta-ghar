// app/api/leads/route.ts
// Handles lead submission from PropertyLeadForm.
// 1. Validates input
// 2. Saves to leads table (triggers auto-routing to agent via DB trigger)
// 3. If wants_loan_assistance = true → loan_inquiries row created by DB trigger
// 4. Returns success

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient }         from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Simple in-memory rate limit: max 5 leads per IP per 10 minutes
const rateMap = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now  = Date.now();
  const rec  = rateMap.get(ip);
  if (!rec || now > rec.reset) {
    rateMap.set(ip, { count: 1, reset: now + 10 * 60 * 1000 });
    return false;
  }
  if (rec.count >= 5) return true;
  rec.count++;
  return false;
}

type LeadIntent =
  | "contact_owner"
  | "schedule_visit"
  | "callback_request"
  | "loan_inquiry"
  | "price_negotiation"
  | "project_brochure";

export async function POST(req: NextRequest) {
  // ── Rate limit ────────────────────────────────────────────
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes." },
      { status: 429 }
    );
  }

  // ── Parse body ────────────────────────────────────────────
  let body: {
    property_id?:           string;
    visitor_id?:            string | null;
    visitor_name:           string;
    visitor_phone:          string;
    visitor_email?:         string | null;
    message?:               string | null;
    intent?:                LeadIntent | string;
    wants_loan_assistance?: boolean;
    source?:                string;
    budget_min?:            number | null;
    budget_max?:            number | null;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // ── Validate ──────────────────────────────────────────────
  const { visitor_name, visitor_phone } = body;

  if (!visitor_name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!visitor_phone?.trim() || visitor_phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "Valid phone number is required." }, { status: 400 });
  }
  if (!body.property_id) {
    return NextResponse.json({ error: "Property ID is required." }, { status: 400 });
  }

  // Valid intent values from our schema enum
  const validIntents: LeadIntent[] = [
    "contact_owner",
    "schedule_visit",
    "callback_request",
    "loan_inquiry",
    "price_negotiation",
    "project_brochure",
  ];

  const isLeadIntent = (value: unknown): value is LeadIntent =>
    typeof value === "string" && validIntents.includes(value as LeadIntent);

  const intent: LeadIntent = isLeadIntent(body.intent) ? body.intent : "contact_owner";

  // ── Insert lead (admin client bypasses RLS) ───────────────
  // The DB trigger route_lead_to_agent() fires automatically after insert.
  // It assigns the lead to the property owner and manages free credit quota.
  const admin = createAdminClient();

  const { data: lead, error: leadError } = await admin
    .from("leads")
    .insert({
      property_id:           body.property_id,
      visitor_id:            body.visitor_id ?? null,
      visitor_name:          visitor_name.trim(),
      visitor_phone:         visitor_phone.replace(/\D/g, ""),
      visitor_email:         body.visitor_email?.trim() || null,
      message:               body.message?.trim() || null,
      intent,
      wants_loan_assistance: body.wants_loan_assistance ?? false,
      source:                body.source ?? "web",
      budget_min:            body.budget_min ?? null,
      budget_max:            body.budget_max ?? null,
      // status:                "new",
    })
    .select("id, unlock_price, status")
    .single();

  if (leadError) {
    console.error("[leads/POST] Insert error:", leadError.message);
    return NextResponse.json(
      { error: "Failed to submit enquiry. Please try again." },
      { status: 500 }
    );
  }

  // ── Increment property views_count (best-effort) ──────────
// This RPC is not present in the generated Supabase types for this project,
// so cast to any to avoid a TypeScript mismatch while keeping the call optional.
try {
  await (admin as any).rpc("increment_property_views", {
    p_property_id: body.property_id,
  });
} catch (_) {}
  // If this RPC doesn't exist yet, it fails silently.

  return NextResponse.json({
    success:     true,
    lead_id:     lead.id,
    loan_queued: body.wants_loan_assistance ?? false,
  });
}