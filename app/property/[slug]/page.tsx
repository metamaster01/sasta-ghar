// app/property/[slug]/page.tsx
// Complete property detail page — Server Component.
// Next.js 15+: params must be awaited.
// Sub-components: gallery, specs, amenities, lead form, agent card, map, loan CTA.

import { notFound }                  from "next/navigation";
import type { Metadata }             from "next";
import Link                          from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import PropertyGalleryDetail         from "@/components/property/PropertyGalleryDetail";
import PropertyLeadForm              from "@/components/property/PropertyLeadForm";
import PropertySpecs                 from "@/components/property/PropertySpecs";
import PropertyAmenities             from "@/components/property/PropertyAmenities";
import PropertyAgentCard             from "@/components/property/PropertyAgentCard";

// ── Types ─────────────────────────────────────────────────────
type Props = {
  params: Promise<{ slug: string }>;
};

// ── Data fetcher ──────────────────────────────────────────────
async function getProperty(slug: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      cities ( id, name, slug ),
      localities ( name, slug ),
      property_media (
        id, url, thumbnail_url,
        media_type, sort_order, caption,
        moderation_status
      ),
      property_amenities (
        amenities ( id, name, category, icon_key )
      ),
      profiles!owner_id (
        id, full_name, avatar_url, phone, email,
        agent_profiles (
          company_name, agent_type, bio,
          rating_avg, rating_count,
          years_of_experience, verification_status,
          office_address, specializations
        )
      )
    `)
    .eq("slug", slug)
    .eq("status", "live")
    .single();

  if (error || !data) return null;
  return data;
}

// ── Metadata ──────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProperty(slug);

  if (!p) {
    return {
      title:       "Property Not Found — Sastaghar",
      description: "The property you are looking for could not be found.",
    };
  }

  const cityName     = (p as any).cities?.name     ?? "";
  const localityName = (p as any).localities?.name ?? "";
  const location     = localityName ? `${localityName}, ${cityName}` : cityName;

  // Format price
  const fmtPrice = (price: number, unit: string) => {
    const s = unit === "per_month" ? "/mo" : "";
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr${s}`;
    if (price >= 100000)   return `₹${(price / 100000).toFixed(1)}L${s}`;
    return `₹${price.toLocaleString("en-IN")}${s}`;
  };

  const priceStr = fmtPrice(p.price, p.price_unit);
  const bhkStr   = p.bedrooms ? `${p.bedrooms} BHK ` : "";
  const typeStr  = p.property_type?.replace(/_/g, " ") ?? "Property";
  const catStr   = p.category === "rent" ? "for Rent" : "for Sale";

  // Cover image for OG
  const coverImages = ((p as any).property_media ?? [])
    .filter((m: any) => m.media_type === "image" && m.moderation_status === "approved")
    .sort((a: any, b: any) => a.sort_order - b.sort_order);
  const ogImage = coverImages[0]?.url ?? "/og-image.png";

  const title       = `${p.title} — ${priceStr} in ${location}`;
  const description = p.description?.slice(0, 155)
    ?? `${bhkStr}${typeStr} ${catStr} in ${location}. ${p.society_name ? `Part of ${p.society_name}. ` : ""}${p.is_verified ? "Verified listing." : ""}`;

  return {
    title,
    description,
    keywords: [
      `${bhkStr.trim()} ${typeStr}`,
      `property in ${cityName}`,
      `${localityName} property`,
      `${catStr} ${cityName}`,
      p.society_name ?? "",
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url:      `https://sastaghar.com/property/${slug}`,
      siteName: "Sastaghar",
      type:     "website",
      images: [{
        url:    ogImage,
        width:  1200,
        height: 630,
        alt:    p.title,
      }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    // Structured data hint for search engines
    alternates: {
      canonical: `https://sastaghar.com/property/${slug}`,
    },
  };
}

// ── Price formatter ───────────────────────────────────────────
function fmtPrice(price: number, unit: string) {
  const s = unit === "per_month" ? "/mo" : "";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr${s}`;
  if (price >= 100000)   return `₹${(price / 100000).toFixed(1)}L${s}`;
  return `₹${price.toLocaleString("en-IN")}${s}`;
}

// ── Category / status badge helpers ──────────────────────────
function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    buy:        { label: "For Sale",    cls: "bg-blue-100 text-blue-700"     },
    sell:       { label: "For Sale",    cls: "bg-blue-100 text-blue-700"     },
    rent:       { label: "For Rent",    cls: "bg-[#2EAE88]/10 text-[#2EAE88]" },
    commercial: { label: "Commercial",  cls: "bg-orange-100 text-orange-700" },
    plot_land:  { label: "Plot / Land", cls: "bg-yellow-100 text-yellow-700" },
    project:    { label: "Project",     cls: "bg-purple-100 text-purple-700" },
  };
  const b = map[category] ?? { label: category, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${b.cls}`}>
      {b.label}
    </span>
  );
}

