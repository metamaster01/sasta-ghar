"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

export default function AdvertisementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as any },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95, x: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as any, delay: 0.2 },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ backgroundColor: "#FDF0EF" }}
    >
      {/* Subtle decorative blob */}
      <div
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full pointer-events-none opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(255,200,195,0.7) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        <motion.div
          className="relative flex flex-col lg:flex-row items-center gap-10 lg:gap-0"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Left: Text Content */}
          <div className="flex-1 lg:pr-12 z-10">
            {/* Eyebrow label */}
            <motion.p
              className="text-[#1B4FD8] text-xs font-bold tracking-[0.18em] uppercase mb-4"
              variants={fadeUp}
            >
              Do you have Plot/Land?
            </motion.p>

            {/* Main heading */}
            <motion.h2
              className="text-gray-900 text-3xl sm:text-4xl lg:text-[2.6rem] font-bold leading-tight tracking-tight mb-10"
              variants={fadeUp}
            >
              Sell or Lease out your{" "}
              <span className="whitespace-nowrap">Plots/Land</span> faster
              <br />
              with sastaghar
            </motion.h2>

            {/* Card block */}
            <motion.div className="space-y-4" variants={fadeUp}>
              {/* Post your property label */}
              <p className="text-gray-400 text-sm font-medium">
                Post your property
              </p>

              <h3 className="text-gray-900 text-2xl sm:text-3xl font-bold leading-snug">
                Looking for buyers for
                <br />
                Plots/land?
              </h3>

              <p className="text-gray-500 text-sm sm:text-base">
                Sell or rent your residential / commercial property
              </p>

              {/* CTA Button */}
              <motion.div
                variants={fadeUp}
                className="pt-2"
              >
                <Link
                  href="/post-property"
                  className="
                    inline-flex items-center gap-2
                    bg-[#1B4FD8] text-white
                    text-sm font-semibold
                    px-7 py-4 rounded-full
                    hover:bg-[#1640b8] active:scale-95
                    transition-all duration-300 ease-out
                    shadow-lg shadow-blue-700/25
                    group
                  "
                >
                  Post your property for free
                  <svg
                    className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Image */}
          <motion.div
            className="flex-1 flex justify-center lg:justify-end w-full max-w-md lg:max-w-none"
            variants={imageVariants}
          >
            <div className="relative w-full max-w-[460px] aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shadow-gray-300/50">
              <Image
                src="/advertisement.png"
                alt="Real estate agents discussing plots and land listings"
                fill
                className="object-cover"
              />
              {/* Subtle inner vignette */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}