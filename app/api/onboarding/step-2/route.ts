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
    rera_number:  string | null;
    rera_doc_url: string | null;
    skipped:      boolean;
  };
 
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
 
  // If not skipping, require at least one of rera_number or doc
  if (!body.skipped && !body.rera_number && !body.rera_doc_url) {
    return NextResponse.json(
      { error: "Please provide a RERA number or upload a document, or skip this step." },
      { status: 400 }
    );
  }
 
  const admin = createAdminClient();
  const { error: dbError } = await admin.rpc("complete_onboarding_step2", {
    p_profile_id:   user.id,
    p_rera_number:  body.rera_number  ?? "",
    p_rera_doc_url: body.rera_doc_url ?? "",
    p_skipped:      body.skipped,
  });
 
  if (dbError) {
    console.error("[Onboarding Step 2]", dbError);
    return NextResponse.json(
      { error: "Failed to save verification details. Please try again." },
      { status: 500 }
    );
  }
 
  return NextResponse.json({ success: true });
}
