"use client";

// app/agent/help-center/page.tsx
// Help Centre — FAQs, super admin contact details, and a query form that
// posts to /api/help-center, which emails the admin via Resend.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── FAQ data ──────────────────────────────────────────────────
// Edit freely — nothing else in the app reads from this list.
const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I get verified as an agent?",
    a: "Go to Verification from your dashboard and submit the requested documents. Our team reviews every application manually, and you'll get a verified badge on your listings once it's approved.",
  },
  {
    q: "What happens when my free leads run out?",
    a: "Free plan agents get 3 leads every 30 days. Once they're used, new leads are paused until your credits reset or you move to a paid plan.",
  },
  {
    q: "When do my free leads reset?",
    a: "Free lead credits reset automatically 30 days after your last reset — you don't need to do anything, and you'll see the updated count on your dashboard.",
  },
  {
    q: "How is my conversion rate calculated?",
    a: "It's total leads converted divided by total leads received, shown as a percentage on your dashboard. It updates automatically as you mark leads as converted.",
  },
  {
    q: "Can I edit or remove a property listing?",
    a: "Yes. Open the listing from Properties, make your changes, and save — updates go live immediately. Removing a listing takes it off search but keeps its history for your records.",
  },
  {
    q: "Who can see my contact details?",
    a: "Only the leads assigned to you and our admin team can see your phone and email. Site visitors only see your business profile until they submit an inquiry.",
  },
  {
    q: "How do I upgrade my plan?",
    a: "Paid plans are launching soon. You can express interest from the Upgrade Plan button on your dashboard and we'll notify you the moment they're available.",
  },
  {
    q: "My property views or leads aren't updating — what should I do?",
    a: "Counts usually update within a few minutes. If something still looks off after refreshing, send us a query below with the property name and we'll take a look.",
  },
];

// ── Super admin contact — update with real details ─────────────
const ADMIN_CONTACT = {
  name: "Super Admin",
  email: "admin@propertylink.com",
  phone: "+91 98765 43210",
  hours: "Mon–Sat, 10:00 AM – 7:00 PM IST",
};

const CATEGORIES = [
  "Account & Verification",
  "Leads & Conversions",
  "Listings & Properties",
  "Billing & Plans",
  "Technical Issue",
  "Something else",
];

// ── FAQ item ─────────────────────────────────────────────────
function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-50 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left"
      >
        <span className="text-gray-800 text-sm font-semibold">{q}</span>
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 sm:px-6 pb-4 text-gray-500 text-xs leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────
export default function HelpCenterPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const [form, setForm] = useState({ name: "", email: "", category: CATEGORIES[0], message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/help-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      setForm({ name: "", email: "", category: CATEGORIES[0], message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "Poppins, sans-serif" }}>
      {/* Page header */}
      <div>
        <h1 className="text-gray-900 text-xl font-bold">Help Centre</h1>
        <p className="text-gray-400 text-sm mt-1">
          Find quick answers below, or send our team a message directly.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* FAQs — 2/3 width */}
        <div
          className="xl:col-span-2 bg-white rounded-2xl border border-gray-100"
          style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}
        >
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-gray-900 font-bold text-base">Frequently Asked Questions</h2>
          </div>
          <div>
            {FAQS.map((item, i) => (
              <FaqItem
                key={item.q}
                q={item.q}
                a={item.a}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </div>

        {/* Contact card — 1/3 width */}
        <div
          className="bg-white rounded-2xl border border-gray-100 p-5 h-fit"
          style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}
        >
          <p className="text-gray-900 font-bold text-sm mb-4">Contact Super Admin</p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2EAE88]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-gray-400 text-[10px] font-medium">Email</p>
                <a href={`mailto:${ADMIN_CONTACT.email}`} className="text-gray-700 text-xs font-semibold hover:text-[#2EAE88] transition-colors break-all">
                  {ADMIN_CONTACT.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1B4FD8]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#1B4FD8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-gray-400 text-[10px] font-medium">Phone</p>
                <a href={`tel:${ADMIN_CONTACT.phone.replace(/\s/g, "")}`} className="text-gray-700 text-xs font-semibold hover:text-[#1B4FD8] transition-colors">
                  {ADMIN_CONTACT.phone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-gray-400 text-[10px] font-medium">Working Hours</p>
                <p className="text-gray-700 text-xs font-semibold">{ADMIN_CONTACT.hours}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Can&apos;t find your answer above? Send a query and {ADMIN_CONTACT.name.toLowerCase()} will get back to you by email.
            </p>
          </div>
        </div>
      </div>

      {/* Query form */}
      <div
        className="bg-white rounded-2xl border border-gray-100"
        style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}
      >
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-gray-900 font-bold text-base">Send a Query</h2>
          <p className="text-gray-400 text-xs mt-0.5">We typically reply within one business day.</p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-gray-600 mb-1.5">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your full name"
                className="w-full text-sm text-gray-800 placeholder:text-gray-300 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2EAE88]/30 focus:border-[#2EAE88] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5">
                Your Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full text-sm text-gray-800 placeholder:text-gray-300 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2EAE88]/30 focus:border-[#2EAE88] transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Category
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full text-sm text-gray-800 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2EAE88]/30 focus:border-[#2EAE88] transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={5}
              maxLength={5000}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us what's going on — include property names, lead IDs, or anything else that helps us look into it."
              className="w-full text-sm text-gray-800 placeholder:text-gray-300 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#2EAE88]/30 focus:border-[#2EAE88] transition-colors"
            />
          </div>

          <AnimatePresence>
            {status === "success" && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-[#2EAE88] text-xs font-semibold bg-[#2EAE88]/10 rounded-xl px-3.5 py-2.5"
              >
                Your message has been sent. We&apos;ll get back to you by email shortly.
              </motion.p>
            )}
            {status === "error" && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-red-600 text-xs font-semibold bg-red-50 rounded-xl px-3.5 py-2.5"
              >
                {errorMsg}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full sm:w-auto bg-[#2EAE88] hover:bg-[#259973] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {status === "submitting" && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {status === "submitting" ? "Sending…" : "Send Query"}
          </button>
        </form>
      </div>
    </div>
  );
}