// ── JSON-LD structured data (boosts SEO in Google) ────────────
function PropertyStructuredData({ p, cityName, localityName, ogImage }: {
  p: any; cityName: string; localityName: string; ogImage: string;
}) {
  const schema = {
    "@context":    "https://schema.org",
    "@type":       "RealEstateListing",
    "name":        p.title,
    "description": p.description ?? "",
    "url":         `https://sastaghar.com/property/${p.slug}`,
    "image":       ogImage,
    "offers": {
      "@type":         "Offer",
      "price":         p.price,
      "priceCurrency": "INR",
      "availability":  "https://schema.org/InStock",
    },
    "address": {
      "@type":           "PostalAddress",
      "addressLocality": localityName || cityName,
      "addressRegion":   "Maharashtra",
      "addressCountry":  "IN",
      "postalCode":      p.pincode ?? "",
    },
    "numberOfRooms":     p.bedrooms ?? undefined,
    "numberOfBathroomsTotal": p.bathrooms ?? undefined,
    "floorSize": p.carpet_area ? {
      "@type": "QuantitativeValue",
      "value": p.carpet_area,
      "unitCode": "FTK",
    } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────
export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProperty(slug);
  if (!p) notFound();

  // Fire-and-forget view tracking
  const supabase = await createServerSupabaseClient();
  supabase
    .from("property_views")
    .insert({ property_id: p.id, source: "direct" })
    .then(() => {});

  // Derived data
  const media = ((p as any).property_media ?? [])
    .filter((m: any) => m.moderation_status === "approved")
    .sort((a: any, b: any) => a.sort_order - b.sort_order);

  const amenities = ((p as any).property_amenities ?? [])
    .map((pa: any) => pa.amenities)
    .filter(Boolean);

  const owner        = (p as any).profiles;
  const agentProfile = Array.isArray(owner?.agent_profiles)
    ? owner.agent_profiles[0]
    : owner?.agent_profiles;

  const cityName     = (p as any).cities?.name     ?? "";
  const localityName = (p as any).localities?.name ?? "";

  const ogImage = media.find((m: any) => m.media_type === "image")?.url ?? "/og-image.png";

  const highlights = (p.highlights as string[] | null) ?? [];

  return (
    <>
      {/* Structured data */}
      <PropertyStructuredData p={p} cityName={cityName} localityName={localityName} ogImage={ogImage} />

      <div className="bg-gray-50 min-h-screen" style={{ fontFamily: "Poppins, sans-serif" }}>

        {/* ── Breadcrumb ──────────────────────────────────── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
              <Link href="/"       className="hover:text-[#1B4FD8] transition-colors">Home</Link>
              <span>›</span>
              <Link href="/search" className="hover:text-[#1B4FD8] transition-colors">Properties</Link>
              {cityName && (
                <>
                  <span>›</span>
                  <Link href={`/search?city_id=${p.city_id}`} className="hover:text-[#1B4FD8] transition-colors">
                    {cityName}
                  </Link>
                </>
              )}
              {localityName && (
                <>
                  <span>›</span>
                  <Link href={`/search?city_id=${p.city_id}&locality=${p.locality_id}`} className="hover:text-[#1B4FD8] transition-colors">
                    {localityName}
                  </Link>
                </>
              )}
              <span>›</span>
              <span className="text-gray-700 font-medium truncate max-w-[200px] sm:max-w-xs">
                {p.title}
              </span>
            </nav>
          </div>
        </div>

        {/* ── Gallery ─────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
          <PropertyGalleryDetail media={media} title={p.title} />
        </div>

        {/* ── Main content ─────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* ── Left — 2/3 width ─────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* ── Header card ──────────────────────────────── */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100"
                style={{ boxShadow: "0 2px 16px -4px rgba(0,0,0,0.06)" }}>

                {/* Badges row */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <CategoryBadge category={p.category} />
                  {p.is_verified && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#2EAE88]/10 text-[#2EAE88] flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verified
                    </span>
                  )}
                  {p.is_exclusive && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                      Exclusive
                    </span>
                  )}
                  {!p.is_exclusive && p.is_premium && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#1B4FD8]/10 text-[#1B4FD8]">
                      Premium
                    </span>
                  )}
                  {p.possession_status === "ready_to_move" && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                      Ready to Move
                    </span>
                  )}
                  {p.rera_number && (
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                      RERA: {p.rera_number}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-gray-900 text-xl sm:text-2xl font-bold leading-tight mb-2">
                  {p.title}
                </h1>

                {/* Location */}
                <div className="flex items-start gap-1.5 text-gray-500 text-sm mb-4">
                  <svg className="w-4 h-4 text-[#1B4FD8] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                  <span>
                    {[p.landmark, localityName, cityName, p.pincode].filter(Boolean).join(", ")}
                  </span>
                </div>

                {/* Price + society */}
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[#1B4FD8] text-2xl sm:text-3xl font-bold">
                      {fmtPrice(p.price, p.price_unit)}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                      {p.is_price_negotiable && <span>Negotiable</span>}
                      {p.maintenance_charge  && <span>+ ₹{p.maintenance_charge.toLocaleString("en-IN")}/mo maintenance</span>}
                      {p.carpet_area         && <span>₹{Math.round(p.price / p.carpet_area).toLocaleString("en-IN")} per {p.area_unit}</span>}
                    </div>
                  </div>
                  {p.society_name && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-medium">Society</p>
                      <p className="text-gray-700 font-semibold text-sm">{p.society_name}</p>
                      {p.tower_name && <p className="text-gray-400 text-xs">{p.tower_name}</p>}
                    </div>
                  )}
                </div>

                {/* Highlights */}
                {highlights.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Highlights
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {highlights.map((h: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-[#2EAE88] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* ── Specs ──────────────────────────────────── */}
              <PropertySpecs property={p} />

              {/* ── Description ────────────────────────────── */}
              {p.description && (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100">
                  <h2 className="text-gray-900 font-bold text-base mb-3">About this property</h2>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {p.description}
                  </p>
                </div>
              )}

              {/* ── Amenities ──────────────────────────────── */}
              {amenities.length > 0 && (
                <PropertyAmenities amenities={amenities} />
              )}

              {/* ── Location & Map ─────────────────────────── */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100">
                <h2 className="text-gray-900 font-bold text-base mb-4">Location & Neighbourhood</h2>
                {p.lat && p.lng ? (
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${p.lng - 0.01}%2C${p.lat - 0.01}%2C${p.lng + 0.01}%2C${p.lat + 0.01}&layer=mapnik&marker=${p.lat}%2C${p.lng}`}
                      width="100%"
                      height="300"
                      style={{ border: 0, display: "block" }}
                      loading="lazy"
                      title={`${p.title} location map`}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                    Map coming soon
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <p className="text-xs text-gray-400 italic">
                    Exact address will be shared once you submit an enquiry
                  </p>
                </div>
              </div>

            </div>

            {/* ── Right — 1/3 width, sticky ────────────────── */}
            <div className="space-y-4">
              <div className="lg:sticky lg:top-24 space-y-4">

                {/* Lead form */}
                <PropertyLeadForm
                  propertyId={p.id}
                  propertyTitle={p.title}
                  propertyPrice={p.price}
                  agentName={owner?.full_name ?? ""}
                />

                {/* Agent card */}
                {owner && (
                  <PropertyAgentCard
                    agent={owner}
                    agentProfile={agentProfile}
                  />
                )}

                {/* Loan CTA */}
                <div className="bg-gradient-to-br from-[#1B4FD8] to-[#0f2d8a] rounded-2xl p-5 text-white overflow-hidden relative">
                  {/* Decorative circle */}
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
                  <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

                  <div className="relative">
                    <p className="font-bold text-sm mb-1">💰 Need a Home Loan?</p>
                    <p className="text-blue-200 text-xs leading-relaxed mb-4">
                      Get pre-approved in 24 hrs. Lowest rates from 29+ banks — powered by Vindhya Enterprises.
                    </p>
                    {p.price > 0 && (
                      <div className="bg-white/10 rounded-xl px-3 py-2 mb-4">
                        <p className="text-white/60 text-[10px] mb-0.5">Est. EMI for this property</p>
                        <p className="text-white font-bold text-sm">
                          ₹{Math.round(p.price * 0.007 / 1000).toFixed(0)}K – {Math.round(p.price * 0.009 / 1000).toFixed(0)}K /mo
                        </p>
                        <p className="text-white/50 text-[9px] mt-0.5">At 8.5–9.5% p.a. for 20 yrs (approx)</p>
                      </div>
                    )}
                    <a
                      href="/loans/check-eligibility"
                      className="block w-full text-center bg-[#2EAE88] hover:bg-[#28996f] text-white font-bold text-xs py-3 rounded-xl transition-colors"
                    >
                      Check Loan Eligibility Free →
                    </a>
                  </div>
                </div>

                {/* Share + Save actions */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-around text-xs text-gray-500">
                  <button className="flex flex-col items-center gap-1.5 hover:text-[#1B4FD8] transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-[#EEF2FF] flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </div>
                    Save
                  </button>
                  <button
                    type="button"
                    className="flex flex-col items-center gap-1.5 hover:text-[#1B4FD8] transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-[#EEF2FF] flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                    </div>
                    Share
                  </button>
                  <button className="flex flex-col items-center gap-1.5 hover:text-red-500 transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-red-50 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" />
                      </svg>
                    </div>
                    Report
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}