"use client";

// app/my-enquiries/page.tsx
// Shows all enquiries (leads) submitted by the logged-in user.
// Reads: leads JOIN properties JOIN property_media
// Groups by: pending, active, closed

import { useState, useEffect }     from "react";
import { useRouter }               from "next/navigation";
import Link                        from "next/link";
import Image                       from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient }            from "@/lib/supabase/client";

interface Enquiry {
  id:              string;
  created_at:      string;
  intent:          string;
  status:          string;
  message:         string | null;
  wants_loan:      boolean;
  property_id:     string;
  property_title:  string;
  property_slug:   string;
  property_price:  number;
  property_unit:   string;
  property_cat:    string;
  city_name:       string;
  locality_name:   string | null;
  cover_image:     string | null;
  is_verified:     boolean;
}

function fmtPrice(price: number, unit: string) {
  const s = unit === "per_month" ? "/mo" : "";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr${s}`;
  if (price >= 100000)   return `₹${(price / 100000).toFixed(1)}L${s}`;
  return `₹${price.toLocaleString("en-IN")}${s}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days < 30)   return `${days}d ago`;
  return formatDate(d);
}

const INTENT_LABEL: Record<string, string> = {
  contact_owner:    "Contact Agent",
  schedule_visit:   "Schedule Visit",
  callback_request: "Callback Request",
  loan_inquiry:     "Loan Inquiry",
  price_negotiation:"Price Negotiation",
  project_brochure: "Brochure Request",
};

const INTENT_ICON: Record<string, React.ReactNode> = {
  contact_owner: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  schedule_visit: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
    </svg>
  ),
  callback_request: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
    </svg>
  ),
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  new:      { label: "Submitted",   cls: "bg-blue-100 text-blue-700",     dot: "bg-blue-500"    },
  routed:   { label: "Sent to Agent", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500"   },
  unlocked: { label: "Agent Notified", cls: "bg-[#2EAE88]/10 text-[#2EAE88]", dot: "bg-[#2EAE88]" },
  viewed:   { label: "Viewed",      cls: "bg-purple-100 text-purple-700", dot: "bg-purple-500"  },
  responded:{ label: "Responded",   cls: "bg-[#2EAE88]/10 text-[#2EAE88]", dot: "bg-[#2EAE88]" },
  closed:   { label: "Closed",      cls: "bg-gray-100 text-gray-500",     dot: "bg-gray-400"    },
};

const CAT_COLOR: Record<string, string> = {
  buy: "bg-blue-100 text-blue-700", sell: "bg-blue-100 text-blue-700",
  rent: "bg-[#2EAE88]/10 text-[#2EAE88]", commercial: "bg-orange-100 text-orange-700",
  plot_land: "bg-yellow-100 text-yellow-700", project: "bg-purple-100 text-purple-700",
};
const CAT_LABEL: Record<string, string> = {
  buy: "For Sale", sell: "For Sale", rent: "For Rent",
  commercial: "Commercial", plot_land: "Plot", project: "Project",
};

