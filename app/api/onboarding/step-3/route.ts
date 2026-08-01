import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";


export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
 
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
 
  let body: {
    plan_slug: string;
    skipped:   boolean;
  };
 
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
 
  const admin = createAdminClient();
 
  // Get the plan ID from slug
  const { data: plan } = await admin
    .from("plans")
    .select("id, slug, price")
    .eq("slug", body.plan_slug)
    .single();
 
  // Phase 2: if paid plan, create Razorpay order here instead
  // For now, just mark step 3 complete (all get free plan behavior)
  const { error: dbError } = await admin.rpc("complete_onboarding_step3", {
    p_profile_id: user.id,
    p_plan_id:    plan?.id ?? "",
    p_skipped:    body.skipped || body.plan_slug === "free",
  });
 
  if (dbError) {
    console.error("[Onboarding Step 3]", dbError);
    return NextResponse.json(
      { error: "Failed to save plan selection. Please try again." },
      { status: 500 }
    );
  }
 
  // Phase 2 hook: if paid plan selected, return razorpay_order_id
  // and the frontend will open Razorpay checkout before redirecting.
  if (plan && plan.price > 0 && !body.skipped) {
    // TODO Phase 2: call create-razorpay-order edge function here
    // For now just complete onboarding with free plan
  }
 
  return NextResponse.json({ success: true });
}