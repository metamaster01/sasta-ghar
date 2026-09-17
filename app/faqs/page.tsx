"use client";

// app/faqs/page.tsx
// One page, two clearly structured sections: a category-filterable FAQ
// accordion, then a Guides grid below it. Guide cards are marked
// "Coming soon" rather than linking anywhere, since the guide articles
// themselves don't exist yet — avoids dead links while still showing
// what's planned.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHero from "@/components/shared/PageHero";

const CATEGORIES = [
  "All",
  "Buying",
  "Selling & Listing",
  "Loans & Financing",
  "Verification & Trust",
  "Account",
];

const FAQS: { category: string; q: string; a: string }[] = [
  {
    category: "Buying",
    q: "How do I search for verified properties on PropertyLink?",
    a: "Use the search bar or the Popular Cities section on the homepage to browse by location, then filter by budget, property type, and BHK. Listings with the green verification badge have passed our multi-step check.",
  },
  {
    category: "Buying",
    q: "What does the \"100% Verified\" badge actually mean?",
    a: "It means the listing's ownership documents, photos, and key details were reviewed by our team before the listing went live. It's a strong signal of authenticity, though we still recommend independently checking title documents before you buy.",
  },
  {
    category: "Buying",
    q: "Can I schedule a site visit through the platform?",
    a: "Yes — open any listing and use \"Contact Agent\" to request a visit. The owner or agent will confirm a time directly with you.",
  },
  {
    category: "Selling & Listing",
    q: "How do I list my property on PropertyLink?",
    a: "Create an account, click \"Post Property,\" and fill in your property details, photos, and price. Your listing enters our verification queue before it appears in search.",
  },
  {
    category: "Selling & Listing",
    q: "Is there a fee to list a property?",
    a: "Basic listings are free. Optional add-ons like featured placement or premium agent tools are paid, and pricing is always shown upfront before you pay.",
  },
  {
    category: "Selling & Listing",
    q: "How long does verification take before my listing goes live?",
    a: "Most listings are reviewed within 24–48 hours. You'll get an email as soon as yours is approved and live.",
  },
  {
    category: "Selling & Listing",
    q: "Can I edit or remove my listing after it's published?",
    a: "Yes, from your dashboard at any time. Major edits (like price or address) may briefly re-enter verification.",
  },
  {
    category: "Loans & Financing",
    q: "How does the home loan approval process work?",
    a: "Request a quote from any property page or the newsletter section, and our lending partner, Vindhya Enterprises LLP, will reach out with eligibility and rate details based on the information you provide.",
  },
  {
    category: "Loans & Financing",
    q: "Which partner handles the loan applications?",
    a: "Vindhya Enterprises LLP handles loan facilitation for PropertyLink users. The loan agreement itself is directly between you and them.",
  },
  {
    category: "Loans & Financing",
    q: "Is applying for a loan through PropertyLink mandatory?",
    a: "Not at all — it's entirely optional. You're free to arrange financing with any bank or lender you prefer.",
  },
  {
    category: "Verification & Trust",
    q: "How are agents verified on PropertyLink?",
    a: "Agents submit identity and business registration documents, which our team reviews before their profile is marked as a Trusted Agent.",
  },
  {
    category: "Verification & Trust",
    q: "What happens if a listing turns out to be inaccurate?",
    a: "Report it directly from the listing page. We investigate promptly and remove listings that violate our accuracy standards.",
  },
  {
    category: "Account",
    q: "Do I need an account to browse properties?",
    a: "No — browsing and searching are open to everyone. You'll need an account to save favorites, contact agents, or list a property.",
  },
  {
    category: "Account",
    q: "How do I delete my account and data?",
    a: "Go to Account Settings → Delete Account, or email us at privacy@propertylink.example and we'll process the request per our Privacy Policy.",
  },
];

