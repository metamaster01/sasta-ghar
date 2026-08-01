// app/api/auth/upgrade-to-agent/route.ts
// Called when an EXISTING logged-in user (role=user) wants to
// become an agent by clicking "Post Property".
// Updates their role and creates agent_profiles stub.
// They then go through onboarding normally.

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type AgentType = "agency" | "builder_developer" | "individual_agent" | "individual_owner";

export async function POST(req: NextRequest) {
  // ── Auth: must be logged in ───────────────────────────────
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // ── Parse body ────────────────────────────────────────────
  let body: { agent_type?: AgentType } = {};
  try { body = await req.json(); } catch { /* body optional */ }

  const agentType = body.agent_type || "individual_agent";

  // ── Check they're not already an agent ───────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "agent" || profile?.role === "builder") {
    // Already an agent — just check onboarding step
    const { data: ap } = await supabase
      .from("agent_profiles")
      .select("onboarding_step")
      .eq("profile_id", user.id)
      .single();

    return NextResponse.json({
      success:         true,
      already_agent:   true,
      onboarding_step: ap?.onboarding_step ?? 0,
    });
  }

  // ── Use admin client to bypass RLS ───────────────────────
  const admin = createAdminClient();

  // 1. Update role in profiles
  const { error: roleError } = await admin
    .from("profiles")
    .update({ role: "agent" })
    .eq("id", user.id);

  if (roleError) {
    console.error("[upgrade-to-agent] role update:", roleError);
    return NextResponse.json({ error: "Failed to update role." }, { status: 500 });
  }

  // 2. Create agent_profiles stub
  const { error: apError } = await admin
    .from("agent_profiles")
    .upsert({
      profile_id:      user.id,
      agent_type:      agentType,
      onboarding_step: 0,
      current_plan_id: (await admin.from("plans").select("id").eq("slug", "free").single()).data?.id,
    }, { onConflict: "profile_id" });

  if (apError) {
    console.error("[upgrade-to-agent] agent_profiles:", apError);
    return NextResponse.json({ error: "Failed to create agent profile." }, { status: 500 });
  }

  return NextResponse.json({
    success:         true,
    already_agent:   false,
    onboarding_step: 0,
  });
}