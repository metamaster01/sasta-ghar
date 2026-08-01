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






// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";
// import Link from "next/link";
// import Image from "next/image";
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
//   // { label: "Sell", href: "/sell" },
//   { label: "Rent", href: "/rent" },
//   { label: "Mortgage", href: "/mortgage" },
//   { label: "Apartments", href: "/apartments" },
//   // { label: "Townhomes", href: "/townhomes" },
//   { label: "Real Estate Agents", href: "/agents" },
//   {label : "Contact Us", href : "/contact"},
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
//     : "bg-white shadow-sm";

//   // ── Dynamic color tokens based on scroll state ───────────────────────────────
//   // When scrolled (blue bg)  -> white text / light borders
//   // When not scrolled (white bg) -> dark text / gray borders
//   const navLinkText = scrolled
//     ? "text-white/85 hover:text-white hover:bg-white/10"
//     : "text-gray-700 hover:text-[#1B4FD8] hover:bg-blue-50";

//   const navLinkBorder = scrolled ? "border-white/30" : "border-gray-200";

//   const signUpBtn = scrolled
//     ? "bg-white/15 border border-white/30 text-white hover:bg-white/25"
//     : "bg-blue-50 border border-blue-100 text-[#1B4FD8] hover:bg-blue-100";

//   const logInText = scrolled
//     ? "text-white/90 hover:text-white"
//     : "text-gray-700 hover:text-[#1B4FD8]";

//   const iconButton = scrolled
//     ? "text-white hover:bg-white/10"
//     : "text-gray-700 hover:bg-gray-100";

//   const searchBarShadow = scrolled
//     ? "shadow-md"
//     : "shadow-md";

//   const searchDivider = scrolled ? "border-gray-200" : "border-gray-200";

//   return (
//     <>
//       <nav
//         className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${navBg}`}
//         style={{ fontFamily: "Poppins, sans-serif" }}
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16 lg:h-[68px] gap-4">

//             {/* ── Logo ──────────────────────────────────────────────────── */}
//             {/*
//               Using logo.png from /public. If your logo file is designed for
//               a light background (dark text/mark), it will read fine on white.
//               If you also have a white/light variant for the blue scrolled state,
//               swap the src conditionally — see commented alternative below.
//             */}
//             <Link href="/" className="flex-shrink-0 flex items-center select-none">
//               <Image
//                 src="/logo-2.png"
//                 alt="Sastaghar"
//                 width={140}
//                 height={40}
//                 className="h-14 lg:h-18 w-auto object-contain"
//                 priority
//               />
//               {/* Alternative if you have two logo variants:
//                 <Image
//                   src={scrolled ? "/logo-white.png" : "/logo.png"}
//                   alt="Sastaghar"
//                   width={140}
//                   height={40}
//                   className="h-8 lg:h-9 w-auto object-contain"
//                   priority
//                 />
//               */}
//             </Link>

//             {/* ── Desktop Nav Links ─────────────────────────────────────── */}
//             <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
//               {NAV_LINKS.map((l) => (
//                 <Link
//                   key={l.label}
//                   href={l.href}
//                   className={`text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${navLinkText}`}
//                 >
//                   {l.label}
//                 </Link>
//               ))}
//             </div>

//             {/* ── Desktop Search Bar ────────────────────────────────────── */}
//             <div className={`hidden lg:flex flex-1 max-w-xl items-center bg-white rounded-full overflow-visible relative transition-shadow duration-300 ${searchBarShadow}`}>
//               {/* Property Type Dropdown */}
//               <div ref={typeRef} className="relative flex-shrink-0">
//                 <button
//                   onClick={() => setTypeDropOpen((p) => !p)}
//                   className={`flex items-center gap-1.5 px-4 py-2.5 text-gray-700 text-sm font-semibold border-r ${searchDivider} hover:text-[#1B4FD8] transition-colors`}
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
//                 className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-sm ${
//                   scrolled
//                     ? "bg-white text-gray-900 hover:bg-blue-50"
//                     : "bg-[#1B4FD8] text-white hover:bg-[#1640b8]"
//                 }`}
//               >
//                 Post Property
//                 <span className="bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none tracking-wide">
//                   FREE
//                 </span>
//               </Link>

