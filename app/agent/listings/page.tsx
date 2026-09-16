// "use client";

// // app/agent/listings/page.tsx
// // Agent listings management page.
// // Shows all properties owned by this agent with:
// // - Stats: total, active, pending, sold
// // - Table: image, title, type, price, status dropdown, leads, actions
// // - Status can be updated inline (draft/live/sold/rented/archived)
// // - Performance analytics section at bottom
// // - Pagination 10 per page

// import { useState, useEffect, useCallback, useRef } from "react";
// import { useRouter }                                from "next/navigation";
// import Link                                         from "next/link";
// import Image                                        from "next/image";
// import { motion, AnimatePresence }                  from "framer-motion";
// import { createClient }                             from "@/lib/supabase/client";

// // ── Types ─────────────────────────────────────────────────────
// interface Listing {
//   id:             string;
//   title:          string;
//   slug:           string;
//   category:       string;
//   property_type:  string;
//   price:          number;
//   price_unit:     string;
//   bedrooms:       number | null;
//   carpet_area:    number | null;
//   area_unit:      string;
//   status:         string;
//   is_verified:    boolean;
//   is_featured:    boolean;
//   is_premium:     boolean;
//   leads_count:    number;
//   views_count:    number;
//   saved_count:    number;
//   published_at:   string | null;
//   expires_at:     string | null;
//   city_name:      string;
//   locality_name:  string | null;
//   cover_image:    string | null;
//   rejection_reason: string | null;
// }

// // ── Constants ─────────────────────────────────────────────────
// // Only statuses agent can set (admin sets pending_review/rejected)
// const AGENT_STATUSES = [
//   { value: "draft",    label: "Draft",    cls: "bg-gray-100 text-gray-500"           },
//   { value: "live",     label: "Active",   cls: "bg-[#2EAE88]/10 text-[#2EAE88]"     },
//   { value: "sold",     label: "Sold",     cls: "bg-blue-100 text-blue-700"           },
//   { value: "rented",   label: "Rented",   cls: "bg-purple-100 text-purple-700"       },
//   { value: "archived", label: "Archived", cls: "bg-red-100 text-red-500"             },
// ];

// // Read-only statuses (set by admin)
// const ALL_STATUS_CFG: Record<string, { label: string; cls: string; dot: string }> = {
//   draft:          { label: "Draft",           cls: "bg-gray-100 text-gray-500",           dot: "bg-gray-400"    },
//   pending_review: { label: "Pending",         cls: "bg-amber-100 text-amber-700",         dot: "bg-amber-500"   },
//   live:           { label: "Active",          cls: "bg-[#2EAE88]/10 text-[#2EAE88]",     dot: "bg-[#2EAE88]"   },
//   rejected:       { label: "Rejected",        cls: "bg-red-100 text-red-600",             dot: "bg-red-500"     },
//   sold:           { label: "Sold",            cls: "bg-blue-100 text-blue-700",           dot: "bg-blue-500"    },
//   rented:         { label: "Rented",          cls: "bg-purple-100 text-purple-700",       dot: "bg-purple-500"  },
//   expired:        { label: "Expired",         cls: "bg-orange-100 text-orange-600",       dot: "bg-orange-500"  },
//   archived:       { label: "Archived",        cls: "bg-red-100 text-red-500",             dot: "bg-red-400"     },
// };

// const TYPE_LABEL: Record<string, string> = {
//   buy: "Residential", sell: "Residential", rent: "Rental",
//   commercial: "Commercial", plot_land: "Plots", project: "Project", pg_coliving: "PG",
// };

// const PAGE_SIZE = 10;

// // ── Helpers ───────────────────────────────────────────────────
// function fmtPrice(price: number, unit: string) {
//   const s = unit === "per_month" ? "/mo" : "";
//   if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr${s}`;
//   if (price >= 100000)   return `₹${(price / 100000).toFixed(1)}L${s}`;
//   return `₹${price.toLocaleString("en-IN")}${s}`;
// }

// function daysLeft(expires_at: string | null) {
//   if (!expires_at) return null;
//   const diff = new Date(expires_at).getTime() - Date.now();
//   if (diff <= 0) return 0;
//   return Math.ceil(diff / 86400000);
// }

// // ── Status dropdown ───────────────────────────────────────────
// function StatusDropdown({
//   listing, onUpdate,
// }: {
//   listing: Listing;
//   onUpdate: (id: string, status: string) => void;
// }) {
//   const [open,   setOpen]   = useState(false);
//   const [saving, setSaving] = useState(false);
//   const ref      = useRef<HTMLDivElement>(null);
//   const supabase = createClient();

//   // Admin-set statuses can't be changed by agent
//   const isReadOnly = ["pending_review","rejected","expired"].includes(listing.status);

