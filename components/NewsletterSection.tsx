"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

export default function NewsletterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Simulate API call — replace with your actual endpoint
    await new Promise((res) => setTimeout(res, 900));
    setLoading(false);
    setSubmitted(true);
    setEmail("");
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as any },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.92 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as any, delay: 0.25 },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="w-full py-8 px-4 sm:px-6 lg:px-8 bg-white"
    >
      <div className="max-w-6xl mx-auto">
        {/* Card wrapper */}
        <div
          className="relative rounded-2xl overflow-hidden px-8 sm:px-12 lg:px-16 py-12 sm:py-14"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, #f9b8b8 0%, #f5c6c6 30%, #fadadf 60%, #fce8ec 100%)",
          }}
        >
          {/* Grain texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.35]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: "200px 200px",
            }}
          />

          <motion.div
            className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-0"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {/* Left: Text + Form */}
            <div className="flex-1 lg:pr-12 w-full">
              <motion.h2
                className="text-gray-900 text-3xl sm:text-4xl lg:text-[2.4rem] font-bold leading-tight tracking-tight mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
                variants={fadeUp}
              >
                Subscribe Our Newsletter
              </motion.h2>

              <motion.p
                className="text-gray-700 text-sm sm:text-base leading-relaxed mb-8 max-w-sm"
                style={{ fontFamily: "Poppins, sans-serif" }}
                variants={fadeUp}
              >
                Get the latest property trends, expert insights, and new
                listings — straight to your inbox.
              </motion.p>

              {/* Form */}
              <motion.div variants={fadeUp}>
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-sm text-gray-800 text-sm font-semibold px-6 py-3.5 rounded-full shadow-sm border border-white/60"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    You&apos;re subscribed! Welcome aboard.
                  </motion.div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="flex items-center w-full max-w-md"
                  >
                    <div className="flex flex-1 items-center bg-white rounded-full shadow-sm overflow-hidden border border-white/70 focus-within:border-gray-300 transition-colors duration-300">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="flex-1 px-5 py-3.5 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="
                          flex-shrink-0 bg-gray-900 text-white
                          text-sm font-semibold
                          px-6 py-3.5 rounded-full m-1
                          hover:bg-gray-800 active:scale-95
                          disabled:opacity-70
                          transition-all duration-300
                          focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
                        "
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="w-3.5 h-3.5 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              />
                            </svg>
                            Sending…
                          </span>
                        ) : (
                          "Get a Quote"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>

            {/* Right: 3D House Image */}
            <motion.div
              className="flex-shrink-0 w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[420px] -mb-14 lg:-mb-14 lg:-mr-8 xl:-mr-12"
              variants={imageVariants}
            >
              <Image
                src="/newsletter-image.png"
                alt="Modern 3D illustrated house"
                width={420}
                height={380}
                className="w-full h-auto object-contain drop-shadow-2xl"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}