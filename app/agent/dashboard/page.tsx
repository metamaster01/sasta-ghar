"use client";

// app/agent/dashboard/page.tsx
// Agent dashboard — matches the design reference image exactly.
// Auth guard: redirects non-agents to /login.
// Data: agent_profiles, leads, properties — all from Supabase.
// Plan: shows Free plan, "Not available yet" on upgrade button.

import { useState, useEffect }     from "react";
import { useRouter }               from "next/navigation";
import Link                        from "next/link";
import Image                       from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient }            from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────
interface AgentData {
  id:                   string;
  full_name:            string;
  email:                string;
  avatar_url:           string | null;
  verification_status:  string;
  total_leads_received: number;
  total_leads_converted:number;
  free_leads_remaining: number;
  rating_avg:           number | null;
  rating_count:         number;
  plan_name:            string;
  plan_slug:            string;
  active_listings:      number;
  views_count:          number;
}

interface Lead {
  id:             string;
  created_at:     string;
  visitor_name:   string;
  visitor_phone:  string;
  visitor_email:  string | null;
  intent:         string;
  status:         string;
  message:        string | null;
  wants_loan:     boolean;
  property_title: string;
  property_slug:  string;
  property_id:    string;
}

// ── Helpers ───────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2)
    .map(n => n[0].toUpperCase()).join("");
}

