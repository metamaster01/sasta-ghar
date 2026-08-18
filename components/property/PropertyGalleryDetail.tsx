"use client";

// components/property/PropertyGalleryDetail.tsx
// Split gallery: large image left + 2 small images right.
// Click any image → full lightbox. Shows photo count badge.

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Media {
  id:        string;
  url:       string;
  media_type:string;
  sort_order:number;
  caption?:  string;
}

export default function PropertyGalleryDetail({
  media, title,
}: {
  media:  Media[];
  title:  string;
}) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const images = media
    .filter(m => m.media_type === "image")
    .sort((a, b) => a.sort_order - b.sort_order);

  if (images.length === 0) return null;

  const main   = images[0];
  const side1  = images[1];
  const side2  = images[2];
  const extra  = images.length - 3;

  function prev() {
    if (lightboxIdx === null) return;
    setLightboxIdx((lightboxIdx - 1 + images.length) % images.length);
  }
  function next() {
    if (lightboxIdx === null) return;
    setLightboxIdx((lightboxIdx + 1) % images.length);
  }

  return (
    <>
      {/* ── Gallery grid ──────────────────────────────────── */}
      <div className="w-full grid grid-cols-3 gap-2 sm:gap-3 h-[260px] sm:h-[340px] lg:h-[400px] rounded-2xl overflow-hidden py-16">

        {/* Main large image — left 2/3 */}
        <div
          className="col-span-2 relative cursor-pointer overflow-hidden group"
          onClick={() => setLightboxIdx(0)}
        >
          <Image
            src={main.url}
            alt={title}
            fill
            sizes="(max-width:640px) 66vw, 55vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
          />
          {/* Verified/Premium badges on gallery */}
          <div className="absolute top-3 left-3 flex gap-2">
            <slot />
          </div>
        </div>

        {/* Right column — two stacked images */}
        <div className="col-span-1 flex flex-col gap-2 sm:gap-3">
          {/* Top right */}
          {side1 ? (
            <div
              className="flex-1 relative cursor-pointer overflow-hidden group"
              onClick={() => setLightboxIdx(1)}
            >
              <Image
                src={side1.url}
                alt={`${title} — photo 2`}
                fill
                sizes="(max-width:640px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ) : <div className="flex-1 bg-gray-100" />}

          {/* Bottom right — with "N Photos" overlay */}
          {side2 ? (
            <div
              className="flex-1 relative cursor-pointer overflow-hidden group"
              onClick={() => setLightboxIdx(2)}
            >
              <Image
                src={side2.url}
                alt={`${title} — photo 3`}
                fill
                sizes="(max-width:640px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Photo count badge */}
              {extra > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-base">
                    +{extra + 1} Photos
                  </span>
                </div>
              )}
            </div>
          ) : <div className="flex-1 bg-gray-100" />}
        </div>
      </div>

      {/* View all button */}
      {images.length > 3 && (
        <div className="flex justify-end mt-2">
          <button
            onClick={() => setLightboxIdx(0)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4FD8] hover:underline underline-offset-4"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            View all {images.length} photos
          </button>
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIdx(null)}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
              onClick={() => setLightboxIdx(null)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium z-10">
              {lightboxIdx + 1} / {images.length}
            </div>

            {/* Image */}
            <motion.div
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-4xl max-h-[80vh] mx-4 rounded-2xl overflow-hidden"
              style={{ aspectRatio: "16/10" }}
              onClick={e => e.stopPropagation()}
            >
              <Image
                src={images[lightboxIdx].url}
                alt={images[lightboxIdx].caption || title}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>

            {/* Prev */}
            {images.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); prev(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); next(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}

            {/* Thumbnail strip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-xs sm:max-w-lg px-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={e => { e.stopPropagation(); setLightboxIdx(i); }}
                  className={`flex-shrink-0 w-12 h-8 rounded-lg overflow-hidden border-2 transition-all ${i === lightboxIdx ? "border-white" : "border-white/30 opacity-60"}`}
                >
                  <div className="relative w-full h-full">
                    <Image src={img.url} alt="" fill className="object-cover" sizes="48px" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}