//   useEffect(() => {
//     function handler(e: MouseEvent) {
//       if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
//     }
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   async function handleSelect(newStatus: string) {
//     if (newStatus === listing.status) { setOpen(false); return; }
//     setSaving(true);
//     setOpen(false);

//     const update: {
//       status: "draft" | "live" | "sold" | "rented" | "archived";
//       published_at?: string;
//       expires_at?: string;
//     } = {
//       status: newStatus as "draft" | "live" | "sold" | "rented" | "archived",
//     };
//     if (newStatus === "live" && !listing.published_at) {
//       update.published_at = new Date().toISOString();
//       update.expires_at   = new Date(Date.now() + 90 * 86400000).toISOString();
//     }

//     const { error } = await supabase
//       .from("properties")
//       .update(update)
//       .eq("id", listing.id);

//     setSaving(false);
//     if (!error) onUpdate(listing.id, newStatus);
//   }

//   const cfg = ALL_STATUS_CFG[listing.status] ?? ALL_STATUS_CFG["draft"];

//   if (isReadOnly) {
//     return (
//       <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.cls}`}>
//         <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
//         {cfg.label}
//       </span>
//     );
//   }

//   return (
//     <div ref={ref} className="relative">
//       <button onClick={() => setOpen(o => !o)} disabled={saving}
//         className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer hover:opacity-80 ${cfg.cls} ${saving ? "opacity-50" : ""}`}
//       >
//         {saving
//           ? <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
//           : <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
//         }
//         {cfg.label}
//         <svg className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
//         </svg>
//       </button>

//       <AnimatePresence>
//         {open && (
//           <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
//             className="absolute left-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-gray-100 z-[100] overflow-hidden py-1"
//             style={{ boxShadow: "0 8px 24px -4px rgba(0,0,0,0.15)" }}
//           >
//             {AGENT_STATUSES.map(s => (
//               <button key={s.value} onClick={() => handleSelect(s.value)}
//                 className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-50 ${s.value === listing.status ? "bg-gray-50" : ""}`}
//               >
//                 <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${s.cls}`}>
//                   {s.value === listing.status ? "✓ " : ""}{s.label}
//                 </span>
//               </button>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // ── Main Page ─────────────────────────────────────────────────
// export default function AgentListingsPage() {
//   const supabase = createClient();
//   const router   = useRouter();

//   const [listings,     setListings]     = useState<Listing[]>([]);
//   const [loading,      setLoading]      = useState(true);
//   const [page,         setPage]         = useState(0);
//   const [total,        setTotal]        = useState(0);
//   const [filterStatus, setFilterStatus] = useState("");
//   const [search,       setSearch]       = useState("");
//   const [deleting,     setDeleting]     = useState<string | null>(null);
//   const [userId,       setUserId]       = useState("");

//   const [stats, setStats] = useState({
//     total: 0, active: 0, pending: 0, sold: 0,
//     total_views: 0, total_leads: 0, rating: 0,
//   });

//   const loadListings = useCallback(async (pg = 0) => {
//     setLoading(true);
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return;
//     setUserId(user.id);

//     let q = supabase
//       .from("properties")
//       .select(`
//         id, title, slug, category, property_type,
//         price, price_unit, bedrooms, carpet_area, area_unit,
//         status, is_verified, is_featured, is_premium,
//         leads_count, views_count, saved_count,
//         published_at, expires_at, rejection_reason,
//         cities ( name ),
//         localities ( name ),
//         property_media ( url, sort_order, media_type, moderation_status )
//       `, { count: "exact" })
//       .eq("owner_id", user.id)
//       .neq("status", "archived")
//       .order("created_at", { ascending: false })
//       .range(pg * PAGE_SIZE, pg * PAGE_SIZE + PAGE_SIZE - 1);

//     if (filterStatus) {
//       q = q.eq(
//         "status",
//         filterStatus as "archived" | "draft" | "expired" | "live" | "pending_review" | "rejected" | "rented" | "sold",
//       );
//     }

//     const { data, count } = await q;

//     const mapped = (data ?? []).map((p: any) => ({
//       id:             p.id,
//       title:          p.title,
//       slug:           p.slug,
//       category:       p.category,
//       property_type:  p.property_type,
//       price:          p.price,
//       price_unit:     p.price_unit,
//       bedrooms:       p.bedrooms,
//       carpet_area:    p.carpet_area,
//       area_unit:      p.area_unit,
//       status:         p.status,
//       is_verified:    p.is_verified,
//       is_featured:    p.is_featured,
//       is_premium:     p.is_premium,
//       leads_count:    p.leads_count ?? 0,
//       views_count:    p.views_count ?? 0,
//       saved_count:    p.saved_count ?? 0,
//       published_at:   p.published_at,
//       expires_at:     p.expires_at,
//       rejection_reason: p.rejection_reason,
//       city_name:      p.cities?.name ?? "",
//       locality_name:  p.localities?.name ?? null,
//       cover_image:    (p.property_media ?? [])
//         .filter((m: any) => m.media_type === "image" && m.moderation_status === "approved")
//         .sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url ?? null,
//     }));

//     // Search filter client side
//     const filtered = search.trim()
//       ? mapped.filter(l =>
//           l.title.toLowerCase().includes(search.toLowerCase()) ||
//           l.city_name.toLowerCase().includes(search.toLowerCase()) ||
//           (l.locality_name ?? "").toLowerCase().includes(search.toLowerCase())
//         )
//       : mapped;

//     setListings(filtered);
//     setTotal(count ?? 0);

//     // Stats on first load
//     if (pg === 0 && !filterStatus) {
//       const { data: allData } = await supabase
//         .from("properties")
//         .select("status, views_count, leads_count")
//         .eq("owner_id", user.id)
//         .neq("status", "archived");

//       const all = allData ?? [];
//       const { data: apData } = await supabase
//         .from("agent_profiles")
//         .select("rating_avg")
//         .eq("profile_id", user.id)
//         .single();

//       setStats({
//         total:       all.length,
//         active:      all.filter(p => p.status === "live").length,
//         pending:     all.filter(p => p.status === "pending_review").length,
//         sold:        all.filter(p => p.status === "sold" || p.status === "rented").length,
//         total_views: all.reduce((s, p) => s + (p.views_count ?? 0), 0),
//         total_leads: all.reduce((s, p) => s + (p.leads_count ?? 0), 0),
//         rating:      apData?.rating_avg ?? 0,
//       });
//     }
//     setLoading(false);
//   }, [filterStatus, search]);

//   useEffect(() => { setPage(0); loadListings(0); }, [filterStatus, search]);
//   useEffect(() => { loadListings(page); }, [page]);

//   function handleStatusUpdate(id: string, newStatus: string) {
//     setListings(ls => ls.map(l => l.id === id ? { ...l, status: newStatus } : l));
//     setStats(s => {
//       const old = listings.find(l => l.id === id)?.status ?? "";
//       return {
//         ...s,
//         active:  s.active  + (newStatus === "live" ? 1 : 0) - (old === "live" ? 1 : 0),
//         sold:    s.sold    + (["sold","rented"].includes(newStatus) ? 1 : 0) - (["sold","rented"].includes(old) ? 1 : 0),
//         pending: s.pending + (newStatus === "pending_review" ? 1 : 0) - (old === "pending_review" ? 1 : 0),
//       };
//     });
//   }

//   async function handleArchive(id: string) {
//     if (!confirm("Archive this listing? It will be hidden from all searches.")) return;
//     setDeleting(id);
//     await supabase.from("properties").update({ status: "archived" }).eq("id", id);
//     setListings(ls => ls.filter(l => l.id !== id));
//     setStats(s => ({ ...s, total: s.total - 1 }));
//     setDeleting(null);
//   }

//   const totalPages = Math.ceil(total / PAGE_SIZE);

//   return (
//     <div className="space-y-6" style={{ fontFamily: "Poppins, sans-serif" }}>

//       {/* ── Stat cards ─────────────────────────────────── */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         {[
//           { label: "Total Properties", value: stats.total, cls: "text-gray-900",    bg: "bg-gray-50",
//             icon: <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18h13.5m-13.5 0V3a.75.75 0 01.75-.75h12a.75.75 0 01.75.75v18" /></svg> },
//           { label: "Active Now",       value: stats.active,  cls: "text-[#2EAE88]", bg: "bg-green-50",
//             icon: <svg className="w-5 h-5 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
//           { label: "Pending Deals",    value: stats.pending, cls: "text-amber-600", bg: "bg-amber-50",
//             icon: <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
//           { label: "Sold / Rented",    value: stats.sold,    cls: "text-[#1B4FD8]", bg: "bg-blue-50",
//             icon: <svg className="w-5 h-5 text-[#1B4FD8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" /></svg> },
//         ].map((s, i) => (
//           <motion.div key={s.label}
//             initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: i * 0.06 }}
//             className="bg-white rounded-2xl p-5 border border-gray-100"
//             style={{ boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>
//             <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg} mb-3`}>{s.icon}</div>
//             <p className="text-gray-400 text-xs font-medium mb-1">{s.label}</p>
//             <p className={`text-2xl font-bold ${s.cls}`}>{String(s.value).padStart(2, "0")}</p>
//           </motion.div>
//         ))}
//       </div>

//       {/* ── Listings table ─────────────────────────────── */}
//       <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
//         style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}>

//         {/* Toolbar */}
//         <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
//           {/* Search */}
//           <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 flex-1 min-w-[180px] max-w-xs">
//             <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             <input type="text" value={search} onChange={e => setSearch(e.target.value)}
//               placeholder="Search by ID, location or project name…"
//               className="bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none w-full" />
//           </div>

//           <div className="flex items-center gap-2">
//             {/* Status filter */}
//             <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
//               className="bg-gray-100 text-xs text-gray-600 rounded-xl px-3 py-2 outline-none cursor-pointer border-0">
//               <option value="">All Status</option>
//               {Object.entries(ALL_STATUS_CFG).map(([v, c]) => (
//                 <option key={v} value={v}>{c.label}</option>
//               ))}
//             </select>

//             {/* Add new listing → WhatsApp */}
//             <a href="https://wa.me/919999999999?text=Hi, I want to add a new listing on Sastaghar."
//               target="_blank" rel="noopener noreferrer"
//               className="flex items-center gap-1.5 bg-[#2EAE88] hover:bg-[#28996f] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap">
//               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
//               </svg>
//               Add New Listing
//             </a>
//           </div>
//         </div>

//         {/* Column headers — desktop */}
//         <div className="hidden md:grid grid-cols-[2fr_1fr_1.2fr_1fr_0.7fr_1fr] gap-4 px-6 py-3 border-b border-gray-50 bg-gray-50/50">
//           {["Property Details","Type","Price","Status","Leads","Actions"].map(h => (
//             <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
//           ))}
//         </div>

//         {/* Rows */}
//         {loading ? (
//           <div className="divide-y divide-gray-50">
//             {Array.from({ length: 4 }).map((_, i) => (
//               <div key={i} className="px-6 py-4 animate-pulse flex gap-4 items-center">
//                 <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0" />
//                 <div className="flex-1 space-y-2">
//                   <div className="h-3 bg-gray-200 rounded w-2/3" />
//                   <div className="h-2.5 bg-gray-100 rounded w-1/3" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : listings.length === 0 ? (
//           <div className="p-14 text-center">
//             <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
//               <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m2.25-18h13.5m-13.5 0V3a.75.75 0 01.75-.75h12a.75.75 0 01.75.75v18" />
//               </svg>
//             </div>
//             <p className="text-gray-500 font-semibold mb-1">No listings found</p>
//             <p className="text-gray-400 text-sm mb-4">
//               {filterStatus ? `No properties with status "${ALL_STATUS_CFG[filterStatus]?.label ?? filterStatus}"` : "You haven't added any listings yet."}
//             </p>
//             {filterStatus
//               ? <button onClick={() => setFilterStatus("")} className="text-xs text-[#1B4FD8] hover:underline underline-offset-4">Clear filter</button>
//               : <a href="https://wa.me/919999999999?text=Hi, I want to add a new listing on Sastaghar."
//                   target="_blank" rel="noopener noreferrer"
//                   className="inline-flex items-center gap-1.5 bg-[#2EAE88] text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
//                   + Add Your First Listing
//                 </a>
//             }
//           </div>
//         ) : (
//           <div className="divide-y divide-gray-50">
//             <AnimatePresence mode="popLayout">
//               {listings.map((listing, i) => {
//                 const days     = daysLeft(listing.expires_at);
//                 const isExpiry = days !== null && days <= 10 && listing.status === "live";

//                 return (
//                   <motion.div key={listing.id}
//                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
//                     transition={{ delay: i * 0.03 }}
//                     className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1.2fr_1fr_0.7fr_1fr] gap-3 md:gap-4 items-center px-5 md:px-6 py-4 hover:bg-gray-50/60 transition-colors"
//                   >
//                     {/* Property details */}
//                     <div className="flex items-center gap-3 min-w-0">
//                       {/* Cover thumbnail */}
//                       <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
//                         {listing.cover_image ? (
//                           <Image src={listing.cover_image} alt={listing.title} fill
//                             sizes="56px" className="object-cover" />
//                         ) : (
//                           <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
//                             <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m2.25-18h13.5" />
//                             </svg>
//                           </div>
//                         )}
//                         {/* Badges */}
//                         {listing.status === "live" && (
//                           <div className="absolute top-1 left-1">
//                             <span className="text-[7px] font-black px-1 py-0.5 rounded bg-[#2EAE88] text-white">LIVE</span>
//                           </div>
//                         )}
//                         {listing.is_featured && (
//                           <div className="absolute top-1 right-1">
//                             <span className="text-[7px] font-black px-1 py-0.5 rounded bg-amber-500 text-white">★</span>
//                           </div>
//                         )}
//                       </div>

//                       <div className="min-w-0 flex-1">
//                         <Link href={`/property/${listing.slug}`} target="_blank"
//                           className="text-gray-900 text-sm font-semibold hover:text-[#1B4FD8] transition-colors line-clamp-1">
//                           {listing.title}
//                           {listing.bedrooms && ` - ${listing.bedrooms}BHK`}
//                         </Link>
//                         <p className="text-gray-400 text-[10px] mt-0.5 flex items-center gap-1 truncate">
//                           <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
//                           </svg>
//                           {listing.locality_name ? `${listing.locality_name}, ` : ""}{listing.city_name}
//                         </p>
//                         {/* Expiry warning */}
//                         {isExpiry && (
//                           <p className="text-amber-500 text-[9px] font-semibold mt-0.5">
//                             ⚠ Expires in {days} day{days === 1 ? "" : "s"}
//                           </p>
//                         )}
//                         {/* Rejection reason */}
//                         {listing.status === "rejected" && listing.rejection_reason && (
//                           <p className="text-red-400 text-[9px] mt-0.5 truncate" title={listing.rejection_reason}>
//                             Reason: {listing.rejection_reason}
//                           </p>
//                         )}
//                         {/* Verified badge */}
//                         {listing.is_verified && (
//                           <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-[#2EAE88] mt-0.5">
//                             <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
//                               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" />
//                             </svg>
//                             Verified
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     {/* Type */}
//                     <div className="md:pl-0 pl-[68px]">
//                       <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wide">
//                         {TYPE_LABEL[listing.category] ?? listing.category}
//                       </span>
//                     </div>

//                     {/* Price */}
//                     <div className="md:pl-0 pl-[68px]">
//                       <p className="text-gray-900 text-sm font-bold">
//                         {fmtPrice(listing.price, listing.price_unit)}
//                       </p>
//                       {listing.carpet_area && (
//                         <p className="text-gray-400 text-[10px] mt-0.5">
//                           ₹{Math.round(listing.price / listing.carpet_area).toLocaleString("en-IN")}/{listing.area_unit}
//                         </p>
//                       )}
//                     </div>

//                     {/* Status */}
//                     <div className="md:pl-0 pl-[68px]">
//                       <StatusDropdown listing={listing} onUpdate={handleStatusUpdate} />
//                     </div>

//                     {/* Leads */}
//                     <div className="md:pl-0 pl-[68px] flex flex-col gap-1">
//                       <div className="flex items-center gap-1 text-gray-700 text-sm font-bold">
//                         {listing.leads_count}
//                         {listing.leads_count > 0 && (
//                           <Link href="/agent/leads"
//                             className="text-[9px] font-bold text-[#1B4FD8] hover:underline underline-offset-2">
//                             →
//                           </Link>
//                         )}
//                       </div>
//                       <p className="text-gray-400 text-[9px]">{listing.views_count} views</p>
//                     </div>

//                     {/* Actions */}
//                     <div className="md:pl-0 pl-[68px] flex items-center gap-1.5">
//                       {/* View */}
//                       <Link href={`/property/${listing.slug}`} target="_blank"
//                         className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#EEF2FF] hover:text-[#1B4FD8] text-gray-500 flex items-center justify-center transition-colors"
//                         title="View listing">
//                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                         </svg>
//                       </Link>

//                       {/* Edit → WhatsApp (listing edit coming soon) */}
//                       <a href={`https://wa.me/919999999999?text=I want to edit my listing: ${listing.title} (ID: ${listing.id})`}
//                         target="_blank" rel="noopener noreferrer"
//                         className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#EEF2FF] hover:text-[#1B4FD8] text-gray-500 flex items-center justify-center transition-colors"
//                         title="Edit listing (via WhatsApp)">
//                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
//                         </svg>
//                       </a>

//                       {/* Archive */}
//                       <button onClick={() => handleArchive(listing.id)}
//                         disabled={deleting === listing.id}
//                         className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 flex items-center justify-center transition-colors disabled:opacity-40"
//                         title="Archive listing">
//                         {deleting === listing.id ? (
//                           <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
//                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
//                           </svg>
//                         ) : (
//                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
//                           </svg>
//                         )}
//                       </button>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </AnimatePresence>
//           </div>
//         )}

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-wrap gap-3">
//             <p className="text-xs text-gray-400">
//               Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total} properties
//             </p>
//             <div className="flex items-center gap-1.5">
//               <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
//                 className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
//                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.75 19.5L8.25 12l7.5-7.5" />
//                 </svg>
//               </button>
//               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                 const pg = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
//                 return (
//                   <button key={pg} onClick={() => setPage(pg)}
//                     className={`w-8 h-8 rounded-xl text-xs font-semibold transition-colors ${
//                       pg === page ? "bg-[#1B4FD8] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
//                     }`}>
//                     {pg + 1}
//                   </button>
//                 );
//               })}
//               <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
//                 className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
//                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Performance analytics + Boost card ─────────── */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

//         {/* Analytics */}
//         <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6"
//           style={{ boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>
//           <h3 className="text-gray-900 font-bold text-base mb-1">Performance Analytics</h3>
//           <p className="text-gray-400 text-xs mb-5">
//             Your listings have received views and inquiries. Boost your top property to close deals faster.
//           </p>
//           <div className="grid grid-cols-3 gap-4">
//             {[
//               {
//                 label: "Views", value: stats.total_views >= 1000 ? `${(stats.total_views/1000).toFixed(1)}k` : String(stats.total_views),
//                 icon: <svg className="w-4 h-4 text-[#1B4FD8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
//                 cls: "text-[#1B4FD8]",
//               },
//               {
//                 label: "Inquiries", value: String(stats.total_leads),
//                 icon: <svg className="w-4 h-4 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>,
//                 cls: "text-[#2EAE88]",
//               },
//               {
//                 label: "Rating", value: stats.rating > 0 ? `${stats.rating.toFixed(1)}/5` : "N/A",
//                 icon: <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
//                 cls: "text-amber-500",
//               },
//             ].map(m => (
//               <div key={m.label} className="text-center">
//                 <div className="flex justify-center mb-2">{m.icon}</div>
//                 <p className={`text-xl font-bold ${m.cls}`}>{m.value}</p>
//                 <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wide mt-0.5">{m.label}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Boost card — Coming soon */}
//         <div className="bg-gradient-to-br from-[#2EAE88] to-[#1d8a6a] rounded-2xl p-6 text-white relative overflow-hidden">
//           <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
//           <div className="absolute -bottom-6 left-0 w-16 h-16 rounded-full bg-white/5" />
//           <div className="relative">
//             <span className="text-[9px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
//               Agent Exclusive
//             </span>
//             <h3 className="text-white font-bold text-lg mt-3 mb-2">Boost Your Reach</h3>
//             <p className="text-white/70 text-xs leading-relaxed mb-5">
//               Get 5x more leads with Featured Listing slots. Activate now and appear on the homepage.
//             </p>
//             <button
//               onClick={() => alert("Premium packages coming soon! We'll notify you when available.")}
//               className="w-full bg-white text-[#1d8a6a] font-bold text-xs py-2.5 rounded-xl transition-all hover:bg-white/90">
//               Upgrade Package
//             </button>
//             <p className="text-white/50 text-[9px] text-center mt-2">
//               Currently not available · Coming soon
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

// app/agent/listings/page.tsx
// Agent listings management page.
// Shows all properties owned by this agent with:
// - Stats: total, active, pending, sold
// - Table: image, title, type, price, status dropdown, leads, actions
// - Status can be updated inline (draft/live/sold/rented/archived)
// - Performance analytics section at bottom
// - Pagination 10 per page

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter }                                from "next/navigation";
import Link                                         from "next/link";
import Image                                        from "next/image";
import { motion, AnimatePresence }                  from "framer-motion";
import { createClient }                             from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────
interface Listing {
  id:             string;
  title:          string;
  slug:           string;
  category:       string;
  property_type:  string;
  price:          number;
  price_unit:     string;
  bedrooms:       number | null;
  carpet_area:    number | null;
  area_unit:      string;
  status:         string;
  is_verified:    boolean;
  is_featured:    boolean;
  is_premium:     boolean;
  leads_count:    number;
  views_count:    number;
  saved_count:    number;
  published_at:   string | null;
  expires_at:     string | null;
  city_name:      string;
  locality_name:  string | null;
  cover_image:    string | null;
  rejection_reason: string | null;
}

