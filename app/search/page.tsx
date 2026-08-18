"use client";

// app/search/page.tsx
// Property listing page with filters, sorting, grid/list toggle.
// Priority ordering: exclusive > premium > featured > verified > newest
// This directly reflects subscription tier value.

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────
type ViewMode = "grid" | "list";
type SortOption = "relevance" | "price_asc" | "price_desc" | "newest";
type Category = "buy" | "sell" | "rent" | "commercial" | "plot_land" | "project" | "pg_coliving";

interface Property {
  id:               string;
  title:            string;
  slug:             string;
  category:         Category;
  property_type:    string;
  price:            number;
  price_unit:       string;
  bedrooms:         number | null;
  bathrooms:        number | null;
  carpet_area:      number | null;
  area_unit:        string;
  furnishing:       string | null;
  possession_status:string;
  is_verified:      boolean;
  is_featured:      boolean;
  is_premium:       boolean;
  is_exclusive:     boolean;
  city_name:        string;
  locality_name:    string | null;
  society_name:     string | null;
  landmark:         string | null;
  cover_image_url:  string | null;
  published_at:     string;
  views_count:      number;
}

interface City { id: string; name: string; slug: string; }

// ── Helpers ───────────────────────────────────────────────────
function fmtPrice(price: number, unit: string) {
  const s = unit === "per_month" ? "/mo" : "";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr${s}`;
  if (price >= 100000)   return `₹${(price / 100000).toFixed(1)}L${s}`;
  return `₹${price.toLocaleString("en-IN")}${s}`;
}

const CAT_LABEL: Record<Category,string> = {
  buy:"For Sale", sell:"For Sale", rent:"For Rent",
  commercial:"Commercial", plot_land:"Plot", project:"Project", pg_coliving:"PG",
};
const CAT_COLOR: Record<Category,string> = {
  buy:"bg-blue-100 text-blue-700", sell:"bg-blue-100 text-blue-700",
  rent:"bg-[#2EAE88]/10 text-[#2EAE88]", commercial:"bg-orange-100 text-orange-700",
  plot_land:"bg-yellow-100 text-yellow-700", project:"bg-purple-100 text-purple-700",
  pg_coliving:"bg-teal-100 text-teal-700",
};

// Sort properties — exclusive > premium > featured > verified > newest
function sortProps(props: Property[], sort: SortOption): Property[] {
  const base = [...props];
  if (sort === "price_asc")  return base.sort((a,b) => a.price - b.price);
  if (sort === "price_desc") return base.sort((a,b) => b.price - a.price);
  if (sort === "newest")     return base.sort((a,b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  // relevance: exclusive first, then premium, then featured, then verified, then newest
  return base.sort((a,b) => {
    const score = (p: Property) =>
      (p.is_exclusive ? 1000 : 0) +
      (p.is_premium   ? 100  : 0) +
      (p.is_featured  ? 10   : 0) +
      (p.is_verified  ? 1    : 0);
    return score(b) - score(a);
  });
}

const CATEGORIES = [
  { value: "buy",        label: "Buy"         },
  { value: "rent",       label: "Rent"        },
  { value: "commercial", label: "Commercial"  },
  { value: "plot_land",  label: "Plot / Land" },
  { value: "project",    label: "Projects"    },
  { value: "pg_coliving",label: "PG"          },
];
const BED_OPTIONS = ["1","2","3","4","4+"];
const BATH_OPTIONS = ["1","2","3","3+"];
const PAGE_SIZE = 12;

// ── Grid Card ─────────────────────────────────────────────────
function GridCard({ p }: { p: Property }) {
  const isNew = new Date(p.published_at) > new Date(Date.now() - 7*24*60*60*1000);
  return (
    <Link href={`/property/${p.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {p.cover_image_url
          ? <Image src={p.cover_image_url} alt={p.title} fill
              sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badges top-left */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${CAT_COLOR[p.category] ?? "bg-gray-100 text-gray-600"}`}>
            {CAT_LABEL[p.category]}
          </span>
          {isNew && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              New Listing
            </span>
          )}
          {p.is_exclusive && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">Exclusive</span>}
          {!p.is_exclusive && p.is_premium && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1B4FD8] text-white">Premium</span>}
        </div>

        {p.is_verified && (
          <div className="absolute top-2.5 right-2.5">
            <span className="flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#2EAE88] text-white">
              ✓ Verified
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-gray-900 font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[#1B4FD8] transition-colors flex-1">
            {p.title}
          </h3>
          <p className="text-[#2EAE88] font-bold text-sm whitespace-nowrap flex-shrink-0">
            {fmtPrice(p.price, p.price_unit)}
          </p>
        </div>

        <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
          </svg>
          <span className="truncate">{p.locality_name ? `${p.locality_name}, ` : ""}{p.city_name}</span>
        </div>

        <div className="flex items-center gap-3 text-gray-400 text-xs pt-2 border-t border-gray-100">
          {p.bedrooms    && <span>{p.bedrooms} BHK</span>}
          {p.bathrooms   && <><span>·</span><span>{p.bathrooms} Bath</span></>}
          {p.carpet_area && <><span>·</span><span>{p.carpet_area.toLocaleString("en-IN")} {p.area_unit}</span></>}
        </div>
      </div>
    </Link>
  );
}

// ── List Card ─────────────────────────────────────────────────
function ListCard({ p }: { p: Property }) {
  return (
    <Link href={`/property/${p.slug}`}
      className="group flex bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative w-48 sm:w-56 flex-shrink-0 bg-gray-100">
        {p.cover_image_url
          ? <Image src={p.cover_image_url} alt={p.title} fill
              sizes="224px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
        }
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {p.is_exclusive && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">Exclusive</span>}
          {!p.is_exclusive && p.is_premium && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1B4FD8] text-white">Premium</span>}
          {!p.is_exclusive && !p.is_premium && p.is_featured && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#2EAE88] text-white">Featured</span>}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="text-gray-900 font-semibold text-sm sm:text-base leading-snug group-hover:text-[#1B4FD8] transition-colors line-clamp-2 flex-1">
              {p.title}
            </h3>
            <p className="text-[#2EAE88] font-bold text-base whitespace-nowrap flex-shrink-0">
              {fmtPrice(p.price, p.price_unit)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
            </svg>
            <span>{p.locality_name ? `${p.locality_name}, ` : ""}{p.city_name}</span>
            {p.is_verified && <span className="ml-1 text-[#2EAE88] font-semibold">· ✓ Verified</span>}
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            {p.bedrooms    && <span>{p.bedrooms} BHK</span>}
            {p.bathrooms   && <><span>·</span><span>{p.bathrooms} Bath</span></>}
            {p.carpet_area && <><span>·</span><span>{p.carpet_area.toLocaleString("en-IN")} {p.area_unit}</span></>}
            {p.furnishing  && <><span>·</span><span className="capitalize">{p.furnishing.replace("_"," ")}</span></>}
          </div>
          <span className="text-xs font-semibold text-[#1B4FD8] group-hover:underline underline-offset-2">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Main Inner Component ──────────────────────────────────────
function SearchPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const supabase     = createClient();

  const [view,       setView]       = useState<ViewMode>("grid");
  const [sort,       setSort]       = useState<SortOption>("relevance");
  const [query,      setQuery]      = useState(searchParams.get("q") || "");
  const [category,   setCategory]   = useState<Category | "">((searchParams.get("category") ?? "") as Category | "");
  const [cityId,     setCityId]     = useState(searchParams.get("city_id") || "");
  const [beds,       setBeds]       = useState(searchParams.get("beds") || "");
  const [baths,      setBaths]      = useState(searchParams.get("baths") || "");
  const [minPrice,   setMinPrice]   = useState(searchParams.get("min_price") || "");
  const [maxPrice,   setMaxPrice]   = useState(searchParams.get("max_price") || "");
  const [verified,   setVerified]   = useState(searchParams.get("verified") === "true");
  const [featured,   setFeatured]   = useState(searchParams.get("featured") === "true");
  const [cities,     setCities]     = useState<City[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    supabase.from("cities").select("id,name,slug").eq("is_active", true).order("sort_order")
      .then(({ data }) => setCities(data ?? []));
  }, []);

  const fetchProperties = useCallback(async (resetPage = true) => {
    setLoading(true);
    const offset = resetPage ? 0 : page * PAGE_SIZE;
    if (resetPage) setPage(0);

    let q = supabase
      .from("properties")
      .select(`
        id, title, slug, category, property_type, price, price_unit,
        bedrooms, bathrooms, carpet_area, area_unit, furnishing,
        possession_status, is_verified, is_featured, is_premium, is_exclusive,
        society_name, landmark, published_at, views_count,
        cities(name), localities(name),
        property_media(url, sort_order, moderation_status, media_type)
      `, { count: "exact" })
      .eq("status", "live")
      .range(offset, offset + PAGE_SIZE - 1);

    if (category)        q = q.eq("category", category);
    if (cityId)          q = q.eq("city_id", cityId);
    if (beds)            q = q.eq("bedrooms", parseInt(beds.replace("+","")));
    if (baths)           q = q.eq("bathrooms", parseInt(baths.replace("+","")));
    if (minPrice)        q = q.gte("price", parseFloat(minPrice));
    if (maxPrice)        q = q.lte("price", parseFloat(maxPrice));
    if (verified)        q = q.eq("is_verified", true);
    if (featured)        q = q.eq("is_featured", true);
    if (query.trim())    q = q.ilike("title", `%${query.trim()}%`);

    const { data, count } = await q;

    const mapped = (data ?? []).map((p: any) => ({
      ...p,
      city_name:       p.cities?.name ?? "",
      locality_name:   p.localities?.name ?? null,
      cover_image_url: p.property_media
        ?.filter((m: any) => m.media_type === "image" && m.moderation_status === "approved")
        ?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url ?? null,
    }));

    setProperties(sortProps(mapped, sort));
    setTotal(count ?? 0);
    setLoading(false);
  }, [category, cityId, beds, baths, minPrice, maxPrice, verified, featured, query, sort]);

  useEffect(() => { fetchProperties(true); }, [category, cityId, beds, baths, minPrice, maxPrice, verified, featured, sort]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white py-16 " style={{ fontFamily: "Poppins, sans-serif" }}>

      {/* ── Page header ───────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 pt-6 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-[#1B4FD8]">Home</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Property Listing</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1B4FD8] mb-1">
                Property Listing
              </h1>
              <p className="text-gray-500 text-sm max-w-md">
                Discover verified properties across Mumbai, Pune, Thane and Navi Mumbai.
              </p>
            </div>

            {/* Sort + view toggle */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
                className="text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#1B4FD8] cursor-pointer">
                <option value="relevance">Most popular</option>
                <option value="newest">Newest first</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
              </select>

              {/* Grid / List toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
                <button onClick={() => setView("list")}
                  className={`p-1.5 rounded-lg transition-colors ${view === "list" ? "bg-white shadow-sm text-[#1B4FD8]" : "text-gray-400"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
                  </svg>
                </button>
                <button onClick={() => setView("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-white shadow-sm text-[#1B4FD8]" : "text-gray-400"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── Search + Filter bar ─────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 shadow-sm mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Text search */}
              <div className="flex-1 min-w-[160px] flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && fetchProperties(true)}
                  placeholder="What are you looking for..."
                  className="bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 w-full" />
              </div>

              {/* Status / Category */}
              <select value={category} onChange={e => setCategory(e.target.value as Category | "")}
                className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#1B4FD8] cursor-pointer">
                <option value="">Status</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>

              {/* City */}
              <select value={cityId} onChange={e => setCityId(e.target.value)}
                className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#1B4FD8] cursor-pointer">
                <option value="">All Cities</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              {/* Beds */}
              <select value={beds} onChange={e => setBeds(e.target.value)}
                className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#1B4FD8] cursor-pointer">
                <option value="">Beds</option>
                {BED_OPTIONS.map(b => <option key={b} value={b}>{b} BHK</option>)}
              </select>

              {/* Baths */}
              <select value={baths} onChange={e => setBaths(e.target.value)}
                className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#1B4FD8] cursor-pointer">
                <option value="">Baths</option>
                {BATH_OPTIONS.map(b => <option key={b} value={b}>{b} Bath</option>)}
              </select>

              {/* Search button */}
              <button onClick={() => fetchProperties(true)}
                className="bg-[#2EAE88] hover:bg-[#28996f] text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors flex-shrink-0">
                Search
              </button>
            </div>

            {/* Advanced filters toggle */}
            <AnimatePresence>
              {filterOpen && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                  exit={{ opacity:0, height:0 }} transition={{ duration:0.25 }}
                  className="overflow-hidden">
                  <div className="pt-4 mt-3 border-t border-gray-100 flex flex-wrap gap-4 items-center">
                    {/* Price range */}
                    <div className="flex items-center gap-2">
                      <input type="number" placeholder="Min ₹" value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                        className="w-28 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#1B4FD8]" />
                      <span className="text-gray-400 text-xs">to</span>
                      <input type="number" placeholder="Max ₹" value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        className="w-28 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#1B4FD8]" />
                    </div>

                    {/* Verified toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div onClick={() => setVerified(v => !v)}
                        className={`w-9 h-5 rounded-full transition-colors relative ${verified ? "bg-[#2EAE88]" : "bg-gray-200"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${verified ? "left-4.5" : "left-0.5"}`} />
                      </div>
                      <span className="text-xs font-medium text-gray-600">Verified only</span>
                    </label>

                    {/* Featured toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div onClick={() => setFeatured(f => !f)}
                        className={`w-9 h-5 rounded-full transition-colors relative ${featured ? "bg-[#1B4FD8]" : "bg-gray-200"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${featured ? "left-4.5" : "left-0.5"}`} />
                      </div>
                      <span className="text-xs font-medium text-gray-600">Featured only</span>
                    </label>

                    {/* Clear filters */}
                    <button onClick={() => {
                      setCategory(""); setCityId(""); setBeds(""); setBaths("");
                      setMinPrice(""); setMaxPrice(""); setVerified(false); setFeatured(false);
                    }} className="text-xs text-red-400 hover:text-red-600 font-medium">
                      Clear all
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={() => setFilterOpen(f => !f)}
              className="mt-2 text-xs text-[#1B4FD8] font-semibold flex items-center gap-1 hover:underline underline-offset-4">
              {filterOpen ? "Hide" : "More"} filters
              <svg className={`w-3 h-3 transition-transform ${filterOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Count + active filters */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <p className="text-sm text-gray-500">
            {loading ? "Searching…" : (
              <><span className="font-bold text-gray-900">{total.toLocaleString("en-IN")}</span> properties found</>
            )}
          </p>
          {/* Active filter chips */}
          <div className="flex gap-2 flex-wrap">
            {category && <FilterChip label={CATEGORIES.find(c => c.value === category)?.label ?? category} onRemove={() => setCategory("")} />}
            {beds     && <FilterChip label={`${beds} BHK`} onRemove={() => setBeds("")} />}
            {verified && <FilterChip label="Verified" onRemove={() => setVerified(false)} />}
            {featured && <FilterChip label="Featured" onRemove={() => setFeatured(false)} />}
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className={view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            : "space-y-4"}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`bg-gray-100 rounded-2xl animate-pulse ${view === "grid" ? "h-64" : "h-36"}`} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold text-lg mb-2">No properties found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your filters or search for a different area.</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {properties.map(p => <GridCard key={p.id} p={p} />)}
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map(p => <ListCard key={p.id} p={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => { setPage(p => Math.max(0, p-1)); fetchProperties(false); }}
              disabled={page === 0}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
              ← Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
              return (
                <button key={pg} onClick={() => { setPage(pg); fetchProperties(false); }}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${pg === page ? "bg-[#1B4FD8] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  {pg + 1}
                </button>
              );
            })}
            <button onClick={() => { setPage(p => Math.min(totalPages-1, p+1)); fetchProperties(false); }}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 text-xs font-medium bg-[#EEF2FF] text-[#1B4FD8] px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-red-500 transition-colors">×</button>
    </span>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#1B4FD8] border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchPageInner />
    </Suspense>
  );
}