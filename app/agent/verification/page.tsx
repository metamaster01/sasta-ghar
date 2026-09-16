"use client";

// app/agent/verification/page.tsx
// Placeholder "coming soon" screen for agent verification while the
// backend flow (agent_profiles.verification_status pipeline) is built.
// Swap this file out for the real verification flow once it's ready —
// nothing else links directly into its internals, so it's a safe drop-in.

import Link from "next/link";
import { motion } from "framer-motion";
import { LottieAnimation } from "@/components/lottie-animation";

export default function AgentVerificationPage() {
  return (
    <div
      className="min-h-[70vh] flex items-center justify-center px-4 py-10"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 text-center"
        style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}
      >
        <div className="w-48 h-48 mx-auto mb-2">
          <LottieAnimation path="/lottie/coming-soon.json" />
        </div>

        <span className="inline-block text-[10px] font-bold tracking-wide text-[#2EAE88] bg-[#2EAE88]/10 px-3 py-1 rounded-full mb-3">
          IN PROGRESS
        </span>

        <h1 className="text-gray-900 text-xl font-bold mb-2">
          Verification is coming soon
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          We&apos;re building agent verification so you can earn a verified badge
          and unlock full access to leads. It&apos;ll be ready shortly — we&apos;ll
          notify you the moment it&apos;s live.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/agent/dashboard"
            className="flex-1 bg-[#2EAE88] hover:bg-[#259973] text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/agent/help-center"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </motion.div>
    </div>
  );
}