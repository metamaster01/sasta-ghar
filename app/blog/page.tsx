// app/blog/page.tsx
// Blog listing page — Server Component.
// Filters by category, shows all published posts paginated.

import type { Metadata }             from "next";
import Link                          from "next/link";
import Image                         from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import BlogListingClient             from "@/components/blog/BlogListingClient";

export const metadata: Metadata = {
  title:       "Property Blog — Buying Guides, Loan Tips & Locality Spotlights",
  description: "Expert guides on buying property, home loans, legal checks and Mumbai neighbourhood spotlights. Powered by Sastaghar.",
  openGraph: {
    title:       "Sastaghar Blog — Property Guides & Home Loan Tips",
    description: "Expert real estate guides, locality spotlights, and home loan advice from Sastaghar.",
    images:      [{ url: "/og-image.png" }],
  },
};

const CATEGORIES = [
  { value: "",                  label: "All Articles"       },
  { value: "buying_guide",      label: "Buying Guide"       },
  { value: "renting_guide",     label: "Renting Guide"      },
  { value: "loan_guide",        label: "Home Loan"          },
  { value: "locality_spotlight",label: "Locality Spotlight" },
  { value: "market_report",     label: "Market Report"      },
  { value: "legal_tips",        label: "Legal Tips"         },
  { value: "investment_tips",   label: "Investment Tips"    },
];

const CAT_COLOR: Record<string, string> = {
  buying_guide:       "bg-blue-100 text-blue-700",
  renting_guide:      "bg-purple-100 text-purple-700",
  loan_guide:         "bg-[#2EAE88]/10 text-[#2EAE88]",
  market_report:      "bg-amber-100 text-amber-700",
  locality_spotlight: "bg-indigo-100 text-indigo-700",
  legal_tips:         "bg-red-100 text-red-700",
  investment_tips:    "bg-teal-100 text-teal-700",
  property_news:      "bg-orange-100 text-orange-700",
};

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

async function getAllBlogs() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("blog_posts")
    .select(`
      id, title, slug, excerpt, cover_image_url,
      category, tags, published_at, views_count,
      profiles ( full_name, avatar_url )
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return data ?? [];
}

export default async function BlogPage() {
  const posts = await getAllBlogs();

  // Featured = first post (most recent)
  const featured = posts[0];
  const rest     = posts.slice(1);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Poppins, sans-serif" }}>

      {/* ── Hero header ───────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#1B4FD8] to-[#0f2d8a] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-blue-200 text-xs font-bold tracking-[0.2em] uppercase mb-3">
            Knowledge Hub
          </p>
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Property Guides & Insights
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto">
            Expert buying guides, home loan tips, locality spotlights and legal checklists — everything you need to make the right property decision.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* ── Featured post ────────────────────────────────── */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group block mb-12 sm:mb-16"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
              style={{ boxShadow: "0 4px 24px -6px rgba(0,0,0,0.1)" }}>

              {/* Image */}
              <div className="relative h-56 sm:h-72 lg:h-auto bg-gray-100">
                {featured.cover_image_url ? (
                  <Image
                    src={featured.cover_image_url}
                    alt={featured.title}
                    fill
                    sizes="(max-width:1024px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1B4FD8] to-[#0f2d8a]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-[#1B4FD8]">
                    Featured
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-7 sm:p-10 flex flex-col justify-center">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full w-fit mb-4 ${CAT_COLOR[(featured as any).category] ?? "bg-gray-100 text-gray-600"}`}>
                  {CATEGORIES.find(c => c.value === (featured as any).category)?.label ?? (featured as any).category}
                </span>
                <h2 className="text-gray-900 text-xl sm:text-2xl font-bold leading-tight mb-3 group-hover:text-[#1B4FD8] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-3">
                  {featured.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#1B4FD8] flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">SG</span>
                    </div>
                    <div>
                      <p className="text-gray-700 text-xs font-semibold">
                        {(featured as any).profiles?.full_name ?? "Sastaghar Team"}
                      </p>
                      <p className="text-gray-400 text-[10px]">
                        {formatDate((featured as any).published_at)}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[#1B4FD8] text-xs font-semibold group-hover:gap-2 transition-all">
                    Read article
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ── Client component handles category filter + grid ── */}
        <BlogListingClient
          posts={rest}
          categories={CATEGORIES}
          catColors={CAT_COLOR}
        />
      </div>
    </div>
  );
}