export default function MyEnquiriesPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<"all" | "active" | "closed">("all");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?redirect=/my-enquiries"); return; }

      const { data } = await supabase
        .from("leads")
        .select(`
          id, created_at, intent, status, message, wants_loan_assistance,
          property_id,
          properties (
            title, slug, price, price_unit, category, is_verified,
            cities ( name ),
            localities ( name ),
            property_media (
              url, sort_order, media_type, moderation_status
            )
          )
        `)
        .eq("visitor_id", user.id)
        .order("created_at", { ascending: false });

      const mapped = (data ?? [])
        .filter((d: any) => d.properties)
        .map((d: any) => {
          const p = d.properties;
          const cover = (p.property_media ?? [])
            .filter((m: any) => m.media_type === "image" && m.moderation_status === "approved")
            .sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url ?? null;
          return {
            id:             d.id,
            created_at:     d.created_at,
            intent:         d.intent,
            status:         d.status,
            message:        d.message,
            wants_loan:     d.wants_loan_assistance,
            property_id:    d.property_id,
            property_title: p.title,
            property_slug:  p.slug,
            property_price: p.price,
            property_unit:  p.price_unit,
            property_cat:   p.category,
            city_name:      p.cities?.name ?? "",
            locality_name:  p.localities?.name ?? null,
            is_verified:    p.is_verified,
            cover_image:    cover,
          };
        });

      setEnquiries(mapped);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-7 h-7 border-2 border-[#1B4FD8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeStatuses = ["new", "routed", "unlocked", "viewed"];
  const filtered = enquiries.filter(e => {
    if (filter === "active") return activeStatuses.includes(e.status);
    if (filter === "closed") return !activeStatuses.includes(e.status);
    return true;
  });

  const counts = {
    all:    enquiries.length,
    active: enquiries.filter(e => activeStatuses.includes(e.status)).length,
    closed: enquiries.filter(e => !activeStatuses.includes(e.status)).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Enquiries</h1>
          <p className="text-gray-400 text-sm mt-1">
            Track all your property enquiries and their status.
          </p>
        </div>

        {/* Stats row */}
        {enquiries.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {(["all","active","closed"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-2xl p-4 text-left border transition-all ${
                  filter === f
                    ? "bg-[#1B4FD8] border-[#1B4FD8] shadow-md shadow-blue-200"
                    : "bg-white border-gray-100 hover:border-gray-200"
                }`}
                style={{ boxShadow: filter === f ? undefined : "0 2px 8px -2px rgba(0,0,0,0.06)" }}
              >
                <p className={`text-2xl font-bold ${filter === f ? "text-white" : "text-gray-900"}`}>
                  {counts[f]}
                </p>
                <p className={`text-xs font-medium mt-0.5 capitalize ${filter === f ? "text-blue-200" : "text-gray-400"}`}>
                  {f === "all" ? "Total" : f}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center"
            style={{ boxShadow: "0 4px 24px -6px rgba(0,0,0,0.06)" }}>
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold text-lg mb-2">
              {filter === "all" ? "No enquiries yet" : `No ${filter} enquiries`}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {filter === "all"
                ? "Submit an enquiry on any property and it will appear here."
                : `You have no ${filter} enquiries at the moment.`}
            </p>
            {filter === "all" && (
              <Link href="/search"
                className="inline-flex items-center gap-2 bg-[#1B4FD8] hover:bg-[#1640b8] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors">
                Browse Properties →
              </Link>
            )}
          </div>
        )}

        {/* Enquiry cards */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((e, i) => {
              const statusCfg = STATUS_CONFIG[e.status] ?? STATUS_CONFIG["new"];
              return (
                <motion.div key={e.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}
                >
                  {/* Top: property info */}
                  <div className="flex gap-0">
                    {/* Cover image */}
                    <Link href={`/property/${e.property_slug}`}
                      className="relative w-28 sm:w-36 flex-shrink-0 bg-gray-100 overflow-hidden group">
                      {e.cover_image ? (
                        <Image src={e.cover_image} alt={e.property_title} fill
                          sizes="144px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                      )}
                      <div className="absolute top-2 left-2">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${CAT_COLOR[e.property_cat] ?? "bg-gray-100 text-gray-600"}`}>
                          {CAT_LABEL[e.property_cat] ?? e.property_cat}
                        </span>
                      </div>
                    </Link>

                    {/* Property details */}
                    <div className="flex-1 p-4 sm:p-5 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link href={`/property/${e.property_slug}`}>
                          <h3 className="text-gray-900 font-semibold text-sm leading-snug line-clamp-2 hover:text-[#1B4FD8] transition-colors">
                            {e.property_title}
                          </h3>
                        </Link>
                        {/* Status badge */}
                        <span className={`flex-shrink-0 flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${statusCfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                        </svg>
                        <span className="truncate">{e.locality_name ? `${e.locality_name}, ` : ""}{e.city_name}</span>
                        {e.is_verified && <span className="text-[#2EAE88] font-semibold flex-shrink-0">· ✓</span>}
                      </div>

                      <p className="text-[#2EAE88] font-bold text-sm">
                        {fmtPrice(e.property_price, e.property_unit)}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: enquiry details */}
                  <div className="border-t border-gray-100 px-4 sm:px-5 py-3 bg-gray-50/50">
                    <div className="flex flex-wrap items-center gap-3 justify-between">
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Intent */}
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <span className="text-[#1B4FD8]">
                            {INTENT_ICON[e.intent] ?? INTENT_ICON["contact_owner"]}
                          </span>
                          <span className="font-medium">{INTENT_LABEL[e.intent] ?? e.intent}</span>
                        </div>

                        {/* Loan flag */}
                        {e.wants_loan && (
                          <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#2EAE88]/10 text-[#2EAE88]">
                            💰 Loan requested
                          </span>
                        )}

                        {/* Time */}
                        <span className="text-gray-400 text-xs">{timeAgo(e.created_at)}</span>
                      </div>

                      <Link href={`/property/${e.property_slug}`}
                        className="text-xs font-semibold text-[#1B4FD8] hover:underline underline-offset-4 flex-shrink-0">
                        View Property →
                      </Link>
                    </div>

                    {/* Message if any */}
                    {e.message && (
                      <p className="text-gray-500 text-xs mt-2 leading-relaxed line-clamp-2 italic">
                        "{e.message}"
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        {enquiries.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-[#1B4FD8] to-[#0f2d8a] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold text-sm">Looking for a home loan?</p>
              <p className="text-blue-200 text-xs mt-0.5">
                Get pre-approved in 24 hours from 29+ banks via Vindhya Enterprises.
              </p>
            </div>
            <Link href="/loans/check-eligibility"
              className="flex-shrink-0 bg-[#2EAE88] hover:bg-[#28996f] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
              Check Eligibility Free →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}