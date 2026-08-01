"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Gallery images ────────────────────────────────────────────
// Replace src with real ImageKit URLs when live.
// aspect: controls the visual height ratio of each cell.
const GALLERY_ITEMS = [
  {
    src: "/gallery/gallery-1.png",
    alt: "Luxury villa with pool at sunset",
    span: "row-span-2",   // tall left cell
    city: "Mumbai",
    type: "Villa",
  },
  {
    src: "/gallery/gallery-2.png",
    alt: "European style street apartment",
    span: "row-span-1",
    city: "Pune",
    type: "Apartment",
  },
  {
    src: "/gallery/gallery-3.png",
    alt: "Ivy covered house with garden",
    span: "row-span-2",   // tall right cell
    city: "Navi Mumbai",
    type: "Independent House",
  },
  {
    src: "/gallery/gallery-4.png  ",
    alt: "Modern minimalist home",
    span: "row-span-1",
    city: "Thane",
    type: "Apartment",
  },
  {
    src: "/gallery/gallery-5.png",
    alt: "Charming countryside cottage",
    span: "row-span-2",   // tall bottom-left
    city: "Pune",
    type: "Farmhouse",
  },
  {
    src: "/gallery/gallery-6.png",
    alt: "Rustic door with floral facade",
    span: "row-span-1",
    city: "Mumbai",
    type: "Studio",
  },
  {
    src: "/gallery/gallery-7.png",
    alt: "Narrow alley townhouse",
    span: "row-span-2",   // tall bottom-right
    city: "Navi Mumbai",
    type: "Townhouse",
  },
  {
    src: "/gallery/gallery-2.png",
    alt: "Contemporary home with pool",
    span: "row-span-1",
    city: "Thane",
    type: "Villa",
  }
];

export default function PropertyGallery() {
  const sectionRef   = useRef<HTMLElement>(null);
  const gridRef      = useRef<HTMLDivElement>(null);
  const isInView     = useInView(sectionRef, { once: true, margin: "-60px" });
  const [lightbox, setLightbox] = useState<null | (typeof GALLERY_ITEMS)[0]>(null);

  // ── GSAP: staggered reveal on scroll ─────────────────────────
  useEffect(() => {
    if (!isInView || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll<HTMLElement>(".gallery-card");

    gsap.fromTo(
      cards,
      { opacity: 0, y: 50, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.75,
        stagger: 0.09,
        ease: "power3.out",
        clearProps: "transform",
      }
    );
  }, [isInView]);

  // Close lightbox on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const openLightbox = useCallback((item: (typeof GALLERY_ITEMS)[0]) => {
    setLightbox(item);
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        className="w-full py-20 sm:py-24 lg:py-28 bg-white"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Heading ──────────────────────────────────────── */}
          <motion.div
            className="text-center mb-12 sm:mb-14"
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[#1B4FD8] text-xs font-bold tracking-[0.22em] uppercase mb-3">
              Explore Properties
            </p>
            <h2 className="text-gray-900 text-3xl sm:text-4xl lg:text-[2.6rem] font-bold leading-tight tracking-tight mb-4">
              Property Gallery
            </h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
              A glimpse into the homes and spaces waiting to be discovered across India.
            </p>
            <div className="mx-auto mt-5 h-0.5 w-14 rounded-full bg-[#1B4FD8]" />
          </motion.div>

          {/* ── Masonry Grid ─────────────────────────────────── */}
          {/*
            CSS Grid masonry: 3 columns, auto rows of 180px.
            Each card has row-span-1 (180px) or row-span-2 (360px + gap).
            Cards are revealed by GSAP on scroll.
          */}
          <div
            ref={gridRef}
            className="grid grid-cols-3 gap-3 sm:gap-4"
            style={{ gridAutoRows: "180px" }}
          >
            {GALLERY_ITEMS.map((item, i) => (
              <GalleryCard
                key={i}
                item={item}
                onClick={() => openLightbox(item)}
              />
            ))}
          </div>

          {/* ── CTA ──────────────────────────────────────────── */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              className="inline-flex items-center gap-2 bg-[#1B4FD8] hover:bg-[#1640b8] active:scale-95 text-white font-semibold text-sm px-7 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-blue-500/20"
            >
              View All Properties
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightbox(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Image container */}
            <motion.div
              className="relative z-10 max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full" style={{ paddingBottom: "66.66%" }}>
                <Image
                  src={lightbox.src}
                  alt={lightbox.alt}
                  fill
                  className="object-cover"
                />
                {/* Overlay info */}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white font-semibold text-lg">{lightbox.alt}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/70 text-sm">{lightbox.city}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/70 text-sm">{lightbox.type}</span>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Individual gallery card ───────────────────────────────────
function GalleryCard({
  item,
  onClick,
}: {
  item: (typeof GALLERY_ITEMS)[0];
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // GSAP magnetic hover effect on the label
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect   = card.getBoundingClientRect();
    const x      = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
    const y      = ((e.clientY - rect.top)  / rect.height - 0.5) * 10;
    gsap.to(card, {
      rotateX: -y,
      rotateY: x,
      transformPerspective: 800,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`gallery-card ${item.span} relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group opacity-0`}
      style={{ willChange: "transform" }}
    >
      {/* Image */}
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 400px"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

      {/* City + type badge — slides up on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out">
        <p className="text-white font-semibold text-xs sm:text-sm leading-tight">{item.alt}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-white/75 text-[10px] sm:text-xs">{item.city}</span>
          <span className="text-white/40 text-[10px]">·</span>
          <span className="text-white/75 text-[10px] sm:text-xs">{item.type}</span>
        </div>
      </div>

      {/* Zoom icon — appears center on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0zM10.5 7.5v6m3-3h-6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
