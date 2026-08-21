"use client";

// components/home/PopularCities.tsx
// Popular cities section — click any city → /search?city=CityName
// Shows real-time property count from Supabase per city.
// Matches the reference design: tall rounded cards, city name overlay.

import { useState, useEffect } from "react";
import Link                    from "next/link";
import Image                   from "next/image";
import { motion }              from "framer-motion";
import { createClient }        from "@/lib/supabase/client";

interface CityData {
  id:             string;
  name:           string;
  slug:           string;
  state:          string;
  cover_image_url:string | null;
  property_count: number;
}

// Fallback images per city — used if DB has no cover_image_url
const CITY_IMAGES: Record<string, string> = {
  mumbai:     "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80",
  pune:       "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&q=80",
  thane:      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
  "navi-mumbai": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
  bangalore:  "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&q=80",
  hyderabad:  "https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=600&q=80",
  delhi:      "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80",
  chennai:    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80",
};

// Card heights — first card is tallest (featured), alternating
const CARD_HEIGHTS = ["h-72 sm:h-80", "h-64 sm:h-96", "h-72 sm:h-80", "h-64 sm:h-72", "h-72 sm:h-80", "h-64 sm:h-72"];

function CityCard({ city, index }: { city: CityData; index: number }) {
  const imgSrc = city.cover_image_url ?? CITY_IMAGES[city.slug] ?? CITY_IMAGES["mumbai"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/search?city=${encodeURIComponent(city.name)}`}
        className={`group relative block ${CARD_HEIGHTS[index % CARD_HEIGHTS.length]} rounded-2xl overflow-hidden`}
      >
        {/* Image */}
        <Image
          src={imgSrc}
          alt={`${city.name} properties`}
          fill
          sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* City name + count */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white font-bold text-base sm:text-lg leading-tight">
            {city.name}
          </p>
          {city.property_count > 0 && (
            <p className="text-white/70 text-xs font-medium mt-0.5">
              {city.property_count.toLocaleString("en-IN")} {city.property_count === 1 ? "property" : "properties"}
            </p>
          )}
        </div>

        {/* Hover arrow */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/0 group-hover:bg-white/20 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}

export default function PopularCities() {
  const [cities,  setCities]  = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCities() {
      // Fetch active cities with property count
      const { data: citiesData } = await supabase
        .from("cities")
        .select("id, name, slug, state, cover_image_url")
        .eq("is_active", true)
        .order("sort_order")
        .limit(8);

      if (!citiesData) { setLoading(false); return; }

      // Get property count per city in one query
      const { data: counts } = await supabase
        .from("properties")
        .select("city_id")
        .eq("status", "live");

      const countMap: Record<string, number> = {};
      (counts ?? []).forEach((p: any) => {
        countMap[p.city_id] = (countMap[p.city_id] ?? 0) + 1;
      });

      setCities(citiesData.map((c : any) => ({
        ...c,
        property_count: countMap[c.id] ?? 0,
        state: (c as any).state ?? "",
      })));
      setLoading(false);
    }
    fetchCities();
  }, []);

  if (!loading && cities.length === 0) return null;

  return (
    <section
      className="w-full py-14 sm:py-20 bg-white"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="flex items-end justify-between mb-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-gray-900 text-2xl sm:text-3xl font-bold">
              Popular Cities
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Find your dream property in India's top real estate markets
            </p>
          </div>

          <Link
            href="/search"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border border-[#2EAE88] text-[#2EAE88] hover:bg-[#2EAE88] hover:text-white transition-all duration-200"
          >
            Explore All Cities
          </Link>
        </motion.div>

        {/* City grid — masonry-style with alternating heights */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`${CARD_HEIGHTS[i % CARD_HEIGHTS.length]} bg-gray-100 rounded-2xl animate-pulse`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {cities.map((city, i) => (
              <CityCard key={city.id} city={city} index={i} />
            ))}
          </div>
        )}

        {/* Mobile CTA */}
        <div className="sm:hidden text-center mt-6">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 border border-[#2EAE88] text-[#2EAE88] font-semibold text-sm px-6 py-2.5 rounded-full"
          >
            Explore All Cities
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}