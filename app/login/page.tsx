"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

// ── Eye toggle icon ───────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

// ── Google icon ───────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ── Field component ───────────────────────────────────────────
function Field({
  label, type = "text", value, onChange, placeholder, disabled,
  rightElement,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  disabled: boolean; rightElement?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F8FA] text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#1B4FD8] focus:bg-white focus:ring-2 focus:ring-[#1B4FD8]/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ paddingRight: rightElement ? "44px" : undefined }}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Property images cycling on the right ─────────────────────
const HERO_IMAGES = [
  { src: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=85", label: "Independent House · Mumbai" },
  { src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=85", label: "Luxury Villa · Pune" },
  { src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=85", label: "Premium Apartment · Navi Mumbai" },
];

// ── Inner component that uses useSearchParams ─────────────────
function LoginInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") || "/";
  const supabase     = createClient();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [imgIdx,   setImgIdx]   = useState(0);

  // Cycle hero images every 4s
  useEffect(() => {
    const t = setInterval(() =>
      setImgIdx(i => (i + 1) % HERO_IMAGES.length), 4000);
    return () => clearInterval(t);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError("");

    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (err) {
      setError(
        err.message.includes("Invalid login")
          ? "Incorrect email or password."
          : err.message
      );
      setLoading(false);
      return;
    }

    // Check if agent with incomplete onboarding
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "agent" || profile?.role === "builder") {
        const { data: ap } = await supabase
          .from("agent_profiles")
          .select("onboarding_step")
          .eq("profile_id", data.user.id)
          .single();

        if (ap && ap.onboarding_step < 3) {
          router.push(`/onboarding/step-${ap.onboarding_step + 1}`);
          return;
        }
        router.push("/agent/dashboard");
        return;
      }
    }

    router.push(redirectTo);
  }

  // async function handleGoogle() {
  //   setLoading(true);
  //   await supabase.auth.signInWithOAuth({
  //     provider: "google",
  //     options: {
  //       redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
  //     },
  //   });
  // }

  async function handleGoogle() {
  setLoading(true);
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error) {
    setError(error.message);
    setLoading(false);
  }
}

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white px-4 py-10 lg:py-0"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:min-h-screen lg:items-center">

        {/* ── Left: Form ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-center py-12 lg:py-20 lg:pr-16 order-2 lg:order-1"
        >
          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-0 mb-10 w-fit">
            <span className="text-2xl font-bold text-[#1B4FD8] tracking-tight">Sasta</span>
            <span className="text-2xl font-bold text-[#2EAE88] tracking-tight">ghar</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Don't have an account?{" "}
            <Link
              href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
              className="text-[#1B4FD8] font-semibold hover:underline underline-offset-4"
            >
              Sign up free
            </Link>
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Example@email.com"
              disabled={loading}
            />
            <Field
              label="Password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="At least 8 characters"
              disabled={loading}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPw} />
                </button>
              }
            />

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-[#1B4FD8] hover:underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#2EAE88] hover:bg-[#28996f] disabled:opacity-70 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </>
              ) : "Log In"}
            </motion.button>

            {/* Divider */}
            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">Or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm py-3.5 rounded-xl transition-colors duration-200 disabled:opacity-60"
            >
              <GoogleIcon />
              Sign in with Google
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            New here?{" "}
            <Link
              href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
              className="text-[#1B4FD8] font-semibold hover:underline underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </motion.div>

        {/* ── Right: Property image ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block order-1 lg:order-2 h-[85vh] max-h-[800px] self-center"
        >
          {/* Tall rounded image card */}
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={imgIdx}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={HERO_IMAGES[imgIdx].src}
                  alt={HERO_IMAGES[imgIdx].label}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* Bottom label */}
            <div className="absolute bottom-6 left-6 right-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={imgIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-white/70 text-xs font-medium tracking-wider uppercase mb-1">
                    Featured Property
                  </p>
                  <p className="text-white font-semibold text-base">
                    {HERO_IMAGES[imgIdx].label}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div className="flex gap-1.5 mt-3">
                {HERO_IMAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === imgIdx ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Top badge */}
            <div className="absolute top-5 left-5">
              <div className="flex items-baseline gap-0 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl">
                <span className="text-base font-bold text-[#1B4FD8]">Sasta</span>
                <span className="text-base font-bold text-[#2EAE88]">ghar</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// ── Page export with Suspense boundary for useSearchParams ────
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1B4FD8] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginInner />
    </Suspense>
  );
}