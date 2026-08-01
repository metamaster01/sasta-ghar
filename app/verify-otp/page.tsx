"use client";

// app/verify-otp/page.tsx
// OTP verification after signup.
// Also handles the UPGRADE ROLE flow (existing user → agent).
// Reads sessionStorage set by register-page or upgrade-role flow.

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function VerifyOTPPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [otp,       setOtp]       = useState(["", "", "", "", "", ""]);
  const [email,     setEmail]     = useState("");
  const [intent,    setIntent]    = useState("");
  const [redirect,  setRedirect]  = useState("/");
  const [agentType, setAgentType] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedEmail    = sessionStorage.getItem("signup_email")      || "";
    const storedIntent   = sessionStorage.getItem("signup_intent")     || "";
    const storedRedirect = sessionStorage.getItem("signup_redirect")   || "/";
    const storedAgent    = sessionStorage.getItem("signup_agent_type") || "";

    if (!storedEmail) {
      router.push("/register");
      return;
    }
    setEmail(storedEmail);
    setIntent(storedIntent);
    setRedirect(storedRedirect);
    setAgentType(storedAgent);
    // Focus first input
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

  // Countdown for resend button
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError("");
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    if (digit && index === 5 && newOtp.every(d => d !== "")) {
      verifyOtp(newOtp.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
      inputRefs.current[5]?.focus();
      verifyOtp(paste);
    }
  }

  async function verifyOtp(code: string) {
    if (loading || code.length !== 6) return;
    setLoading(true);
    setError("");

    const { data, error: err } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });

    if (err) {
      setError(
        err.message.includes("expired")
          ? "Code expired. Request a new one below."
          : err.message.includes("invalid") || err.message.includes("Token")
          ? "Incorrect code. Please check your email."
          : err.message
      );
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setLoading(false);
      return;
    }

    // ── OTP verified — session is now active ──────────────
    if (!data.user) {
      setError("Verification failed. Please try again.");
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    // ── For agent signups: update role + create agent_profiles ──
    if (intent === "agent") {
      // 1. Update profiles.role to 'agent'
      await supabase
        .from("profiles")
        .update({ role: "agent" })
        .eq("id", userId);

      // 2. Create agent_profiles stub (so middleware can find it)
      const { error: apErr } = await supabase
        .from("agent_profiles")
        .upsert({
          profile_id:      userId,
          agent_type:      (agentType as any) || "individual_agent",
          onboarding_step: 0,
          current_plan_id: "", // will be set by complete_onboarding_step1
        }, { onConflict: "profile_id" });

      if (apErr) {
        console.error("agent_profiles upsert:", apErr);
        // Non-fatal — onboarding step 1 will also upsert
      }
    }

    // ── Clean sessionStorage ──────────────────────────────
    sessionStorage.removeItem("signup_email");
    sessionStorage.removeItem("signup_intent");
    sessionStorage.removeItem("signup_redirect");
    sessionStorage.removeItem("signup_name");
    sessionStorage.removeItem("signup_agent_type");

    setSuccess("Email verified! Redirecting…");

    // Small delay so success state is visible
    setTimeout(() => router.push(redirect), 800);
  }

  async function handleResend() {
    if (!canResend || resending) return;
    setResending(true);
    setError("");

    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (err) {
      setError("Failed to resend. Please wait a moment and try again.");
    } else {
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
    setResending(false);
  }

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) =>
        `${a}${"*".repeat(Math.min(b.length, 4))}${c}`
      )
    : "";

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#F5F7FF] to-[#EEF2FF] flex items-center justify-center px-4"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-baseline mb-8">
          <span className="text-xl font-bold text-[#1B4FD8]">Sasta</span>
          <span className="text-xl font-bold text-[#2EAE88]">ghar</span>
        </Link>

        {/* Success state */}
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
                className="w-16 h-16 bg-[#2EAE88]/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-8 h-8 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <motion.path
                    strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </svg>
              </motion.div>
              <h2 className="text-gray-900 font-bold text-xl mb-1">Verified!</h2>
              <p className="text-gray-500 text-sm">Redirecting you now…</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Email icon */}
              <div className="w-14 h-14 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-[#1B4FD8]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h1>
              <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-gray-800">{maskedEmail}</span>.
                Enter it below to continue.
              </p>

              {/* OTP boxes */}
              <div className="flex gap-2.5 mb-5" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    disabled={loading}
                    className={`w-13 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200 ${
                      digit
                        ? "border-[#1B4FD8] bg-[#EEF2FF] text-[#1B4FD8]"
                        : "border-gray-200 bg-gray-50 text-gray-900"
                    } focus:border-[#1B4FD8] focus:bg-[#EEF2FF] disabled:opacity-50`}
                  />
                ))}
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Verify button */}
              <motion.button
                onClick={() => verifyOtp(otp.join(""))}
                disabled={loading || otp.some(d => !d)}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#1B4FD8] hover:bg-[#1640b8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mb-5"
              >
                {loading ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Verifying…</>
                ) : "Verify & Continue →"}
              </motion.button>

              {/* Resend */}
              <div className="text-center space-y-1">
                <p className="text-xs text-gray-400">Didn't receive the code?</p>
                {canResend ? (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-[#1B4FD8] text-sm font-semibold hover:underline underline-offset-4 disabled:opacity-60"
                  >
                    {resending ? "Sending…" : "Resend code"}
                  </button>
                ) : (
                  <p className="text-gray-400 text-sm">
                    Resend in <span className="font-semibold text-gray-700 tabular-nums">{countdown}s</span>
                  </p>
                )}
              </div>

              <div className="text-center mt-5">
                <button
                  onClick={() => router.push("/register")}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Wrong email? Go back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}