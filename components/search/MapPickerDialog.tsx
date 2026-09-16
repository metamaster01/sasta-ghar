"use client";

// components/search/MapPickerDialog.tsx
// Full-screen dialog with an OpenStreetMap + Leaflet map.
// User clicks anywhere → gets lat/lng → reverse geocoded to label.
// No API key needed — uses OpenStreetMap tiles + Nominatim reverse geocoding.
// Install: npm install leaflet @types/leaflet

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence }      from "framer-motion";

interface Props {
  onSelect: (lat: number, lng: number, label: string) => void;
  onClose:  () => void;
  initialLat?: number;
  initialLng?: number;
}

export default function MapPickerDialog({
  onSelect,
  onClose,
  initialLat = 19.0760,  // Mumbai by default
  initialLng = 72.8777,
}: Props) {
  const mapRef        = useRef<HTMLDivElement>(null);
  const leafletRef    = useRef<any>(null);   // L instance
  const mapInstanceRef= useRef<any>(null);   // map instance
  const markerRef     = useRef<any>(null);   // current marker

  const [selectedLat,   setSelectedLat]   = useState<number | null>(null);
  const [selectedLng,   setSelectedLng]   = useState<number | null>(null);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [reverseLoading,setReverseLoading]= useState(false);
  const [confirming,    setConfirming]    = useState(false);

  // ── Initialize Leaflet ────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    // Dynamic import — Leaflet can't run SSR
    import("leaflet").then(L => {
      leafletRef.current = L;

      // Fix Leaflet default icon path issue with webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      // Create map centered on Mumbai (or initial coords)
      const map = L.map(mapRef.current!, {
        center:    [initialLat, initialLng],
        zoom:      12,
        zoomControl: true,
      });

      // OpenStreetMap tiles — free, no API key
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Click handler — place marker + reverse geocode
      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;

        // Remove previous marker
        if (markerRef.current) markerRef.current.remove();

        // Add new marker
        markerRef.current = L.marker([lat, lng], {
          draggable: true,
        }).addTo(map);

        // Marker drag also updates position
        markerRef.current.on("dragend", async (de: any) => {
          const pos = de.target.getLatLng();
          await updateLocation(pos.lat, pos.lng);
        });

        await updateLocation(lat, lng);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ── Reverse geocode + update state ───────────────────────
  async function updateLocation(lat: number, lng: number) {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setReverseLoading(true);
    setSelectedLabel("Locating…");

    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16`,
        { headers: { "User-Agent": "PropertyLink/1.0 (propertylink.com)" } }
      );
      const data = await res.json();

      if (data?.display_name) {
        // Build a concise label: "Neighbourhood, City"
        const addr     = data.address ?? {};
        const parts    = [
          addr.suburb || addr.neighbourhood || addr.village || addr.town,
          addr.city   || addr.state_district || addr.state,
        ].filter(Boolean);
        const label    = parts.length > 0
          ? parts.join(", ")
          : data.display_name.split(",").slice(0, 2).join(",").trim();
        setSelectedLabel(label);
      } else {
        setSelectedLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      setSelectedLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setReverseLoading(false);
    }
  }

  function handleConfirm() {
    if (selectedLat === null || selectedLng === null) return;
    setConfirming(true);
    onSelect(selectedLat, selectedLng, selectedLabel);
  }

  // Close on Escape key
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />

      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:max-w-3xl sm:mx-4 bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
            style={{ maxHeight: "90vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-gray-900 font-bold text-base" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Pick Location on Map
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  Click anywhere on the map to select a location
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Map container */}
            <div
              ref={mapRef}
              className="w-full"
              style={{ height: "420px" }}
            />

            {/* Bottom panel */}
            <div className="px-5 py-4 bg-white border-t border-gray-100">
              {selectedLat === null ? (
                <p className="text-gray-400 text-sm text-center py-1">
                  👆 Tap on the map to select a location
                </p>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#2EAE88]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      {reverseLoading ? (
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          <span className="text-sm text-gray-400">Getting address…</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-900 font-semibold text-sm truncate">{selectedLabel}</p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {selectedLat?.toFixed(6)}, {selectedLng?.toFixed(6)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleConfirm}
                    disabled={reverseLoading || confirming || selectedLat === null}
                    className="flex-shrink-0 bg-[#1B4FD8] hover:bg-[#1640b8] disabled:opacity-60 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
                  >
                    {confirming ? "Searching…" : "Search Here"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}