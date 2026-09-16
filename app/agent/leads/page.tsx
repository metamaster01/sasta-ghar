// "use client";

// // app/agent/leads/page.tsx
// // Full leads management page for agents.
// // - Stats: total, converted, negotiating, new
// // - Table: lead info, property, status dropdown, timestamp, quick actions
// // - Status updates: lead_assignments.agent_status in Supabase
// // - Quick actions: Call (tel:), WhatsApp / Email dropdown
// // - Pagination: 10 per page

// import { useState, useEffect, useCallback, useRef } from "react";
// import { motion, AnimatePresence }                  from "framer-motion";
// import Link                                         from "next/link";
// import { createClient }                             from "@/lib/supabase/client";

// // ── Types ─────────────────────────────────────────────────────
// interface LeadRow {
//   id:              string;  // lead_assignments.id
//   lead_id:         string;
//   created_at:      string;
//   visitor_name:    string;
//   visitor_phone:   string;
//   visitor_email:   string | null;
//   intent:          string;
//   message:         string | null;
//   wants_loan:      boolean;
//   agent_status:    string;  // from lead_assignments
//   assignment_id:   string;  // lead_assignments.id
//   property_title:  string;
//   property_slug:   string;
//   property_locality:string | null;
//   property_city:   string;
// }

// // ── Agent status options (from DB check constraint) ───────────
// const AGENT_STATUSES = [
//   { value: "pending",        label: "Pending",        cls: "bg-gray-100 text-gray-500"          },
//   { value: "viewed",         label: "Viewed",          cls: "bg-blue-100 text-blue-700"         },
//   { value: "contacted",      label: "Contacted",       cls: "bg-purple-100 text-purple-700"     },
//   { value: "visit_scheduled",label: "Visit Scheduled", cls: "bg-indigo-100 text-indigo-700"    },
//   { value: "negotiating",    label: "Negotiating",     cls: "bg-amber-100 text-amber-700"       },
//   { value: "converted",      label: "Converted ✓",     cls: "bg-[#2EAE88]/10 text-[#2EAE88]"   },
//   { value: "not_interested", label: "Not Interested",  cls: "bg-red-100 text-red-500"           },
//   { value: "lost",           label: "Lost",            cls: "bg-red-100 text-red-700"           },
// ];

// const STATUS_MAP = Object.fromEntries(AGENT_STATUSES.map(s => [s.value, s]));

// // ── Helpers ───────────────────────────────────────────────────
// function timeAgo(d: string) {
//   const diff  = Date.now() - new Date(d).getTime();
//   const mins  = Math.floor(diff / 60000);
//   const hours = Math.floor(diff / 3600000);
//   const days  = Math.floor(diff / 86400000);
//   if (mins < 1)    return "just now";
//   if (mins < 60)   return `${mins}m ago`;
//   if (hours < 24)  return `${hours}h ago`;
//   if (days < 7)    return `${days}d ago`;
//   return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
// }

// function getInitials(name: string) {
//   return name.split(" ").filter(Boolean).slice(0, 2)
//     .map(n => n[0].toUpperCase()).join("");
// }

// const AVATAR_COLORS = [
//   "bg-blue-100 text-blue-700",
//   "bg-purple-100 text-purple-700",
//   "bg-amber-100 text-amber-700",
//   "bg-green-100 text-green-700",
//   "bg-red-100 text-red-600",
//   "bg-indigo-100 text-indigo-700",
// ];

// const INTENT_LABEL: Record<string, string> = {
//   contact_owner:    "Contact",
//   schedule_visit:   "Visit Request",
//   callback_request: "Callback",
//   loan_inquiry:     "Loan Inquiry",
//   price_negotiation:"Negotiation",
//   project_brochure: "Brochure",
// };

// const PAGE_SIZE = 10;

// // ── Status dropdown ───────────────────────────────────────────
// function StatusDropdown({
//   leadId, assignmentId, currentStatus, onUpdate,
// }: {
//   leadId: string;
//   assignmentId: string;
//   currentStatus: string;
//   onUpdate: (assignmentId: string, newStatus: string) => void;
// }) {
//   const [open,    setOpen]    = useState(false);
//   const [saving,  setSaving]  = useState(false);
//   const ref = useRef<HTMLDivElement>(null);
//   const supabase = createClient();

