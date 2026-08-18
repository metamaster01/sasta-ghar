"use client";

// components/blog/BlogListingClient.tsx
// Client-side category filter + grid for blog listing page.
// Receives all posts from server, filters locally (no extra DB calls).

import { useState } from "react";
import Link         from "next/link";
import Image        from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Post {
  id:              string;
  title:           string;
  slug:            string;
  excerpt:         string | null;
  cover_image_url: string | null;
  category:        string;
  tags?:           string[] | null;
  published_at:    string | null;
  views_count?:    number;
  profiles?:       { full_name: string | null; avatar_url: string | null } | null;
}

interface Category {
  value: string;
  label: string;
}

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function readTime(excerpt: string | null) {
  const words = (excerpt ?? "").split(" ").length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function BlogCard({
  post, catColors, catLabel, index,
}: {
  post: Post; catColors: Record<string, string>;
  catLabel: string; index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full"
        style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}
      >
        {/* Cover */}
        <div className="relative h-44 bg-gray-100 overflow-hidden flex-shrink-0">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${catColors[post.category] ?? "bg-gray-100 text-gray-600"}`}>
              {catLabel}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Meta row */}
          <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-2.5">
            <span>{formatDate(post.published_at)}</span>
            <span>·</span>
            <span>{readTime(post.excerpt)}</span>
            {(post.views_count ?? 0) > 0 && (
              <>
                <span>·</span>
                <span>{post.views_count?.toLocaleString("en-IN")} views</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-gray-900 font-semibold text-sm sm:text-base leading-snug line-clamp-2 mb-2 group-hover:text-[#1B4FD8] transition-colors flex-1">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4">
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#1B4FD8] flex items-center justify-center overflow-hidden">
                {post.profiles?.avatar_url ? (
                  <Image src={post.profiles.avatar_url} alt="" width={24} height={24} className="object-cover" />
                ) : (
                  <span className="text-white text-[8px] font-bold">SG</span>
                )}
              </div>
              <span className="text-gray-500 text-[10px] font-medium">
                {post.profiles?.full_name ?? "Sastaghar Team"}
              </span>
            </div>
            <span className="flex items-center gap-1 text-[#1B4FD8] text-[10px] font-semibold group-hover:gap-1.5 transition-all">
              Read
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function BlogListingClient({
  posts, categories, catColors,
}: {
  posts:      Post[];
  categories: Category[];
  catColors:  Record<string, string>;
}) {
  const [active, setActive] = useState("");
  const [search, setSearch] = useState("");

  const catLabelMap = Object.fromEntries(categories.map(c => [c.value, c.label]));

  const filtered = posts.filter(p => {
    const matchCat    = !active || p.category === active;
    const matchSearch = !search.trim() ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.tags ?? []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div style={{ fontFamily: "Poppins, sans-serif" }}>

      {/* Search + category filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5 sm:max-w-xs w-full">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category pills — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActive(a => a === cat.value ? "" : cat.value)}
              className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200 ${
                active === cat.value
                  ? "bg-[#1B4FD8] text-white border-[#1B4FD8]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-400 mb-6">
        {filtered.length === 0
          ? "No articles found"
          : <><span className="font-semibold text-gray-700">{filtered.length}</span> {filtered.length === 1 ? "article" : "articles"}</>
        }
        {active && <> in <span className="font-semibold text-[#1B4FD8]">{catLabelMap[active]}</span></>}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No articles found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different category or search term</p>
          <button
            onClick={() => { setActive(""); setSearch(""); }}
            className="mt-4 text-[#1B4FD8] text-sm font-semibold hover:underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={active + search}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((post, i) => (
              <BlogCard
                key={post.id}
                post={post}
                catColors={catColors}
                catLabel={catLabelMap[post.category] ?? post.category}
                index={i}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Newsletter CTA at bottom */}
      <div className="mt-16 bg-gradient-to-r from-[#1B4FD8] to-[#0f2d8a] rounded-3xl p-8 sm:p-10 text-center">
        <p className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-2">Stay Updated</p>
        <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">Get Weekly Property Insights</h3>
        <p className="text-blue-100 text-sm mb-6 max-w-md mx-auto">
          Market updates, new locality spotlights, and loan rate changes — delivered every Monday.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-xl text-sm text-gray-800 outline-none focus:ring-2 focus:ring-white/30"
          />
          <button className="bg-[#2EAE88] hover:bg-[#28996f] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors flex-shrink-0">
            Subscribe Free
          </button>
        </div>
      </div>
    </div>
  );
}