//               {/* Log In */}
//               <Link
//                 href="/login"
//                 className={`hidden sm:inline-flex text-sm font-medium transition-colors px-2 ${logInText}`}
//               >
//                 Log In
//               </Link>

//               {/* Sign Up */}
//               <Link
//                 href="/register"
//                 className={`hidden sm:inline-flex text-sm font-semibold px-4 py-2 rounded-full transition-all ${signUpBtn}`}
//               >
//                 Sign Up
//               </Link>

//               {/* Mobile: search icon */}
//               <button
//                 className={`lg:hidden p-2 rounded-lg transition-colors ${iconButton}`}
//                 onClick={() => setMobileSearchOpen((p) => !p)}
//                 aria-label="Toggle search"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </button>

//               {/* Mobile: hamburger */}
//               <button
//                 className={`lg:hidden p-2 rounded-lg transition-colors ${iconButton}`}
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
//                 <div className={`flex items-center bg-white rounded-full overflow-hidden ${scrolled ? "shadow-md" : "shadow-md ring-1 ring-gray-200"}`}>
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
//               className={`lg:hidden border-t overflow-hidden ${
//                 scrolled ? "bg-[#1B4FD8] border-white/10" : "bg-white border-gray-100"
//               }`}
//             >
//               <div className="px-4 py-4 space-y-1">
//                 {NAV_LINKS.map((l) => (
//                   <Link
//                     key={l.label}
//                     href={l.href}
//                     onClick={() => setMobileMenuOpen(false)}
//                     className={`block text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${
//                       scrolled
//                         ? "text-white/85 hover:bg-white/10 hover:text-white"
//                         : "text-gray-700 hover:bg-blue-50 hover:text-[#1B4FD8]"
//                     }`}
//                   >
//                     {l.label}
//                   </Link>
//                 ))}
//                 <div className={`pt-3 flex flex-col gap-2 border-t mt-2 ${scrolled ? "border-white/15" : "border-gray-100"}`}>
//                   <Link
//                     href="/post-property"
//                     className={`flex items-center justify-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-full ${
//                       scrolled ? "bg-white text-gray-900" : "bg-[#1B4FD8] text-white"
//                     }`}
//                   >
//                     Post Property
//                     <span className="bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">FREE</span>
//                   </Link>
//                   <div className="flex gap-2">
//                     <Link
//                       href="/login"
//                       className={`flex-1 text-center border text-sm font-medium py-2 rounded-full transition-colors ${
//                         scrolled
//                           ? "border-white/30 text-white hover:bg-white/10"
//                           : "border-gray-300 text-gray-700 hover:bg-gray-50"
//                       }`}
//                     >
//                       Log In
//                     </Link>
//                     <Link
//                       href="/signup"
//                       className={`flex-1 text-center text-sm font-semibold py-2 rounded-full transition-colors ${
//                         scrolled
//                           ? "bg-white/15 border border-white/30 text-white hover:bg-white/25"
//                           : "bg-blue-50 border border-blue-100 text-[#1B4FD8] hover:bg-blue-100"
//                       }`}
//                     >
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
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────
type PropertyType = "Buy" | "Sell" | "Rent" | "Commercial" | "Plots/Land" | "Projects";

interface AuthUser {
  id:       string;
  email:    string;
  name:     string;
  avatar:   string | null;
  role:     "user" | "agent" | "builder" | "admin";
  onboardingStep: number; // 0–3; 3 = complete
}

// ── Constants ─────────────────────────────────────────────────
const PROPERTY_TYPES: PropertyType[] = ["Buy", "Sell", "Rent", "Commercial", "Plots/Land", "Projects"];