//   useEffect(() => {
//     function handler(e: MouseEvent) {
//       if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
//     }
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   async function handleSelect(newStatus: string) {
//     if (newStatus === currentStatus) { setOpen(false); return; }
//     setSaving(true);
//     setOpen(false);

//     const update: {
//       agent_status: string;
//       contacted_at?: string;
//       converted_at?: string;
//     } = { agent_status: newStatus };
//     if (newStatus === "contacted")      update.contacted_at  = new Date().toISOString();
//     if (newStatus === "converted")      update.converted_at  = new Date().toISOString();

//     const { error } = await supabase
//       .from("lead_assignments")
//       .update(update)
//       .eq("id", assignmentId);

//     // If converted — increment agent's total_leads_converted counter
//     if (!error && newStatus === "converted") {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         await supabase.rpc("increment_converted_leads", { p_agent_user_id: user.id });
//       }
//     }

//     setSaving(false);
//     if (!error) onUpdate(assignmentId, newStatus);
//   }

//   const cfg = STATUS_MAP[currentStatus] ?? AGENT_STATUSES[0];

//   return (
//     <div ref={ref} className="relative">
//       <button
//         onClick={() => setOpen(o => !o)}
//         disabled={saving}
//         className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${cfg.cls} ${saving ? "opacity-50" : "hover:opacity-80 cursor-pointer"}`}
//       >
//         {saving ? (
//           <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
//           </svg>
//         ) : null}
//         {cfg.label}
//         <svg className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
//         </svg>
//       </button>

//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ opacity: 0, y: -6, scale: 0.97 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: -4 }}
//             transition={{ duration: 0.15 }}
//             className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-[100] overflow-hidden py-1"
//             style={{ boxShadow: "0 8px 24px -4px rgba(0,0,0,0.15)" }}
//           >
//             {AGENT_STATUSES.map(s => (
//               <button key={s.value} onClick={() => handleSelect(s.value)}
//                 className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-gray-50 ${
//                   s.value === currentStatus ? "bg-gray-50" : ""
//                 }`}
//               >
//                 <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${s.cls}`}>
//                   {s.value === currentStatus ? "✓ " : ""}{s.label.replace(" ✓","")}
//                 </span>
//               </button>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // ── Quick Actions dropdown ────────────────────────────────────
// function QuickActions({ lead }: { lead: LeadRow }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     function handler(e: MouseEvent) {
//       if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
//     }
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const phone   = lead.visitor_phone;
//   const email   = lead.visitor_email;
//   const waMsg   = encodeURIComponent(`Hi ${lead.visitor_name}, I'm calling regarding your enquiry for ${lead.property_title} on Sastaghar.`);
//   const waLink  = `https://wa.me/91${phone.replace(/\D/g, "")}?text=${waMsg}`;

//   return (
//     <div ref={ref} className="flex items-center gap-1.5">
//       {/* Call — always visible */}
//       <a href={`tel:+91${phone.replace(/\D/g, "")}`}
//         className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#2EAE88]/10 hover:text-[#2EAE88] text-gray-500 flex items-center justify-center transition-colors"
//         title={`Call ${lead.visitor_name}`}>
//         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
//         </svg>
//       </a>

//       {/* WhatsApp / Email dropdown */}
//       <div className="relative">
//         <button onClick={() => setOpen(o => !o)}
//           className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-[#1B4FD8] text-gray-500 flex items-center justify-center transition-colors"
//           title="Message options">
//           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
//           </svg>
//         </button>

//         <AnimatePresence>
//           {open && (
//             <motion.div
//               initial={{ opacity: 0, y: -4, scale: 0.97 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: -4 }}
//               transition={{ duration: 0.15 }}
//               className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-[100] overflow-hidden py-1"
//               style={{ boxShadow: "0 8px 24px -4px rgba(0,0,0,0.15)" }}
//             >
//               {/* WhatsApp */}
//               <a href={waLink} target="_blank" rel="noopener noreferrer"
//                 onClick={() => setOpen(false)}
//                 className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
//                 <span className="w-6 h-6 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
//                   <svg className="w-3.5 h-3.5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
//                     <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
//                   </svg>
//                 </span>
//                 WhatsApp
//               </a>

//               {/* Email */}
//               {email && (
//                 <a href={`mailto:${email}?subject=Your enquiry for ${lead.property_title}`}
//                   onClick={() => setOpen(false)}
//                   className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
//                   <span className="w-6 h-6 rounded-full bg-[#1B4FD8]/10 flex items-center justify-center flex-shrink-0">
//                     <svg className="w-3.5 h-3.5 text-[#1B4FD8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
//                     </svg>
//                   </span>
//                   Send Email
//                 </a>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

// // ── Main Page ─────────────────────────────────────────────────
// export default function AgentLeadsPage() {
//   const supabase = createClient();

//   const [leads,        setLeads]        = useState<LeadRow[]>([]);
//   const [loading,      setLoading]      = useState(true);
//   const [page,         setPage]         = useState(0);
//   const [total,        setTotal]        = useState(0);
//   const [filterStatus, setFilterStatus] = useState("");
//   const [search,       setSearch]       = useState("");

//   // Stats
//   const [stats, setStats] = useState({
//     total: 0, converted: 0, negotiating: 0, new_today: 0,
//   });

//   const loadLeads = useCallback(async (pg = 0) => {
//     setLoading(true);
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return;

//     // Get agent_profile id
//     const { data: ap } = await supabase
//       .from("agent_profiles")
//       .select("id")
//       .eq("profile_id", user.id)
//       .single();
//     if (!ap) { setLoading(false); return; }

//     // Build query on lead_assignments (agent's view of leads)
//     let q = supabase
//       .from("lead_assignments")
//       .select(`
//         id,
//         agent_status,
//         created_at,
//         leads (
//           id, created_at, visitor_name, visitor_phone,
//           visitor_email, intent, message, wants_loan_assistance,
//           properties (
//             title, slug,
//             cities ( name ),
//             localities ( name )
//           )
//         )
//       `, { count: "exact" })
//       .eq("agent_id", ap.id)
//       .order("created_at", { ascending: false })
//       .range(pg * PAGE_SIZE, pg * PAGE_SIZE + PAGE_SIZE - 1);

//     if (filterStatus) q = q.eq("agent_status", filterStatus);

//     const { data, count } = await q;

//     const mapped = (data ?? [])
//       .filter((d: any) => d.leads && d.leads.properties)
//       .map((d: any, i: number) => ({
//         id:               d.leads.id,
//         lead_id:          d.leads.id,
//         assignment_id:    d.id,
//         created_at:       d.leads.created_at,
//         visitor_name:     d.leads.visitor_name,
//         visitor_phone:    d.leads.visitor_phone,
//         visitor_email:    d.leads.visitor_email,
//         intent:           d.leads.intent,
//         message:          d.leads.message,
//         wants_loan:       d.leads.wants_loan_assistance,
//         agent_status:     d.agent_status,
//         property_title:   d.leads.properties.title,
//         property_slug:    d.leads.properties.slug,
//         property_city:    d.leads.properties.cities?.name ?? "",
//         property_locality:d.leads.properties.localities?.name ?? null,
//       }));

//     // Search filter (client side for simplicity)
//     const filtered = search.trim()
//       ? mapped.filter(l =>
//           l.visitor_name.toLowerCase().includes(search.toLowerCase()) ||
//           l.property_title.toLowerCase().includes(search.toLowerCase()) ||
//           (l.visitor_email ?? "").toLowerCase().includes(search.toLowerCase())
//         )
//       : mapped;

//     setLeads(filtered);
//     setTotal(count ?? 0);

//     // Stats — load once
//     if (pg === 0 && !filterStatus) {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       const { data: allData } = await supabase
//         .from("lead_assignments")
//         .select("agent_status, created_at")
//         .eq("agent_id", ap.id);
//       const all = allData ?? [];
//       setStats({
//         total:       all.length,
//         converted:   all.filter(l => l.agent_status === "converted").length,
//         negotiating: all.filter(l => l.agent_status === "negotiating").length,
//         new_today:   all.filter(l => new Date(l.created_at) >= today).length,
//       });
//     }

//     setLoading(false);
//   }, [filterStatus, search]);

//   useEffect(() => { setPage(0); loadLeads(0); }, [filterStatus, search]);
//   useEffect(() => { loadLeads(page); }, [page]);

//   // Update lead status in local state after dropdown update
//   function handleStatusUpdate(assignmentId: string, newStatus: string) {
//     setLeads(ls => ls.map(l =>
//       l.assignment_id === assignmentId ? { ...l, agent_status: newStatus } : l
//     ));
//     // Update stats optimistically
//     if (newStatus === "converted") {
//       setStats(s => ({ ...s, converted: s.converted + 1 }));
//     }
//     if (newStatus === "negotiating") {
//       setStats(s => ({ ...s, negotiating: s.negotiating + 1 }));
//     }
//   }

//   const totalPages = Math.ceil(total / PAGE_SIZE);

//   return (
//     <div className="space-y-6" style={{ fontFamily: "Poppins, sans-serif" }}>

//       {/* ── Stat cards ─────────────────────────────────── */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         {[
//           {
//             label: "Total Leads", value: stats.total.toLocaleString("en-IN"),
//             sub: "All time", cls: "text-[#1B4FD8]", bg: "bg-blue-50",
//             icon: <svg className="w-5 h-5 text-[#1B4FD8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
//           },
//           {
//             label: "Converted", value: stats.converted.toLocaleString("en-IN"),
//             sub: `${stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : 0}% conversion rate`,
//             cls: "text-[#2EAE88]", bg: "bg-green-50",
//             icon: <svg className="w-5 h-5 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
//           },
//           {
//             label: "In Negotiation", value: stats.negotiating.toLocaleString("en-IN"),
//             sub: "Active deals", cls: "text-amber-600", bg: "bg-amber-50",
//             icon: <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>,
//           },
//           {
//             label: "New Inquiries", value: stats.new_today.toLocaleString("en-IN"),
//             sub: "Received today", cls: "text-purple-600", bg: "bg-purple-50",
//             icon: <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
//           },
//         ].map((s, i) => (
//           <motion.div key={s.label}
//             initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: i * 0.06 }}
//             className="bg-white rounded-2xl p-5 border border-gray-100"
//             style={{ boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>
//             <div className="flex items-start justify-between mb-3">
//               <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg}`}>{s.icon}</div>
//             </div>
//             <p className="text-gray-400 text-xs font-medium mb-1">{s.label}</p>
//             <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
//             <p className="text-gray-400 text-[10px] mt-1">{s.sub}</p>
//           </motion.div>
//         ))}
//       </div>

//       {/* ── Leads table card ───────────────────────────── */}
//       <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
//         style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}>

//         {/* Table toolbar */}
//         <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
//           <h2 className="text-gray-900 font-bold text-base">Recent Leads</h2>

//           <div className="flex flex-wrap items-center gap-2.5">
//             {/* Search */}
//             <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
//               <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//               <input type="text" value={search} onChange={e => setSearch(e.target.value)}
//                 placeholder="Search name or property…"
//                 className="bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none w-36" />
//             </div>

//             {/* Status filter */}
//             <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
//               className="bg-gray-100 text-xs text-gray-600 rounded-xl px-3 py-2 outline-none border-none cursor-pointer">
//               <option value="">All Statuses</option>
//               {AGENT_STATUSES.map(s => (
//                 <option key={s.value} value={s.value}>{s.label.replace(" ✓","")}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Column headers */}
//         <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-gray-50 bg-gray-50/50">
//           {["Lead Info","Interested Property","Status","Timestamp","Quick Actions"].map(h => (
//             <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
//           ))}
//         </div>

//         {/* Rows */}
//         {loading ? (
//           <div className="divide-y divide-gray-50">
//             {Array.from({ length: 5 }).map((_, i) => (
//               <div key={i} className="px-6 py-4 animate-pulse flex items-center gap-4">
//                 <div className="w-8 h-8 rounded-full bg-gray-200" />
//                 <div className="flex-1 space-y-2">
//                   <div className="h-3 bg-gray-200 rounded w-32" />
//                   <div className="h-2.5 bg-gray-100 rounded w-24" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : leads.length === 0 ? (
//           <div className="p-12 text-center">
//             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
//               <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
//               </svg>
//             </div>
//             <p className="text-gray-400 text-sm">
//               {filterStatus ? `No leads with status "${STATUS_MAP[filterStatus]?.label ?? filterStatus}"` : "No leads yet."}
//             </p>
//             {filterStatus && (
//               <button onClick={() => setFilterStatus("")}
//                 className="mt-2 text-xs text-[#1B4FD8] hover:underline underline-offset-4">
//                 Clear filter
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="divide-y divide-gray-50">
//             <AnimatePresence mode="popLayout">
//               {leads.map((lead, i) => (
//                 <motion.div key={lead.lead_id}
//                   initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//                   transition={{ delay: i * 0.03 }}
//                   className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-3 sm:gap-4 items-center px-5 sm:px-6 py-4 hover:bg-gray-50/60 transition-colors"
//                 >
//                   {/* Lead info */}
//                   <div className="flex items-center gap-2.5 min-w-0">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
//                       {getInitials(lead.visitor_name)}
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-gray-800 text-sm font-semibold truncate">{lead.visitor_name}</p>
//                       <p className="text-gray-400 text-[10px]">
//                         +91 {lead.visitor_phone}
//                         {lead.wants_loan && <span className="ml-1 text-[#2EAE88]">· 💰 Loan</span>}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Property */}
//                   <div className="min-w-0 sm:pl-0 pl-10">
//                     <Link href={`/property/${lead.property_slug}`}
//                       className="text-[#1B4FD8] text-xs font-semibold hover:underline underline-offset-4 truncate block">
//                       {lead.property_title}
//                     </Link>
//                     <p className="text-gray-400 text-[10px] mt-0.5 truncate">
//                       {lead.property_locality ? `${lead.property_locality}, ` : ""}{lead.property_city}
//                       {lead.intent && ` · ${INTENT_LABEL[lead.intent] ?? lead.intent}`}
//                     </p>
//                   </div>

//                   {/* Status dropdown */}
//                   <div className="sm:pl-0 pl-10">
//                     <StatusDropdown
//                       leadId={lead.lead_id}
//                       assignmentId={lead.assignment_id}
//                       currentStatus={lead.agent_status}
//                       onUpdate={handleStatusUpdate}
//                     />
//                   </div>

//                   {/* Timestamp */}
//                   <p className="text-gray-400 text-xs sm:pl-0 pl-10">{timeAgo(lead.created_at)}</p>

//                   {/* Quick actions */}
//                   <div className="sm:pl-0 pl-10">
//                     <QuickActions lead={lead} />
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           </div>
//         )}

//         {/* Pagination footer */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-wrap gap-3">
//             <p className="text-xs text-gray-400">
//               Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString("en-IN")} leads
//             </p>
//             <div className="flex items-center gap-1.5">
//               <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
//                 className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
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
//                 className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
//                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }






"use client";

// app/agent/leads/page.tsx
// Full leads management page for agents.
// - Stats: total, converted, negotiating, new
// - Table: lead info, property, status dropdown, timestamp, quick actions
// - Status updates: lead_assignments.agent_status in Supabase
// - Quick actions: Call (tel:), WhatsApp / Email dropdown
// - Pagination: 10 per page

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence }                  from "framer-motion";
import Link                                         from "next/link";
import { createClient }                             from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────
interface LeadRow {
  id:              string;  // lead_assignments.id
  lead_id:         string;
  created_at:      string;
  visitor_name:    string;
  visitor_phone:   string;
  visitor_email:   string | null;
  intent:          string;
  message:         string | null;
  agent_status:    string;  // from lead_assignments
  assignment_id:   string;  // lead_assignments.id
  property_title:  string;
  property_slug:   string;
  property_locality:string | null;
  property_city:   string;
}

