// app/api/imagekit-auth/route.ts
// Server-side ImageKit authentication signature.
// Called by client before uploading to ImageKit.
// Uses IMAGEKIT_PRIVATE_KEY (server-only, never exposed to browser).

import { NextResponse }            from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import crypto                      from "crypto";

export async function GET() {
  // ── Auth guard — only logged-in users can get upload tokens ──
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: "ImageKit not configured" }, { status: 500 });
  }

  // Generate signature
  const token   = crypto.randomBytes(16).toString("hex");
  const expire  = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  const toSign  = token + expire;
  const signature = crypto
    .createHmac("sha1", privateKey)
    .update(toSign)
    .digest("hex");

  return NextResponse.json({ token, expire, signature });
}