const POPULAR_CITIES = [
  { name: "Mumbai",    state: "Maharashtra" },
  { name: "Pune",      state: "Maharashtra" },
  { name: "Bangalore", state: "Karnataka"   },
  { name: "Hyderabad", state: "Telangana"   },
  { name: "Delhi",     state: "Delhi"       },
  { name: "Chennai",   state: "Tamil Nadu"  },
  { name: "Kolkata",   state: "West Bengal" },
  { name: "Ahmedabad", state: "Gujarat"     },
];

const NAV_LINKS = [
  { label: "Buy",               href: "/buy"       },
  { label: "Rent",              href: "/rent"      },
  { label: "Mortgage",          href: "/mortgage"  },
  { label: "Apartments",        href: "/apartments"},
  { label: "Real Estate Agents",href: "/agents"    },
];

// ── Helper: User avatar initials ──────────────────────────────
function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

// ── UserMenu dropdown ─────────────────────────────────────────
function UserMenu({
  user,
  onClose,
  onLogout,
  scrolled,
}: {
  user: AuthUser;
  onClose: () => void;
  onLogout: () => void;
  scrolled: boolean;
}) {
  const isAgent = user.role === "agent" || user.role === "builder" || user.role === "admin";

  const menuItems = [
    {
      label: "My Account",
      href:  "/my-account",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
    {
      label: "Liked Properties",
      href:  "/saved",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
    },
    {
      label: "My Enquiries",
      href:  "/my-enquiries",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
      style={{ boxShadow: "0 8px 40px -8px rgba(0,0,0,0.18)" }}
    >
      {/* User info header */}
      <div className="px-4 py-3.5 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-[#1B4FD8] flex items-center justify-center flex-shrink-0">
            {user.avatar ? (
              <Image src={user.avatar} alt={user.name} width={36} height={36} className="rounded-full object-cover w-9 h-9" />
            ) : (
              <span className="text-white text-xs font-bold">{getInitials(user.name)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name || "User"}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        {/* Role badge */}
        <div className="mt-2">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isAgent
              ? "bg-[#1B4FD8]/10 text-[#1B4FD8]"
              : "bg-gray-100 text-gray-500"
          }`}>
            {isAgent ? "🏢 Agent / Builder" : "👤 Buyer / Renter"}
          </span>
        </div>
      </div>

      {/* Agent dashboard link — only for agents */}
      {isAgent && (
        <div className="px-2 pt-2">
          <Link
            href="/agent/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#1B4FD8]/5 hover:bg-[#1B4FD8]/10 text-[#1B4FD8] font-semibold text-sm transition-colors group"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6.75v6.75" />
            </svg>
            Agent Dashboard
            <svg className="w-3.5 h-3.5 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      )}

      {/* Menu items */}
      <div className="px-2 py-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <span className="text-gray-400">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Divider + Logout */}
      <div className="px-2 pb-2 border-t border-gray-100">
        <button
          onClick={() => { onLogout(); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Log Out
        </button>
      </div>
    </motion.div>
  );
}

// ── Avatar Button ─────────────────────────────────────────────
function AvatarButton({
  user,
  open,
  onClick,
  scrolled,
}: {
  user: AuthUser;
  open: boolean;
  onClick: () => void;
  scrolled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full transition-all duration-200 p-1 pr-2 ${
        scrolled
          ? "hover:bg-white/10"
          : "hover:bg-gray-100"
      }`}
      aria-label="User menu"
    >
      {/* Avatar circle */}
      <div className="w-8 h-8 rounded-full bg-[#1B4FD8] flex items-center justify-center flex-shrink-0 ring-2 ring-white/60">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name}
            width={32}
            height={32}
            className="rounded-full object-cover w-8 h-8"
          />
        ) : (
          <span className="text-white text-xs font-bold leading-none">
            {getInitials(user.name)}
          </span>
        )}
      </div>
      {/* Chevron */}
      <svg
        className={`w-3.5 h-3.5 transition-transform duration-200 ${
          open ? "rotate-180" : ""
        } ${scrolled ? "text-white/70" : "text-gray-500"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN NAVBAR
// ══════════════════════════════════════════════════════════════
export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();

  // ── State ─────────────────────────────────────────────────
  const [scrolled,        setScrolled]        = useState(false);
  const [activeType,      setActiveType]      = useState<PropertyType>("Buy");
  const [locationQuery,   setLocationQuery]   = useState("");
  const [locationOpen,    setLocationOpen]    = useState(false);
  const [typeDropOpen,    setTypeDropOpen]    = useState(false);
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const [mobileSearchOpen,setMobileSearchOpen]= useState(false);
  const [userMenuOpen,    setUserMenuOpen]    = useState(false);
  const [authUser,        setAuthUser]        = useState<AuthUser | null>(null);
  const [authLoading,     setAuthLoading]     = useState(true);

  const locationRef = useRef<HTMLDivElement>(null);
  const typeRef     = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ── Scroll detection ──────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Auth state ────────────────────────────────────────────
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setAuthUser(null);
        setAuthLoading(false);
        return;
      }

      // Fetch profile + agent_profiles in one join
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, avatar_url, agent_profiles(onboarding_step)")
        .eq("id", user.id)
        .single();

      const onboardingStep =
        (profile?.agent_profiles as any)?.[0]?.onboarding_step ??
        (profile?.agent_profiles as any)?.onboarding_step ??
        0;

      setAuthUser({
        id:             user.id,
        email:          user.email ?? "",
        name:           profile?.full_name ?? user.email?.split("@")[0] ?? "User",
        avatar:         profile?.avatar_url ?? null,
        role:           (profile?.role as AuthUser["role"]) ?? "user",
        onboardingStep,
      });
      setAuthLoading(false);
    }

    fetchUser();

    // Listen for auth changes (login / logout in another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Close dropdowns on outside click ─────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node))
        setLocationOpen(false);
      if (typeRef.current && !typeRef.current.contains(e.target as Node))
        setTypeDropOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
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
      () => { setLocationQuery("Current Location"); setLocationOpen(false); },
      () => {}
    );
  }, []);

  // ── Logout ────────────────────────────────────────────────
  async function handleLogout() {
    await supabase.auth.signOut();
    setAuthUser(null);
    router.push("/");
    router.refresh();
  }

  // ── Post Property click logic ─────────────────────────────
  function handlePostProperty(e: React.MouseEvent) {
    e.preventDefault();
    if (!authUser) {
      router.push("/login?redirect=/post-property");
      return;
    }
    const isAgent = authUser.role === "agent" || authUser.role === "builder";
    if (isAgent) {
      if (authUser.onboardingStep >= 3) {
        router.push("/agent/listings/new");
      } else {
        router.push(`/onboarding/step-${authUser.onboardingStep + 1}`);
      }
    } else {
      // Regular user → start agent onboarding
      router.push("/register?intent=agent");
    }
  }

  // ── Color tokens (scrolled = blue bg, not scrolled = white) ─
  const navBg       = scrolled ? "bg-[#1B4FD8] shadow-lg shadow-blue-900/20" : "bg-white shadow-sm";
  const navLinkText = scrolled ? "text-white/85 hover:text-white hover:bg-white/10" : "text-gray-700 hover:text-[#1B4FD8] hover:bg-blue-50";
  const logInText   = scrolled ? "text-white/90 hover:text-white" : "text-gray-700 hover:text-[#1B4FD8]";
  const signUpBtn   = scrolled ? "bg-white/15 border border-white/30 text-white hover:bg-white/25" : "bg-blue-50 border border-blue-100 text-[#1B4FD8] hover:bg-blue-100";
  const iconBtn     = scrolled ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100";

  const isAgent = authUser && (authUser.role === "agent" || authUser.role === "builder" || authUser.role === "admin");

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${navBg}`}
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[68px] gap-4">

            {/* ── Logo ──────────────────────────────────── */}
            <Link href="/" className="flex-shrink-0 flex items-center select-none">
              <Image
                src="/logo-2.png"
                alt="Sastaghar"
                width={140}
                height={40}
                className="h-14 lg:h-16 w-auto object-contain"
                priority
              />
            </Link>

            {/* ── Desktop Nav Links ─────────────────────── */}
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

            {/* ── Desktop Search Bar ────────────────────── */}
            <div className="hidden lg:flex flex-1 max-w-xl items-center bg-white rounded-full shadow-md overflow-visible relative">
              {/* Property type dropdown */}
              <div ref={typeRef} className="relative flex-shrink-0">
                <button
                  onClick={() => setTypeDropOpen((p) => !p)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-gray-700 text-sm font-semibold border-r border-gray-200 hover:text-[#1B4FD8] transition-colors"
                >
                  {activeType}
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${typeDropOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${activeType === t ? "bg-blue-50 text-[#1B4FD8] font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Location input */}
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
                      <button onClick={handleUseLocation} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group border-b border-gray-100">
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
                      <div className="px-4 pt-3 pb-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Popular Cities</p>
                      </div>
                      {filteredCities.length > 0 ? (
                        filteredCities.map((c) => (
                          <button key={c.name} onClick={() => handleCitySelect(c.name)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
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

              {/* Search button */}
              <button className="flex-shrink-0 bg-[#1B4FD8] hover:bg-[#1640b8] text-white p-2.5 rounded-full m-1 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* ── Right Actions ─────────────────────────── */}
            <div className="flex items-center gap-2 flex-shrink-0">

              {authLoading ? (
                // Loading skeleton
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-24 h-8 rounded-full bg-gray-200/60 animate-pulse" />
                  <div className="w-8 h-8 rounded-full bg-gray-200/60 animate-pulse" />
                </div>

              ) : authUser ? (
                // ── LOGGED IN ─────────────────────────────
                <>
                  {/* Agent Admin button — only for agents */}
                  {isAgent && (
                    <Link
                      href="/agent/dashboard"
                      className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-colors ${
                        scrolled
                          ? "bg-white/15 border border-white/30 text-white hover:bg-white/25"
                          : "bg-[#1B4FD8] text-white hover:bg-[#1640b8]"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                      </svg>
                      Agent Admin
                    </Link>
                  )}

                  {/* Post Property — visible to all logged-in users */}
                  {!isAgent && (
                    <button
                      onClick={handlePostProperty}
                      className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-sm ${
                        scrolled
                          ? "bg-white text-gray-900 hover:bg-blue-50"
                          : "bg-[#1B4FD8] text-white hover:bg-[#1640b8]"
                      }`}
                    >
                      Post Property
                      <span className="bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                        FREE
                      </span>
                    </button>
                  )}

                  {/* User menu — desktop */}
                  <div ref={userMenuRef} className="relative hidden sm:block">
                    <AvatarButton
                      user={authUser}
                      open={userMenuOpen}
                      onClick={() => setUserMenuOpen((p) => !p)}
                      scrolled={scrolled}
                    />
                    <AnimatePresence>
                      {userMenuOpen && (
                        <UserMenu
                          user={authUser}
                          onClose={() => setUserMenuOpen(false)}
                          onLogout={handleLogout}
                          scrolled={scrolled}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </>

              ) : (
                // ── NOT LOGGED IN ────────────────────────
                <>
                  {/* Post Property */}
                  <button
                    onClick={handlePostProperty}
                    className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-sm ${
                      scrolled
                        ? "bg-white text-gray-900 hover:bg-blue-50"
                        : "bg-[#1B4FD8] text-white hover:bg-[#1640b8]"
                    }`}
                  >
                    Post Property
                    <span className="bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                      FREE
                    </span>
                  </button>

                  <Link href="/login" className={`hidden sm:inline-flex text-sm font-medium transition-colors px-2 ${logInText}`}>
                    Log In
                  </Link>

                  <Link href="/register" className={`hidden sm:inline-flex text-sm font-semibold px-4 py-2 rounded-full transition-all ${signUpBtn}`}>
                    Sign Up
                  </Link>
                </>
              )}

              {/* ── Mobile icons ──────────────────────────── */}
              {/* Search icon */}
              <button
                className={`lg:hidden p-2 rounded-lg transition-colors ${iconBtn}`}
                onClick={() => setMobileSearchOpen((p) => !p)}
                aria-label="Toggle search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Mobile: show avatar if logged in, hamburger always */}
              {authUser && !authLoading && (
                <div ref={userMenuRef} className="relative lg:hidden">
                  <AvatarButton
                    user={authUser}
                    open={userMenuOpen}
                    onClick={() => setUserMenuOpen((p) => !p)}
                    scrolled={scrolled}
                  />
                  <AnimatePresence>
                    {userMenuOpen && (
                      <UserMenu
                        user={authUser}
                        onClose={() => setUserMenuOpen(false)}
                        onLogout={handleLogout}
                        scrolled={scrolled}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Hamburger */}
              <button
                className={`lg:hidden p-2 rounded-lg transition-colors ${iconBtn}`}
                onClick={() => setMobileMenuOpen((p) => !p)}
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Mobile Search Bar ────────────────────────── */}
          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="lg:hidden overflow-hidden pb-3"
              >
                <div className={`flex items-center bg-white rounded-full overflow-hidden shadow-md ${!scrolled && "ring-1 ring-gray-200"}`}>
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

        {/* ── Mobile Menu ──────────────────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`lg:hidden border-t overflow-hidden ${scrolled ? "bg-[#1B4FD8] border-white/10" : "bg-white border-gray-100"}`}
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${
                      scrolled ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-gray-700 hover:bg-blue-50 hover:text-[#1B4FD8]"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}

                {/* Mobile bottom actions */}
                <div className={`pt-3 flex flex-col gap-2 border-t mt-2 ${scrolled ? "border-white/15" : "border-gray-100"}`}>

                  {authUser ? (
                    <>
                      {/* Agent admin button — mobile */}
                      {isAgent && (
                        <Link
                          href="/agent/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-full ${
                            scrolled ? "bg-white text-[#1B4FD8]" : "bg-[#1B4FD8] text-white"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                          </svg>
                          Agent Admin
                        </Link>
                      )}

                      {/* Post property */}
                      <button
                        onClick={(e) => { setMobileMenuOpen(false); handlePostProperty(e); }}
                        className={`flex items-center justify-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-full ${
                          scrolled ? "bg-white/15 border border-white/30 text-white" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        Post Property
                        <span className="bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">FREE</span>
                      </button>

                      {/* Mobile menu items */}
                      <div className={`flex flex-col gap-1 pt-1 border-t ${scrolled ? "border-white/10" : "border-gray-100"}`}>
                        {[
                          { label: "My Account",       href: "/my-account"   },
                          { label: "Liked Properties", href: "/saved"        },
                          { label: "My Enquiries",     href: "/my-enquiries" },
                        ].map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${
                              scrolled ? "text-white/85 hover:bg-white/10" : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                        <button
                          onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                          className="text-left text-sm font-medium px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-50/30 transition-colors"
                        >
                          Log Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Not logged in — mobile */}
                      <button
                        onClick={(e) => { setMobileMenuOpen(false); handlePostProperty(e); }}
                        className={`flex items-center justify-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-full ${
                          scrolled ? "bg-white text-gray-900" : "bg-[#1B4FD8] text-white"
                        }`}
                      >
                        Post Property
                        <span className="bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">FREE</span>
                      </button>
                      <div className="flex gap-2">
                        <Link
                          href="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex-1 text-center border text-sm font-medium py-2 rounded-full transition-colors ${
                            scrolled ? "border-white/30 text-white hover:bg-white/10" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Log In
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex-1 text-center text-sm font-semibold py-2 rounded-full transition-colors ${
                            scrolled ? "bg-white/15 border border-white/30 text-white hover:bg-white/25" : "bg-blue-50 border border-blue-100 text-[#1B4FD8] hover:bg-blue-100"
                          }`}
                        >
                          Sign Up
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}