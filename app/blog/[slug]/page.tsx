// app/blog/[slug]/page.tsx
// Blog detail page — Server Component.
// Full article with: author, tags, loan CTA, related posts, share buttons.

import type { Metadata }             from "next";
import { notFound }                  from "next/navigation";
import Link                          from "next/link";
import Image                         from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import BlogShareButtons              from "@/components/blog/BlogShareButtons";

type Props = { params: Promise<{ slug: string }> };

// ── Fetch blog post ───────────────────────────────────────────
async function getBlog(slug: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("blog_posts")
    .select(`
      id, title, slug, excerpt, content,
      cover_image_url, category, tags, status,
      published_at, updated_at, views_count,
      loan_cta_enabled, loan_cta_text, loan_cta_url,
      meta_title, meta_description,
      related_city_id,
      profiles ( id, full_name, avatar_url, agent_profiles ( bio ) )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data;
}

async function getRelatedPosts(category: string, currentSlug: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, slug, cover_image_url, category, published_at, excerpt")
    .eq("status", "published")
    .eq("category", category)
    .neq("slug", currentSlug)
    .order("published_at", { ascending: false })
    .limit(3);
  return data ?? [];
}

// ── Metadata ──────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post     = await getBlog(slug);

  if (!post) {
    return { title: "Article Not Found — Sastaghar" };
  }

  const ogImage = post.cover_image_url ?? "/og-image.png";
  const title   = post.meta_title ?? post.title;
  const desc    = post.meta_description ?? post.excerpt ?? "";

  return {
    title,
    description: desc,
    keywords:    post.tags ?? [],
    openGraph: {
      title,
      description: desc,
      url:         `https://sastaghar.com/blog/${slug}`,
      siteName:    "Sastaghar",
      type:        "article",
      publishedTime: post.published_at ?? undefined,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description: desc,
      images:      [ogImage],
    },
    alternates: { canonical: `https://sastaghar.com/blog/${slug}` },
  };
}

// ── Category helpers ──────────────────────────────────────────
const CAT_LABEL: Record<string, string> = {
  buying_guide:       "Buying Guide",
  renting_guide:      "Renting Guide",
  loan_guide:         "Home Loan",
  market_report:      "Market Report",
  locality_spotlight: "Locality Spotlight",
  legal_tips:         "Legal Tips",
  investment_tips:    "Investment Tips",
  property_news:      "Property News",
};

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

function readTime(content: string | null) {
  const words = (content ?? "").replace(/<[^>]+>/g, "").split(/\s+/).length;
  return `${Math.max(2, Math.ceil(words / 200))} min read`;
}

