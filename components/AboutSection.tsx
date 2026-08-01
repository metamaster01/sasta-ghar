"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as any },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as any },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 60, y: 30 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any, delay: 0.3 },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="relative rounded-2xl overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Background Image */}
          <motion.div
            className="relative w-full h-[480px] sm:h-[520px] lg:h-[560px] rounded-2xl overflow-hidden"
            variants={imageVariants}
          >
            <Image
              src="/about-image.png"
              alt="Sastaghar property - luxury residential complex with pool and greenery"
              fill
              className="object-cover"
              priority
            />
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent rounded-2xl" />
          </motion.div>

          {/* Floating Info Card */}
          <motion.div
            className="
              absolute bottom-6 right-4 sm:right-6 lg:right-8
              w-[90%] sm:w-[58%] lg:w-[52%]
              bg-[#1B4FD8] rounded-2xl p-7 sm:p-9
              shadow-2xl shadow-blue-900/40
            "
            variants={cardVariants}
          >
            {/* Decorative subtle pattern */}
            <div className="absolute inset-0 rounded-2xl opacity-10 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
              }}
            />

            <motion.h2
              className="text-white text-2xl sm:text-3xl font-bold mb-4 leading-tight tracking-tight"
              variants={fadeUp}
            >
              About Sastaghar
            </motion.h2>

            <motion.p
              className="text-blue-100 text-sm sm:text-base leading-relaxed mb-7 font-light"
              variants={fadeUp}
            >
              At sastaghar, we believe finding your perfect home should be
              simple, transparent, and stress-free. With a growing network of
              verified listings and trusted agents across India, we help people
              buy, sell, and rent properties with confidence.
            </motion.p>

            <motion.div variants={fadeUp}>
              <Link
                href="/properties"
                className="
                  inline-flex items-center gap-2
                  border-2 border-white/80 text-white
                  text-xs sm:text-sm font-semibold tracking-widest uppercase
                  px-6 py-3 rounded-full
                  hover:bg-white hover:text-[#1B4FD8]
                  transition-all duration-300 ease-out
                  group
                "
              >
                See All Properties
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
        </motion.div>
      </div>
    </section>
  );
}