// ── Constants ─────────────────────────────────────────────────
// Only statuses agent can set (admin sets pending_review/rejected)
const AGENT_STATUSES = [
  { value: "draft",    label: "Draft",    cls: "bg-gray-100 text-gray-500"           },
  { value: "live",     label: "Active",   cls: "bg-[#2EAE88]/10 text-[#2EAE88]"     },
  { value: "sold",     label: "Sold",     cls: "bg-blue-100 text-blue-700"           },
  { value: "rented",   label: "Rented",   cls: "bg-purple-100 text-purple-700"       },
  { value: "archived", label: "Archived", cls: "bg-red-100 text-red-500"             },
];

// Read-only statuses (set by admin)
const ALL_STATUS_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  draft:          { label: "Draft",           cls: "bg-gray-100 text-gray-500",           dot: "bg-gray-400"    },
  pending_review: { label: "Pending",         cls: "bg-amber-100 text-amber-700",         dot: "bg-amber-500"   },
  live:           { label: "Active",          cls: "bg-[#2EAE88]/10 text-[#2EAE88]",     dot: "bg-[#2EAE88]"   },
  rejected:       { label: "Rejected",        cls: "bg-red-100 text-red-600",             dot: "bg-red-500"     },
  sold:           { label: "Sold",            cls: "bg-blue-100 text-blue-700",           dot: "bg-blue-500"    },
  rented:         { label: "Rented",          cls: "bg-purple-100 text-purple-700",       dot: "bg-purple-500"  },
  expired:        { label: "Expired",         cls: "bg-orange-100 text-orange-600",       dot: "bg-orange-500"  },
  archived:       { label: "Archived",        cls: "bg-red-100 text-red-500",             dot: "bg-red-400"     },
};

