// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";

// // ── Types ─────────────────────────────────────────────────────────────────────
// type PropertyType = "Buy" | "Sell" | "Rent" | "Commercial" | "Plots/Land" | "Projects";

// const PROPERTY_TYPES: PropertyType[] = ["Buy", "Sell", "Rent", "Commercial", "Plots/Land", "Projects"];

// const POPULAR_CITIES = [
//   { name: "Mumbai", state: "Maharashtra" },
//   { name: "Pune", state: "Maharashtra" },
//   { name: "Bangalore", state: "Karnataka" },
//   { name: "Hyderabad", state: "Telangana" },
//   { name: "Delhi", state: "Delhi" },
//   { name: "Chennai", state: "Tamil Nadu" },
//   { name: "Kolkata", state: "West Bengal" },
//   { name: "Ahmedabad", state: "Gujarat" },
// ];

// const NAV_LINKS = [
//   { label: "Buy", href: "/buy" },
//   { label: "Sell", href: "/sell" },
//   { label: "Rent", href: "/rent" },
//   { label: "Mortgage", href: "/mortgage" },
//   { label: "Apartments", href: "/apartments" },
//   { label: "Townhomes", href: "/townhomes" },
//   { label: "Real Estate Agents", href: "/agents" },
// ];

// // ── Component ─────────────────────────────────────────────────────────────────
// export default function Navbar() {
//   const [scrolled, setScrolled] = useState(false);
//   const [activeType, setActiveType] = useState<PropertyType>("Buy");
//   const [locationQuery, setLocationQuery] = useState("");
//   const [locationOpen, setLocationOpen] = useState(false);
//   const [typeDropOpen, setTypeDropOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

//   const locationRef = useRef<HTMLDivElement>(null);
//   const typeRef = useRef<HTMLDivElement>(null);

//   // Scroll detection
//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 60);
//     window.addEventListener("scroll", onScroll, { passive: true });
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   // Close dropdowns on outside click
//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
//         setLocationOpen(false);
//       }
//       if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
//         setTypeDropOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const filteredCities = POPULAR_CITIES.filter(
//     (c) =>
//       locationQuery === "" ||
//       c.name.toLowerCase().includes(locationQuery.toLowerCase()) ||
//       c.state.toLowerCase().includes(locationQuery.toLowerCase())
//   );

//   const handleCitySelect = useCallback((city: string) => {
//     setLocationQuery(city);
//     setLocationOpen(false);
//   }, []);

