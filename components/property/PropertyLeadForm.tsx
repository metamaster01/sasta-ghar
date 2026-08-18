"use client";

// components/property/PropertyLeadForm.tsx
// Lead capture form — right sidebar of property detail page.
// Intents: Contact Agent, Schedule Visit, Get Callback, WhatsApp
// Submits to /api/leads → saves to Supabase leads table.
// The wants_loan_assistance flag is the key cross-sell trigger.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type Intent = "contact_owner" | "schedule_visit" | "callback_request" | "loan_inquiry";
type FormState = "idle" | "loading" | "success" | "error";

interface Props {
  propertyId:    string;
  propertyTitle: string;
  propertyPrice: number;
  agentName?:    string;
}

const INTENTS: { value: Intent; label: string; icon: React.ReactNode }[] = [
  {
    value: "contact_owner",
    label: "Contact Agent",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    value: "schedule_visit",
    label: "Schedule Visit",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    value: "callback_request",
    label: "Get Callback",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
      </svg>
    ),
  },
];

export default function PropertyLeadForm({
  propertyId,
  propertyTitle,
  propertyPrice,
  agentName,
}: Props) {
  const supabase = createClient();

  const [intent,         setIntent]         = useState<Intent>("contact_owner");
  const [name,           setName]           = useState("");
  const [phone,          setPhone]          = useState("");
  const [email,          setEmail]          = useState("");
  const [message,        setMessage]        = useState("");
  const [wantsLoan,      setWantsLoan]      = useState(false);
  const [formState,      setFormState]      = useState<FormState>("idle");
  const [errorMsg,       setErrorMsg]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim())  { setErrorMsg("Please enter your name.");         return; }
    if (!phone.trim()) { setErrorMsg("Please enter your phone number."); return; }
    if (phone.trim().length < 10) { setErrorMsg("Enter a valid 10-digit phone number."); return; }

    setFormState("loading");
    setErrorMsg("");

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    const res = await fetch("/api/leads", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property_id:          propertyId,
        visitor_id:           user?.id ?? null,
        visitor_name:         name.trim(),
        visitor_phone:        phone.trim(),
        visitor_email:        email.trim() || null,
        message:              message.trim() || null,
        intent,
        wants_loan_assistance:wantsLoan,
        source:               "web",
      }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErrorMsg(d.error ?? "Something went wrong. Please try again.");
      setFormState("error");
      return;
    }

    setFormState("success");
  }

  const isLoading = formState === "loading";

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{
        boxShadow: "0 2px 16px -4px rgba(0,0,0,0.08)",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <AnimatePresence mode="wait">

        {/* ── Success state ──────────────────────────────── */}
        {formState === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
              className="w-14 h-14 bg-[#2EAE88]/10 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg className="w-7 h-7 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <motion.path
                  strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </svg>
            </motion.div>
            <h3 className="text-gray-900 font-bold text-base mb-1">Enquiry Sent!</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-1">
              {agentName ? `${agentName} will` : "The agent will"} contact you shortly on{" "}
              <span className="font-semibold text-gray-700">{phone}</span>.
            </p>
            {wantsLoan && (
              <p className="text-[#2EAE88] text-xs font-medium mt-2">
                ✓ Our loan team will also reach out about home loan options.
              </p>
            )}
            <button
              onClick={() => { setFormState("idle"); setName(""); setPhone(""); setEmail(""); setMessage(""); setWantsLoan(false); }}
              className="mt-4 text-xs text-[#1B4FD8] hover:underline underline-offset-4"
            >
              Send another enquiry
            </button>
          </motion.div>

        ) : (
          /* ── Form state ──────────────────────────────── */
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Header */}
            <div className="bg-gradient-to-r from-[#1B4FD8] to-[#1640b8] p-4 sm:p-5">
              <h3 className="text-white font-bold text-sm sm:text-base">Get In Touch</h3>
              <p className="text-blue-200 text-xs mt-0.5">
                Free enquiry · No spam · Response within 2 hours
              </p>
            </div>

            <div className="p-4 sm:p-5">
              {/* Intent tabs */}
              <div className="flex gap-1.5 mb-4 bg-gray-100 rounded-xl p-1">
                {INTENTS.map(int => (
                  <button
                    key={int.value}
                    type="button"
                    onClick={() => setIntent(int.value)}
                    className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 text-[10px] sm:text-xs font-semibold py-2 px-1 rounded-lg transition-all duration-200 ${
                      intent === int.value
                        ? "bg-white text-[#1B4FD8] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {int.icon}
                    <span className="leading-tight text-center">{int.label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">

                {/* Name */}
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setErrorMsg(""); }}
                    placeholder="Your Name *"
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl placeholder-gray-400 text-gray-800 outline-none focus:border-[#1B4FD8] focus:bg-white focus:ring-2 focus:ring-[#1B4FD8]/10 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Phone */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setErrorMsg(""); }}
                    placeholder="Phone Number *"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl placeholder-gray-400 text-gray-800 outline-none focus:border-[#1B4FD8] focus:bg-white focus:ring-2 focus:ring-[#1B4FD8]/10 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Email (optional) */}
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email (optional)"
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl placeholder-gray-400 text-gray-800 outline-none focus:border-[#1B4FD8] focus:bg-white focus:ring-2 focus:ring-[#1B4FD8]/10 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Message */}
                <div>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={
                      intent === "schedule_visit"
                        ? "Preferred date and time for visit..."
                        : intent === "callback_request"
                        ? "Best time to call you..."
                        : "Any specific requirements or questions..."
                    }
                    rows={3}
                    disabled={isLoading}
                    className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl placeholder-gray-400 text-gray-800 outline-none focus:border-[#1B4FD8] focus:bg-white focus:ring-2 focus:ring-[#1B4FD8]/10 transition-all resize-none disabled:opacity-50"
                  />
                </div>

                {/* Loan cross-sell toggle — THE KEY REVENUE FLAG */}
                <div
                  onClick={() => setWantsLoan(w => !w)}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    wantsLoan
                      ? "border-[#2EAE88] bg-[#F0FDF9]"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <div className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-all ${
                    wantsLoan ? "bg-[#2EAE88] border-[#2EAE88]" : "bg-white border-gray-300"
                  }`}>
                    {wantsLoan && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold leading-tight ${wantsLoan ? "text-[#2EAE88]" : "text-gray-700"}`}>
                      I'm also interested in a Home Loan
                    </p>
                    <p className="text-gray-400 text-[10px] mt-0.5">
                      Get pre-approved in 24 hrs via Vindhya Enterprises · 29+ banks
                    </p>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5"
                    >
                      {errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#2EAE88] hover:bg-[#28996f] disabled:opacity-70 text-white font-bold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      {INTENTS.find(i => i.value === intent)?.icon}
                      {INTENTS.find(i => i.value === intent)?.label}
                    </>
                  )}
                </motion.button>

                {/* Trust line */}
                <p className="text-center text-[10px] text-gray-400 leading-relaxed">
                  🔒 Your details are private and will only be shared with the agent.
                </p>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}