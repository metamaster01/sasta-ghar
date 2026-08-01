"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "100% Verified",
    description: "Every listing on our platform goes through a rigorous multi-step verification process before going live.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.454 1.272 1.454 3.336 0 4.608-.57.498-1.293.747-2.115.806V14.25a.75.75 0 01-1.5 0v-1.378c0-.414.336-.75.75-.75 1.034 0 1.875-.84 1.875-1.875 0-.703-.567-1.165-.997-1.164z" />
      </svg>
    ),
    title: "Trusted Agents",
    description: "Connect with certified local experts who know the market inside out and have your best interests at heart.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
    title: "Easy Home Loans",
    description: "Get instant approval and the lowest interest rates from top banks through Vindhya Enterprises LLP.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
    title: "Best Market Price",
    description: "Our price-match algorithm ensures you never overpay — get the fairest deal for your dream home, every time.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.13, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as any },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as any },
  },
};

export default function WhyChooseSastaghar() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="w-full py-20 sm:py-24 lg:py-28"
      style={{
        background: "linear-gradient(160deg, #F5F5F0 0%, #EEEEE8 100%)",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Heading ────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-14 sm:mb-16"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {/* Eyebrow */}
          <motion.p
            variants={headingVariants}
            className="text-[#2EAE88] text-xs font-bold tracking-[0.22em] uppercase mb-3"
          >
            Why Sastaghar
          </motion.p>

          <motion.h2
            variants={headingVariants}
            className="text-gray-900 text-3xl sm:text-4xl lg:text-[2.6rem] font-bold leading-tight tracking-tight mb-4"
          >
            Why Choose Sastaghar
          </motion.h2>

          <motion.p
            variants={headingVariants}
            className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto"
          >
            We provide the most transparent and efficient real estate experience in India.
          </motion.p>

          {/* Decorative underline */}
          <motion.div
            variants={{
              hidden: { scaleX: 0, opacity: 0 },
              visible: {
                scaleX: 1,
                opacity: 1,
                transition: { duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            className="mx-auto mt-5 h-0.5 w-14 rounded-full bg-[#2EAE88] origin-left"
          />
        </motion.div>

        {/* ── Cards Grid ─────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {FEATURES.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Individual card with hover interaction ────────────────────
function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
}) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        y: -6,
        boxShadow: "0 20px 48px -8px rgba(0,0,0,0.12)",
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className="group relative bg-white rounded-2xl p-7 sm:p-8 flex flex-col items-center text-center cursor-default"
      style={{
        boxShadow: "0 2px 16px -4px rgba(0,0,0,0.07)",
      }}
    >
      {/* Icon container */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.25 }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-[#2EAE88]"
        style={{ background: "rgba(46, 174, 136, 0.10)" }}
      >
        {feature.icon}
      </motion.div>

      {/* Title */}
      <h3 className="text-gray-900 text-[1.05rem] font-bold leading-snug mb-3">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed">
        {feature.description}
      </p>

      {/* Bottom accent line — appears on hover */}
      <motion.div
        className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-[#2EAE88] origin-left"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}