const TYPE_LABEL: Record<string, string> = {
  buy: "Residential", sell: "Residential", rent: "Rental",
  commercial: "Commercial", plot_land: "Plots", project: "Project", pg_coliving: "PG",
};

const PAGE_SIZE = 10;

// ── Helpers ───────────────────────────────────────────────────
function fmtPrice(price: number, unit: string) {
  const s = unit === "per_month" ? "/mo" : "";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr${s}`;
  if (price >= 100000)   return `₹${(price / 100000).toFixed(1)}L${s}`;
  return `₹${price.toLocaleString("en-IN")}${s}`;
}

function daysLeft(expires_at: string | null) {
  if (!expires_at) return null;
  const diff = new Date(expires_at).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / 86400000);
}

// ── Status dropdown ───────────────────────────────────────────
function StatusDropdown({
  listing, onUpdate,
}: {
  listing: Listing;
  onUpdate: (id: string, status: string) => void;
}) {
  const [open,   setOpen]   = useState(false);
  const [saving, setSaving] = useState(false);
  const ref      = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Admin-set statuses can't be changed by agent
  const isReadOnly = ["pending_review","rejected","expired"].includes(listing.status);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSelect(newStatus: string) {
    if (newStatus === listing.status) { setOpen(false); return; }
    setSaving(true);
    setOpen(false);

    const update: { status: any; published_at?: string; expires_at?: string } = {
      status: newStatus as any,
    };
    if (newStatus === "live" && !listing.published_at) {
      update.published_at = new Date().toISOString();
      update.expires_at   = new Date(Date.now() + 90 * 86400000).toISOString();
    }

    const { error } = await supabase
      .from("properties")
      .update(update)
      .eq("id", listing.id);

    setSaving(false);
    if (!error) onUpdate(listing.id, newStatus);
  }

  const cfg = ALL_STATUS_CFG[listing.status] ?? ALL_STATUS_CFG["draft"];

  if (isReadOnly) {
    return (
      <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} disabled={saving}
        className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer hover:opacity-80 ${cfg.cls} ${saving ? "opacity-50" : ""}`}
      >
        {saving
          ? <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          : <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        }
        {cfg.label}
        <svg className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-gray-100 z-[100] overflow-hidden py-1"
            style={{ boxShadow: "0 8px 24px -4px rgba(0,0,0,0.15)" }}
          >
            {AGENT_STATUSES.map(s => (
              <button key={s.value} onClick={() => handleSelect(s.value)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-50 ${s.value === listing.status ? "bg-gray-50" : ""}`}
              >
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${s.cls}`}>
                  {s.value === listing.status ? "✓ " : ""}{s.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AgentListingsPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [listings,     setListings]     = useState<Listing[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(0);
  const [total,        setTotal]        = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [search,       setSearch]       = useState("");
  const [deleting,     setDeleting]     = useState<string | null>(null);
  const [userId,       setUserId]       = useState("");

  const [stats, setStats] = useState({
    total: 0, active: 0, pending: 0, sold: 0,
    total_views: 0, total_leads: 0, rating: 0,
  });
  const [creditInfo, setCreditInfo] = useState({
    can_publish: true,
    active:      0,
    max:         3,
    plan_name:   "Free",
    plan_slug:   "free",
  });

  const loadListings = useCallback(async (pg = 0) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    let q = supabase
      .from("properties")
      .select(`
        id, title, slug, category, property_type,
        price, price_unit, bedrooms, carpet_area, area_unit,
        status, is_verified, is_featured, is_premium,
        leads_count, views_count, saved_count,
        published_at, expires_at, rejection_reason,
        cities ( name ),
        localities ( name ),
        property_media ( url, sort_order, media_type, moderation_status )
      `, { count: "exact" })
      .eq("owner_id", user.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .range(pg * PAGE_SIZE, pg * PAGE_SIZE + PAGE_SIZE - 1);

    if (filterStatus) {
      q = q.eq(
        "status",
        filterStatus as "archived" | "draft" | "expired" | "live" | "pending_review" | "rejected" | "rented" | "sold",
      );
    }

    const { data, count } = await q;

    const mapped = (data ?? []).map((p: any) => ({
      id:             p.id,
      title:          p.title,
      slug:           p.slug,
      category:       p.category,
      property_type:  p.property_type,
      price:          p.price,
      price_unit:     p.price_unit,
      bedrooms:       p.bedrooms,
      carpet_area:    p.carpet_area,
      area_unit:      p.area_unit,
      status:         p.status,
      is_verified:    p.is_verified,
      is_featured:    p.is_featured,
      is_premium:     p.is_premium,
      leads_count:    p.leads_count ?? 0,
      views_count:    p.views_count ?? 0,
      saved_count:    p.saved_count ?? 0,
      published_at:   p.published_at,
      expires_at:     p.expires_at,
      rejection_reason: p.rejection_reason,
      city_name:      p.cities?.name ?? "",
      locality_name:  p.localities?.name ?? null,
      cover_image:    (p.property_media ?? [])
        .filter((m: any) => m.media_type === "image" && m.moderation_status === "approved")
        .sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url ?? null,
    }));

    // Search filter client side
    const filtered = search.trim()
      ? mapped.filter(l =>
          l.title.toLowerCase().includes(search.toLowerCase()) ||
          l.city_name.toLowerCase().includes(search.toLowerCase()) ||
          (l.locality_name ?? "").toLowerCase().includes(search.toLowerCase())
        )
      : mapped;

    setListings(filtered);
    setTotal(count ?? 0);

    // Stats on first load
    if (pg === 0 && !filterStatus) {
      const { data: allData } = await supabase
        .from("properties")
        .select("status, views_count, leads_count")
        .eq("owner_id", user.id)
        .neq("status", "archived");

      const all = allData ?? [];
      const { data: apData } = await supabase
        .from("agent_profiles")
        .select("rating_avg")
        .eq("profile_id", user.id)
        .single();

      setStats({
        total:       all.length,
        active:      all.filter(p => p.status === "live").length,
        pending:     all.filter(p => p.status === "pending_review").length,
        sold:        all.filter(p => p.status === "sold" || p.status === "rented").length,
        total_views: all.reduce((s, p) => s + (p.views_count ?? 0), 0),
        total_leads: all.reduce((s, p) => s + (p.leads_count ?? 0), 0),
        rating:      apData?.rating_avg ?? 0,
      });

      // Check listing credit limit via RPC
      const { data: creditData } = await supabase.rpc("can_agent_publish_listing", {
        p_agent_user_id: user.id,
      });
      if (creditData) {
        const credit = creditData as {
          can_publish?: boolean;
          active?: number;
          max?: number;
          plan_name?: string;
          plan_slug?: string;
        };
        setCreditInfo({
          can_publish : credit.can_publish ?? true ,
          active:      credit.active      ?? 0,
          max:         credit.max         ?? 3,
          plan_name:   credit.plan_name   ?? "Free",
          plan_slug:   credit.plan_slug   ?? "free",
        });
      }
    }
    setLoading(false);
  }, [filterStatus, search]);

  useEffect(() => { setPage(0); loadListings(0); }, [filterStatus, search]);
  useEffect(() => { loadListings(page); }, [page]);

  function handleStatusUpdate(id: string, newStatus: string) {
    setListings(ls => ls.map(l => l.id === id ? { ...l, status: newStatus } : l));
    setStats(s => {
      const old = listings.find(l => l.id === id)?.status ?? "";
      return {
        ...s,
        active:  s.active  + (newStatus === "live" ? 1 : 0) - (old === "live" ? 1 : 0),
        sold:    s.sold    + (["sold","rented"].includes(newStatus) ? 1 : 0) - (["sold","rented"].includes(old) ? 1 : 0),
        pending: s.pending + (newStatus === "pending_review" ? 1 : 0) - (old === "pending_review" ? 1 : 0),
      };
    });
  }

  async function handleArchive(id: string) {
    if (!confirm("Archive this listing? It will be hidden from all searches.")) return;
    setDeleting(id);
    await supabase.from("properties").update({ status: "archived" }).eq("id", id);
    setListings(ls => ls.filter(l => l.id !== id));
    setStats(s => ({ ...s, total: s.total - 1 }));
    setDeleting(null);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6" style={{ fontFamily: "Poppins, sans-serif" }}>

      {/* ── Stat cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Properties", value: stats.total, cls: "text-gray-900",    bg: "bg-gray-50",
            icon: <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18h13.5m-13.5 0V3a.75.75 0 01.75-.75h12a.75.75 0 01.75.75v18" /></svg> },
          { label: "Active Now",       value: stats.active,  cls: "text-[#2EAE88]", bg: "bg-green-50",
            icon: <svg className="w-5 h-5 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { label: "Pending Deals",    value: stats.pending, cls: "text-amber-600", bg: "bg-amber-50",
            icon: <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { label: "Sold / Rented",    value: stats.sold,    cls: "text-[#1B4FD8]", bg: "bg-blue-50",
            icon: <svg className="w-5 h-5 text-[#1B4FD8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" /></svg> },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-5 border border-gray-100"
            style={{ boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg} mb-3`}>{s.icon}</div>
            <p className="text-gray-400 text-xs font-medium mb-1">{s.label}</p>
            {s.label === "Active Now" ? (
            <p className={`text-2xl font-bold ${s.cls}`}>
              {String(s.value).padStart(2,"0")}
              <span className="text-base text-gray-300 font-normal">/{creditInfo.max}</span>
            </p>
          ) : (
            <p className={`text-2xl font-bold ${s.cls}`}>{String(s.value).padStart(2, "0")}</p>
          )}
          </motion.div>
        ))}
      </div>

      {/* ── Credit limit banner ────────────────────────── */}
      {!creditInfo.can_publish && (
        <div id="credit-limit-banner"
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-amber-800 font-bold text-sm">
              Active Listing Limit Reached — {creditInfo.active}/{creditInfo.max} listings used
            </p>
            <p className="text-amber-600 text-xs mt-0.5 leading-relaxed">
              Your <strong>{creditInfo.plan_name}</strong> plan allows up to <strong>{creditInfo.max} active listings</strong>.
              To add more, archive an existing listing or upgrade your plan.
              New listings will be saved as <strong>Draft</strong> and cannot go live until you free up a slot.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                alert("Premium plans coming soon! We'll notify you when upgrades are available.");
              }}
              className="flex items-center gap-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap">
              Upgrade Plan
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Listings table ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 flex-1 min-w-[180px] max-w-xs">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID, location or project name…"
              className="bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none w-full" />
          </div>

          <div className="flex items-center gap-2">
            {/* Status filter */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="bg-gray-100 text-xs text-gray-600 rounded-xl px-3 py-2 outline-none cursor-pointer border-0">
              <option value="">All Status</option>
              {Object.entries(ALL_STATUS_CFG).map(([v, c]) => (
                <option key={v} value={v}>{c.label}</option>
              ))}
            </select>

            {/* Add new listing — gated by credit limit */}
            {creditInfo.can_publish ? (
              <button
                onClick={() => router.push("/agent/listings/new")}
                className="flex items-center gap-1.5 bg-[#2EAE88] hover:bg-[#28996f] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add New Listing
              </button>
            ) : (
              <button
                onClick={() => {
                  const el = document.getElementById("credit-limit-banner");
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="flex items-center gap-1.5 bg-gray-200 text-gray-500 font-semibold text-xs px-4 py-2.5 rounded-xl cursor-not-allowed whitespace-nowrap"
                title="Listing limit reached">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Limit Reached
              </button>
            )}
          </div>
        </div>

        {/* Column headers — desktop */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1.2fr_1fr_0.7fr_1fr] gap-4 px-6 py-3 border-b border-gray-50 bg-gray-50/50">
          {["Property Details","Type","Price","Status","Leads","Actions"].map(h => (
            <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse flex gap-4 items-center">
                <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m2.25-18h13.5m-13.5 0V3a.75.75 0 01.75-.75h12a.75.75 0 01.75.75v18" />
              </svg>
            </div>
            <p className="text-gray-500 font-semibold mb-1">No listings found</p>
            <p className="text-gray-400 text-sm mb-4">
              {filterStatus ? `No properties with status "${ALL_STATUS_CFG[filterStatus]?.label ?? filterStatus}"` : "You haven't added any listings yet."}
            </p>
            {filterStatus
              ? <button onClick={() => setFilterStatus("")} className="text-xs text-[#1B4FD8] hover:underline underline-offset-4">Clear filter</button>
              : creditInfo.can_publish
                ? <button
                    onClick={() => router.push("/agent/listings/new")}
                    className="inline-flex items-center gap-1.5 bg-[#2EAE88] hover:bg-[#28996f] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                    + Add Your First Listing
                  </button>
                : <p className="text-amber-600 text-sm font-medium mt-1">
                    Listing limit reached. Archive an existing listing to add more.
                  </p>
            }
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {listings.map((listing, i) => {
                const days     = daysLeft(listing.expires_at);
                const isExpiry = days !== null && days <= 10 && listing.status === "live";

                return (
                  <motion.div key={listing.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1.2fr_1fr_0.7fr_1fr] gap-3 md:gap-4 items-center px-5 md:px-6 py-4 hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Property details */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Cover thumbnail */}
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {listing.cover_image ? (
                          <Image src={listing.cover_image} alt={listing.title} fill
                            sizes="56px" className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m2.25-18h13.5" />
                            </svg>
                          </div>
                        )}
                        {/* Badges */}
                        {listing.status === "live" && (
                          <div className="absolute top-1 left-1">
                            <span className="text-[7px] font-black px-1 py-0.5 rounded bg-[#2EAE88] text-white">LIVE</span>
                          </div>
                        )}
                        {listing.is_featured && (
                          <div className="absolute top-1 right-1">
                            <span className="text-[7px] font-black px-1 py-0.5 rounded bg-amber-500 text-white">★</span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link href={`/property/${listing.slug}`} target="_blank"
                          className="text-gray-900 text-sm font-semibold hover:text-[#1B4FD8] transition-colors line-clamp-1">
                          {listing.title}
                          {listing.bedrooms && ` - ${listing.bedrooms}BHK`}
                        </Link>
                        <p className="text-gray-400 text-[10px] mt-0.5 flex items-center gap-1 truncate">
                          <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                          </svg>
                          {listing.locality_name ? `${listing.locality_name}, ` : ""}{listing.city_name}
                        </p>
                        {/* Expiry warning */}
                        {isExpiry && (
                          <p className="text-amber-500 text-[9px] font-semibold mt-0.5">
                            ⚠ Expires in {days} day{days === 1 ? "" : "s"}
                          </p>
                        )}
                        {/* Rejection reason */}
                        {listing.status === "rejected" && listing.rejection_reason && (
                          <p className="text-red-400 text-[9px] mt-0.5 truncate" title={listing.rejection_reason}>
                            Reason: {listing.rejection_reason}
                          </p>
                        )}
                        {/* Verified badge */}
                        {listing.is_verified && (
                          <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-[#2EAE88] mt-0.5">
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" />
                            </svg>
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Type */}
                    <div className="md:pl-0 pl-[68px]">
                      <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wide">
                        {TYPE_LABEL[listing.category] ?? listing.category}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="md:pl-0 pl-[68px]">
                      <p className="text-gray-900 text-sm font-bold">
                        {fmtPrice(listing.price, listing.price_unit)}
                      </p>
                      {listing.carpet_area && (
                        <p className="text-gray-400 text-[10px] mt-0.5">
                          ₹{Math.round(listing.price / listing.carpet_area).toLocaleString("en-IN")}/{listing.area_unit}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="md:pl-0 pl-[68px]">
                      <StatusDropdown listing={listing} onUpdate={handleStatusUpdate} />
                    </div>

                    {/* Leads */}
                    <div className="md:pl-0 pl-[68px] flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-gray-700 text-sm font-bold">
                        {listing.leads_count}
                        {listing.leads_count > 0 && (
                          <Link href="/agent/leads"
                            className="text-[9px] font-bold text-[#1B4FD8] hover:underline underline-offset-2">
                            →
                          </Link>
                        )}
                      </div>
                      <p className="text-gray-400 text-[9px]">{listing.views_count} views</p>
                    </div>

                    {/* Actions */}
                    <div className="md:pl-0 pl-[68px] flex items-center gap-1.5">
                      {/* View */}
                      <Link href={`/property/${listing.slug}`} target="_blank"
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#EEF2FF] hover:text-[#1B4FD8] text-gray-500 flex items-center justify-center transition-colors"
                        title="View listing">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </Link>

                      {/* Edit → /agent/listings/{id}/edit */}
                      <button
                        onClick={() => router.push(`/agent/listings/${listing.id}/edit`)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#EEF2FF] hover:text-[#1B4FD8] text-gray-500 flex items-center justify-center transition-colors"
                        title="Edit listing">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>

                      {/* Archive */}
                      <button onClick={() => handleArchive(listing.id)}
                        disabled={deleting === listing.id}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 flex items-center justify-center transition-colors disabled:opacity-40"
                        title="Archive listing">
                        {deleting === listing.id ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-wrap gap-3">
            <p className="text-xs text-gray-400">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total} properties
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-xl text-xs font-semibold transition-colors ${
                      pg === page ? "bg-[#1B4FD8] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}>
                    {pg + 1}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Performance analytics + Boost card ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Analytics */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6"
          style={{ boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>
          <h3 className="text-gray-900 font-bold text-base mb-1">Performance Analytics</h3>
          <p className="text-gray-400 text-xs mb-5">
            Your listings have received views and inquiries. Boost your top property to close deals faster.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Views", value: stats.total_views >= 1000 ? `${(stats.total_views/1000).toFixed(1)}k` : String(stats.total_views),
                icon: <svg className="w-4 h-4 text-[#1B4FD8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
                cls: "text-[#1B4FD8]",
              },
              {
                label: "Inquiries", value: String(stats.total_leads),
                icon: <svg className="w-4 h-4 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>,
                cls: "text-[#2EAE88]",
              },
              {
                label: "Rating", value: stats.rating > 0 ? `${stats.rating.toFixed(1)}/5` : "N/A",
                icon: <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
                cls: "text-amber-500",
              },
            ].map(m => (
              <div key={m.label} className="text-center">
                <div className="flex justify-center mb-2">{m.icon}</div>
                <p className={`text-xl font-bold ${m.cls}`}>{m.value}</p>
                <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wide mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Boost card — Coming soon */}
        <div className="bg-gradient-to-br from-[#2EAE88] to-[#1d8a6a] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 left-0 w-16 h-16 rounded-full bg-white/5" />
          <div className="relative">
            <span className="text-[9px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
              Agent Exclusive
            </span>
            <h3 className="text-white font-bold text-lg mt-3 mb-2">Boost Your Reach</h3>
            <p className="text-white/70 text-xs leading-relaxed mb-5">
              Get 5x more leads with Featured Listing slots. Activate now and appear on the homepage.
            </p>
            <button
              onClick={() => alert("Premium packages coming soon! We'll notify you when available.")}
              className="w-full bg-white text-[#1d8a6a] font-bold text-xs py-2.5 rounded-xl transition-all hover:bg-white/90">
              Upgrade Package
            </button>
            <p className="text-white/50 text-[9px] text-center mt-2">
              Currently not available · Coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}