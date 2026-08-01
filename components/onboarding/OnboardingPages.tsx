"use client";

// ============================================================
// SASTAGHAR — Agent Onboarding (3 Steps)
// This file contains:
//   OnboardingStep1Page  → /onboarding/step-1
//   OnboardingStep2Page  → /onboarding/step-2
//   OnboardingStep3Page  → /onboarding/step-3
//
// Each is a separate page.tsx — extract into:
//   app/onboarding/step-1/page.tsx
//   app/onboarding/step-2/page.tsx
//   app/onboarding/step-3/page.tsx
// ============================================================

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

// ── Shared: Progress bar ──────────────────────────────────────
function ProgressBar({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Professional Details", "Verification", "Choose Plan"];
  return (
    <div className="w-full mb-10">
      <div className="flex items-center justify-between mb-3">
        {steps.map((label, i) => {
          const num    = i + 1;
          const done   = num < step;
          const active = num === step;
          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  done   ? "bg-[#2EAE88] text-white" :
                  active ? "bg-[#1B4FD8] text-white ring-4 ring-[#1B4FD8]/20" :
                           "bg-gray-100 text-gray-400"
                }`}>
                  {done ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : num}
                </div>
                <p className={`text-[10px] font-semibold mt-1.5 hidden sm:block ${
                  active ? "text-[#1B4FD8]" : done ? "text-[#2EAE88]" : "text-gray-400"
                }`}>
                  {label}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${done ? "bg-[#2EAE88]" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Shared: Onboarding layout wrapper ────────────────────────
function OnboardingLayout({
  step, title, subtitle, children,
}: {
  step: 1 | 2 | 3; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#F5F7FF] to-[#EEF2FF] flex flex-col items-center justify-start pt-10 pb-20 px-4"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-baseline mb-10">
          <span className="text-xl font-bold text-[#1B4FD8]">Sasta</span>
          <span className="text-xl font-bold text-[#2EAE88]">ghar</span>
        </div>

        {/* Progress */}
        <ProgressBar step={step} />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl shadow-xl shadow-blue-900/8 p-8 sm:p-10"
        >
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-500 text-sm">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

// ── Shared: Field ─────────────────────────────────────────────
function OField({
  label, required = false, children,
}: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F8FA] text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#1B4FD8] focus:bg-white focus:ring-2 focus:ring-[#1B4FD8]/10 transition-all duration-200 disabled:opacity-50";

// ══════════════════════════════════════════════════════════════
// STEP 1: Professional Details
// app/onboarding/step-1/page.tsx
// ══════════════════════════════════════════════════════════════
export function OnboardingStep1Page() {
  const router   = useRouter();
  const supabase = createClient();

  const [agentType,    setAgentType]    = useState("individual_agent");
  const [companyName,  setCompanyName]  = useState("");
  const [bio,          setBio]          = useState("");
  const [experience,   setExperience]   = useState("");
  const [address,      setAddress]      = useState("");
  const [website,      setWebsite]      = useState("");
  const [specs,        setSpecs]        = useState<string[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  const SPECS = ["Residential", "Commercial", "Luxury", "Plots / Land", "Rental", "New Projects", "Affordable Housing"];

  function toggleSpec(s: string) {
    setSpecs(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const res = await fetch("/api/onboarding/step-1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent_type:         agentType,
        company_name:       companyName.trim() || null,
        bio:                bio.trim() || null,
        specializations:    specs,
        years_of_experience: experience ? parseInt(experience) : null,
        office_address:     address.trim() || null,
        website_url:        website.trim() || null,
      }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push("/onboarding/step-2");
  }

  return (
    <OnboardingLayout
      step={1}
      title="Tell us about yourself"
      subtitle="Help buyers and sellers understand who you are. You can always update this later."
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Agent type */}
        <OField label="I am a" required>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: "individual_agent",  label: "Agent / Broker" },
              { value: "builder_developer", label: "Builder" },
              { value: "individual_owner",  label: "Owner" },
            ] as const).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAgentType(opt.value)}
                className={`py-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                  agentType === opt.value
                    ? "border-[#1B4FD8] bg-[#EEF2FF] text-[#1B4FD8]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </OField>

        {/* Company name */}
        <OField label="Company / Agency Name">
          <input
            className={inputClass}
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="e.g. Mehta Properties (optional)"
            disabled={loading}
          />
        </OField>

        {/* Bio */}
        <OField label="Short Bio">
          <textarea
            className={inputClass}
            rows={3}
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell buyers about your experience and what you specialise in…"
            disabled={loading}
          />
        </OField>

        {/* Two column: experience + address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OField label="Years of Experience">
            <input
              className={inputClass}
              type="number"
              min="0"
              max="60"
              value={experience}
              onChange={e => setExperience(e.target.value)}
              placeholder="e.g. 5"
              disabled={loading}
            />
          </OField>
          <OField label="Website (optional)">
            <input
              className={inputClass}
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://yoursite.com"
              disabled={loading}
            />
          </OField>
        </div>

        {/* Office address */}
        <OField label="Office Address (optional)">
          <input
            className={inputClass}
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="e.g. Kandivali West, Mumbai"
            disabled={loading}
          />
        </OField>

        {/* Specializations */}
        <OField label="Specialisations (pick all that apply)">
          <div className="flex flex-wrap gap-2 pt-1">
            {SPECS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpec(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  specs.includes(s)
                    ? "bg-[#1B4FD8] text-white border-[#1B4FD8]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </OField>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">Step 1 of 3</p>
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="bg-[#1B4FD8] hover:bg-[#1640b8] disabled:opacity-70 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-colors flex items-center gap-2"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : null}
            {loading ? "Saving…" : "Continue →"}
          </motion.button>
        </div>
      </form>
    </OnboardingLayout>
  );
}

// ══════════════════════════════════════════════════════════════
// STEP 2: Verification
// app/onboarding/step-2/page.tsx
// ══════════════════════════════════════════════════════════════
export function OnboardingStep2Page() {
  const router   = useRouter();
  const supabase = createClient();

  const [reraNumber, setReraNumber] = useState("");
  const [docUrl,     setDocUrl]     = useState("");
  const [uploading,  setUploading]  = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  async function handleSkip() {
    setLoading(true);
    await fetch("/api/onboarding/step-2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skipped: true }),
    });
    router.push("/onboarding/step-3");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/onboarding/step-2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rera_number:  reraNumber.trim() || null,
        rera_doc_url: docUrl || null,
        skipped:      false,
      }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push("/onboarding/step-3");
  }

  return (
    <OnboardingLayout
      step={2}
      title="Get verified"
      subtitle="Verified agents get a badge on their profile and 3x more leads. Takes 48 hours."
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Trust badge preview */}
        <div className="flex items-center gap-3 bg-[#EEF2FF] border border-[#1B4FD8]/20 rounded-2xl p-4">
          <div className="w-12 h-12 rounded-xl bg-[#1B4FD8] flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <p className="text-[#1B4FD8] font-bold text-sm">Verified Agent Badge</p>
            <p className="text-gray-500 text-xs mt-0.5">Shown on all your listings and profile. Builds instant trust with buyers.</p>
          </div>
        </div>

        <OField label="RERA Registration Number">
          <input
            className={inputClass}
            value={reraNumber}
            onChange={e => setReraNumber(e.target.value)}
            placeholder="e.g. A51800000001"
            disabled={loading}
          />
        </OField>

        <OField label="Upload RERA Certificate or ID Proof">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#1B4FD8]/50 transition-colors">
            {docUrl ? (
              <div className="flex items-center justify-center gap-2 text-[#2EAE88]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold">Document uploaded</span>
                <button type="button" onClick={() => setDocUrl("")} className="text-gray-400 hover:text-red-400 ml-2 text-xs">Remove</button>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-gray-500 text-sm">Drag & drop or <span className="text-[#1B4FD8] font-semibold cursor-pointer">browse files</span></p>
                <p className="text-gray-400 text-xs mt-1">PDF, JPG, PNG — max 5MB</p>
                {/* Phase 2: Wire up ImageKit upload here */}
                {/* <IKUpload onSuccess={(res) => setDocUrl(res.url)} folder="/rera-docs" /> */}
              </>
            )}
          </div>
        </OField>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSkip}
            disabled={loading}
            className="w-full sm:w-auto order-2 sm:order-1 text-sm text-gray-400 hover:text-gray-600 font-medium px-6 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors disabled:opacity-50"
          >
            Skip for now
          </button>
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:flex-1 order-1 sm:order-2 bg-[#1B4FD8] hover:bg-[#1640b8] disabled:opacity-70 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Submit for verification →
          </motion.button>
        </div>
      </form>
    </OnboardingLayout>
  );
}

// ══════════════════════════════════════════════════════════════
// STEP 3: Choose Plan
// app/onboarding/step-3/page.tsx
// ══════════════════════════════════════════════════════════════

const PLANS = [
  {
    slug: "free", name: "Free", price: 0, period: "",
    listings: 3, leads: 3, featured: 0, badge: false,
    highlight: false, color: "gray",
    features: ["3 active listings", "3 free leads/month", "Basic dashboard", "Email support"],
  },
  {
    slug: "silver", name: "Silver", price: 999, period: "/mo",
    listings: 10, leads: 10, featured: 1, badge: false,
    highlight: false, color: "blue",
    features: ["10 active listings", "10 free leads/month", "1 featured listing slot", "Analytics dashboard", "Priority support"],
  },
  {
    slug: "gold", name: "Gold", price: 2999, period: "/mo",
    listings: 25, leads: 30, featured: 3, badge: true,
    highlight: true, color: "indigo",
    features: ["25 active listings", "30 free leads/month", "3 featured slots", "Verified badge included", "Priority support", "Advanced analytics"],
  },
  {
    slug: "platinum", name: "Platinum", price: 6999, period: "/mo",
    listings: 999, leads: 999, featured: 5, badge: true,
    highlight: false, color: "violet",
    features: ["Unlimited listings", "Unlimited leads", "5 featured slots", "Verified badge", "Dedicated account manager", "WhatsApp notifications"],
  },
];

export function OnboardingStep3Page() {
  const router      = useRouter();
  const [selected,  setSelected]  = useState("free");
  const [loading,   setLoading]   = useState(false);

  async function handleContinue() {
    setLoading(true);
    await fetch("/api/onboarding/step-3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan_slug: selected,
        skipped:   selected === "free",
      }),
    });
    router.push("/onboarding/complete");
  }

  return (
    <OnboardingLayout
      step={3}
      title="Choose your plan"
      subtitle="Start free and upgrade anytime. No credit card required for the Free plan."
    >
      <div className="space-y-3 mb-8">
        {PLANS.map(plan => (
          <motion.button
            key={plan.slug}
            type="button"
            onClick={() => setSelected(plan.slug)}
            whileTap={{ scale: 0.99 }}
            className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 relative ${
              selected === plan.slug
                ? "border-[#1B4FD8] bg-[#EEF2FF]"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-2.5 left-4 bg-[#1B4FD8] text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                MOST POPULAR
              </span>
            )}

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {/* Radio dot */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  selected === plan.slug ? "border-[#1B4FD8] bg-[#1B4FD8]" : "border-gray-300"
                }`}>
                  {selected === plan.slug && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm">{plan.name}</p>
                    {plan.badge && (
                      <span className="text-[10px] bg-[#2EAE88]/10 text-[#2EAE88] font-bold px-2 py-0.5 rounded-full">
                        ✓ Verified Badge
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                    {plan.features.slice(0, 3).map(f => (
                      <span key={f} className="text-xs text-gray-500">{f}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 text-lg">
                  {plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString("en-IN")}`}
                </p>
                {plan.period && <p className="text-xs text-gray-400">{plan.period}</p>}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <p className="text-xs text-gray-400 flex-1">
          {selected === "free"
            ? "You can upgrade anytime from your dashboard."
            : "Razorpay payment page opens after you click Continue. Cancel anytime."}
        </p>
        <motion.button
          onClick={handleContinue}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto bg-[#1B4FD8] hover:bg-[#1640b8] disabled:opacity-70 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : null}
          {selected === "free" ? "Continue with Free" : `Continue with ${PLANS.find(p => p.slug === selected)?.name}`}
        </motion.button>
      </div>
    </OnboardingLayout>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPLETE: Onboarding done
// app/onboarding/complete/page.tsx
// ══════════════════════════════════════════════════════════════
export function OnboardingCompletePage() {
  const router = useRouter();
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#F5F7FF] to-[#EEF2FF] flex items-center justify-center px-4"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl shadow-xl p-10 sm:p-14 max-w-md w-full text-center"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
          className="w-20 h-20 bg-[#2EAE88]/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg className="w-10 h-10 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <motion.path
              strokeLinecap="round" strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
            />
          </svg>
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're all set! 🎉</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Your Sastaghar agent account is ready. Post your first property and start getting leads today.
        </p>

        <div className="flex flex-col gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/post-property")}
            className="w-full bg-[#1B4FD8] hover:bg-[#1640b8] text-white font-semibold text-sm py-4 rounded-xl transition-colors"
          >
            Post Your First Property
          </motion.button>
          <button
            onClick={() => router.push("/agent/dashboard")}
            className="w-full border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm py-4 rounded-xl transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}