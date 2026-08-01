"use client";

// app/reset-password/page.tsx
// Step 2: User clicks link in email → lands here.
// Supabase injects the session via URL hash automatically.
// User sets their new password here.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type State = "loading" | "ready" | "saving" | "success" | "error" | "invalid";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "Contains a number",      pass: /\d/.test(password) },
    { label: "Contains a letter",      pass: /[a-zA-Z]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ["bg-red-400", "bg-yellow-400", "bg-[#2EAE88]"];
  const labels = ["Weak", "Fair", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < score ? colors[score - 1] : "bg-gray-200"}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map(c => (
            <span key={c.label} className={`text-[10px] flex items-center gap-1 ${c.pass ? "text-[#2EAE88]" : "text-gray-400"}`}>
              <span>{c.pass ? "✓" : "○"}</span>{c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-[10px] font-bold ${colors[score-1].replace("bg-","text-")}`}>
            {labels[score - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [state,       setState]       = useState<State>("loading");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error,       setError]       = useState("");

  // ── Detect session from URL hash ───────────────────────────
  // Supabase puts the session tokens in the URL hash after
  // user clicks the reset link in their email.
  // onAuthStateChange picks this up automatically.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          // Valid reset session — show the password form
          setState("ready");
        } else if (event === "SIGNED_IN" && session) {
          // Already handled via PASSWORD_RECOVERY first
          setState("ready");
        }
      }
    );

    // Timeout — if no auth event in 3 seconds, the link is invalid/expired
    const timeout = setTimeout(() => {
      setState(s => s === "loading" ? "invalid" : s);
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setState("saving");

    const { error: err } = await supabase.auth.updateUser({ password });

    if (err) {
      setError(err.message.includes("same password")
        ? "New password must be different from your current password."
        : err.message);
      setState("ready");
      return;
    }

    setState("success");
    // Sign out so they log in fresh with new password
    await supabase.auth.signOut();
    setTimeout(() => router.push("/login?message=password_reset"), 2000);
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#F5F7FF] to-[#EEF2FF] flex items-center justify-center px-4 py-10"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-10 lg:items-center">

        {/* ── Left: Form card ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 order-2 lg:order-1"
        >
          <Link href="/" className="flex items-baseline mb-8">
            <span className="text-xl font-bold text-[#1B4FD8]">Sasta</span>
            <span className="text-xl font-bold text-[#2EAE88]">ghar</span>
          </Link>

          <AnimatePresence mode="wait">

            {/* Loading */}
            {state === "loading" && (
              <motion.div key="loading" className="text-center py-12">
                <svg className="w-8 h-8 animate-spin text-[#1B4FD8] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p className="text-gray-500 text-sm">Verifying reset link…</p>
              </motion.div>
            )}

            {/* Invalid / expired */}
            {state === "invalid" && (
              <motion.div key="invalid"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <h2 className="text-gray-900 font-bold text-xl mb-2">Link expired</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  This reset link has expired or already been used. Reset links are valid for 1 hour.
                </p>
                <Link href="/forgot-password"
                  className="inline-block bg-[#1B4FD8] text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-[#1640b8] transition-colors">
                  Request a new link
                </Link>
              </motion.div>
            )}

            {/* Success */}
            {state === "success" && (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
                  className="w-16 h-16 bg-[#2EAE88]/10 rounded-full flex items-center justify-center mx-auto mb-5"
                >
                  <svg className="w-8 h-8 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <motion.path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }} />
                  </svg>
                </motion.div>
                <h2 className="text-gray-900 font-bold text-xl mb-2">Password updated!</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Your password has been changed successfully. Redirecting you to login…
                </p>
              </motion.div>
            )}

            {/* Ready to reset */}
            {(state === "ready" || state === "saving") && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-14 h-14 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-[#1B4FD8]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Set new password</h1>
                <p className="text-gray-500 text-sm mb-7">
                  Choose a strong password you haven't used before.
                </p>

                <form onSubmit={handleReset} className="space-y-4">
                  {/* New password */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(""); }}
                        placeholder="At least 8 characters"
                        disabled={state === "saving"}
                        className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-[#F7F8FA] text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#1B4FD8] focus:bg-white focus:ring-2 focus:ring-[#1B4FD8]/10 transition-all disabled:opacity-50"
                      />
                      <button type="button" onClick={() => setShowPw(p => !p)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw
                          ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        }
                      </button>
                    </div>
                    <PasswordStrength password={password} />
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={e => { setConfirm(e.target.value); setError(""); }}
                        placeholder="Repeat your password"
                        disabled={state === "saving"}
                        className={`w-full px-4 py-3 pr-11 rounded-xl border bg-[#F7F8FA] text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 transition-all disabled:opacity-50 ${
                          confirm && confirm !== password
                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                            : confirm && confirm === password
                            ? "border-[#2EAE88] focus:border-[#2EAE88] focus:ring-green-100"
                            : "border-gray-200 focus:border-[#1B4FD8] focus:ring-[#1B4FD8]/10"
                        }`}
                      />
                      <button type="button" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirm
                          ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        }
                      </button>
                    </div>
                    {confirm && confirm === password && (
                      <p className="text-[10px] text-[#2EAE88] flex items-center gap-1 mt-1">
                        <span>✓</span> Passwords match
                      </p>
                    )}
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button type="submit" disabled={state === "saving"} whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#2EAE88] hover:bg-[#28996f] disabled:opacity-70 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                    {state === "saving"
                      ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>Updating password…</>
                      : "Update Password"}
                  </motion.button>
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
            <h3 className="text-gray-900 font-bold text-lg mb-4">Tips for a strong password</h3>
            <div className="space-y-3.5">
              {[
                { icon: "🔢", tip: "Use a mix of numbers and letters" },
                { icon: "🔡", tip: "Include uppercase and lowercase characters" },
                { icon: "✨", tip: "Add special characters like ! @ # $" },
                { icon: "🚫", tip: "Don't reuse passwords from other sites" },
                { icon: "📏", tip: "Longer passwords are always stronger" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-gray-600 text-sm">{item.tip}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}