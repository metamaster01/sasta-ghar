"use client";

// components/home/FeaturedProperties.tsx
// Shows featured properties on homepage.
// Priority: exclusive > premium > featured (mirrors subscription value)

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface FeaturedProperty {
  id:              string;
  title:           string;
  slug:            string;
  category:        string;
  price:           number;
  price_unit:      string;
  bedrooms:        number | null;
  bathrooms:       number | null;
  carpet_area:     number | null;
  area_unit:       string;
  is_verified:     boolean;
  is_featured:     boolean;
  is_premium:      boolean;
  is_exclusive:    boolean;
  city_name:       string;
  locality_name:   string | null;
  cover_image_url: string | null;
}

function formatPrice(price: number, unit: string) {
  const sfx = unit === "per_month" ? "/mo" : "";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr${sfx}`;
  if (price >= 100000)   return `₹${(price / 100000).toFixed(1)}L${sfx}`;
  return `₹${price.toLocaleString("en-IN")}${sfx}`;
}

const CAT_LABEL: Record<string, string> = {
  buy: "For Sale", sell: "For Sale", rent: "For Rent",
  commercial: "Commercial", plot_land: "Plot", project: "Project",
};

function PropertyCard({ p, i }: { p: FeaturedProperty; i: number }) {
  const tierBadge =
    p.is_exclusive ? { label: "Exclusive", cls: "bg-purple-600" } :
    p.is_premium   ? { label: "Premium",   cls: "bg-[#1B4FD8]"  } : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/property/${p.slug}`}
        className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1.5 transition-all duration-300">

        {/* Image */}
        <div className="relative h-52 bg-gray-100 overflow-hidden">
          {p.cover_image_url
            ? <Image src={p.cover_image_url} alt={p.title} fill
                sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {p.is_verified && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#2EAE88] text-white">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verified
              </span>
            )}
            {tierBadge && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-white ${tierBadge.cls}`}>
                {tierBadge.label}
              </span>
            )}
          </div>

          {/* Price bottom-left */}
          <div className="absolute bottom-3 left-3">
            <span className="text-white font-bold text-base sm:text-lg drop-shadow-md">
              {formatPrice(p.price, p.price_unit)}
            </span>
          </div>

          {/* Category bottom-right */}
          <span className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
            {CAT_LABEL[p.category] ?? p.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-gray-900 font-semibold text-sm leading-snug line-clamp-1 mb-1.5 group-hover:text-[#1B4FD8] transition-colors">
            {p.title}
          </h3>
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
            <svg className="w-3.5 h-3.5 text-[#2EAE88] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
            </svg>
            <span className="truncate">{p.locality_name ? `${p.locality_name}, ` : ""}{p.city_name}</span>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-4 text-gray-400 text-xs pt-3 border-t border-gray-100">
            {p.bedrooms    && <span className="flex items-center gap-1"><BedIcon />{p.bedrooms} BHK</span>}
            {p.bathrooms   && <span className="flex items-center gap-1"><BathIcon />{p.bathrooms} Bath</span>}
            {p.carpet_area && <span className="flex items-center gap-1"><AreaIcon />{p.carpet_area.toLocaleString("en-IN")} {p.area_unit}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function BedIcon()  { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" /></svg>; }
function BathIcon() { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" /></svg>; }
function AreaIcon() { return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>; }

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<FeaturedProperty[]>([]);
  const [loading,    setLoading]    = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: "-60px" });
  const supabase   = createClient();

  useEffect(() => {
    supabase
      .from("properties")
      .select(`
        id, title, slug, category, price, price_unit,
        bedrooms, bathrooms, carpet_area, area_unit,
        is_verified, is_featured, is_premium, is_exclusive,
        cities(name), localities(name),
        property_media(url, sort_order, moderation_status, media_type)
      `)
      .eq("status", "live")
      .eq("is_featured", true)
      .order("is_exclusive", { ascending: false })
      .order("is_premium",   { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setProperties((data ?? []).map((p: any) => ({
          ...p,
          city_name:       p.cities?.name ?? "",
          locality_name:   p.localities?.name ?? null,
          cover_image_url: p.property_media
            ?.filter((m: any) => m.media_type === "image" && m.moderation_status === "approved")
            ?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url ?? null,
        })));
        setLoading(false);
      });
  }, []);

  if (!loading && properties.length === 0) return null;

  return (
    <section ref={sectionRef} className="w-full py-14 sm:py-20 bg-[#F5F7FF]"
      style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div className="flex items-end justify-between mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}>
          <div>
            <p className="text-[#2EAE88] text-xs font-bold tracking-[0.2em] uppercase mb-2">
              Handpicked luxury listings in prime locations
            </p>
            <h2 className="text-gray-900 text-2xl sm:text-3xl lg:text-4xl font-bold">
              Featured Properties
            </h2>
          </div>
          <Link href="/search?featured=true"
            className="hidden sm:flex items-center gap-1.5 text-[#1B4FD8] text-sm font-semibold hover:gap-3 transition-all duration-200 group">
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>

        {/* Cards */}
        {loading
          ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i => <div key={i} className="h-72 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
            </div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.map((p, i) => <PropertyCard key={p.id} p={p} i={i} />)}
            </div>
        }

        {/* Mobile CTA */}
        <div className="sm:hidden text-center mt-8">
          <Link href="/search?featured=true"
            className="inline-flex items-center gap-2 bg-[#1B4FD8] text-white font-semibold text-sm px-7 py-3.5 rounded-full">
            View All Properties
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}