// import { NextRequest, NextResponse } from "next/server";
// import { createServerSupabaseClient } from "@/lib/supabase/server";
// import { createAdminClient } from "@/lib/supabase/admin";

 
// export async function POST(req: NextRequest) {
//   const supabase = await createServerSupabaseClient();
//   const { data: { user }, error: authError } = await supabase.auth.getUser();
 
//   if (authError || !user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }
 
//   let body: {
    // rera_number:  string | null;
//     rera_doc_url: string | null;
//     skipped:      boolean;
//   };
 
//   try {
//     body = await req.json();
//   } catch {
//     return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
//   }
 
//   // If not skipping, require at least one of rera_number or doc
//   if (!body.skipped && !body.rera_number && !body.rera_doc_url) {
//     return NextResponse.json(
//       { error: "Please provide a RERA number or upload a document, or skip this step." },
//       { status: 400 }
//     );
//   }
 
//   const admin = createAdminClient();
//   const { error: dbError } = await admin.rpc("complete_onboarding_step2", {
//     p_profile_id:   user.id,
//     p_rera_number:  body.rera_number  ?? "",
//     p_rera_doc_url: body.rera_doc_url ?? "",
//     p_skipped:      body.skipped,
//   });
 
//   if (dbError) {
//     console.error("[Onboarding Step 2]", dbError);
//     return NextResponse.json(
//       { error: "Failed to save verification details. Please try again." },
//       { status: 500 }
//     );
//   }
 
//   return NextResponse.json({ success: true });
// }






// app/api/onboarding/step-2/route.ts
// Updated: no longer accepts rera_doc_url.
// Document upload happens at /agent/verification via agent_documents table.
// Calls complete_onboarding_step2 RPC with empty doc_url + skipped flag.

import { NextRequest, NextResponse }   from "next/server";
import { createServerSupabaseClient }  from "@/lib/supabase/server";
import { createAdminClient }           from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { rera_number?: string | null; skipped?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const skipped    = body.skipped    ?? false;
  const reraNumber = body.rera_number?.trim() ?? "";

  // ── RERA duplicate check (skip if skipping) ───────────────
  if (!skipped && reraNumber) {
    const { data: existing } = await supabase
      .from("agent_profiles")
      .select("id")
      .eq("rera_number", reraNumber)
      .neq("profile_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "This RERA number is already registered. If this is your account, please log in. Otherwise contact support." },
        { status: 409 }
      );
    }
  }

  // ── Call existing RPC — pass empty string for rera_doc_url ─
  // Doc uploads now go to agent_documents table via /agent/verification.
  // We pass empty rera_doc_url so the RPC doesn't overwrite existing data.
  // verification_status is NOT set to 'pending' here anymore —
  // the check_verification_readiness() trigger handles that when
  // required docs are uploaded in agent_documents.
  const admin = createAdminClient();
  const { error: dbError } = await admin.rpc("complete_onboarding_step2", {
    p_profile_id:   user.id,
    p_rera_number:  reraNumber,
    p_rera_doc_url: "",       // intentionally empty — docs go to agent_documents
    p_skipped:      skipped,
  });

  if (dbError) {
    console.error("[Onboarding Step 2]", dbError);
    return NextResponse.json(
      { error: "Failed to save. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}