function timeAgo(d: string) {
  const diff  = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins} min${mins > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const INTENT_LABEL: Record<string, string> = {
  contact_owner:    "Contact",
  schedule_visit:   "Visit Request",
  callback_request: "Callback",
  loan_inquiry:     "Loan Inquiry",
  price_negotiation:"Negotiation",
  project_brochure: "Brochure",
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  new:       { label: "NEW",       cls: "bg-blue-100 text-blue-700"        },
  routed:    { label: "ROUTED",    cls: "bg-amber-100 text-amber-700"      },
  unlocked:  { label: "HOT LEAD",  cls: "bg-red-100 text-red-600"          },
  viewed:    { label: "VIEWED",    cls: "bg-purple-100 text-purple-700"    },
  responded: { label: "CONTACTED", cls: "bg-[#2EAE88]/10 text-[#2EAE88]"  },
  closed:    { label: "CLOSED",    cls: "bg-gray-100 text-gray-500"        },
};

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  icon, label, value, sub, color, delay,
}: {
  icon: React.ReactNode; label: string; value: string;
  sub?: string; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22,1,0.36,1] }}
      className="bg-white rounded-2xl p-5 border border-gray-100"
      style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {sub && (
          <span className={`text-xs font-semibold ${sub.startsWith("-") ? "text-red-500" : "text-[#2EAE88]"}`}>
            {sub}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-xs font-medium mb-1">{label}</p>
      <p className="text-gray-900 text-2xl font-bold">{value}</p>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function AgentDashboardPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [agent,          setAgent]          = useState<AgentData | null>(null);
  const [leads,          setLeads]          = useState<Lead[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [showUpgradeMsg, setShowUpgradeMsg] = useState(false);

  useEffect(() => {
    async function load() {
      // ── Auth check ─────────────────────────────────────
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?redirect=/agent/dashboard"); return; }

      // ── Fetch profile + agent profile + plan ───────────
      const { data: profile } = await supabase
        .from("profiles")
        .select(`
          id, full_name, email, avatar_url, role,
          agent_profiles (
            id, verification_status,
            total_leads_received, total_leads_converted,
            free_leads_remaining, rating_avg, rating_count,
            plans ( name, slug )
          )
        `)
        .eq("id", user.id)
        .single();

      // Redirect if not agent/builder/admin
      const role = profile?.role ?? "user";
      if (!["agent","builder","admin"].includes(role)) {
        router.push("/");
        return;
      }

      const ap = Array.isArray(profile?.agent_profiles)
        ? profile.agent_profiles[0]
        : profile?.agent_profiles;

      // ── Fetch active listings count ────────────────────
      const { count: listingCount } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .eq("status", "live");

      // ── Fetch total views across all properties ─────────
      const { data: viewData } = await supabase
        .from("properties")
        .select("views_count")
        .eq("owner_id", user.id);
      const totalViews = (viewData ?? []).reduce(
        (sum: number, p: any) => sum + (p.views_count ?? 0), 0
      );

      // ── Fetch recent leads ──────────────────────────────
      const { data: leadsData } = await supabase
        .from("leads")
        .select(`
          id, created_at, visitor_name, visitor_phone,
          visitor_email, intent, status, message,
          wants_loan_assistance,
          properties ( title, slug, id )
        `)
        .eq("properties.owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Filter out nulls (properties not owned by this agent)
      const mappedLeads = (leadsData ?? [])
        .filter((l: any) => l.properties)
        .map((l: any) => ({
          id:             l.id,
          created_at:     l.created_at,
          visitor_name:   l.visitor_name,
          visitor_phone:  l.visitor_phone,
          visitor_email:  l.visitor_email,
          intent:         l.intent,
          status:         l.status,
          message:        l.message,
          wants_loan:     l.wants_loan_assistance,
          property_title: l.properties.title,
          property_slug:  l.properties.slug,
          property_id:    l.properties.id,
        }));

      const plan = Array.isArray(ap?.plans) ? ap.plans[0] : ap?.plans;

      setAgent({
        id:                   user.id,
        full_name:            profile?.full_name ?? user.email?.split("@")[0] ?? "Agent",
        email:                user.email ?? "",
        avatar_url:           profile?.avatar_url ?? null,
        verification_status:  ap?.verification_status ?? "pending",
        total_leads_received: ap?.total_leads_received ?? 0,
        total_leads_converted:ap?.total_leads_converted ?? 0,
        free_leads_remaining: ap?.free_leads_remaining ?? 0,
        rating_avg:           ap?.rating_avg ?? null,
        rating_count:         ap?.rating_count ?? 0,
        plan_name:            plan?.name ?? "Free",
        plan_slug:            plan?.slug ?? "free",
        active_listings:      listingCount ?? 0,
        views_count:          totalViews,
      });
      setLeads(mappedLeads);
      setLoading(false);
    }
    load();
  }, []);

  // ── Filtered leads for search ─────────────────────────────
  const filteredLeads = leads;

  // ── Conversion rate ───────────────────────────────────────
  const convRate = agent && agent.total_leads_received > 0
    ? ((agent.total_leads_converted / agent.total_leads_received) * 100).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2EAE88] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  if (!agent) return null;

  const isVerified = agent.verification_status === "verified";

  return (
    <div className="space-y-6" style={{ fontFamily: "Poppins, sans-serif" }}>

        {/* Page content */}
        <div>

          {/* Verification banner */}
          {!isVerified && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-amber-800 font-semibold text-sm">Account not verified yet</p>
                <p className="text-amber-600 text-xs mt-0.5">
                  Complete verification to unlock all features and get a verified badge on your listings.
                </p>
              </div>
              <Link href="/agent/verification"
                className="flex-shrink-0 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">
                Verify Now
              </Link>
            </motion.div>
          )}

          {/* ── Stat cards ──────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<svg className="w-5 h-5 text-[#1B4FD8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18h13.5m-13.5 0V3a.75.75 0 01.75-.75h12a.75.75 0 01.75.75v18" /></svg>}
              label="Active Listings"
              value={String(agent.active_listings)}
              color="bg-blue-50"
              delay={0.05}
            />
            <StatCard
              icon={<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
              label="Total Leads"
              value={agent.total_leads_received.toLocaleString("en-IN")}
              color="bg-purple-50"
              delay={0.1}
            />
            <StatCard
              icon={<svg className="w-5 h-5 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              label="Property Views"
              value={agent.views_count >= 1000
                ? `${(agent.views_count / 1000).toFixed(1)}k`
                : String(agent.views_count)}
              color="bg-green-50"
              delay={0.15}
            />
            <StatCard
              icon={<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
              label="Conversion Rate"
              value={`${convRate}%`}
              color="bg-amber-50"
              delay={0.2}
            />
          </div>

          {/* ── Two-column layout ───────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Recent Leads table — 2/3 width */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100"
              style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}>

              {/* Table header */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
                <h2 className="text-gray-900 font-bold text-base">Recent Leads</h2>
                <Link href="/agent/leads"
                  className="text-xs font-semibold text-[#2EAE88] hover:underline underline-offset-4">
                  View All
                </Link>
              </div>

              {filteredLeads.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">No leads yet. Share your listings to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Column headers */}
                  <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 px-5 sm:px-6 py-3 border-b border-gray-50">
                    {["Lead Name","Property Interest","Status","Action"].map(h => (
                      <p key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</p>
                    ))}
                  </div>

                  {/* Lead rows */}
                  {filteredLeads.slice(0, 8).map((lead, i) => {
                    const statusCfg = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG["new"];
                    const initials  = lead.visitor_name.split(" ").filter(Boolean)
                      .slice(0,2).map((n:string) => n[0].toUpperCase()).join("");
                    const bgColors  = ["bg-blue-100 text-blue-700","bg-purple-100 text-purple-700",
                      "bg-amber-100 text-amber-700","bg-green-100 text-green-700","bg-red-100 text-red-700"];
                    const avatarCls = bgColors[i % bgColors.length];

                    return (
                      <motion.div key={lead.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 items-center px-5 sm:px-6 py-3.5 border-b border-gray-50 hover:bg-gray-50/60 transition-colors last:border-0"
                      >
                        {/* Lead name */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarCls}`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-800 text-sm font-semibold truncate">{lead.visitor_name}</p>
                            <p className="text-gray-400 text-[10px]">{timeAgo(lead.created_at)}</p>
                          </div>
                        </div>

                        {/* Property */}
                        <div className="min-w-0">
                          <Link href={`/property/${lead.property_slug}`}
                            className="text-gray-600 text-xs hover:text-[#1B4FD8] transition-colors truncate block">
                            {lead.property_title}
                          </Link>
                          <p className="text-gray-400 text-[10px] mt-0.5">
                            {INTENT_LABEL[lead.intent] ?? lead.intent}
                            {lead.wants_loan && " · 💰 Loan"}
                          </p>
                        </div>

                        {/* Status */}
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${statusCfg.cls}`}>
                          {statusCfg.label}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          <a href={`tel:+91${lead.visitor_phone}`}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#2EAE88]/10 hover:text-[#2EAE88] text-gray-500 flex items-center justify-center transition-colors"
                            title={`Call ${lead.visitor_name}`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                            </svg>
                          </a>
                          {lead.visitor_email && (
                            <a href={`mailto:${lead.visitor_email}`}
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#1B4FD8]/10 hover:text-[#1B4FD8] text-gray-500 flex items-center justify-center transition-colors"
                              title={`Email ${lead.visitor_name}`}>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right column — 1/3 */}
            <div className="space-y-5">

              {/* Top listing card */}
              {agent.active_listings > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}>
                  <div className="relative h-36 bg-gradient-to-br from-[#1B4FD8] to-[#0f2d8a]">
                    <div className="absolute inset-0 flex items-end p-4">
                      <div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#2EAE88] text-white mb-2 inline-block">
                          ACTIVE
                        </span>
                        <p className="text-white font-bold text-sm leading-tight">
                          {agent.active_listings} Active {agent.active_listings === 1 ? "Listing" : "Listings"}
                        </p>
                        <p className="text-blue-200 text-xs mt-0.5">on PropertyLink</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-[#1B4FD8] font-bold text-lg">{agent.total_leads_received}</p>
                      <p className="text-gray-400 text-[10px] font-medium">Total Inquiries</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-[#2EAE88] font-bold text-lg">{convRate}%</p>
                      <p className="text-gray-400 text-[10px] font-medium">CTR</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Plan / Upgrade status */}
              <div className="bg-gradient-to-br from-[#2EAE88] to-[#1d8a6a] rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 -left-4 w-16 h-16 rounded-full bg-white/5" />
                <div className="relative">
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Current Plan
                  </p>
                  <p className="text-white font-bold text-xl mb-1 capitalize">
                    {agent.plan_name}
                  </p>
                  <p className="text-white/70 text-xs leading-relaxed mb-3">
                    {agent.plan_slug === "free"
                      ? `You're on the free plan. You have ${agent.free_leads_remaining} free lead${agent.free_leads_remaining === 1 ? "" : "s"} remaining this month.`
                      : `You're enjoying all ${agent.plan_name} benefits.`
                    }
                  </p>

                  {/* Free leads remaining bar */}
                  {agent.plan_slug === "free" && (
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] text-white/60 mb-1">
                        <span>Free leads used</span>
                        <span>{3 - agent.free_leads_remaining} / 3</span>
                      </div>
                      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all"
                          style={{ width: `${((3 - agent.free_leads_remaining) / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Upgrade button — disabled, not available yet */}
                  <button
                    onClick={() => setShowUpgradeMsg(true)}
                    className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors border border-white/30 flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Upgrade Plan
                  </button>

                  {/* Not available message */}
                  <AnimatePresence>
                    {showUpgradeMsg && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-white/80 text-[10px] text-center mt-2 leading-relaxed"
                      >
                        Premium plans coming soon! We'll notify you when upgrades are available.
                        <button onClick={() => setShowUpgradeMsg(false)} className="ml-2 text-white/60 hover:text-white underline">
                          Dismiss
                        </button>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Free leads info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5"
                style={{ boxShadow: "0 2px 8px -2px rgba(0,0,0,0.06)" }}>
                <p className="text-gray-900 font-bold text-sm mb-3">Free Lead Credits</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Remaining this month</span>
                    <span className="font-bold text-[#1B4FD8]">{agent.free_leads_remaining}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Total received</span>
                    <span className="font-bold text-gray-700">{agent.total_leads_received}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Converted</span>
                    <span className="font-bold text-[#2EAE88]">{agent.total_leads_converted}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Free leads reset every 30 days. Upgrade to unlock unlimited leads.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
    </div>
  );
}