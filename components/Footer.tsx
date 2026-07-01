"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

const companyLinks = [
  { label: "About us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Terms & conditions", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
];

const exploreLinks = [
  { label: "Buy Property", href: "/buy" },
  { label: "Rent Property", href: "/rent" },
  { label: "Commercial", href: "/commercial" },
  { label: "Agents", href: "/agents" },
];

const resourceLinks = [
  { label: "Blog", href: "/blog" },
  { label: "FAQs", href: "/faqs" },
  { label: "Guides", href: "/guides" },
  { label: "Price Trends", href: "/price-trends" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "https://x.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/919876543210",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const ctaRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-60px" });
  const footerInView = useInView(footerRef, { once: true, margin: "-40px" });

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as any, delay },
    },
  });

  return (
    <footer className="w-full bg-white" style={{ fontFamily: "Poppins, sans-serif" }}>

      {/* ── House Belt ───────────────────────────────────────────── */}
      <div className="w-full overflow-hidden select-none pointer-events-none" style={{ lineHeight: 0 }}>
        {/* Desktop: doubled image side-by-side (seamless) */}
        <div className="hidden md:flex w-full">
          <Image
            src="/footer-bar.png"
            alt=""
            width={1100}
            height={120}
            className="w-1/2 h-auto object-cover object-bottom"
            priority
          />
          <Image
            src="/footer-bar.png"
            alt=""
            width={1100}
            height={120}
            className="w-1/2 h-auto object-cover object-bottom"
            priority
          />
        </div>
        {/* Mobile: single */}
        <div className="md:hidden w-full">
          <Image
            src="/footer-bar.png"
            alt=""
            width={1100}
            height={120}
            className="w-full h-auto object-cover object-bottom"
            priority
          />
        </div>
      </div>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <div className="w-full bg-[#1B4FD8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
          <motion.div
            ref={ctaRef}
            className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-0"
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {/* Heading */}
            <motion.h2
              className="flex-1 text-white text-3xl sm:text-4xl lg:text-[2.5rem] font-bold leading-tight tracking-tight"
              variants={fadeUp(0)}
            >
              Find Your Perfect
              <br />
              Home with
              <br />
              Sastaghar
            </motion.h2>

            {/* Description */}
            <motion.p
              className="flex-1 text-blue-100 text-sm sm:text-base leading-relaxed lg:px-8"
              variants={fadeUp(0.1)}
            >
              Search verified listings, explore premium properties, and connect
              with trusted agents — all in one place.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              className="flex-shrink-0"
              variants={fadeUp(0.2)}
            >
              <Link
                href="/properties"
                className="
                  inline-flex items-center gap-2
                  bg-white text-gray-900
                  text-sm font-semibold
                  px-7 py-3.5 rounded-full
                  hover:bg-blue-50 active:scale-95
                  transition-all duration-300
                  shadow-lg shadow-blue-900/20
                  group
                "
              >
                Explore Properties
                <svg
                  className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Main Footer ──────────────────────────────────────────── */}
      <div className="w-full bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          <motion.div
            ref={footerRef}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-8 mb-12"
            initial="hidden"
            animate={footerInView ? "visible" : "hidden"}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          >

            {/* Brand + Social — spans 2 cols on mobile, 1 on lg */}
            <motion.div
              className="col-span-2 sm:col-span-3 lg:col-span-1"
              variants={fadeUp(0)}
            >
              {/* Logo */}
              <Link href="/" className="inline-flex items-baseline gap-0 mb-5">
                <span className="text-2xl font-bold text-gray-900 tracking-tight">Sasta</span>
                <span className="text-2xl font-bold text-[#1B4FD8] tracking-tight">ghar</span>
              </Link>

              {/* Social */}
              <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mb-3 mt-6">
                Follow Us
              </p>
              <div className="flex items-center gap-2.5">
                {socialLinks.map((s) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="
                      w-9 h-9 rounded-full border border-gray-300
                      flex items-center justify-center
                      text-gray-500
                      hover:border-[#1B4FD8] hover:text-[#1B4FD8] hover:bg-blue-50
                      transition-all duration-250
                    "
                  >
                    {s.icon}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Company */}
            <motion.div variants={fadeUp(0.05)}>
              <h4 className="text-gray-900 text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                {companyLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-gray-500 text-sm hover:text-[#1B4FD8] transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Explore */}
            <motion.div variants={fadeUp(0.1)}>
              <h4 className="text-gray-900 text-sm font-semibold mb-4">Explore</h4>
              <ul className="space-y-3">
                {exploreLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-gray-500 text-sm hover:text-[#1B4FD8] transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Resources */}
            <motion.div variants={fadeUp(0.15)}>
              <h4 className="text-gray-900 text-sm font-semibold mb-4">Resources</h4>
              <ul className="space-y-3">
                {resourceLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-gray-500 text-sm hover:text-[#1B4FD8] transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Us */}
            <motion.div variants={fadeUp(0.2)}>
              <h4 className="text-gray-900 text-sm font-semibold mb-4">Contact Us</h4>
              <address className="not-italic space-y-3">
                <p className="text-gray-500 text-sm leading-relaxed">
                  Vindhya Towers, MG Road,
                  <br />
                  Pune – 411001
                </p>
                <Link
                  href="mailto:Contact@vindhyareality.com"
                  className="block text-gray-500 text-sm hover:text-[#1B4FD8] transition-colors duration-200 break-all"
                >
                  Contact@vindhyareality.com
                </Link>
                <Link
                  href="tel:+919876543210"
                  className="block text-gray-500 text-sm hover:text-[#1B4FD8] transition-colors duration-200"
                >
                  +91 98765 43210
                </Link>
              </address>
            </motion.div>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-gray-400 text-xs">
                ABC Company @ 2025. All rights Reserved.
              </p>
              <Link
                href="mailto:support@Company.com"
                className="text-gray-400 text-xs hover:text-[#1B4FD8] transition-colors duration-200"
              >
                support@Company.com
              </Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}