"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";

type PropertyTab = "Buy" | "Sell" | "Rent" | "Commercial" | "Plots/Land" | "Projects";
const TABS: PropertyTab[] = ["Buy", "Sell", "Rent", "Commercial", "Plots/Land", "Projects"];

const SLIDES = [
  { src: "/hero/hero-1.png", headline: "Discover Your New Home", sub: "Helping 100 million renters find their perfect fit." },
  { src: "/hero/hero-3.jpg", headline: "Premium Plots & Land", sub: "Invest in verified plots across India's fastest-growing cities." },
  { src: "/hero/hero-2.jpg", headline: "Rent Smarter, Live Better", sub: "Thousands of verified rental listings — zero brokerage." },
];

const POPULAR_CITIES = [
  { name: "Mumbai", state: "Maharashtra" },
  { name: "Pune", state: "Maharashtra" },
  { name: "Bangalore", state: "Karnataka" },
  { name: "Hyderabad", state: "Telangana" },
  { name: "Delhi", state: "Delhi" },
  { name: "Chennai", state: "Tamil Nadu" },
  { name: "Kolkata", state: "West Bengal" },
  { name: "Ahmedabad", state: "Gujarat" },
];

const STATS = [
  { value: "100M+", label: "Happy Renters" },
  { value: "2M+", label: "Verified Listings" },
  { value: "500+", label: "Cities Covered" },
  { value: "50K+", label: "Trusted Agents" },
];

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, scale: dir > 0 ? 1.04 : 0.97 }),
  center: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as any } },
  exit: (dir: number) => ({ opacity: 0, scale: dir > 0 ? 0.97 : 1.04, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any } }),
};

const textVariants = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as any, delay: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3 } },
};

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [activeTab, setActiveTab] = useState<PropertyTab>("Buy");
  const [query, setQuery] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-40px" });

  useEffect(() => {
    const t = setInterval(() => {
      setDirection(1);
      setCurrent((p) => (p + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filteredCities = POPULAR_CITIES.filter(
    (c) => query === "" || c.name.toLowerCase().includes(query.toLowerCase()) || c.state.toLowerCase().includes(query.toLowerCase())
  );

  const handleUseLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      () => { setQuery("Current Location"); setDropOpen(false); },
      () => {}
    );
  };

  return (
    <section className="w-full bg-white" style={{ fontFamily: "Poppins, sans-serif" }}>

      {/* ── Carousel ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "clamp(460px, 52vw, 600px)" }}>

        {/* Slides */}
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gray-900">
              <Image
                src={SLIDES[current].src}
                alt={SLIDES[current].headline}
                fill
                className="object-cover opacity-80"
                priority={current === 0}
              />
            </div>
            {/* Strong bottom gradient so all bottom content is readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
          </motion.div>
        </AnimatePresence>

        {/* ── All content pinned to bottom, stacked: headline → tabs+search → dots ── */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-4 sm:px-6 pb-4 gap-8">



          {/* 1. Slide headline + sub */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${current}`}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-center w-full max-w-3xl"
            >
              <h1 className="text-white text-xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight drop-shadow-lg">
                {SLIDES[current].headline}
              </h1>
              <p className="text-white/75 text-xs sm:text-sm mt-1 drop-shadow">
                {SLIDES[current].sub}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* 2. Tabs + Search bar */}
          <div className="w-full max-w-3xl">
            {/* Tabs */}
            <div className="flex items-center gap-1 mb-2 flex-wrap">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-white text-[#1B4FD8] shadow-md"
                      : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search input */}
            <div ref={dropRef} className="relative flex items-center bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-visible">
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setDropOpen(true); }}
                onFocus={() => setDropOpen(true)}
                placeholder="Address, city, locality or landmark..."
                className="flex-1 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
              />

              <button
                onClick={handleUseLocation}
                className="p-2.5 text-gray-400 hover:text-[#1B4FD8] transition-colors"
                title="Use current location"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              <button className="flex-shrink-0 bg-[#1B4FD8] hover:bg-[#1640b8] active:scale-95 text-white px-5 sm:px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center gap-1.5 m-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                  >
                    <button
                      onClick={handleUseLocation}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 border-b border-gray-100 group transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1B4FD8] transition-colors">
                        <svg className="w-4 h-4 text-[#1B4FD8] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-[#1B4FD8]">Use current location</p>
                        <p className="text-xs text-gray-400">Detect via GPS</p>
                      </div>
                    </button>

                    <div className="px-4 pt-2.5 pb-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Popular Cities</p>
                    </div>
                    <div className="max-h-44 overflow-y-auto">
                      {filteredCities.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => { setQuery(c.name); setDropOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span className="text-sm text-gray-700 font-medium">{c.name}</span>
                          <span className="text-xs text-gray-400 ml-1">{c.state}</span>
                        </button>
                      ))}
                    </div>

                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span className="text-xs text-gray-400">Select on map — powered by PostGIS (coming soon)</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 3. Carousel dots — very bottom, compact */}
          <div className="flex gap-1.5 pt-0.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/45 hover:bg-white/70"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

        </div>
        {/* ── End bottom stack ── */}
      </div>
      {/* ── End Carousel ── */}

      {/* ── Title + Stats ── */}
      <div ref={titleRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <motion.div
          className="text-center mb-10"
          initial="hidden"
          animate={titleInView ? "visible" : "hidden"}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.p
            className="text-[#1B4FD8] text-xs font-bold tracking-[0.2em] uppercase mb-3"
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
          >
            All Property Needs · One Portal
          </motion.p>
          <motion.h2
            className="text-gray-900 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}
          >
            Find Better Places to Live,
            <br className="hidden sm:block" />
            Work and Wonder…
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4"
          initial="hidden"
          animate={titleInView ? "visible" : "hidden"}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
        >
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              className="text-center group"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
            >
              <div className="text-2xl sm:text-3xl font-bold text-[#1B4FD8] mb-1 group-hover:scale-110 transition-transform duration-300 inline-block">
                {s.value}
              </div>
              <div className="text-gray-500 text-xs sm:text-sm">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}