const GUIDES = [
  {
    title: "RERA Explained: What Every Buyer Should Know",
    description:
      "A plain-language walkthrough of RERA registration, why it matters, and how to check a project's status.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6">
        <rect x="5" y="3.5" width="14" height="17" rx="2" />
        <path strokeLinecap="round" d="M8.5 8h7M8.5 12h7M8.5 16h4" />
      </svg>
    ),
  },
  {
    title: "Home Loan Process, Step by Step",
    description:
      "From pre-approval to disbursement — what to expect when financing your purchase.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 4l9 6.5M5 10v9h14v-9" />
        <path strokeLinecap="round" d="M10 19v-5h4v5" />
      </svg>
    ),
  },
  {
    title: "How Property Verification Works on PropertyLink",
    description:
      "A behind-the-scenes look at the checks every listing goes through before it goes live.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "First-Time Buyer's Checklist",
    description:
      "The documents, budget checks, and site-visit questions to run through before making an offer.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.5l1.5 1.5L14 8M9 15.5l1.5 1.5L14 14" />
      </svg>
    ),
  },
  {
    title: "NRI Guide to Buying Property in India",
    description:
      "FEMA basics, remittance routes, and power-of-attorney options for buying from abroad.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6">
        <circle cx="12" cy="12" r="8.5" />
        <path strokeLinecap="round" d="M3.5 12h17M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5s-1.2 6.2-3.4 8.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5z" />
      </svg>
    ),
  },
  {
    title: "Renting vs. Buying: What's Right for You",
    description:
      "A cost and lifestyle comparison to help you decide based on your timeline and goals.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10l8-6 8 6v10" />
        <path strokeLinecap="round" d="M9 20v-6h6v6" />
      </svg>
    ),
  },
];

export default function FaqsGuidesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered =
    activeCategory === "All" ? FAQS : FAQS.filter((f) => f.category === activeCategory);

  return (
    <>
      <PageHero
        eyebrow="Support"
        title="FAQs & Guides"
        subtitle="Everything you need to know about buying, selling, and renting on PropertyLink."
      />

      {/* ── FAQs ─────────────────────────────────────────── */}
      <section
        className="w-full bg-white pt-4 sm:pt-6 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setOpenIndex(0);
                }}
                className={`shrink-0 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-[#2EAE88] text-white border-[#2EAE88]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#2EAE88] hover:text-[#2EAE88]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion */}
          <div className="flex flex-col gap-3">
            {filtered.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={item.q}
                  className="bg-white rounded-2xl border border-gray-100"
                  style={{ boxShadow: "0 2px 16px -4px rgba(0,0,0,0.07)" }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-4 sm:py-5"
                  >
                    <span className="text-gray-900 text-sm sm:text-[0.95rem] font-semibold">
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="shrink-0 w-6 h-6 rounded-full bg-[#2EAE88]/10 text-[#2EAE88] flex items-center justify-center text-lg leading-none"
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-500 text-sm leading-relaxed px-5 sm:px-6 pb-5 sm:pb-6">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Guides ───────────────────────────────────────── */}
      <section
        className="w-full pb-20 sm:pb-24 px-4 sm:px-6 lg:px-8"
        style={{
          background: "linear-gradient(180deg, #fafaf8 0%, #ffffff 100%)",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <div className="max-w-6xl mx-auto pt-14 sm:pt-16">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[#2EAE88] text-xs font-bold tracking-[0.22em] uppercase mb-3">
              Resources
            </p>
            <h2 className="text-gray-900 text-2xl sm:text-3xl font-bold">Guides</h2>
            <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-lg mx-auto">
              In-depth reading to help you buy, sell, or rent with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {GUIDES.map((g) => (
              <div
                key={g.title}
                className="relative bg-white rounded-2xl p-6 sm:p-7"
                style={{ boxShadow: "0 2px 16px -4px rgba(0,0,0,0.07)" }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-[#2EAE88]"
                  style={{ background: "rgba(46, 174, 136, 0.10)" }}
                >
                  {g.icon}
                </div>
                <h3 className="text-gray-900 text-base font-bold leading-snug mb-2">
                  {g.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {g.description}
                </p>
                <span className="inline-block text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                  Coming soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}