//   const handleUseLocation = useCallback(() => {
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition(
//       () => {
//         setLocationQuery("Current Location");
//         setLocationOpen(false);
//       },
//       () => alert("Location access denied.")
//     );
//   }, []);

//   // ── Navbar BG ───────────────────────────────────────────────────────────────
//   const navBg = scrolled
//     ? "bg-[#1B4FD8] shadow-lg shadow-blue-900/20"
//     : "bg-white";

//   return (
//     <>
//       <nav
//         className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${navBg}`}
//         style={{ fontFamily: "Poppins, sans-serif" }}
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16 lg:h-[68px] gap-4">

//             {/* ── Logo ──────────────────────────────────────────────────── */}
//             <Link
//               href="/"
//               className="flex-shrink-0 flex items-baseline gap-0 select-none"
//             >
//               <span className="text-xl lg:text-2xl font-bold text-white tracking-tight">
//                 Sasta
//               </span>
//               <span
//                 className={`text-xl lg:text-2xl font-bold tracking-tight transition-colors duration-500 ${
//                   scrolled ? "text-yellow-300" : "text-[#93C5FD]"
//                 }`}
//               >
//                 ghar
//               </span>
//             </Link>

//             {/* ── Desktop Nav Links ─────────────────────────────────────── */}
//             <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
//               {NAV_LINKS.map((l) => (
//                 <Link
//                   key={l.label}
//                   href={l.href}
//                   className="text-white/85 text-[13px] font-medium px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-all duration-200"
//                 >
//                   {l.label}
//                 </Link>
//               ))}
//             </div>

//             {/* ── Desktop Search Bar ────────────────────────────────────── */}
//             <div className="hidden lg:flex flex-1 max-w-xl items-center bg-white rounded-full shadow-md overflow-visible relative">
//               {/* Property Type Dropdown */}
//               <div ref={typeRef} className="relative flex-shrink-0">
//                 <button
//                   onClick={() => setTypeDropOpen((p) => !p)}
//                   className="flex items-center gap-1.5 px-4 py-2.5 text-gray-700 text-sm font-semibold border-r border-gray-200 hover:text-[#1B4FD8] transition-colors"
//                 >
//                   {activeType}
//                   <svg
//                     className={`w-3.5 h-3.5 transition-transform duration-200 ${typeDropOpen ? "rotate-180" : ""}`}
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </button>
//                 <AnimatePresence>
//                   {typeDropOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, y: -6, scale: 0.97 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: -6, scale: 0.97 }}
//                       transition={{ duration: 0.18, ease: "easeOut" }}
//                       className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
//                     >
//                       {PROPERTY_TYPES.map((t) => (
//                         <button
//                           key={t}
//                           onClick={() => { setActiveType(t); setTypeDropOpen(false); }}
//                           className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
//                             activeType === t
//                               ? "bg-blue-50 text-[#1B4FD8] font-semibold"
//                               : "text-gray-700 hover:bg-gray-50"
//                           }`}
//                         >
//                           {t}
//                         </button>
//                       ))}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>

//               {/* Location Input */}
//               <div ref={locationRef} className="relative flex-1">
//                 <input
//                   type="text"
//                   value={locationQuery}
//                   onChange={(e) => { setLocationQuery(e.target.value); setLocationOpen(true); }}
//                   onFocus={() => setLocationOpen(true)}
//                   placeholder="Enter Locality / Project / Society / Landmark"
//                   className="w-full px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
//                 />
//                 <AnimatePresence>
//                   {locationOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, y: -4 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -4 }}
//                       transition={{ duration: 0.18 }}
//                       className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
//                       style={{ minWidth: 320 }}
//                     >
//                       {/* Use current location */}
//                       <button
//                         onClick={handleUseLocation}
//                         className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group border-b border-gray-100"
//                       >
//                         <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1B4FD8] transition-colors">
//                           <svg className="w-4 h-4 text-[#1B4FD8] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                           </svg>
//                         </div>
//                         <div className="text-left">
//                           <p className="text-sm font-semibold text-[#1B4FD8]">Use current location</p>
//                           <p className="text-xs text-gray-400">Auto-detect via GPS</p>
//                         </div>
//                       </button>

//                       {/* Popular Cities */}
//                       <div className="px-4 pt-3 pb-1">
//                         <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
//                           Popular Cities
//                         </p>
//                       </div>
//                       {filteredCities.length > 0 ? (
//                         filteredCities.map((c) => (
//                           <button
//                             key={c.name}
//                             onClick={() => handleCitySelect(c.name)}
//                             className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
//                           >
//                             <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                             </svg>
//                             <div className="text-left">
//                               <span className="text-sm font-medium text-gray-800">{c.name}</span>
//                               <span className="text-xs text-gray-400 ml-2">{c.state}</span>
//                             </div>
//                           </button>
//                         ))
//                       ) : (
//                         <p className="px-4 py-3 text-sm text-gray-400">No cities found</p>
//                       )}

//                       {/* Map selection hint */}
//                       <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2 bg-gray-50/50">
//                         <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
//                         </svg>
//                         <span className="text-xs text-gray-400">Select on map — coming soon</span>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>

//               {/* Search Button */}
//               <button className="flex-shrink-0 bg-[#1B4FD8] hover:bg-[#1640b8] text-white p-2.5 rounded-full m-1 transition-colors">
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </button>
//             </div>

//             {/* ── Right Actions ─────────────────────────────────────────── */}
//             <div className="flex items-center gap-2 flex-shrink-0">
//               {/* Post Property */}
//               <Link
//                 href="/post-property"
//                 className="hidden sm:flex items-center gap-1.5 bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
//               >
//                 Post Property
//                 <span className="bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none tracking-wide">
//                   FREE
//                 </span>
//               </Link>

//               {/* Log In */}
//               <Link
//                 href="/login"
//                 className="hidden sm:inline-flex text-white/90 text-sm font-medium hover:text-white transition-colors px-2"
//               >
//                 Log In
//               </Link>

//               {/* Sign Up */}
//               <Link
//                 href="/signup"
//                 className="hidden sm:inline-flex bg-white/15 border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-white/25 transition-all"
//               >
//                 Sign Up
//               </Link>

//               {/* Mobile: search icon */}
//               <button
//                 className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
//                 onClick={() => setMobileSearchOpen((p) => !p)}
//                 aria-label="Toggle search"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </button>

//               {/* Mobile: hamburger */}
//               <button
//                 className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
//                 onClick={() => setMobileMenuOpen((p) => !p)}
//                 aria-label="Toggle menu"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
//                 </svg>
//               </button>
//             </div>
//           </div>

//           {/* ── Mobile Search Bar ───────────────────────────────────────── */}
//           <AnimatePresence>
//             {mobileSearchOpen && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: "auto" }}
//                 exit={{ opacity: 0, height: 0 }}
//                 transition={{ duration: 0.25, ease: "easeOut" }}
//                 className="lg:hidden overflow-hidden pb-3"
//               >
//                 <div className="flex items-center bg-white rounded-full shadow-md overflow-hidden">
//                   <input
//                     type="text"
//                     placeholder="Enter city, locality or landmark..."
//                     className="flex-1 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
//                   />
//                   <button className="flex-shrink-0 bg-[#1B4FD8] text-white p-3 rounded-full m-1">
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                     </svg>
//                   </button>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         {/* ── Mobile Menu ─────────────────────────────────────────────── */}
//         <AnimatePresence>
//           {mobileMenuOpen && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               transition={{ duration: 0.25, ease: "easeOut" }}
//               className="lg:hidden bg-[#1B4FD8] border-t border-white/10 overflow-hidden"
//             >
//               <div className="px-4 py-4 space-y-1">
//                 {NAV_LINKS.map((l) => (
//                   <Link
//                     key={l.label}
//                     href={l.href}
//                     onClick={() => setMobileMenuOpen(false)}
//                     className="block text-white/85 text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
//                   >
//                     {l.label}
//                   </Link>
//                 ))}
//                 <div className="pt-3 flex flex-col gap-2 border-t border-white/15 mt-2">
//                   <Link
//                     href="/post-property"
//                     className="flex items-center justify-center gap-1.5 bg-white text-gray-900 text-sm font-bold px-4 py-2.5 rounded-full"
//                   >
//                     Post Property
//                     <span className="bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">FREE</span>
//                   </Link>
//                   <div className="flex gap-2">
//                     <Link href="/login" className="flex-1 text-center border border-white/30 text-white text-sm font-medium py-2 rounded-full hover:bg-white/10 transition-colors">
//                       Log In
//                     </Link>
//                     <Link href="/signup" className="flex-1 text-center bg-white/15 border border-white/30 text-white text-sm font-semibold py-2 rounded-full hover:bg-white/25 transition-colors">
//                       Sign Up
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </nav>
//     </>
//   );
// }






"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────
type PropertyType = "Buy" | "Sell" | "Rent" | "Commercial" | "Plots/Land" | "Projects";

const PROPERTY_TYPES: PropertyType[] = ["Buy", "Sell", "Rent", "Commercial", "Plots/Land", "Projects"];

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

const NAV_LINKS = [
  { label: "Buy", href: "/buy" },
  { label: "Sell", href: "/sell" },
  { label: "Rent", href: "/rent" },
  { label: "Mortgage", href: "/mortgage" },
  { label: "Apartments", href: "/apartments" },
  { label: "Townhomes", href: "/townhomes" },
  { label: "Real Estate Agents", href: "/agents" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeType, setActiveType] = useState<PropertyType>("Buy");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const locationRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setTypeDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredCities = POPULAR_CITIES.filter(
    (c) =>
      locationQuery === "" ||
      c.name.toLowerCase().includes(locationQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(locationQuery.toLowerCase())
  );

  const handleCitySelect = useCallback((city: string) => {
    setLocationQuery(city);
    setLocationOpen(false);
  }, []);

  const handleUseLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationQuery("Current Location");
        setLocationOpen(false);
      },
      () => alert("Location access denied.")
    );
  }, []);

  // ── Navbar BG ───────────────────────────────────────────────────────────────
  const navBg = scrolled
    ? "bg-[#1B4FD8] shadow-lg shadow-blue-900/20"
    : "bg-white shadow-sm";

  // ── Dynamic color tokens based on scroll state ───────────────────────────────
  // When scrolled (blue bg)  -> white text / light borders
  // When not scrolled (white bg) -> dark text / gray borders
  const navLinkText = scrolled
    ? "text-white/85 hover:text-white hover:bg-white/10"
    : "text-gray-700 hover:text-[#1B4FD8] hover:bg-blue-50";

  const navLinkBorder = scrolled ? "border-white/30" : "border-gray-200";

  const signUpBtn = scrolled
    ? "bg-white/15 border border-white/30 text-white hover:bg-white/25"
    : "bg-blue-50 border border-blue-100 text-[#1B4FD8] hover:bg-blue-100";

  const logInText = scrolled
    ? "text-white/90 hover:text-white"
    : "text-gray-700 hover:text-[#1B4FD8]";

  const iconButton = scrolled
    ? "text-white hover:bg-white/10"
    : "text-gray-700 hover:bg-gray-100";

  const searchBarShadow = scrolled
    ? "shadow-md"
    : "shadow-md";

  const searchDivider = scrolled ? "border-gray-200" : "border-gray-200";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${navBg}`}
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[68px] gap-4">

            {/* ── Logo ──────────────────────────────────────────────────── */}
            {/*
              Using logo.png from /public. If your logo file is designed for
              a light background (dark text/mark), it will read fine on white.
              If you also have a white/light variant for the blue scrolled state,
              swap the src conditionally — see commented alternative below.
            */}
            <Link href="/" className="flex-shrink-0 flex items-center select-none">
              <Image
                src="/logo-2.png"
                alt="Sastaghar"
                width={140}
                height={40}
                className="h-14 lg:h-18 w-auto object-contain"
                priority
              />
              {/* Alternative if you have two logo variants:
                <Image
                  src={scrolled ? "/logo-white.png" : "/logo.png"}
                  alt="Sastaghar"
                  width={140}
                  height={40}
                  className="h-8 lg:h-9 w-auto object-contain"
                  priority
                />
              */}
            </Link>

            {/* ── Desktop Nav Links ─────────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className={`text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${navLinkText}`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* ── Desktop Search Bar ────────────────────────────────────── */}
            <div className={`hidden lg:flex flex-1 max-w-xl items-center bg-white rounded-full overflow-visible relative transition-shadow duration-300 ${searchBarShadow}`}>
              {/* Property Type Dropdown */}
              <div ref={typeRef} className="relative flex-shrink-0">
                <button
                  onClick={() => setTypeDropOpen((p) => !p)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-gray-700 text-sm font-semibold border-r ${searchDivider} hover:text-[#1B4FD8] transition-colors`}
                >
                  {activeType}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${typeDropOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {typeDropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() => { setActiveType(t); setTypeDropOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            activeType === t
                              ? "bg-blue-50 text-[#1B4FD8] font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Location Input */}
              <div ref={locationRef} className="relative flex-1">
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => { setLocationQuery(e.target.value); setLocationOpen(true); }}
                  onFocus={() => setLocationOpen(true)}
                  placeholder="Enter Locality / Project / Society / Landmark"
                  className="w-full px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
                />
                <AnimatePresence>
                  {locationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                      style={{ minWidth: 320 }}
                    >
                      {/* Use current location */}
                      <button
                        onClick={handleUseLocation}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group border-b border-gray-100"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1B4FD8] transition-colors">
                          <svg className="w-4 h-4 text-[#1B4FD8] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-[#1B4FD8]">Use current location</p>
                          <p className="text-xs text-gray-400">Auto-detect via GPS</p>
                        </div>
                      </button>

                      {/* Popular Cities */}
                      <div className="px-4 pt-3 pb-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                          Popular Cities
                        </p>
                      </div>
                      {filteredCities.length > 0 ? (
                        filteredCities.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => handleCitySelect(c.name)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                          >
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <div className="text-left">
                              <span className="text-sm font-medium text-gray-800">{c.name}</span>
                              <span className="text-xs text-gray-400 ml-2">{c.state}</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="px-4 py-3 text-sm text-gray-400">No cities found</p>
                      )}

                      {/* Map selection hint */}
                      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2 bg-gray-50/50">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span className="text-xs text-gray-400">Select on map — coming soon</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Button */}
              <button className="flex-shrink-0 bg-[#1B4FD8] hover:bg-[#1640b8] text-white p-2.5 rounded-full m-1 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* ── Right Actions ─────────────────────────────────────────── */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Post Property */}
              <Link
                href="/post-property"
                className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-sm ${
                  scrolled
                    ? "bg-white text-gray-900 hover:bg-blue-50"
                    : "bg-[#1B4FD8] text-white hover:bg-[#1640b8]"
                }`}
              >
                Post Property
                <span className="bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none tracking-wide">
                  FREE
                </span>
              </Link>

              {/* Log In */}
              <Link
                href="/login"
                className={`hidden sm:inline-flex text-sm font-medium transition-colors px-2 ${logInText}`}
              >
                Log In
              </Link>

              {/* Sign Up */}
              <Link
                href="/signup"
                className={`hidden sm:inline-flex text-sm font-semibold px-4 py-2 rounded-full transition-all ${signUpBtn}`}
              >
                Sign Up
              </Link>

              {/* Mobile: search icon */}
              <button
                className={`lg:hidden p-2 rounded-lg transition-colors ${iconButton}`}
                onClick={() => setMobileSearchOpen((p) => !p)}
                aria-label="Toggle search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Mobile: hamburger */}
              <button
                className={`lg:hidden p-2 rounded-lg transition-colors ${iconButton}`}
                onClick={() => setMobileMenuOpen((p) => !p)}
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Mobile Search Bar ───────────────────────────────────────── */}
          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="lg:hidden overflow-hidden pb-3"
              >
                <div className={`flex items-center bg-white rounded-full overflow-hidden ${scrolled ? "shadow-md" : "shadow-md ring-1 ring-gray-200"}`}>
                  <input
                    type="text"
                    placeholder="Enter city, locality or landmark..."
                    className="flex-1 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
                  />
                  <button className="flex-shrink-0 bg-[#1B4FD8] text-white p-3 rounded-full m-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Mobile Menu ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`lg:hidden border-t overflow-hidden ${
                scrolled ? "bg-[#1B4FD8] border-white/10" : "bg-white border-gray-100"
              }`}
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${
                      scrolled
                        ? "text-white/85 hover:bg-white/10 hover:text-white"
                        : "text-gray-700 hover:bg-blue-50 hover:text-[#1B4FD8]"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className={`pt-3 flex flex-col gap-2 border-t mt-2 ${scrolled ? "border-white/15" : "border-gray-100"}`}>
                  <Link
                    href="/post-property"
                    className={`flex items-center justify-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-full ${
                      scrolled ? "bg-white text-gray-900" : "bg-[#1B4FD8] text-white"
                    }`}
                  >
                    Post Property
                    <span className="bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">FREE</span>
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      href="/login"
                      className={`flex-1 text-center border text-sm font-medium py-2 rounded-full transition-colors ${
                        scrolled
                          ? "border-white/30 text-white hover:bg-white/10"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      className={`flex-1 text-center text-sm font-semibold py-2 rounded-full transition-colors ${
                        scrolled
                          ? "bg-white/15 border border-white/30 text-white hover:bg-white/25"
                          : "bg-blue-50 border border-blue-100 text-[#1B4FD8] hover:bg-blue-100"
                      }`}
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}