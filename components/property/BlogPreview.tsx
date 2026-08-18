"use client";

// components/home/BlogPreview.tsx
// Latest blog posts preview on homepage.
// Receives data as props from Server Component (homepage page.tsx).
// Categories include loan_guide which cross-promotes Vindhya loans.

import Link  from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface BlogPost {
  id:              string;
  title:           string;
  slug:            string;
  excerpt:         string | null;
  cover_image_url: string | null;
  category:        string;
  published_at:    string | null;
}

const CAT_LABEL: Record<string, string> = {
  buying_guide:      "Buying Guide",
  renting_guide:     "Renting Guide",
  loan_guide:        "Home Loan",
  market_report:     "Market Report",
  locality_spotlight:"Locality Spotlight",
  legal_tips:        "Legal Tips",
  property_news:     "Property News",
  investment_tips:   "Investment Tips",
};

const CAT_COLOR: Record<string, string> = {
  buying_guide:      "bg-blue-100 text-blue-700",
  renting_guide:     "bg-purple-100 text-purple-700",
  loan_guide:        "bg-[#2EAE88]/10 text-[#2EAE88]",
  market_report:     "bg-amber-100 text-amber-700",
  locality_spotlight:"bg-indigo-100 text-indigo-700",
  legal_tips:        "bg-red-100 text-red-700",
  property_news:     "bg-orange-100 text-orange-700",
  investment_tips:   "bg-teal-100 text-teal-700",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full"
        style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}
      >
        {/* Cover image */}
        <div className="relative h-44 bg-gray-100 overflow-hidden">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            // Fallback gradient by category
            <div className={`absolute inset-0 flex items-center justify-center ${
              post.category === "loan_guide"
                ? "bg-gradient-to-br from-[#1B4FD8] to-[#0f2d8a]"
                : "bg-gradient-to-br from-gray-100 to-gray-200"
            }`}>
              <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6V7.5z" />
              </svg>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${CAT_COLOR[post.category] ?? "bg-gray-100 text-gray-600"}`}>
              {CAT_LABEL[post.category] ?? post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col h-full">
          {/* Date */}
          {post.published_at && (
            <p className="text-gray-400 text-[10px] font-medium mb-2">
              {formatDate(post.published_at)}
            </p>
          )}

          {/* Title */}
          <h3 className="text-gray-900 font-semibold text-sm sm:text-base leading-snug line-clamp-2 mb-2 group-hover:text-[#1B4FD8] transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed line-clamp-2 flex-1">
              {post.excerpt}
            </p>
          )}

          {/* Read more */}
          <div className="flex items-center gap-1 text-[#1B4FD8] text-xs font-semibold mt-3 group-hover:gap-2 transition-all duration-200">
            Read article
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function BlogPreview({ posts }: { posts: BlogPost[] }) {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  if (!posts.length) return null;

  return (
    <section
      ref={ref}
      className="w-full py-14 sm:py-20 bg-white"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="flex items-end justify-between mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          <div>
            <p className="text-[#1B4FD8] text-xs font-bold tracking-[0.2em] uppercase mb-2">
              Knowledge Hub
            </p>
            <h2 className="text-gray-900 text-2xl sm:text-3xl lg:text-4xl font-bold">
              Latest Articles
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-1.5 text-[#1B4FD8] text-sm font-semibold hover:gap-3 transition-all duration-200"
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post, i) => (
            <BlogCard key={post.id} post={post} index={i} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="sm:hidden text-center mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 border border-[#1B4FD8] text-[#1B4FD8] font-semibold text-sm px-7 py-3 rounded-full"
          >
            View all articles
          </Link>
        </div>
      </div>
    </section>
  );
}