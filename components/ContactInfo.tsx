"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

// ── Contact details — update to Vindhya's real info ──────────
const CONTACT_DETAILS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    label:   "Address",
    value:   "Office No. 141, Shree Naman Plaza, S.V. Road, Kandivali West, Mumbai 400067",
    href:    "https://maps.google.com/?q=Kandivali+West+Mumbai",
    isLink:  true,
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    label:   "Mobile",
    value:   "+91 90294 48777",
    href:    "tel:+919029448777",
    isLink:  true,
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label:   "Email",
    value:   "contact@sastaghar.com",
    href:    "mailto:contact@sastaghar.com",
    isLink:  true,
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label:   "Working Hours",
    value:   "Mon – Sat: 9:00 AM – 7:00 PM IST",
    isLink:  false,
  },
];

const SOCIAL_LINKS = [
  {
    name:  "Twitter / X",
    href:  "https://twitter.com/sastaghar",
    color: "#1DA1F2",
    icon:  (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name:  "Facebook",
    href:  "https://facebook.com/sastaghar",
    color: "#1877F2",
    icon:  (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name:  "Instagram",
    href:  "https://instagram.com/sastaghar",
    color: "#E1306C",
    icon:  (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name:  "YouTube",
    href:  "https://youtube.com/@sastaghar",
    color: "#FF0000",
    icon:  (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

// ── OpenStreetMap embed (no API key needed) ───────────────────
// Centred on Kandivali West, Mumbai (Vindhya's office)
const MAP_SRC =
  "https://www.openstreetmap.org/export/embed.html?bbox=72.8217%2C19.1930%2C72.8517%2C19.2130&layer=mapnik&marker=19.2030%2C72.8317";

export default function ContactInfo() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <section
      ref={sectionRef}
      className="w-full py-16 sm:py-20 lg:py-24"
      style={{
        background: "linear-gradient(160deg, #F5F5F0 0%, #EEEEE8 100%)",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* ── Left: Info ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Heading */}
            <div className="mb-8">
              <p className="text-[#1B4FD8] text-xs font-bold tracking-[0.22em] uppercase mb-2">
                Find Us
              </p>
              <h2 className="text-gray-900 text-2xl sm:text-3xl font-bold leading-tight mb-3">
                Connecting Near Or Far
              </h2>
              <p className="text-gray-500 text-sm sm:text-[15px] leading-relaxed max-w-sm">
                Whether you're in Mumbai or across India, Vindhya Enterprises LLP is
                here to guide you through every step of your property journey.
              </p>
            </div>

            {/* Contact detail rows */}
            <div className="space-y-5 mb-10">
              {CONTACT_DETAILS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.55,
                    delay: 0.1 + i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex items-start gap-4"
                >
                  {/* Icon bubble */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1B4FD8]/10 text-[#1B4FD8] flex items-center justify-center">
                    {item.icon}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                      {item.label}
                    </p>
                    {item.isLink ? (
                      <a
                        href={item.href}
                        target={item.href?.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-gray-700 text-sm font-medium hover:text-[#1B4FD8] transition-colors leading-relaxed"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-gray-700 text-sm font-medium leading-relaxed">
                        {item.value}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                Follow Us
              </p>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((s) => (
                  <motion.a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    whileHover={{ scale: 1.12, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center transition-shadow hover:shadow-md"
                    style={{ color: s.color }}
                  >
                    {s.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Map ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
            style={{ minHeight: "360px" }}
          >
            <iframe
              src={MAP_SRC}
              title="Sastaghar Office Location — Kandivali West, Mumbai"
              width="100%"
              height="100%"
              style={{ border: 0, display: "block", minHeight: "360px" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Open in Maps CTA */}
            <a
              href="https://maps.google.com/?q=Shree+Naman+Plaza+Kandivali+West+Mumbai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white border-t border-gray-200 py-3 text-[#1B4FD8] text-xs font-semibold hover:bg-blue-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Open in Google Maps
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
