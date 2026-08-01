// app/api/onboarding/step-1/route.ts
// Saves professional details to agent_profiles.
// Calls the complete_onboarding_step1() SQL function.

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  // ── Auth check ────────────────────────────────────────────
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse body ────────────────────────────────────────────
  let body: {
    agent_type:          "individual_agent" | "builder_developer" | "individual_owner" | "agency";
    company_name:        string | null;
    bio:                 string | null;
    specializations:     string[];
    years_of_experience: number | null;
    office_address:      string | null;
    website_url:         string | null;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // ── Basic validation ──────────────────────────────────────
  const validAgentTypes = [
    "individual_agent",
    "builder_developer",
    "individual_owner",
    "agency",
  ];
  if (!validAgentTypes.includes(body.agent_type)) {
    return NextResponse.json({ error: "Invalid agent type." }, { status: 400 });
  }

  // ── Call SQL function via admin client (bypasses RLS) ─────
  const admin = createAdminClient();
  const { error: dbError } = await admin.rpc("complete_onboarding_step1", {
    p_profile_id:          user.id,
    p_agent_type:          body.agent_type,
    p_company_name:        body.company_name ?? "",
    p_bio:                 body.bio ?? "",
    p_operating_city_ids:  [],   // populated later when city multi-select is added
    p_specializations:     body.specializations ?? [],
    p_years_experience:    body.years_of_experience ?? 0,
    p_office_address:      body.office_address ?? "",
    p_website_url:         body.website_url ?? "",
  });

  if (dbError) {
    console.error("[Onboarding Step 1]", dbError);
    return NextResponse.json(
      { error: "Failed to save your details. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}