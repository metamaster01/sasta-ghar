"use client";

// app/saved/page.tsx
// Liked / Saved properties page.
// Reads: saved_properties JOIN properties JOIN property_media
// Actions: remove from saved

import { useState, useEffect }     from "react";
import { useRouter }               from "next/navigation";
import Link                        from "next/link";
import Image                       from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient }            from "@/lib/supabase/client";

interface SavedProperty {
  property_id:    string;
  saved_at:       string;
  title:          string;
  slug:           string;
  category:       string;
  price:          number;
  price_unit:     string;
  bedrooms:       number | null;
  carpet_area:    number | null;
  area_unit:      string;
  city_name:      string;
  locality_name:  string | null;
  is_verified:    boolean;
  cover_image_url:string | null;
  status:         string;
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

const CAT_COLOR: Record<string, string> = {
  buy: "bg-blue-100 text-blue-700",
  sell: "bg-blue-100 text-blue-700",
  rent: "bg-[#2EAE88]/10 text-[#2EAE88]",
  commercial: "bg-orange-100 text-orange-700",
  plot_land: "bg-yellow-100 text-yellow-700",
  project: "bg-purple-100 text-purple-700",
};
const CAT_LABEL: Record<string, string> = {
  buy: "For Sale", sell: "For Sale", rent: "For Rent",
  commercial: "Commercial", plot_land: "Plot", project: "Project",
};

export default function SavedPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [properties, setProperties] = useState<SavedProperty[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [removing,   setRemoving]   = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?redirect=/saved"); return; }

      const { data } = await supabase
        .from("saved_properties")
        .select(`
          property_id,
          saved_at,
          properties (
            id, title, slug, category, price, price_unit,
            bedrooms, carpet_area, area_unit, is_verified, status,
            cities ( name ),
            localities ( name ),
            property_media (
              url, sort_order, media_type, moderation_status
            )
          )
        `)
        .eq("user_id", user.id)
        .order("saved_at", { ascending: false });

      const mapped = (data ?? [])
        .filter((d: any) => d.properties)
        .map((d: any) => {
          const p = d.properties;
          const cover = (p.property_media ?? [])
            .filter((m: any) => m.media_type === "image" && m.moderation_status === "approved")
            .sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url ?? null;
          return {
            property_id:    d.property_id,
            saved_at:       d.saved_at,
            title:          p.title,
            slug:           p.slug,
            category:       p.category,
            price:          p.price,
            price_unit:     p.price_unit,
            bedrooms:       p.bedrooms,
            carpet_area:    p.carpet_area,
            area_unit:      p.area_unit,
            city_name:      p.cities?.name ?? "",
            locality_name:  p.localities?.name ?? null,
            is_verified:    p.is_verified,
            status:         p.status,
            cover_image_url: cover,
          };
        });

      setProperties(mapped);
      setLoading(false);
    }
    load();
  }, []);

  async function handleRemove(propertyId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setRemoving(propertyId);
    await supabase.from("saved_properties")
      .delete()
      .eq("user_id", user.id)
      .eq("property_id", propertyId);
    setProperties(ps => ps.filter(p => p.property_id !== propertyId));
    setRemoving(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-7 h-7 border-2 border-[#1B4FD8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Liked Properties</h1>
          <p className="text-gray-400 text-sm mt-1">
            {properties.length > 0
              ? `${properties.length} saved propert${properties.length === 1 ? "y" : "ies"}`
              : "Your saved properties will appear here."}
          </p>
        </div>

        {/* Empty state */}
        {properties.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center"
            style={{ boxShadow: "0 4px 24px -6px rgba(0,0,0,0.06)" }}>
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold text-lg mb-2">No saved properties yet</h3>
            <p className="text-gray-400 text-sm mb-6">
              Click the ❤️ icon on any property to save it here for later.
            </p>
            <Link href="/search"
              className="inline-flex items-center gap-2 bg-[#1B4FD8] hover:bg-[#1640b8] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors">
              Browse Properties
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}

        {/* Property cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {properties.map((p, i) => (
              <motion.div key={p.property_id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, scale: 0.97 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden flex hover:shadow-md transition-all duration-300"
                style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}
              >
                {/* Image */}
                <Link href={`/property/${p.slug}`}
                  className="relative w-36 sm:w-48 flex-shrink-0 bg-gray-100 overflow-hidden">
                  {p.cover_image_url ? (
                    <Image src={p.cover_image_url} alt={p.title} fill sizes="192px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m2.25-18h13.5m-13.5 0V3a.75.75 0 01.75-.75h12a.75.75 0 01.75.75v18" />
                      </svg>
                    </div>
                  )}
                  {/* Category badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${CAT_COLOR[p.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {CAT_LABEL[p.category] ?? p.category}
                    </span>
                  </div>
                  {/* Sold/expired overlay */}
                  {p.status !== "live" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs font-bold px-2 py-1 bg-black/50 rounded-lg capitalize">
                        {p.status}
                      </span>
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link href={`/property/${p.slug}`}>
                        <h3 className="text-gray-900 font-semibold text-sm sm:text-base leading-snug line-clamp-2 hover:text-[#1B4FD8] transition-colors">
                          {p.title}
                        </h3>
                      </Link>
                      <p className="text-[#2EAE88] font-bold text-sm sm:text-base whitespace-nowrap flex-shrink-0">
                        {fmtPrice(p.price, p.price_unit)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                      </svg>
                      <span className="truncate">{p.locality_name ? `${p.locality_name}, ` : ""}{p.city_name}</span>
                      {p.is_verified && <span className="ml-1 text-[#2EAE88] font-semibold flex-shrink-0">· ✓ Verified</span>}
                    </div>

                    <div className="flex items-center gap-3 text-gray-400 text-xs">
                      {p.bedrooms && <span>{p.bedrooms} BHK</span>}
                      {p.carpet_area && <><span>·</span><span>{p.carpet_area.toLocaleString("en-IN")} {p.area_unit}</span></>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <p className="text-gray-400 text-xs">
                      Saved {formatDate(p.saved_at)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Link href={`/property/${p.slug}`}
                        className="text-xs font-semibold text-[#1B4FD8] hover:underline underline-offset-4">
                        View →
                      </Link>
                      <button
                        onClick={() => handleRemove(p.property_id)}
                        disabled={removing === p.property_id}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                      >
                        {removing === p.property_id ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}