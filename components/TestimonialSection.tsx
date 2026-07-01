"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";

type Testimonial = {
  id: number;
  quote: string;
  name: string;
  location: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      '"I found my apartment in just two days through sastaghar! The verified listings saved me so much time and effort. The process was smooth from start to finish."',
    name: "Rohit Patel",
    location: "Pune",
    avatar: "/avatars/avatar-1.png",
  },
  {
    id: 2,
    quote:
      '"Sastaghar made buying our first home completely stress-free. The agent network is fantastic and every listing was exactly as described. Highly recommended!"',
    name: "Priya Sharma",
    location: "Mumbai",
    avatar: "/avatars/avatar-1.png",
  },
  {
    id: 3,
    quote:
      '"Listed my plot within a week and got multiple genuine inquiries. The platform is transparent and the team is very supportive throughout the process."',
    name: "Anil Mehta",
    location: "Bangalore",
    avatar: "/avatars/avatar-1.png",
  },
  {
    id: 4,
    quote:
      '"Outstanding experience! The filters helped me narrow down exactly what I needed. Found a verified 2BHK in Hyderabad within my budget in under a week."',
    name: "Sneha Rao",
    location: "Hyderabad",
    avatar: "/avatars/avatar-1.png",
  },
  {
    id: 5,
    quote:
      '"Renting out my commercial space was so simple with sastaghar. The reach is incredible and the process is completely transparent from day one."',
    name: "Vikram Singh",
    location: "Delhi",
    avatar: "/avatars/avatar-1.png",
  },
];

const CARDS_PER_VIEW = 3; // Desktop
const AUTO_SCROLL_INTERVAL = 3500;

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDots = testimonials.length - CARDS_PER_VIEW + 1; // sliding window

  const goTo = useCallback((index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, totalDots - 1)));
  }, [totalDots]);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalDots);
  }, [totalDots]);

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(next, AUTO_SCROLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next]);

  const visibleTestimonials = testimonials.slice(
    activeIndex,
    activeIndex + CARDS_PER_VIEW
  );

  return (
    <section
      ref={sectionRef}
      className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="text-4xl sm:text-5xl font-semibold text-gray-900 tracking-tight"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Testimonials
          </h2>
          <Link
            href="/testimonials"
            className="hidden sm:inline-flex items-center border border-gray-300 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-full hover:border-[#1B4FD8] hover:text-[#1B4FD8] transition-colors duration-300"
          >
            SEE ALL
          </Link>
        </motion.div>

        {/* Cards Grid — Desktop sliding window, mobile single */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Desktop: 3-card sliding window */}
          <div className="hidden md:grid md:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {visibleTestimonials.map((t, i) => (
                <motion.div
                  key={`${t.id}-${activeIndex}`}
                  layout
                  initial={{ opacity: 0, x: 40, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -40, scale: 0.96 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                    delay: i * 0.07,
                  }}
                  onMouseEnter={() => setHoveredId(t.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`
                    relative flex flex-col justify-between
                    border-2 rounded-2xl p-6 cursor-default
                    transition-all duration-300 ease-out
                    ${
                      hoveredId === t.id
                        ? "border-[#1B4FD8] shadow-lg shadow-blue-100 -translate-y-1.5 bg-[#fafcff]"
                        : "border-blue-200/70 bg-white"
                    }
                  `}
                  style={{ minHeight: 220 }}
                >
                  {/* Hover glow accent */}
                  <div
                    className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none ${
                      hoveredId === t.id ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                      background:
                        "radial-gradient(ellipse at top left, rgba(27,79,216,0.06) 0%, transparent 70%)",
                    }}
                  />

                  {/* Quote */}
                  <p
                    className="text-gray-600 text-sm leading-relaxed mb-6 flex-1"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {t.quote}
                  </p>

                  {/* Author */}
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <p
                        className="font-semibold text-gray-900 text-sm"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {t.name}
                      </p>
                      <p
                        className="text-gray-400 text-xs mt-0.5"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {t.location}
                      </p>
                    </div>
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-blue-100 flex-shrink-0">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        width={44}
                        height={44}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          // Fallback to initials avatar
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      {/* Initials fallback */}
                      <div className="w-full h-full bg-[#1B4FD8] flex items-center justify-center text-white text-xs font-bold -mt-11">
                        {t.name.charAt(0)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile: single card */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="border-2 border-blue-200/70 rounded-2xl p-6 bg-white"
              >
                <p
                  className="text-gray-600 text-sm leading-relaxed mb-6"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {testimonials[activeIndex].quote}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="font-semibold text-gray-900 text-sm"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {testimonials[activeIndex].name}
                    </p>
                    <p
                      className="text-gray-400 text-xs mt-0.5"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {testimonials[activeIndex].location}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-blue-100 bg-[#1B4FD8] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {testimonials[activeIndex].name.charAt(0)}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dots Navigation */}
        <motion.div
          className="flex items-center justify-center gap-2.5 mt-10"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {Array.from({ length: totalDots }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-400 ease-out focus:outline-none focus:ring-2 focus:ring-[#1B4FD8] focus:ring-offset-2 ${
                i === activeIndex
                  ? "w-4 h-4 bg-[#1B4FD8] scale-110"
                  : "w-3.5 h-3.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </motion.div>

        {/* Mobile See All */}
        <div className="flex justify-center mt-6 sm:hidden">
          <Link
            href="/testimonials"
            className="border border-gray-300 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-full hover:border-[#1B4FD8] hover:text-[#1B4FD8] transition-colors duration-300"
          >
            SEE ALL
          </Link>
        </div>
      </div>
    </section>
  );
}