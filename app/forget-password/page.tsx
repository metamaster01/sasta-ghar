"use client";

// app/forgot-password/page.tsx
// Step 1: User enters email → Supabase sends reset link/OTP.
// Matches the auth theme exactly.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type State = "idle" | "loading" | "sent" | "error";

export default function ForgotPasswordPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [email,  setEmail]  = useState("");
  const [state,  setState]  = useState<State>("idle");
  const [error,  setError]  = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setState("loading");
    setError("");

    const { error: err } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        // Redirect to reset-password page after user clicks link in email
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (err) {
      setError(err.message);
      setState("error");
      return;
    }

    setState("sent");
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#F5F7FF] to-[#EEF2FF] flex items-center justify-center px-4 py-10"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-10 lg:items-center">

        {/* ── Left: Form ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 order-2 lg:order-1"
        >
          {/* Logo */}
          <Link href="/" className="flex items-baseline mb-8">
            <span className="text-xl font-bold text-[#1B4FD8]">Sasta</span>
            <span className="text-xl font-bold text-[#2EAE88]">ghar</span>
          </Link>

          <AnimatePresence mode="wait">

            {/* ── Sent state ──────────────────────────── */}
            {state === "sent" ? (
              <motion.div key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
                  className="w-16 h-16 bg-[#2EAE88]/10 rounded-full flex items-center justify-center mx-auto mb-5"
                >
                  <svg className="w-8 h-8 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </motion.div>

                <h2 className="text-gray-900 text-2xl font-bold mb-2">Check your email</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-2">
                  We sent a password reset link to
                </p>
                <p className="text-[#1B4FD8] font-semibold text-sm mb-6">
                  {email.trim().toLowerCase()}
                </p>
                <p className="text-gray-400 text-xs leading-relaxed mb-8">
                  Click the link in the email to set a new password.
                  If you don't see it, check your spam folder.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleSubmit as any}
                    className="w-full border border-gray-200 text-gray-600 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Resend email
                  </button>
                  <Link
                    href="/login"
                    className="block w-full text-center text-[#1B4FD8] text-sm font-semibold hover:underline underline-offset-4"
                  >
                    ← Back to login
                  </Link>
                </div>
              </motion.div>

            ) : (
              /* ── Input state ────────────────────────── */
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Lock icon */}
                <div className="w-14 h-14 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-[#1B4FD8]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot password?</h1>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  No worries — enter your registered email and we'll send you a reset link.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      placeholder="you@email.com"
                      disabled={state === "loading"}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F8FA] text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#1B4FD8] focus:bg-white focus:ring-2 focus:ring-[#1B4FD8]/10 transition-all duration-200 disabled:opacity-50"
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={state === "loading"}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#1B4FD8] hover:bg-[#1640b8] disabled:opacity-70 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {state === "loading"
                      ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>Sending reset link…</>
                      : "Send Reset Link"}
                  </motion.button>

                  <Link href="/login"
                    className="block text-center text-sm text-gray-500 hover:text-[#1B4FD8] transition-colors mt-2">
                    ← Back to login
                  </Link>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Right: Decorative panel ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex flex-col justify-center order-1 lg:order-2 py-10"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white">
            <div className="w-12 h-12 bg-[#1B4FD8]/10 rounded-2xl flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-[#1B4FD8]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-2">Your account is secure</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Reset links expire in 1 hour and can only be used once. Your data and listings are always safe.
            </p>
            <div className="space-y-3">
              {[
                "Reset link sent to your registered email",
                "Link expires in 1 hour for security",
                "No data is lost during password reset",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#2EAE88]/15 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}