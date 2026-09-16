"use client";

// components/search/LocationSearchBox.tsx
// Unified location input component used in Navbar and Search page.
// Three input methods:
//   1. Text → Mapbox geocoding autocomplete
//   2. GPS  → browser geolocation
//   3. Map  → click on Leaflet map to pick coordinates
//
// On select → calls onLocationSelect({ label, lat, lng })
//
// Setup: add to .env.local
//   NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
// Get free token at: mapbox.com (100K req/month free, no credit card)

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence }                  from "framer-motion";
import MapPickerDialog                              from "./MapPickerDialog";

export interface LocationResult {
  label: string;  // "Bandra West, Mumbai"
  lat:   number;
  lng:   number;
  type:  "mapbox" | "gps" | "map" | "locality";
}

interface Props {
  value?:           string;
  placeholder?:     string;
  onLocationSelect: (result: LocationResult) => void;
  onClear?:         () => void;
  className?:       string;
  inputClassName?:  string;
}

// ── Mapbox suggestion type ────────────────────────────────────
interface MapboxFeature {
  id:          string;
  place_name:  string;
  center:      [number, number]; // [lng, lat]
  place_type:  string[];
  context?:    { id: string; text: string }[];
}

export default function LocationSearchBox({
  value        = "",
  placeholder  = "Enter locality, city or landmark…",
  onLocationSelect,
  onClear,
  className    = "",
  inputClassName = "",
}: Props) {
  const [query,         setQuery]         = useState(value);
  const [suggestions,   setSuggestions]   = useState<MapboxFeature[]>([]);
  const [open,          setOpen]          = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [gpsLoading,    setGpsLoading]    = useState(false);
  const [gpsError,      setGpsError]      = useState("");
  const [showMapPicker, setShowMapPicker] = useState(false);

  const inputRef    = useRef<HTMLInputElement>(null);
  const dropRef     = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync external value
  useEffect(() => { setQuery(value); }, [value]);

  // ── Fetch Mapbox suggestions ──────────────────────────────
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setSuggestions([]); return; }
    setLoading(true);

    try {
      if (MAPBOX_TOKEN) {
        // Mapbox Geocoding API — biased to India
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${MAPBOX_TOKEN}&country=in&language=en&limit=6&types=place,locality,neighborhood,poi,address`;
        const res  = await fetch(url);
        const data = await res.json();
        setSuggestions(data.features ?? []);
      } else {
        // Fallback: OpenStreetMap Nominatim (no key needed)
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=in&limit=6&addressdetails=1`;
        const res  = await fetch(url, {
          headers: { "User-Agent": "PropertyLink/1.0 (propertylink.com)" },
        });
        const data = await res.json();
        // Normalize Nominatim → MapboxFeature shape
        const normalized: MapboxFeature[] = data.map((item: any) => ({
          id:         item.place_id,
          place_name: item.display_name,
          center:     [parseFloat(item.lon), parseFloat(item.lat)],
          place_type: [item.type],
        }));
        setSuggestions(normalized);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [MAPBOX_TOKEN]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    setGpsError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 350);
  }

  function handleSelect(feature: MapboxFeature) {
    const [lng, lat] = feature.center;
    // Shorten label — strip ", India" suffix
    const label = feature.place_name
      .replace(/, India$/, "")
      .replace(/, इंडिया$/, "");
    setQuery(label);
    setSuggestions([]);
    setOpen(false);
    onLocationSelect({ label, lat, lng, type: "mapbox" });
  }

  // ── GPS ──────────────────────────────────────────────────
  function handleGPS() {
    if (!navigator.geolocation) {
      setGpsError("GPS not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    setGpsError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;

        // Reverse geocode to get human-readable label
        let label = "Your Location";
        try {
          if (MAPBOX_TOKEN) {
            const res  = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=locality,place,neighborhood&language=en`);
            const data = await res.json();
            label = data.features?.[0]?.place_name?.replace(/, India$/, "") ?? label;
          } else {
            const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
              headers: { "User-Agent": "PropertyLink/1.0 (propertylink.com)" },
            });
            const data = await res.json();
            label = data.display_name?.split(",").slice(0, 2).join(", ") ?? label;
          }
        } catch { /* use default label */ }

        setQuery(label);
        setGpsLoading(false);
        setOpen(false);
        onLocationSelect({ label, lat, lng, type: "gps" });
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === 1
            ? "Location access denied. Please allow location in browser settings."
            : "Could not get your location. Please try again."
        );
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }

  // ── Map picker callback ───────────────────────────────────
  function handleMapSelect(lat: number, lng: number, label: string) {
    setQuery(label);
    setShowMapPicker(false);
    onLocationSelect({ label, lat, lng, type: "map" });
  }

  function handleClear() {
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    onClear?.();
    inputRef.current?.focus();
  }

  return (
    <>
      <div className={`relative ${className}`}>
        <div className="relative flex items-center">
          {/* Search icon */}
          <svg className="absolute left-3.5 w-4 h-4 text-gray-400 flex-shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            onFocus={() => { if (query.length >= 2) setOpen(true); }}
            placeholder={placeholder}
            className={`w-full pl-9 pr-20 py-3 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none ${inputClassName}`}
          />

          {/* Right action buttons */}
          <div className="absolute right-2 flex items-center gap-1">
            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* GPS button */}
            <button
              type="button"
              onClick={handleGPS}
              disabled={gpsLoading}
              className="p-1.5 text-gray-400 hover:text-[#1B4FD8] transition-colors disabled:opacity-50"
              title="Use my location"
            >
              {gpsLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                </svg>
              )}
            </button>

            {/* Map picker button */}
            <button
              type="button"
              onClick={() => { setShowMapPicker(true); setOpen(false); }}
              className="p-1.5 text-gray-400 hover:text-[#2EAE88] transition-colors"
              title="Pick on map"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* GPS error */}
        <AnimatePresence>
          {gpsError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute top-full left-0 right-0 mt-1 text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2 z-50"
            >
              {gpsError}
            </motion.p>
          )}
        </AnimatePresence>

        {/* ── Autocomplete dropdown ─────────────────────── */}
        <AnimatePresence>
          {open && (query.length >= 2) && (
            <motion.div
              ref={dropRef}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60]"
              style={{ minWidth: 320, boxShadow: "0 8px 40px -8px rgba(0,0,0,0.18)" }}
            >
              {/* GPS shortcut inside dropdown */}
              <button
                type="button"
                onClick={handleGPS}
                disabled={gpsLoading}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group border-b border-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 group-hover:bg-[#1B4FD8] flex items-center justify-center flex-shrink-0 transition-colors">
                  <svg className="w-4 h-4 text-[#1B4FD8] group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#1B4FD8]">Use current location</p>
                  <p className="text-xs text-gray-400">Auto-detect via GPS</p>
                </div>
              </button>

              {/* Map picker shortcut */}
              <button
                type="button"
                onClick={() => { setShowMapPicker(true); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors group border-b border-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 group-hover:bg-[#2EAE88] flex items-center justify-center flex-shrink-0 transition-colors">
                  <svg className="w-4 h-4 text-[#2EAE88] group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#2EAE88]">Pick on map</p>
                  <p className="text-xs text-gray-400">Click anywhere on the map</p>
                </div>
              </button>

              {/* Suggestions */}
              {loading ? (
                <div className="px-4 py-5 flex items-center gap-3">
                  <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span className="text-sm text-gray-400">Searching locations…</span>
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <div className="px-4 pt-2.5 pb-1">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      {MAPBOX_TOKEN ? "Suggestions" : "Locations"}
                    </p>
                  </div>
                  {suggestions.map(feat => (
                    <button
                      key={feat.id}
                      type="button"
                      onClick={() => handleSelect(feat)}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {feat.place_name.split(",")[0]}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {feat.place_name.split(",").slice(1).join(",").replace(/, India$/, "").trim()}
                        </p>
                      </div>
                    </button>
                  ))}
                </>
              ) : query.length >= 2 && !loading ? (
                <div className="px-4 py-4 text-sm text-gray-400 text-center">
                  No locations found for "{query}"
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map picker dialog */}
      {showMapPicker && (
        <MapPickerDialog
          onSelect={handleMapSelect}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </>
  );
}