// ── Agent status options (from DB check constraint) ───────────
const AGENT_STATUSES = [
  { value: "pending",        label: "Pending",        cls: "bg-gray-100 text-gray-500"          },
  { value: "viewed",         label: "Viewed",          cls: "bg-blue-100 text-blue-700"         },
  { value: "contacted",      label: "Contacted",       cls: "bg-purple-100 text-purple-700"     },
  { value: "visit_scheduled",label: "Visit Scheduled", cls: "bg-indigo-100 text-indigo-700"    },
  { value: "negotiating",    label: "Negotiating",     cls: "bg-amber-100 text-amber-700"       },
  { value: "converted",      label: "Converted ✓",     cls: "bg-[#2EAE88]/10 text-[#2EAE88]"   },
  { value: "not_interested", label: "Not Interested",  cls: "bg-red-100 text-red-500"           },
  { value: "lost",           label: "Lost",            cls: "bg-red-100 text-red-700"           },
];

const STATUS_MAP = Object.fromEntries(AGENT_STATUSES.map(s => [s.value, s]));

// ── Helpers ───────────────────────────────────────────────────
function timeAgo(d: string) {
  const diff  = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)    return "just now";
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days < 7)    return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2)
    .map(n => n[0].toUpperCase()).join("");
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-green-100 text-green-700",
  "bg-red-100 text-red-600",
  "bg-indigo-100 text-indigo-700",
];

