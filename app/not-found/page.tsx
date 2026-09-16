"use client";

// app/not-found.tsx
// Next.js renders this automatically for any route that doesn't resolve
// (unknown URL, notFound() call, etc). Reuses the same coming-soon.json
// animation so empty/placeholder states feel consistent across the app.

import Link from "next/link";
import { motion } from "framer-motion";
import { LottieAnimation } from "@/components/lottie-animation";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10"
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

        <span className="inline-block text-[10px] font-bold tracking-wide text-red-500 bg-red-50 px-3 py-1 rounded-full mb-3">
          404
        </span>

        <h1 className="text-gray-900 text-xl font-bold mb-2">
          We couldn&apos;t find this page
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Sorry, the page you&apos;re looking for doesn&apos;t exist, may have been
          moved, or hasn&apos;t been built yet.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Reload
          </button>
          <Link
            href="/agent/dashboard"
            className="flex-1 bg-[#2EAE88] hover:bg-[#259973] text-white font-semibold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Go to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}