// ── Related post card ─────────────────────────────────────────
function RelatedCard({ post }: { post: any }) {
  return (
    <Link href={`/blog/${post.slug}`}
      className="group flex gap-3 items-start hover:bg-gray-50 p-2 rounded-xl transition-colors">
      <div className="relative w-20 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
        {post.cover_image_url && (
          <Image src={post.cover_image_url} alt={post.title} fill
            sizes="80px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 text-xs font-semibold leading-snug line-clamp-2 group-hover:text-[#1B4FD8] transition-colors">
          {post.title}
        </p>
        <p className="text-gray-400 text-[10px] mt-1">{formatDate(post.published_at)}</p>
      </div>
    </Link>
  );
}

// ── Structured data ───────────────────────────────────────────
function ArticleSchema({ post }: { post: any }) {
  const schema = {
    "@context":       "https://schema.org",
    "@type":          "Article",
    "headline":       post.title,
    "description":    post.excerpt ?? "",
    "image":          post.cover_image_url ?? "",
    "author": {
      "@type": "Person",
      "name":  post.profiles?.full_name ?? "Sastaghar Team",
    },
    "publisher": {
      "@type": "Organization",
      "name":  "Sastaghar",
      "logo": {
        "@type": "ImageObject",
        "url":   "https://sastaghar.com/logo.png",
      },
    },
    "datePublished": post.published_at,
    "dateModified":  post.updated_at ?? post.published_at,
    "url":           `https://sastaghar.com/blog/${post.slug}`,
    "keywords":      (post.tags ?? []).join(", "),
  };
  return (
    <script type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

// ── Page ──────────────────────────────────────────────────────
export default async function BlogDetailPage({ params }: Props) {
  const { slug }   = await params;
  const post       = await getBlog(slug);
  if (!post) notFound();

  const related    = await getRelatedPosts(post.category, slug);
  const author     = (post as any).profiles;
  const authorBio  = author?.agent_profiles?.[0]?.bio ?? author?.agent_profiles?.bio;
  const rt         = readTime(post.content);

  // Fire-and-forget view increment
  const supabase = await createServerSupabaseClient();
  supabase.from("blog_posts")
    .update({ views_count: (post.views_count ?? 0) + 1 })
    .eq("id", post.id)
    .then(() => {});

  return (
    <>
      <ArticleSchema post={post} />

      <div className="min-h-screen bg-white" style={{ fontFamily: "Poppins, sans-serif" }}>

        {/* ── Cover image ───────────────────────────────────── */}
        {post.cover_image_url && (
          <div className="relative w-full h-56 sm:h-72 lg:h-96 bg-gray-100">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Main article — left 2/3 ───────────────────── */}
            <article className="lg:col-span-2">

              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 flex-wrap">
                <Link href="/"     className="hover:text-[#1B4FD8]">Home</Link>
                <span>›</span>
                <Link href="/blog" className="hover:text-[#1B4FD8]">Blog</Link>
                <span>›</span>
                <span className="text-gray-600 font-medium truncate max-w-[200px]">{post.title}</span>
              </nav>

              {/* Category + meta */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${CAT_COLOR[post.category] ?? "bg-gray-100 text-gray-600"}`}>
                  {CAT_LABEL[post.category] ?? post.category}
                </span>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-gray-400 text-xs">{formatDate(post.published_at)}</span>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-gray-400 text-xs">{rt}</span>
                {(post.views_count ?? 0) > 0 && (
                  <>
                    <span className="text-gray-300 text-xs">·</span>
                    <span className="text-gray-400 text-xs">
                      {post.views_count?.toLocaleString("en-IN")} views
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="text-gray-900 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-5">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-6 border-l-4 border-[#1B4FD8] pl-4">
                  {post.excerpt}
                </p>
              )}

              {/* Author row */}
              {author && (
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-[#1B4FD8] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {author.avatar_url
                      ? <Image src={author.avatar_url} alt={author.full_name ?? ""} width={40} height={40} className="object-cover" />
                      : <span className="text-white text-sm font-bold">SG</span>
                    }
                  </div>
                  <div>
                    <p className="text-gray-800 text-sm font-semibold">
                      {author.full_name ?? "Sastaghar Team"}
                    </p>
                    <p className="text-gray-400 text-xs">Property Expert · Sastaghar</p>
                  </div>
                </div>
              )}

              {/* ── Article content ─────────────────────────── */}
              {post.content ? (
                <div
                  className="prose prose-sm sm:prose max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900
                    prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
                    prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
                    prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4
                    prose-li:text-gray-600 prose-li:leading-relaxed
                    prose-strong:text-gray-800 prose-strong:font-semibold
                    prose-a:text-[#1B4FD8] prose-a:no-underline hover:prose-a:underline
                    prose-table:border prose-table:border-collapse
                    prose-th:bg-gray-50 prose-th:p-3 prose-th:border prose-th:border-gray-200 prose-th:text-left prose-th:text-sm prose-th:font-semibold
                    prose-td:p-3 prose-td:border prose-td:border-gray-200 prose-td:text-sm
                    prose-ul:pl-5 prose-ul:space-y-1
                    prose-ol:pl-5 prose-ol:space-y-1"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                <p className="text-gray-400 italic">Article content coming soon.</p>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
                  {post.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-[#EEF2FF] hover:text-[#1B4FD8] transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Share buttons */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-600 mb-3">Share this article</p>
                <BlogShareButtons title={post.title} slug={slug} />
              </div>

              {/* Loan CTA inline */}
              {post.loan_cta_enabled && (
                <div className="mt-10 bg-gradient-to-r from-[#1B4FD8] to-[#0f2d8a] rounded-2xl p-6 sm:p-8 text-white">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="flex-1">
                      <p className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-1">
                        Vindhya Enterprises LLP
                      </p>
                      <h3 className="text-white font-bold text-lg mb-1">
                        {post.loan_cta_text ?? "Get the Best Home Loan Rate"}
                      </h3>
                      <p className="text-blue-200 text-sm">
                        Compare rates from 29+ banks. Pre-approved in 24 hours. Zero processing fee.
                      </p>
                    </div>
                    <a
                      href={post.loan_cta_url ?? "/loans/check-eligibility"}
                      className="flex-shrink-0 bg-[#2EAE88] hover:bg-[#28996f] text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
                    >
                      Check Eligibility →
                    </a>
                  </div>
                </div>
              )}

              {/* Author bio card */}
              {author && (
                <div className="mt-8 bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">About the Author</p>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1B4FD8] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {author.avatar_url
                        ? <Image src={author.avatar_url} alt="" width={48} height={48} className="object-cover" />
                        : <span className="text-white font-bold">SG</span>
                      }
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">{author.full_name ?? "Sastaghar Team"}</p>
                      <p className="text-gray-400 text-xs mb-1">Property Expert · Sastaghar</p>
                      {authorBio && (
                        <p className="text-gray-500 text-xs leading-relaxed">{authorBio}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </article>

            {/* ── Sidebar — right 1/3 ───────────────────────── */}
            <aside className="space-y-6">
              <div className="lg:sticky lg:top-24 space-y-6">

                {/* Loan CTA sidebar */}
                <div className="bg-gradient-to-br from-[#1B4FD8] to-[#0f2d8a] rounded-2xl p-5 text-white">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
                    </svg>
                  </div>
                  <p className="text-white font-bold text-sm mb-1">Home Loan Calculator</p>
                  <p className="text-blue-200 text-xs mb-4 leading-relaxed">
                    Check your eligibility and compare rates from 29+ banks instantly.
                  </p>
                  <a href="/loans/check-eligibility"
                    className="block w-full text-center bg-[#2EAE88] hover:bg-[#28996f] text-white font-bold text-xs py-2.5 rounded-xl transition-colors">
                    Check Free →
                  </a>
                </div>

                {/* Search properties CTA */}
                <div className="bg-[#F5F7FF] rounded-2xl p-5 border border-[#1B4FD8]/10">
                  <p className="text-gray-900 font-bold text-sm mb-1">Find Properties</p>
                  <p className="text-gray-500 text-xs mb-4">
                    Browse verified properties across Mumbai, Pune and Thane.
                  </p>
                  <Link href="/search"
                    className="block w-full text-center bg-[#1B4FD8] hover:bg-[#1640b8] text-white font-bold text-xs py-2.5 rounded-xl transition-colors">
                    Search Properties →
                  </Link>
                </div>

                {/* Related posts */}
                {related.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-gray-900 font-bold text-sm mb-4">Related Articles</p>
                    <div className="space-y-1">
                      {related.map(r => <RelatedCard key={r.id} post={r} />)}
                    </div>
                    <Link href="/blog"
                      className="mt-4 block text-center text-xs text-[#1B4FD8] font-semibold hover:underline underline-offset-4">
                      View all articles →
                    </Link>
                  </div>
                )}

                {/* Popular categories */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-gray-900 font-bold text-sm mb-4">Browse by Category</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(CAT_LABEL).map(([val, label]) => (
                      <Link key={val} href={`/blog?category=${val}`}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                          val === post.category
                            ? CAT_COLOR[val] ?? "bg-gray-100 text-gray-600"
                            : "bg-gray-100 text-gray-600 hover:bg-[#EEF2FF] hover:text-[#1B4FD8]"
                        }`}>
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}