"use client";

// components/shared/PageHero.tsx
// Shared hero for content pages (terms, privacy, faqs/guides, price-trends…).
// Matches the gradient/eyebrow/underline treatment already used in
// WhyChooseSastaghar and NewsletterSection, so every page feels part of
// the same site rather than a bolted-on template.

import { motion } from "framer-motion";

export default function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section
      className="w-full pt-20 sm:pt-28 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8"
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #fafaf8 24%, #eeeeeb 100%), radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 58%)",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <motion.div
        className="max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[#2EAE88] text-xs font-bold tracking-[0.22em] uppercase mb-3">
          {eyebrow}
        </p>
        <h1 className="text-gray-900 text-3xl sm:text-4xl lg:text-[2.6rem] font-bold leading-tight tracking-tight mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto">
            {subtitle}
          </p>
        )}
        <div className="mx-auto mt-5 h-0.5 w-14 rounded-full bg-[#2EAE88]" />
      </motion.div>
    </section>
  );
}