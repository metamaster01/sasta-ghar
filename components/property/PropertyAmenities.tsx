"use client";

// components/property/PropertyAmenities.tsx
// Amenity icon grid — matches Image 4 design exactly.
// Groups amenities by category with icons.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Amenity {
  id:        string;
  name:      string;
  category:  string;
  icon_key?: string | null;
}

// ── Icon map — maps icon_key to SVG ──────────────────────────
function AmenityIcon({ iconKey, className = "w-6 h-6" }: { iconKey?: string | null; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    lift: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12M3 3h18v18H3V3z" />
      </svg>
    ),
    pool: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12a8.25 8.25 0 0116.5 0M3 16.5c1.5 1 3 1.5 4.5 1.5s3-.5 4.5-1.5 3-1.5 4.5-1.5 3 .5 4.5 1.5M3 20c1.5 1 3 1.5 4.5 1.5s3-.5 4.5-1.5 3-1.5 4.5-1.5 3 .5 4.5 1.5" />
      </svg>
    ),
    gym: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    power: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    cctv: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    guard: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    parking_cover: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    clubhouse: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18h13.5m-13.5 0V3a.75.75 0 01.75-.75h12a.75.75 0 01.75.75v18M12 12.75h.008v.008H12v-.008zm0 3h.008v.008H12v-.008z" />
      </svg>
    ),
    garden: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
    ev: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    jogging: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5S11.172 3 12 3s1.5.672 1.5 1.5zM6.75 8.25l2.25 2.25m0 0l-2.25 5.25M9 10.5l2.25-2.25 2.25 4.5 2.25-1.5" />
      </svg>
    ),
    play_area: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    intercom: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    gate: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    fire: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      </svg>
    ),
    metro: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    water: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 5.4-6 8.4-6 12a6 6 0 0012 0c0-3.6-4.8-6.6-6-12z" />
      </svg>
    ),
  };

  // Default icon for unknown keys
  const icon = iconKey && icons[iconKey]
    ? icons[iconKey]
    : (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );

  return <>{icon}</>;
}

// ── Category display names ────────────────────────────────────
const CAT_LABELS: Record<string, string> = {
  basic:        "Basic Amenities",
  security:     "Security",
  parking:      "Parking",
  recreation:   "Recreation",
  green:        "Green & Outdoors",
  convenience:  "Convenience",
  connectivity: "Connectivity",
};

const CAT_ORDER = ["basic","security","parking","recreation","green","convenience","connectivity"];

export default function PropertyAmenities({ amenities }: { amenities: Amenity[] }) {
  const [showAll, setShowAll] = useState(false);

  if (!amenities.length) return null;

  // Group by category
  const grouped = amenities.reduce<Record<string, Amenity[]>>((acc, a) => {
    if (!a) return acc;
    const cat = a.category ?? "basic";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  const categories = CAT_ORDER.filter(c => grouped[c]?.length > 0);
  const VISIBLE_LIMIT = 8;
  const allFlat = amenities.filter(Boolean);
  const visibleFlat = showAll ? allFlat : allFlat.slice(0, VISIBLE_LIMIT);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100"
      style={{ fontFamily: "Poppins, sans-serif" }}>

      <h2 className="text-gray-900 font-bold text-base mb-5">
        World-Class Amenities
        <span className="ml-2 text-xs font-normal text-gray-400">
          ({allFlat.length} available)
        </span>
      </h2>

      {/* Flat icon grid — matches Image 4 design */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visibleFlat.map((amenity) => (
          <motion.div
            key={amenity.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-[#F0FDF9] border border-gray-100 hover:border-[#2EAE88]/30 rounded-xl p-3 sm:p-4 text-center transition-all duration-200 cursor-default group"
          >
            <div className="text-[#2EAE88] group-hover:scale-110 transition-transform duration-200">
              <AmenityIcon iconKey={amenity.icon_key} className="w-6 h-6" />
            </div>
            <span className="text-gray-600 text-[11px] sm:text-xs font-medium leading-tight">
              {amenity.name}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Show more / less toggle */}
      {allFlat.length > VISIBLE_LIMIT && (
        <button
          onClick={() => setShowAll(s => !s)}
          className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#1B4FD8] hover:bg-[#EEF2FF] transition-colors flex items-center justify-center gap-2"
        >
          {showAll ? "Show less" : `Show all ${allFlat.length} amenities`}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${showAll ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}