const INTENT_LABEL: Record<string, string> = {
  contact_owner:    "Contact",
  schedule_visit:   "Visit Request",
  callback_request: "Callback",
  loan_inquiry:     "Loan Inquiry",
  price_negotiation:"Negotiation",
  project_brochure: "Brochure",
};

const PAGE_SIZE = 10;

// ── Status dropdown ───────────────────────────────────────────
function StatusDropdown({
  leadId, assignmentId, currentStatus, onUpdate,
}: {
  leadId: string;
  assignmentId: string;
  currentStatus: string;
  onUpdate: (assignmentId: string, newStatus: string) => void;
}) {
  const [open,    setOpen]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSelect(newStatus: string) {
    if (newStatus === currentStatus) { setOpen(false); return; }
    setSaving(true);
    setOpen(false);

    const timestamp = new Date().toISOString();
    const update = {
      agent_status: newStatus,
      ...(newStatus === "contacted" ? { contacted_at: timestamp } : {}),
      ...(newStatus === "converted" ? { converted_at: timestamp } : {}),
    };

    const { error } = await supabase
      .from("lead_assignments")
      .update(update)
      .eq("id", assignmentId);

    // If converted — increment agent's total_leads_converted counter
    if (!error && newStatus === "converted") {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc("increment_converted_leads", { p_agent_user_id: user.id });
      }
    }

    setSaving(false);
    if (!error) onUpdate(assignmentId, newStatus);
  }

  const cfg = STATUS_MAP[currentStatus] ?? AGENT_STATUSES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={saving}
        className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${cfg.cls} ${saving ? "opacity-50" : "hover:opacity-80 cursor-pointer"}`}
      >
        {saving ? (
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : null}
        {cfg.label}
        <svg className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-[100] overflow-hidden py-1"
            style={{ boxShadow: "0 8px 24px -4px rgba(0,0,0,0.15)" }}
          >
            {AGENT_STATUSES.map(s => (
              <button key={s.value} onClick={() => handleSelect(s.value)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-gray-50 ${
                  s.value === currentStatus ? "bg-gray-50" : ""
                }`}
              >
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${s.cls}`}>
                  {s.value === currentStatus ? "✓ " : ""}{s.label.replace(" ✓","")}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Quick Actions dropdown ────────────────────────────────────
function QuickActions({ lead }: { lead: LeadRow }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const phone   = lead.visitor_phone;
  const email   = lead.visitor_email;
  const waMsg   = encodeURIComponent(`Hi ${lead.visitor_name}, I'm calling regarding your enquiry for ${lead.property_title} on PropertyLink.`);
  const waLink  = `https://wa.me/91${phone.replace(/\D/g, "")}?text=${waMsg}`;

  return (
    <div ref={ref} className="flex items-center gap-1.5">
      {/* Call — always visible */}
      <a href={`tel:+91${phone.replace(/\D/g, "")}`}
        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#2EAE88]/10 hover:text-[#2EAE88] text-gray-500 flex items-center justify-center transition-colors"
        title={`Call ${lead.visitor_name}`}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      </a>

      {/* WhatsApp / Email dropdown */}
      <div className="relative">
        <button onClick={() => setOpen(o => !o)}
          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-[#1B4FD8] text-gray-500 flex items-center justify-center transition-colors"
          title="Message options">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-[100] overflow-hidden py-1"
              style={{ boxShadow: "0 8px 24px -4px rgba(0,0,0,0.15)" }}
            >
              {/* WhatsApp */}
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="w-6 h-6 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                  </svg>
                </span>
                WhatsApp
              </a>

              {/* Email */}
              {email && (
                <a href={`mailto:${email}?subject=Your enquiry for ${lead.property_title}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-[#1B4FD8]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#1B4FD8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </span>
                  Send Email
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AgentLeadsPage() {
  const supabase = createClient();

  const [leads,        setLeads]        = useState<LeadRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(0);
  const [total,        setTotal]        = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [search,       setSearch]       = useState("");

  // Stats
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0, converted: 0, negotiating: 0, new_today: 0,
  });

  const loadLeads = useCallback(async (pg = 0) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get agent_profile id
    const { data: ap } = await supabase
      .from("agent_profiles")
      .select("id")
      .eq("profile_id", user.id)
      .single();
    if (!ap) { setLoading(false); return; }

    // Build query on lead_assignments (agent's view of leads)
    let q = supabase
      .from("lead_assignments")
      .select(`
        id,
        agent_status,
        created_at,
        leads (
          id, created_at, visitor_name, visitor_phone,
          visitor_email, intent, message, wants_loan_assistance,
          properties (
            title, slug,
            cities ( name ),
            localities ( name )
          )
        )
      `, { count: "exact" })
      .eq("agent_id", ap.id)
      .order("created_at", { ascending: false })
      .range(pg * PAGE_SIZE, pg * PAGE_SIZE + PAGE_SIZE - 1);

    if (filterStatus) q = q.eq("agent_status", filterStatus);

    const { data, count } = await q;

    const mapped = (data ?? [])
      .filter((d: any) => d.leads && d.leads.properties)
      .map((d: any, i: number) => ({
        id:               d.leads.id,
        lead_id:          d.leads.id,
        assignment_id:    d.id,
        created_at:       d.leads.created_at,
        visitor_name:     d.leads.visitor_name,
        visitor_phone:    d.leads.visitor_phone,
        visitor_email:    d.leads.visitor_email,
        intent:           d.leads.intent,
        message:          d.leads.message,
        agent_status:     d.agent_status,
        property_title:   d.leads.properties.title,
        property_slug:    d.leads.properties.slug,
        property_city:    d.leads.properties.cities?.name ?? "",
        property_locality:d.leads.properties.localities?.name ?? null,
      }));

    // Search filter (client side for simplicity)
    const filtered = search.trim()
      ? mapped.filter(l =>
          l.visitor_name.toLowerCase().includes(search.toLowerCase()) ||
          l.property_title.toLowerCase().includes(search.toLowerCase()) ||
          (l.visitor_email ?? "").toLowerCase().includes(search.toLowerCase())
        )
      : mapped;

    setLeads(filtered);
    setTotal(count ?? 0);

    // Stats — load once
    if (pg === 0 && !filterStatus) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: allData } = await supabase
        .from("lead_assignments")
        .select("agent_status, created_at")
        .eq("agent_id", ap.id);
      const all = allData ?? [];
      setStats({
        total:       all.length,
        converted:   all.filter(l => l.agent_status === "converted").length,
        negotiating: all.filter(l => l.agent_status === "negotiating").length,
        new_today:   all.filter(l => new Date(l.created_at) >= today).length,
      });
    }

    setLoading(false);
  }, [filterStatus, search]);

  useEffect(() => { setPage(0); loadLeads(0); }, [filterStatus, search]);
  useEffect(() => { loadLeads(page); }, [page]);

  // Update lead status in local state after dropdown update
  function handleStatusUpdate(assignmentId: string, newStatus: string) {
    setLeads(ls => ls.map(l =>
      l.assignment_id === assignmentId ? { ...l, agent_status: newStatus } : l
    ));
    // Update stats optimistically
    if (newStatus === "converted") {
      setStats(s => ({ ...s, converted: s.converted + 1 }));
    }
    if (newStatus === "negotiating") {
      setStats(s => ({ ...s, negotiating: s.negotiating + 1 }));
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6" style={{ fontFamily: "Poppins, sans-serif" }}>

      {/* ── Stat cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Leads", value: stats.total.toLocaleString("en-IN"),
            sub: "All time", cls: "text-[#1B4FD8]", bg: "bg-blue-50",
            icon: <svg className="w-5 h-5 text-[#1B4FD8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
          },
          {
            label: "Converted", value: stats.converted.toLocaleString("en-IN"),
            sub: `${stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : 0}% conversion rate`,
            cls: "text-[#2EAE88]", bg: "bg-green-50",
            icon: <svg className="w-5 h-5 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          },
          {
            label: "In Negotiation", value: stats.negotiating.toLocaleString("en-IN"),
            sub: "Active deals", cls: "text-amber-600", bg: "bg-amber-50",
            icon: <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>,
          },
          {
            label: "New Inquiries", value: stats.new_today.toLocaleString("en-IN"),
            sub: "Received today", cls: "text-purple-600", bg: "bg-purple-50",
            icon: <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
          },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-5 border border-gray-100"
            style={{ boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg}`}>{s.icon}</div>
            </div>
            <p className="text-gray-400 text-xs font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-gray-400 text-[10px] mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Leads table card ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}>

        {/* Table toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-gray-900 font-bold text-base">All Leads</h2>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name or property…"
                className="bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none w-36" />
            </div>

            {/* Status filter */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="bg-gray-100 text-xs text-gray-600 rounded-xl px-3 py-2 outline-none border-none cursor-pointer">
              <option value="">All Statuses</option>
              {AGENT_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label.replace(" ✓","")}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Column headers */}
        <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-gray-50 bg-gray-50/50">
          {["Lead Info","Interested Property","Status","Timestamp","Actions"].map(h => (
            <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-32" />
                  <div className="h-2.5 bg-gray-100 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">
              {filterStatus ? `No leads with status "${STATUS_MAP[filterStatus]?.label ?? filterStatus}"` : "No leads yet."}
            </p>
            {filterStatus && (
              <button onClick={() => setFilterStatus("")}
                className="mt-2 text-xs text-[#1B4FD8] hover:underline underline-offset-4">
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {leads.map((lead, i) => (
                <motion.div key={lead.lead_id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-3 sm:gap-4 items-center px-5 sm:px-6 py-4 hover:bg-gray-50/60 transition-colors"
                >
                  {/* Lead info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                      {getInitials(lead.visitor_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-800 text-sm font-semibold truncate">{lead.visitor_name}</p>
                      <p className="text-gray-400 text-[10px]">+91 {lead.visitor_phone}</p>
                      {lead.visitor_email && (
                        <p className="text-gray-400 text-[10px] truncate">{lead.visitor_email}</p>
                      )}
                    </div>
                  </div>

                  {/* Property */}
                  <div className="min-w-0 sm:pl-0 pl-10">
                    <Link href={`/property/${lead.property_slug}`}
                      className="text-[#1B4FD8] text-xs font-semibold hover:underline underline-offset-4 truncate block">
                      {lead.property_title}
                    </Link>
                    <p className="text-gray-400 text-[10px] mt-0.5 truncate">
                      {lead.property_locality ? `${lead.property_locality}, ` : ""}{lead.property_city}
                      {lead.intent && ` · ${INTENT_LABEL[lead.intent] ?? lead.intent}`}
                    </p>
                  </div>

                  {/* Status dropdown */}
                  <div className="sm:pl-0 pl-10">
                    <StatusDropdown
                      leadId={lead.lead_id}
                      assignmentId={lead.assignment_id}
                      currentStatus={lead.agent_status}
                      onUpdate={handleStatusUpdate}
                    />
                  </div>

                  {/* Timestamp */}
                  <p className="text-gray-400 text-xs sm:pl-0 pl-10">{timeAgo(lead.created_at)}</p>

                  {/* Actions: expand + quick contact */}
                  <div className="sm:pl-0 pl-10 flex items-center gap-1.5">
                    {/* Expand detail button */}
                    <button
                      onClick={() => setExpandedLead(expandedLead === lead.lead_id ? null : lead.lead_id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        expandedLead === lead.lead_id
                          ? "bg-[#1B4FD8] text-white"
                          : "bg-gray-100 hover:bg-[#EEF2FF] hover:text-[#1B4FD8] text-gray-500"
                      }`}
                      title="View lead details">
                      <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedLead === lead.lead_id ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <QuickActions lead={lead} />
                  </div>
                  {/* Expanded detail panel */}
                  {expandedLead === lead.lead_id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="col-span-full overflow-hidden"
                    >
                      <div className="mt-2 mb-1 mx-0 bg-[#F8FAFF] border border-[#1B4FD8]/10 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Contact info */}
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Contact Details</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-[#1B4FD8] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                              </svg>
                              <a href={`tel:+91${lead.visitor_phone.replace(/\D/g,"")}`}
                                className="text-xs font-semibold text-gray-700 hover:text-[#1B4FD8] transition-colors">
                                +91 {lead.visitor_phone}
                              </a>
                            </div>
                            {lead.visitor_email && (
                              <div className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5 text-[#1B4FD8] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                                <a href={`mailto:${lead.visitor_email}`}
                                  className="text-xs font-semibold text-gray-700 hover:text-[#1B4FD8] transition-colors truncate">
                                  {lead.visitor_email}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Property interest */}
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Property Interest</p>
                          <Link href={`/property/${lead.property_slug}`} target="_blank"
                            className="text-xs font-semibold text-[#1B4FD8] hover:underline underline-offset-4 block truncate">
                            {lead.property_title}
                          </Link>
                          <p className="text-gray-500 text-[10px] mt-1">
                            {lead.property_locality ? `${lead.property_locality}, ` : ""}{lead.property_city}
                          </p>
                          <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1B4FD8]/10 text-[#1B4FD8]">
                            {INTENT_LABEL[lead.intent] ?? lead.intent}
                          </span>
                        </div>

                        {/* Message */}
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Message</p>
                          {lead.message ? (
                            <p className="text-gray-600 text-xs leading-relaxed italic">
                              "{lead.message}"
                            </p>
                          ) : (
                            <p className="text-gray-400 text-xs italic">No message provided.</p>
                          )}
                          <p className="text-gray-400 text-[10px] mt-2">
                            Received: {new Date(lead.created_at).toLocaleString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-wrap gap-3">
            <p className="text-xs text-gray-400">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString("en-IN")} leads
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
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
                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}