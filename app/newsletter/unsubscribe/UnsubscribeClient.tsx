"use client";

// app/newsletter/unsubscribe/UnsubscribeClient.tsx
// Split out from page.tsx because it needs useSearchParams, which the
// App Router requires to sit inside a Suspense boundary.

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

type Status = "loading" | "success" | "already" | "error";

export default function UnsubscribeClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [resubscribing, setResubscribing] = useState(false);
  const [resubscribed, setResubscribed] = useState(false);

  useEffect(() => {
    async function run() {
      if (!token) {
        setStatus("error");
        setMessage("This unsubscribe link is missing a token.");
        return;
      }

      try {
        const res = await fetch(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setStatus("error");
          setMessage(data?.error ?? "Something went wrong.");
          return;
        }

        setEmail(data.email ?? null);
        setMessage(data.message ?? "");
        setStatus(data.message?.toLowerCase().includes("already") ? "already" : "success");
      } catch {
        setStatus("error");
        setMessage("Network error — please try again.");
      }
    }

    run();
  }, [token]);

  const handleResubscribe = async () => {
    if (!token || resubscribing) return;
    setResubscribing(true);
    try {
      const res = await fetch(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`, {
        method: "POST",
      });
      if (res.ok) setResubscribed(true);
    } finally {
      setResubscribing(false);
    }
  };

  return (
    <section
      className="w-full bg-white pb-24 px-4 sm:px-6 lg:px-8"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md mx-auto text-center bg-white rounded-2xl p-8 sm:p-10"
        style={{ boxShadow: "0 2px 16px -4px rgba(0,0,0,0.07)" }}
      >
        {status === "loading" && (
          <p className="text-gray-400 text-sm">Processing your request…</p>
        )}

        {(status === "success" || status === "already") && !resubscribed && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-[#2EAE88]/10 flex items-center justify-center mb-5 text-[#2EAE88]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-gray-900 text-lg font-bold mb-2">
              {status === "already" ? "Already unsubscribed" : "You're unsubscribed"}
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {email
                ? `${email} won't receive PropertyLink newsletter emails anymore.`
                : "You won't receive PropertyLink newsletter emails anymore."}
            </p>
            <button
              onClick={handleResubscribe}
              disabled={resubscribing}
              className="text-sm font-semibold text-[#2EAE88] hover:underline disabled:opacity-60"
            >
              {resubscribing ? "Resubscribing…" : "Change your mind? Resubscribe"}
            </button>
          </>
        )}

        {resubscribed && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-[#2EAE88]/10 flex items-center justify-center mb-5 text-[#2EAE88]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-gray-900 text-lg font-bold mb-2">You're back in</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              You&apos;ll start receiving PropertyLink newsletter emails again.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-5 text-red-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-gray-900 text-lg font-bold mb-2">Something&apos;s not right</h1>
            <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
          </>
        )}
      </motion.div>
    </section>
  );
}