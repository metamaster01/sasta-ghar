// "use client";

// // app/agent/listings/new/page.tsx  (for add)
// // app/agent/listings/[id]/edit/page.tsx  (for edit — same component, receives propertyId)
// //
// // Usage:
// //   Add:  <AddEditListingPage />
// //   Edit: <AddEditListingPage propertyId="uuid" />
// //
// // Image flow:
// //   1. User picks files → local preview shown immediately
// //   2. Each file uploads to ImageKit with XHR progress bar
// //   3. On upload complete → URL saved to Supabase property_media
// //   4. Cover = sort_order 0 (draggable to reorder)

// import { useState, useEffect, useCallback, useRef } from "react";
// import { useRouter }                                from "next/navigation";
// import Image                                        from "next/image";
// import { motion, AnimatePresence }                  from "framer-motion";
// import { createClient }                             from "@/lib/supabase/client";
// import { uploadToImageKit, UploadProgress }         from "@/lib/imagekit/upload";

// // ── Types ─────────────────────────────────────────────────────
// interface City     { id: string; name: string; slug: string; }
// interface Locality { id: string; name: string; lat: number | null; lng: number | null; }
// interface Amenity  { id: string; name: string; category: string; icon_key: string | null; }

// interface FormData {
//   // Classification
//   category:         string;
//   property_type:    string;
//   // Identity
//   title:            string;
//   description:      string;
//   highlights:       string[];
//   // Price
//   price:            string;
//   price_unit:       string;
//   is_price_negotiable: boolean;
//   maintenance_charge: string;
//   security_deposit: string;
//   // Size
//   carpet_area:      string;
//   builtup_area:     string;
//   area_unit:        string;
//   // Layout
//   bedrooms:         string;
//   bathrooms:        string;
//   balconies:        string;
//   // Building
//   floor_number:     string;
//   total_floors:     string;
//   facing:           string;
//   furnishing:       string;
//   property_age:     string;
//   possession_status:string;
//   possession_date:  string;
//   available_from:   string;
//   // Society
//   society_name:     string;
//   tower_name:       string;
//   // Location
//   city_id:          string;
//   locality_id:      string;
//   address_line:     string;
//   landmark:         string;
//   pincode:          string;
//   lat:              string;
//   lng:              string;
//   // RERA
//   rera_number:      string;
//   is_rera_registered: boolean;
//   // Amenities
//   amenity_ids:      string[];
// }

// const INITIAL_FORM: FormData = {
//   category: "buy", property_type: "apartment",
//   title: "", description: "", highlights: ["","",""],
//   price: "", price_unit: "total", is_price_negotiable: false,
//   maintenance_charge: "", security_deposit: "",
//   carpet_area: "", builtup_area: "", area_unit: "sqft",
//   bedrooms: "", bathrooms: "", balconies: "",
//   floor_number: "", total_floors: "", facing: "",
//   furnishing: "", property_age: "", possession_status: "ready_to_move",
//   possession_date: "", available_from: "",
//   society_name: "", tower_name: "",
//   city_id: "", locality_id: "", address_line: "",
//   landmark: "", pincode: "", lat: "", lng: "",
//   rera_number: "", is_rera_registered: false,
//   amenity_ids: [],
// };

// // ── Enum options ──────────────────────────────────────────────
// const CATEGORIES = [
//   { value: "buy",        label: "Residential — Buy"  },
//   { value: "sell",       label: "Residential — Sell" },
//   { value: "rent",       label: "Residential — Rent" },
//   { value: "commercial", label: "Commercial"          },
//   { value: "plot_land",  label: "Plot / Land"         },
//   { value: "project",    label: "New Project"         },
//   { value: "pg_coliving",label: "PG / Co-living"      },
// ];

// const PROPERTY_TYPES: Record<string, { value: string; label: string }[]> = {
//   buy:        [{ value:"apartment",label:"Apartment"},{ value:"independent_house",label:"Independent House"},{ value:"villa",label:"Villa"},{ value:"row_house",label:"Row House"},{ value:"penthouse",label:"Penthouse"},{ value:"studio",label:"Studio"},{ value:"builder_floor",label:"Builder Floor"}],
//   sell:       [{ value:"apartment",label:"Apartment"},{ value:"independent_house",label:"Independent House"},{ value:"villa",label:"Villa"},{ value:"penthouse",label:"Penthouse"},{ value:"builder_floor",label:"Builder Floor"}],
//   rent:       [{ value:"apartment",label:"Apartment"},{ value:"independent_house",label:"Independent House"},{ value:"studio",label:"Studio"},{ value:"service_apartment",label:"Service Apartment"}],
//   commercial: [{ value:"office_space",label:"Office Space"},{ value:"shop",label:"Shop"},{ value:"showroom",label:"Showroom"},{ value:"warehouse",label:"Warehouse"},{ value:"coworking",label:"Co-working"}],
//   plot_land:  [{ value:"plot",label:"Residential Plot"},{ value:"agricultural_land",label:"Agricultural Land"},{ value:"farmhouse",label:"Farmhouse"}],
//   project:    [{ value:"apartment",label:"Apartment Project"},{ value:"villa",label:"Villa Project"},{ value:"townhouse",label:"Townhouse"}],
//   pg_coliving:[{ value:"studio",label:"PG Room"}],
// };

// const PRICE_UNITS = [
//   { value:"total",     label:"Total Price"    },
//   { value:"per_month", label:"Per Month"      },
//   { value:"per_sqft",  label:"Per Sq.ft"      },
//   { value:"per_acre",  label:"Per Acre"       },
// ];

// const AREA_UNITS = [
//   { value:"sqft",  label:"sq.ft" },
//   { value:"sqm",   label:"sq.m"  },
//   { value:"sqyd",  label:"sq.yd" },
//   { value:"acre",  label:"Acre"  },
//   { value:"gunta", label:"Gunta" },
// ];

// const FURNISHINGS = [
//   { value:"", label:"Select..." },
//   { value:"unfurnished",    label:"Unfurnished"     },
//   { value:"semi_furnished", label:"Semi Furnished"  },
//   { value:"fully_furnished",label:"Fully Furnished" },
// ];

// const POSSESSION = [
//   { value:"ready_to_move",     label:"Ready to Move"      },
//   { value:"under_construction",label:"Under Construction" },
//   { value:"new_launch",        label:"New Launch"         },
// ];

// const PROPERTY_AGE = [
//   { value:"",                   label:"Select..."         },
//   { value:"new_construction",   label:"New Construction"  },
//   { value:"less_than_5_years",  label:"Less than 5 years" },
//   { value:"5_to_10_years",      label:"5–10 years"        },
//   { value:"10_to_20_years",     label:"10–20 years"       },
//   { value:"more_than_20_years", label:"20+ years"         },
// ];

// const FACING = [
//   { value:"", label:"Select..." },
//   { value:"north",      label:"North"       },
//   { value:"south",      label:"South"       },
//   { value:"east",       label:"East"        },
//   { value:"west",       label:"West"        },
//   { value:"north_east", label:"North East"  },
//   { value:"north_west", label:"North West"  },
//   { value:"south_east", label:"South East"  },
//   { value:"south_west", label:"South West"  },
// ];

// const STEPS = [
//   { id: 1, label: "Basic Info"  },
//   { id: 2, label: "Location"    },
//   { id: 3, label: "Details"     },
//   { id: 4, label: "Amenities"   },
//   { id: 5, label: "Photos"      },
//   { id: 6, label: "Review"      },
// ];

// // ── Input component ───────────────────────────────────────────
// function Field({ label, required, hint, children }: {
//   label: string; required?: boolean; hint?: string; children: React.ReactNode;
// }) {
//   return (
//     <div>
//       <label className="block text-xs font-semibold text-gray-600 mb-1.5">
//         {label} {required && <span className="text-red-500">*</span>}
//       </label>
//       {children}
//       {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
//     </div>
//   );
// }

// function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
//   return (
//     <input {...props}
//       className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all disabled:opacity-50 ${props.className ?? ""}`}
//     />
//   );
// }

// function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
//   return (
//     <select {...props}
//       className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all cursor-pointer ${props.className ?? ""}`}
//     >
//       {children}
//     </select>
//   );
// }

// function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
//   return (
//     <textarea {...props}
//       className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all resize-none ${props.className ?? ""}`}
//     />
//   );
// }

// // ── Image uploader component ──────────────────────────────────
// function ImageUploader({
//   propertyId, uploads, setUploads, existingMedia, onRemoveExisting,
// }: {
//   propertyId:        string;
//   uploads:           UploadProgress[];
//   setUploads:        React.Dispatch<React.SetStateAction<UploadProgress[]>>;
//   existingMedia:     any[];
//   onRemoveExisting:  (id: string) => void;
// }) {
//   const dropRef   = useRef<HTMLDivElement>(null);
//   const inputRef  = useRef<HTMLInputElement>(null);

//   function handleFiles(files: FileList | null) {
//     if (!files) return;
//     const valid = Array.from(files).filter(f => {
//       if (!f.type.startsWith("image/")) return false;
//       if (f.size > 10 * 1024 * 1024) { alert(`${f.name} is too large. Max 10MB per image.`); return false; }
//       return true;
//     });

//     const newUploads: UploadProgress[] = valid.map(f => ({
//       file:     f,
//       progress: 0,
//       status:   "pending",
//       localUrl: URL.createObjectURL(f),
//     }));

//     setUploads(prev => [...prev, ...newUploads]);

//     // Start uploading each file
//     newUploads.forEach((up, idx) => {
//       const uploadIdx = uploads.length + idx;
//       uploadFile(up, uploadIdx + uploads.length);
//     });
//   }

//   async function uploadFile(up: UploadProgress, idx: number) {
//     setUploads(prev => prev.map((u, i) => i === idx ? { ...u, status: "uploading" } : u));
//     try {
//       const result = await uploadToImageKit({
//         file:   up.file,
//         folder: `properties/${propertyId}`,
//         onProgress: (pct) => {
//           setUploads(prev => prev.map((u, i) => i === idx ? { ...u, progress: pct } : u));
//         },
//       });
//       setUploads(prev => prev.map((u, i) => i === idx ? { ...u, status: "done", result, progress: 100 } : u));
//     } catch (err: any) {
//       setUploads(prev => prev.map((u, i) => i === idx ? { ...u, status: "error", error: err.message, progress: 0 } : u));
//     }
//   }

//   function removeUpload(idx: number) {
//     setUploads(prev => {
//       const up = prev[idx];
//       if (up?.localUrl) URL.revokeObjectURL(up.localUrl);
//       return prev.filter((_, i) => i !== idx);
//     });
//   }

//   function retryUpload(idx: number) {
//     const up = uploads[idx];
//     if (!up) return;
//     setUploads(prev => prev.map((u, i) => i === idx ? { ...u, status: "pending", progress: 0, error: undefined } : u));
//     uploadFile(up, idx);
//   }

//   const onDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     handleFiles(e.dataTransfer.files);
//   };

//   const totalDone    = uploads.filter(u => u.status === "done").length + existingMedia.length;
//   const totalUploads = uploads.length + existingMedia.length;

//   return (
//     <div className="space-y-4">
//       {/* Drop zone */}
//       <div
//         ref={dropRef}
//         onDrop={onDrop}
//         onDragOver={e => e.preventDefault()}
//         onClick={() => inputRef.current?.click()}
//         className="border-2 border-dashed border-gray-300 hover:border-[#2EAE88] rounded-2xl p-8 text-center cursor-pointer transition-colors group"
//       >
//         <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#2EAE88]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors">
//           <svg className="w-6 h-6 text-gray-400 group-hover:text-[#2EAE88] transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
//           </svg>
//         </div>
//         <p className="text-gray-600 font-semibold text-sm mb-1">
//           Drop photos here or click to browse
//         </p>
//         <p className="text-gray-400 text-xs">JPG, PNG, WEBP · Max 10MB each · First photo = cover image</p>
//         <p className="text-[#2EAE88] text-xs font-semibold mt-2">
//           {totalDone > 0 ? `${totalDone} photo${totalDone > 1 ? "s" : ""} uploaded` : "Add up to 20 photos"}
//         </p>
//         <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
//           onChange={e => handleFiles(e.target.files)} />
//       </div>

//       {/* Existing media (edit mode) */}
//       {existingMedia.length > 0 && (
//         <div>
//           <p className="text-xs font-semibold text-gray-500 mb-2">Existing Photos</p>
//           <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
//             {existingMedia.map((m, i) => (
//               <div key={m.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
//                 <Image src={m.url} alt="" fill className="object-cover" sizes="120px" />
//                 {i === 0 && (
//                   <div className="absolute top-1 left-1 bg-[#2EAE88] text-white text-[8px] font-black px-1.5 py-0.5 rounded">
//                     COVER
//                   </div>
//                 )}
//                 <button onClick={() => onRemoveExisting(m.id)}
//                   className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
//                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* New uploads grid */}
//       {uploads.length > 0 && (
//         <div>
//           <p className="text-xs font-semibold text-gray-500 mb-2">New Photos</p>
//           <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
//             {uploads.map((up, i) => (
//               <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
//                 {/* Preview */}
//                 <img src={up.localUrl} alt="" className="w-full h-full object-cover" />

//                 {/* Cover badge */}
//                 {i === 0 && existingMedia.length === 0 && (
//                   <div className="absolute top-1 left-1 bg-[#2EAE88] text-white text-[8px] font-black px-1.5 py-0.5 rounded">
//                     COVER
//                   </div>
//                 )}

//                 {/* Status overlay */}
//                 {up.status === "uploading" && (
//                   <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
//                     <div className="w-12 h-1.5 bg-white/30 rounded-full overflow-hidden">
//                       <div className="h-full bg-[#2EAE88] rounded-full transition-all"
//                         style={{ width: `${up.progress}%` }} />
//                     </div>
//                     <p className="text-white text-[9px] font-bold mt-1.5">{up.progress}%</p>
//                   </div>
//                 )}

//                 {up.status === "done" && (
//                   <div className="absolute top-1 right-1 w-5 h-5 bg-[#2EAE88] rounded-full flex items-center justify-center">
//                     <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
//                     </svg>
//                   </div>
//                 )}

//                 {up.status === "error" && (
//                   <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center gap-1">
//                     <p className="text-white text-[8px] text-center px-1">Upload failed</p>
//                     <button onClick={() => retryUpload(i)}
//                       className="text-[8px] text-white font-bold bg-white/20 px-2 py-0.5 rounded">
//                       Retry
//                     </button>
//                   </div>
//                 )}

//                 {/* Remove on hover */}
//                 {(up.status === "done" || up.status === "pending") && (
//                   <button onClick={() => removeUpload(i)}
//                     className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
//                     <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Main component ────────────────────────────────────────────
// export default function AddEditListingPage({ propertyId }: { propertyId?: string }) {
//   const supabase  = createClient();
//   const router    = useRouter();
//   const isEdit    = !!propertyId;

//   const [step,          setStep]          = useState(1);
//   const [form,          setForm]          = useState<FormData>(INITIAL_FORM);
//   const [cities,        setCities]        = useState<City[]>([]);
//   const [localities,    setLocalities]    = useState<Locality[]>([]);
//   const [amenities,     setAmenities]     = useState<Amenity[]>([]);
//   const [uploads,       setUploads]       = useState<UploadProgress[]>([]);
//   const [existingMedia, setExistingMedia] = useState<any[]>([]);
//   const [saving,        setSaving]        = useState(false);
//   const [savedId,       setSavedId]       = useState(propertyId ?? "");
//   const [errors,        setErrors]        = useState<Record<string, string>>({});
//   const [localitySearch,setLocalitySearch]= useState("");
//   const [locLoading,    setLocLoading]    = useState(false);
//   const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

//   // ── Load reference data ───────────────────────────────────
//   useEffect(() => {
//     async function load() {
//       const [citiesRes, amenitiesRes] = await Promise.all([
//         supabase.from("cities").select("id,name,slug").eq("is_active", true).order("sort_order"),
//         supabase.from("amenities").select("id,name,category,icon_key").order("category,name"),
//       ]);
//       setCities(citiesRes.data ?? []);
//       setAmenities(amenitiesRes.data ?? []);

//       // Load existing property if editing
//       if (propertyId) {
//         const { data: p } = await supabase
//           .from("properties")
//           .select("*, property_media(*), property_amenities(amenity_id)")
//           .eq("id", propertyId)
//           .single();

//         if (p) {
//           setForm({
//             category:         p.category        ?? "buy",
//             property_type:    p.property_type   ?? "apartment",
//             title:            p.title           ?? "",
//             description:      p.description     ?? "",
//             highlights:       p.highlights      ?? ["","",""],
//             price:            String(p.price    ?? ""),
//             price_unit:       p.price_unit      ?? "total",
//             is_price_negotiable: p.is_price_negotiable ?? false,
//             maintenance_charge: String(p.maintenance_charge ?? ""),
//             security_deposit:   String(p.security_deposit   ?? ""),
//             carpet_area:      String(p.carpet_area    ?? ""),
//             builtup_area:     String(p.builtup_area   ?? ""),
//             area_unit:        p.area_unit        ?? "sqft",
//             bedrooms:         String(p.bedrooms  ?? ""),
//             bathrooms:        String(p.bathrooms ?? ""),
//             balconies:        String(p.balconies ?? ""),
//             floor_number:     String(p.floor_number  ?? ""),
//             total_floors:     String(p.total_floors  ?? ""),
//             facing:           p.facing           ?? "",
//             furnishing:       p.furnishing       ?? "",
//             property_age:     p.property_age     ?? "",
//             possession_status:p.possession_status ?? "ready_to_move",
//             possession_date:  p.possession_date  ?? "",
//             available_from:   p.available_from   ?? "",
//             society_name:     p.society_name     ?? "",
//             tower_name:       p.tower_name       ?? "",
//             city_id:          p.city_id          ?? "",
//             locality_id:      p.locality_id      ?? "",
//             address_line:     p.address_line     ?? "",
//             landmark:         p.landmark         ?? "",
//             pincode:          p.pincode          ?? "",
//             lat:              String(p.lat       ?? ""),
//             lng:              String(p.lng       ?? ""),
//             rera_number:      p.rera_number      ?? "",
//             is_rera_registered: p.is_rera_registered ?? false,
//             amenity_ids:      (p.property_amenities ?? []).map((a: any) => a.amenity_id),
//           });

//           const media = (p.property_media ?? [])
//             .sort((a: any, b: any) => a.sort_order - b.sort_order);
//           setExistingMedia(media);

//           if (p.city_id) loadLocalities(p.city_id);
//         }
//       }
//     }
//     load();
//   }, [propertyId]);

//   async function loadLocalities(cityId: string) {
//     const { data } = await supabase
//       .from("localities")
//       .select("id,name,lat,lng")
//       .eq("city_id", cityId)
//       .eq("is_active", true)
//       .order("name");
//     setLocalities(data ?? []);
//   }

//   function set(key: keyof FormData, val: any) {
//     setForm(f => ({ ...f, [key]: val }));
//     if (errors[key]) setErrors(e => ({ ...e, [key]: "" }));
//   }

//   // ── Mapbox location search ────────────────────────────────
//   const [mapboxSuggestions, setMapboxSuggestions] = useState<any[]>([]);
//   const [mapboxOpen,        setMapboxOpen]        = useState(false);
//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   async function searchMapbox(query: string) {
//     if (!query.trim() || query.length < 3) { setMapboxSuggestions([]); return; }
//     if (!MAPBOX_TOKEN) return;
//     const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=in&language=en&limit=5&types=address,neighborhood,locality,poi`;
//     const res  = await fetch(url);
//     const data = await res.json();
//     setMapboxSuggestions(data.features ?? []);
//     setMapboxOpen(true);
//   }

//   function handleLocationInput(val: string) {
//     set("address_line", val);
//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     debounceRef.current = setTimeout(() => searchMapbox(val), 350);
//   }

//   function selectMapboxPlace(feature: any) {
//     const [lng, lat] = feature.center;
//     const label = feature.place_name.replace(/, India$/, "");
//     set("address_line", label);
//     set("lat", String(lat));
//     set("lng", String(lng));
//     // Auto-fill pincode if present
//     const postalCode = feature.context?.find((c: any) => c.id.startsWith("postcode"));
//     if (postalCode) set("pincode", postalCode.text);
//     setMapboxSuggestions([]);
//     setMapboxOpen(false);
//   }

//   // ── GPS detect ────────────────────────────────────────────
//   function detectGPS() {
//     if (!navigator.geolocation) return;
//     setLocLoading(true);
//     navigator.geolocation.getCurrentPosition(async pos => {
//       const { latitude: lat, longitude: lng } = pos.coords;
//       set("lat", String(lat));
//       set("lng", String(lng));
//       // Reverse geocode
//       try {
//         if (MAPBOX_TOKEN) {
//           const res  = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,neighborhood&language=en`);
//           const data = await res.json();
//           const label = data.features?.[0]?.place_name?.replace(/, India$/, "") ?? "";
//           if (label) set("address_line", label);
//           const postalCode = data.features?.[0]?.context?.find((c: any) => c.id.startsWith("postcode"));
//           if (postalCode) set("pincode", postalCode.text);
//         } else {
//           const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
//             headers: { "User-Agent": "Sastaghar/1.0" },
//           });
//           const data = await res.json();
//           if (data?.display_name) set("address_line", data.display_name.split(",").slice(0,3).join(", "));
//           if (data?.address?.postcode) set("pincode", data.address.postcode);
//         }
//       } catch {}
//       setLocLoading(false);
//     }, () => setLocLoading(false));
//   }

//   // ── Remove existing media ─────────────────────────────────
//   async function removeExistingMedia(id: string) {
//     await supabase.from("property_media").delete().eq("id", id);
//     setExistingMedia(m => m.filter(x => x.id !== id));
//   }

//   // ── Validation ────────────────────────────────────────────
//   function validate(s: number): boolean {
//     const e: Record<string, string> = {};
//     if (s === 1) {
//       if (!form.title.trim())     e.title    = "Title is required";
//       if (!form.category)         e.category = "Category is required";
//       if (!form.price.trim())     e.price    = "Price is required";
//       if (isNaN(Number(form.price))) e.price = "Price must be a number";
//     }
//     if (s === 2) {
//       if (!form.city_id)          e.city_id  = "City is required";
//     }
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   }

//   // ── Save draft / property to Supabase ────────────────────
//   async function saveProperty(status: "draft" | "pending_review" = "draft"): Promise<string | null> {
//     setSaving(true);
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) { setSaving(false); return null; }

//     // Generate slug
//     const slugBase = form.title.toLowerCase()
//       .replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 50);
//     const slug = `${slugBase}-${Math.random().toString(36).slice(2,7)}`;

//     // Typed as explicit object — cast individual enums to satisfy Supabase types.
//     const payload = {
//       owner_id:           user.id,
//       category:           form.category            as any,
//       property_type:      form.property_type       as any,
//       title:              form.title.trim(),
//       ...(isEdit ? {} : { slug }),
//       description:        form.description.trim()  || null,
//       highlights:         form.highlights.filter(h => h.trim()),
//       price:              parseFloat(form.price)   || 0,
//       price_unit:         form.price_unit          as any,
//       is_price_negotiable:form.is_price_negotiable,
//       maintenance_charge: parseFloat(form.maintenance_charge) || null,
//       security_deposit:   parseFloat(form.security_deposit)   || null,
//       carpet_area:        parseFloat(form.carpet_area)        || null,
//       builtup_area:       parseFloat(form.builtup_area)       || null,
//       area_unit:          form.area_unit            as any,
//       bedrooms:           parseInt(form.bedrooms)  || null,
//       bathrooms:          parseInt(form.bathrooms) || null,
//       balconies:          parseInt(form.balconies) || null,
//       floor_number:       parseInt(form.floor_number)  || null,
//       total_floors:       parseInt(form.total_floors)  || null,
//       facing:             (form.facing           || null) as any,
//       furnishing:         (form.furnishing       || null) as any,
//       property_age:       (form.property_age     || null) as any,
//       possession_status:  form.possession_status  as any,
//       possession_date:    form.possession_date    || null,
//       available_from:     form.available_from     || null,
//       society_name:       form.society_name.trim()|| null,
//       tower_name:         form.tower_name.trim()  || null,
//       city_id:            form.city_id            || null,
//       locality_id:        form.locality_id        || null,
//       address_line:       form.address_line.trim()|| null,
//       landmark:           form.landmark.trim()    || null,
//       pincode:            form.pincode.trim()     || null,
//       lat:                parseFloat(form.lat)    || null,
//       lng:                parseFloat(form.lng)    || null,
//       rera_number:        form.rera_number.trim() || null,
//       is_rera_registered: form.is_rera_registered,
//       status:             status                  as any,
//     };

//     let propId = savedId;

//     if (isEdit && propertyId) {
//       const { error } = await supabase.from("properties").update(payload as any).eq("id", propertyId);
//       if (error) { console.error(error); setSaving(false); return null; }
//       propId = propertyId;
//     } else if (!propId) {
//       const { data, error } = await supabase.from("properties").insert(payload as any).select("id").single();
//       if (error || !data) { console.error(error); setSaving(false); return null; }
//       propId = data.id;
//       setSavedId(propId);
//     } else {
//       await supabase.from("properties").update(payload as any).eq("id", propId);
//     }

//     // Save amenities
//     if (propId && form.amenity_ids.length > 0) {
//       await supabase.from("property_amenities").delete().eq("property_id", propId);
//       const amenityRows = form.amenity_ids.map((amenity_id) => ({
//         property_id: propId as string,
//         amenity_id,
//       }));
//       await supabase.from("property_amenities").insert(amenityRows);
//     }

//     // Save uploaded images to property_media
//     const doneUploads = uploads.filter(u => u.status === "done" && u.result);
//     const existingCount = existingMedia.length;
//     for (let i = 0; i < doneUploads.length; i++) {
//       const up = doneUploads[i];
//       if (!up.result) continue;
//       await supabase.from("property_media").insert({
//         property_id:       propId,
//         url:               up.result.url,
//         thumbnail_url:     `${up.result.url}?tr=w-400,h-300,c-maintain_ratio,q-80`,
//         media_type:        "image",
//         sort_order:        existingCount + i,
//         moderation_status: "approved",
//         caption:           null,
//       });
//     }

//     setSaving(false);
//     return propId;
//   }

//   async function handleNext() {
//     if (!validate(step)) return;
//     // Auto-save draft on each step
//     if (step >= 2) {
//       const id = await saveProperty("draft");
//       if (!id) return;
//     }
//     setStep(s => Math.min(6, s + 1));
//   }

//   async function handleSubmit() {
//     const id = await saveProperty("pending_review");
//     if (id) {
//       router.push("/agent/listings?submitted=1");
//     }
//   }

//   async function handleSaveDraft() {
//     const id = await saveProperty("draft");
//     if (id) router.push("/agent/listings?saved=1");
//   }

//   // ── Amenity toggle ────────────────────────────────────────
//   function toggleAmenity(id: string) {
//     set("amenity_ids", form.amenity_ids.includes(id)
//       ? form.amenity_ids.filter(a => a !== id)
//       : [...form.amenity_ids, id]
//     );
//   }

//   const amenityGroups = amenities.reduce<Record<string, Amenity[]>>((acc, a) => {
//     if (!acc[a.category]) acc[a.category] = [];
//     acc[a.category].push(a);
//     return acc;
//   }, {});

//   const showResidentialFields = ["buy","sell","rent","pg_coliving"].includes(form.category);
//   const showRentalFields      = ["rent","pg_coliving"].includes(form.category);

//   // ── Render ────────────────────────────────────────────────
//   return (
//     <div style={{ fontFamily: "Poppins, sans-serif" }}>

//       {/* Header */}
//       <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
//         <div>
//           <h2 className="text-gray-900 font-bold text-xl">{isEdit ? "Edit Listing" : "Add New Listing"}</h2>
//           <p className="text-gray-400 text-xs mt-0.5">
//             {isEdit ? "Update your property details" : "Fill in the details to list your property on Sastaghar"}
//           </p>
//         </div>
//         <button onClick={handleSaveDraft} disabled={saving}
//           className="flex items-center gap-2 text-sm font-semibold text-gray-600 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
//           <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
//           </svg>
//           Save as Draft
//         </button>
//       </div>

//       {/* Step progress */}
//       <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
//         {STEPS.map((s, i) => (
//           <div key={s.id} className="flex items-center flex-shrink-0">
//             <button
//               onClick={() => step > s.id && setStep(s.id)}
//               className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
//                 step === s.id
//                   ? "bg-[#2EAE88] text-white shadow-sm"
//                   : step > s.id
//                   ? "text-[#2EAE88] cursor-pointer hover:bg-[#2EAE88]/10"
//                   : "text-gray-400 cursor-default"
//               }`}
//             >
//               <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
//                 step === s.id ? "bg-white text-[#2EAE88]" : step > s.id ? "bg-[#2EAE88] text-white" : "bg-gray-200 text-gray-500"
//               }`}>
//                 {step > s.id ? "✓" : s.id}
//               </div>
//               <span className="text-xs font-semibold whitespace-nowrap">{s.label}</span>
//             </button>
//             {i < STEPS.length - 1 && (
//               <div className={`w-6 h-px mx-1 ${step > s.id ? "bg-[#2EAE88]" : "bg-gray-200"}`} />
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Step content */}
//       <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8"
//         style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}>

//         <AnimatePresence mode="wait">

//           {/* ── STEP 1: Basic Info ──────────────────────── */}
//           {step === 1 && (
//             <motion.div key="step1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
//               className="space-y-6">
//               <h3 className="text-gray-900 font-bold text-base border-b border-gray-100 pb-4">Basic Information</h3>

//               {/* Category + Type */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <Field label="Listing Category" required>
//                   <Select value={form.category} onChange={e => { set("category",""); set("property_type",""); set("category", e.target.value); }}>
//                     {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
//                   </Select>
//                   {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
//                 </Field>
//                 <Field label="Property Type" required>
//                   <Select value={form.property_type} onChange={e => set("property_type", e.target.value)}>
//                     {(PROPERTY_TYPES[form.category] ?? PROPERTY_TYPES["buy"]).map(t => (
//                       <option key={t.value} value={t.value}>{t.label}</option>
//                     ))}
//                   </Select>
//                 </Field>
//               </div>

//               {/* Title */}
//               <Field label="Property Title" required hint="Be specific: e.g. '3BHK Apartment in Bandra West near Linking Road'">
//                 <Input type="text" value={form.title} onChange={e => set("title", e.target.value)}
//                   placeholder="e.g. 3BHK Apartment in Kandivali West" maxLength={120} />
//                 <p className="text-[10px] text-gray-400 mt-1 text-right">{form.title.length}/120</p>
//                 {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
//               </Field>

//               {/* Description */}
//               <Field label="Description" hint="Describe the property, its features, and why someone should buy/rent it.">
//                 <Textarea value={form.description} onChange={e => set("description", e.target.value)}
//                   placeholder="Describe the property…" rows={5} maxLength={2000} />
//                 <p className="text-[10px] text-gray-400 mt-1 text-right">{form.description.length}/2000</p>
//               </Field>

//               {/* Highlights */}
//               <Field label="Key Highlights" hint="Up to 3 bullet points shown on the listing card.">
//                 <div className="space-y-2">
//                   {form.highlights.map((h, i) => (
//                     <div key={i} className="flex items-center gap-2">
//                       <span className="text-[#2EAE88] text-sm flex-shrink-0">✓</span>
//                       <Input type="text" value={h}
//                         onChange={e => set("highlights", form.highlights.map((x,j) => j===i ? e.target.value : x))}
//                         placeholder={`Highlight ${i+1} — e.g. "Spacious 1200 sqft with open terrace"`}
//                         maxLength={100} />
//                     </div>
//                   ))}
//                 </div>
//               </Field>

//               {/* Price */}
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 <div className="sm:col-span-2">
//                   <Field label="Price" required>
//                     <div className="relative">
//                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
//                       <Input type="number" value={form.price} onChange={e => set("price", e.target.value)}
//                         placeholder="e.g. 8500000" className="pl-8" />
//                     </div>
//                     {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
//                   </Field>
//                 </div>
//                 <Field label="Price Unit">
//                   <Select value={form.price_unit} onChange={e => set("price_unit", e.target.value)}>
//                     {PRICE_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
//                   </Select>
//                 </Field>
//               </div>

//               {/* Rental extras */}
//               {showRentalFields && (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <Field label="Security Deposit (₹)">
//                     <Input type="number" value={form.security_deposit}
//                       onChange={e => set("security_deposit", e.target.value)} placeholder="e.g. 100000" />
//                   </Field>
//                   <Field label="Maintenance Charge (₹/mo)">
//                     <Input type="number" value={form.maintenance_charge}
//                       onChange={e => set("maintenance_charge", e.target.value)} placeholder="e.g. 3000" />
//                   </Field>
//                 </div>
//               )}

//               {/* Negotiable toggle */}
//               <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 cursor-pointer"
//                 onClick={() => set("is_price_negotiable", !form.is_price_negotiable)}>
//                 <div className={`w-10 h-5 rounded-full relative transition-colors ${form.is_price_negotiable ? "bg-[#2EAE88]" : "bg-gray-300"}`}>
//                   <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_price_negotiable ? "left-5" : "left-0.5"}`} />
//                 </div>
//                 <div>
//                   <p className="text-gray-700 text-sm font-medium">Price is negotiable</p>
//                   <p className="text-gray-400 text-[10px]">Shows "Negotiable" badge on listing</p>
//                 </div>
//               </div>
//             </motion.div>
//           )}

//           {/* ── STEP 2: Location ────────────────────────── */}
//           {step === 2 && (
//             <motion.div key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
//               className="space-y-6">
//               <h3 className="text-gray-900 font-bold text-base border-b border-gray-100 pb-4">Location Details</h3>

//               {/* City + Locality */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <Field label="City" required>
//                   <Select value={form.city_id} onChange={e => { set("city_id", e.target.value); set("locality_id",""); loadLocalities(e.target.value); }}>
//                     <option value="">Select city…</option>
//                     {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                   </Select>
//                   {errors.city_id && <p className="text-xs text-red-500 mt-1">{errors.city_id}</p>}
//                 </Field>
//                 <Field label="Locality / Area">
//                   <Select value={form.locality_id}
//                     onChange={e => {
//                       set("locality_id", e.target.value);
//                       const loc = localities.find(l => l.id === e.target.value);
//                       if (loc?.lat) set("lat", String(loc.lat));
//                       if (loc?.lng) set("lng", String(loc.lng));
//                     }}
//                     disabled={!form.city_id}
//                   >
//                     <option value="">Select locality…</option>
//                     {localities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
//                   </Select>
//                 </Field>
//               </div>

//               {/* Address with Mapbox */}
//               <Field label="Street Address / Project Name"
//                 hint={MAPBOX_TOKEN ? "Start typing for smart address suggestions" : "Enter the full address"}>
//                 <div className="relative">
//                   <div className="flex gap-2">
//                     <div className="relative flex-1">
//                       <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                       </svg>
//                       <input type="text" value={form.address_line}
//                         onChange={e => handleLocationInput(e.target.value)}
//                         placeholder="Search address or enter manually…"
//                         className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all" />
//                     </div>
//                     {/* GPS */}
//                     <button type="button" onClick={detectGPS} disabled={locLoading}
//                       className="flex-shrink-0 w-12 h-12 bg-gray-100 hover:bg-[#2EAE88]/10 hover:text-[#2EAE88] text-gray-500 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
//                       title="Detect my location">
//                       {locLoading ? (
//                         <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
//                       ) : (
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
//                         </svg>
//                       )}
//                     </button>
//                   </div>

//                   {/* Mapbox dropdown */}
//                   <AnimatePresence>
//                     {mapboxOpen && mapboxSuggestions.length > 0 && (
//                       <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
//                         className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
//                         {mapboxSuggestions.map(feat => (
//                           <button key={feat.id} type="button" onClick={() => selectMapboxPlace(feat)}
//                             className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
//                             <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
//                             </svg>
//                             <div>
//                               <p className="text-sm font-medium text-gray-800">{feat.place_name.split(",")[0]}</p>
//                               <p className="text-xs text-gray-400">{feat.place_name.split(",").slice(1).join(",").trim()}</p>
//                             </div>
//                           </button>
//                         ))}
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               </Field>

//               {/* Landmark + Pincode */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <Field label="Landmark" hint="e.g. Near XYZ Mall / School / Metro Station">
//                   <Input type="text" value={form.landmark}
//                     onChange={e => set("landmark", e.target.value)} placeholder="Near…" />
//                 </Field>
//                 <Field label="Pincode">
//                   <Input type="text" value={form.pincode}
//                     onChange={e => set("pincode", e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="6-digit pincode" />
//                 </Field>
//               </div>

//               {/* Coordinates display */}
//               {(form.lat || form.lng) && (
//                 <div className="bg-[#2EAE88]/5 border border-[#2EAE88]/20 rounded-xl px-4 py-3 flex items-center gap-3">
//                   <svg className="w-4 h-4 text-[#2EAE88] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
//                   </svg>
//                   <div>
//                     <p className="text-[#2EAE88] text-xs font-semibold">Location pinned</p>
//                     <p className="text-gray-500 text-[10px]">
//                       {parseFloat(form.lat).toFixed(6)}, {parseFloat(form.lng).toFixed(6)}
//                     </p>
//                   </div>
//                   <button type="button" onClick={() => { set("lat",""); set("lng",""); }}
//                     className="ml-auto text-xs text-gray-400 hover:text-red-500">Clear</button>
//                 </div>
//               )}

//               {/* Map preview */}
//               {form.lat && form.lng && (
//                 <div className="rounded-xl overflow-hidden border border-gray-200 h-48">
//                   <iframe
//                     src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(form.lng)-0.01},${parseFloat(form.lat)-0.01},${parseFloat(form.lng)+0.01},${parseFloat(form.lat)+0.01}&layer=mapnik&marker=${form.lat},${form.lng}`}
//                     width="100%" height="192" style={{ border: 0 }} loading="lazy" />
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* ── STEP 3: Property Details ─────────────── */}
//           {step === 3 && (
//             <motion.div key="step3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
//               className="space-y-6">
//               <h3 className="text-gray-900 font-bold text-base border-b border-gray-100 pb-4">Property Details</h3>

//               {/* Area */}
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 <Field label="Carpet Area">
//                   <Input type="number" value={form.carpet_area} onChange={e => set("carpet_area", e.target.value)} placeholder="e.g. 850" />
//                 </Field>
//                 <Field label="Built-up Area">
//                   <Input type="number" value={form.builtup_area} onChange={e => set("builtup_area", e.target.value)} placeholder="e.g. 980" />
//                 </Field>
//                 <Field label="Area Unit">
//                   <Select value={form.area_unit} onChange={e => set("area_unit", e.target.value)}>
//                     {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
//                   </Select>
//                 </Field>
//               </div>

//               {/* Layout — residential only */}
//               {showResidentialFields && (
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                   <Field label="Bedrooms">
//                     <Select value={form.bedrooms} onChange={e => set("bedrooms", e.target.value)}>
//                       <option value="">–</option>
//                       {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} BHK</option>)}
//                     </Select>
//                   </Field>
//                   <Field label="Bathrooms">
//                     <Select value={form.bathrooms} onChange={e => set("bathrooms", e.target.value)}>
//                       <option value="">–</option>
//                       {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
//                     </Select>
//                   </Field>
//                   <Field label="Balconies">
//                     <Select value={form.balconies} onChange={e => set("balconies", e.target.value)}>
//                       <option value="">–</option>
//                       {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
//                     </Select>
//                   </Field>
//                   <Field label="Furnishing">
//                     <Select value={form.furnishing} onChange={e => set("furnishing", e.target.value)}>
//                       {FURNISHINGS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
//                     </Select>
//                   </Field>
//                 </div>
//               )}

//               {/* Floor details */}
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                 <Field label="Floor Number">
//                   <Input type="number" value={form.floor_number} onChange={e => set("floor_number", e.target.value)} placeholder="e.g. 4" />
//                 </Field>
//                 <Field label="Total Floors">
//                   <Input type="number" value={form.total_floors} onChange={e => set("total_floors", e.target.value)} placeholder="e.g. 12" />
//                 </Field>
//                 <Field label="Facing">
//                   <Select value={form.facing} onChange={e => set("facing", e.target.value)}>
//                     {FACING.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
//                   </Select>
//                 </Field>
//                 <Field label="Property Age">
//                   <Select value={form.property_age} onChange={e => set("property_age", e.target.value)}>
//                     {PROPERTY_AGE.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
//                   </Select>
//                 </Field>
//               </div>

//               {/* Possession */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <Field label="Possession Status" required>
//                   <Select value={form.possession_status} onChange={e => set("possession_status", e.target.value)}>
//                     {POSSESSION.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
//                   </Select>
//                 </Field>
//                 {form.possession_status === "under_construction" && (
//                   <Field label="Expected Possession Date">
//                     <Input type="date" value={form.possession_date} onChange={e => set("possession_date", e.target.value)} />
//                   </Field>
//                 )}
//                 {showRentalFields && (
//                   <Field label="Available From">
//                     <Input type="date" value={form.available_from} onChange={e => set("available_from", e.target.value)} />
//                   </Field>
//                 )}
//               </div>

//               {/* Society */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <Field label="Society / Project Name">
//                   <Input type="text" value={form.society_name} onChange={e => set("society_name", e.target.value)} placeholder="e.g. Hiranandani Gardens" />
//                 </Field>
//                 <Field label="Tower / Wing Name">
//                   <Input type="text" value={form.tower_name} onChange={e => set("tower_name", e.target.value)} placeholder="e.g. Tower A / Wing 3" />
//                 </Field>
//               </div>

//               {/* RERA */}
//               <div className="space-y-3">
//                 <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 cursor-pointer"
//                   onClick={() => set("is_rera_registered", !form.is_rera_registered)}>
//                   <div className={`w-10 h-5 rounded-full relative transition-colors ${form.is_rera_registered ? "bg-[#2EAE88]" : "bg-gray-300"}`}>
//                     <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_rera_registered ? "left-5" : "left-0.5"}`} />
//                   </div>
//                   <p className="text-gray-700 text-sm font-medium">RERA Registered</p>
//                 </div>
//                 {form.is_rera_registered && (
//                   <Field label="RERA Number" hint="MahaRERA / relevant state RERA number">
//                     <Input type="text" value={form.rera_number} onChange={e => set("rera_number", e.target.value)} placeholder="e.g. P51700012345" />
//                   </Field>
//                 )}
//               </div>
//             </motion.div>
//           )}

//           {/* ── STEP 4: Amenities ───────────────────────── */}
//           {step === 4 && (
//             <motion.div key="step4" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
//               className="space-y-6">
//               <div className="flex items-center justify-between border-b border-gray-100 pb-4">
//                 <h3 className="text-gray-900 font-bold text-base">Amenities & Features</h3>
//                 <span className="text-xs text-gray-400">{form.amenity_ids.length} selected</span>
//               </div>

//               {Object.entries(amenityGroups).map(([cat, items]) => (
//                 <div key={cat}>
//                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 capitalize">
//                     {cat.replace(/_/g," ")}
//                   </p>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
//                     {items.map(a => {
//                       const selected = form.amenity_ids.includes(a.id);
//                       return (
//                         <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)}
//                           className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
//                             selected
//                               ? "border-[#2EAE88] bg-[#2EAE88]/5 text-[#2EAE88]"
//                               : "border-gray-200 text-gray-600 hover:border-gray-300"
//                           }`}>
//                           <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selected ? "bg-[#2EAE88] border-[#2EAE88]" : "border-gray-300"}`}>
//                             {selected && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
//                           </div>
//                           {a.name}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ))}
//             </motion.div>
//           )}

//           {/* ── STEP 5: Photos ──────────────────────────── */}
//           {step === 5 && (
//             <motion.div key="step5" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
//               className="space-y-6">
//               <div className="border-b border-gray-100 pb-4">
//                 <h3 className="text-gray-900 font-bold text-base">Property Photos</h3>
//                 <p className="text-gray-400 text-xs mt-1">
//                   First photo = cover image. Add up to 20 high-quality photos. Photos are uploaded to ImageKit CDN for fast loading.
//                 </p>
//               </div>

//               {!savedId && (
//                 <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
//                   ℹ️ Saving basic info first before uploading photos…
//                 </div>
//               )}

//               <ImageUploader
//                 propertyId={savedId || "temp"}
//                 uploads={uploads}
//                 setUploads={setUploads}
//                 existingMedia={existingMedia}
//                 onRemoveExisting={removeExistingMedia}
//               />

//               {/* Upload summary */}
//               {uploads.some(u => u.status === "uploading") && (
//                 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-blue-700 text-sm font-semibold">Uploading photos…</p>
//                     <p className="text-blue-500 text-xs">
//                       {uploads.filter(u => u.status === "done").length}/{uploads.length} done
//                     </p>
//                   </div>
//                   <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
//                     <div className="h-full bg-blue-500 rounded-full transition-all"
//                       style={{ width: `${(uploads.filter(u => u.status === "done").length / uploads.length) * 100}%` }} />
//                   </div>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* ── STEP 6: Review & Submit ──────────────── */}
//           {step === 6 && (
//             <motion.div key="step6" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
//               className="space-y-6">
//               <h3 className="text-gray-900 font-bold text-base border-b border-gray-100 pb-4">Review & Submit</h3>

//               {/* Summary grid */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {[
//                   { label: "Category",    value: CATEGORIES.find(c => c.value === form.category)?.label ?? form.category },
//                   { label: "Title",       value: form.title },
//                   { label: "Price",       value: `₹${parseFloat(form.price).toLocaleString("en-IN")} ${PRICE_UNITS.find(u => u.value === form.price_unit)?.label ?? ""}` },
//                   { label: "Location",    value: `${cities.find(c => c.id === form.city_id)?.name ?? "–"}, ${localities.find(l => l.id === form.locality_id)?.name ?? "–"}` },
//                   { label: "Bedrooms",    value: form.bedrooms ? `${form.bedrooms} BHK` : "–" },
//                   { label: "Carpet Area", value: form.carpet_area ? `${form.carpet_area} ${form.area_unit}` : "–" },
//                   { label: "Possession",  value: POSSESSION.find(p => p.value === form.possession_status)?.label ?? "–" },
//                   { label: "Photos",      value: `${uploads.filter(u => u.status === "done").length + existingMedia.length} uploaded` },
//                   { label: "Amenities",   value: `${form.amenity_ids.length} selected` },
//                 ].map(r => (
//                   <div key={r.label} className="bg-gray-50 rounded-xl p-4">
//                     <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide mb-1">{r.label}</p>
//                     <p className="text-gray-800 text-sm font-semibold truncate">{r.value || "–"}</p>
//                   </div>
//                 ))}
//               </div>

//               {/* Info box */}
//               <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
//                 <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
//                 </svg>
//                 <div>
//                   <p className="text-blue-800 font-semibold text-sm">What happens next?</p>
//                   <p className="text-blue-600 text-xs mt-1 leading-relaxed">
//                     Your listing will be submitted for admin review. Once approved (usually within 24 hours), it will go live on Sastaghar. You'll receive a notification when it's approved.
//                   </p>
//                 </div>
//               </div>

//               {/* Submit button */}
//               <button onClick={handleSubmit} disabled={saving || uploads.some(u => u.status === "uploading")}
//                 className="w-full bg-[#2EAE88] hover:bg-[#28996f] disabled:opacity-60 text-white font-bold text-base py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
//                 {saving ? (
//                   <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Submitting…</>
//                 ) : uploads.some(u => u.status === "uploading") ? (
//                   "Please wait for photos to finish uploading…"
//                 ) : (
//                   <><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>Submit for Review</>
//                 )}
//               </button>
//             </motion.div>
//           )}

//         </AnimatePresence>

//         {/* Navigation buttons */}
//         {step < 6 && (
//           <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
//             <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1}
//               className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
//               </svg>
//               Back
//             </button>
//             <button onClick={handleNext} disabled={saving}
//               className="flex items-center gap-2 bg-[#2EAE88] hover:bg-[#28996f] disabled:opacity-60 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors">
//               {saving ? (
//                 <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
//               ) : (
//                 <>{step === 5 ? "Continue to Review" : "Next Step"}
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
//                   </svg>
//                 </>
//               )}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }












"use client";

// app/agent/listings/new/page.tsx  (for add)
// app/agent/listings/[id]/edit/page.tsx  (for edit — same component, receives propertyId)
//
// Usage:
//   Add:  <AddEditListingPage />
//   Edit: <AddEditListingPage propertyId="uuid" />
//
// Image flow:
//   1. User picks files → local preview shown immediately
//   2. Each file uploads to ImageKit with XHR progress bar
//   3. On upload complete → URL saved to Supabase property_media
//   4. Cover = sort_order 0 (draggable to reorder)

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter }                                from "next/navigation";
import Image                                        from "next/image";
import { motion, AnimatePresence }                  from "framer-motion";
import { createClient }                             from "@/lib/supabase/client";
import { uploadToImageKit, UploadProgress }         from "@/lib/imagekit/upload";

// ── Types ─────────────────────────────────────────────────────
interface City     { id: string; name: string; slug: string; }
interface Locality { id: string; name: string; lat: number | null; lng: number | null; }
interface Amenity  { id: string; name: string; category: string; icon_key: string | null; }

interface FormData {
  // Classification
  category:         string;
  property_type:    string;
  // Identity
  title:            string;
  description:      string;
  highlights:       string[];
  // Price
  price:            string;
  price_unit:       string;
  is_price_negotiable: boolean;
  maintenance_charge: string;
  security_deposit: string;
  // Size
  carpet_area:      string;
  builtup_area:     string;
  area_unit:        string;
  // Layout
  bedrooms:         string;
  bathrooms:        string;
  balconies:        string;
  // Building
  floor_number:     string;
  total_floors:     string;
  facing:           string;
  furnishing:       string;
  property_age:     string;
  possession_status:string;
  possession_date:  string;
  available_from:   string;
  // Society
  society_name:     string;
  tower_name:       string;
  // Location
  city_id:          string;
  locality_id:      string;
  address_line:     string;
  landmark:         string;
  pincode:          string;
  lat:              string;
  lng:              string;
  // RERA
  rera_number:      string;
  is_rera_registered: boolean;
  // Amenities
  amenity_ids:      string[];
}

const INITIAL_FORM: FormData = {
  category: "buy", property_type: "apartment",
  title: "", description: "", highlights: ["","",""],
  price: "", price_unit: "total", is_price_negotiable: false,
  maintenance_charge: "", security_deposit: "",
  carpet_area: "", builtup_area: "", area_unit: "sqft",
  bedrooms: "", bathrooms: "", balconies: "",
  floor_number: "", total_floors: "", facing: "",
  furnishing: "", property_age: "", possession_status: "ready_to_move",
  possession_date: "", available_from: "",
  society_name: "", tower_name: "",
  city_id: "", locality_id: "", address_line: "",
  landmark: "", pincode: "", lat: "", lng: "",
  rera_number: "", is_rera_registered: false,
  amenity_ids: [],
};

// ── Enum options ──────────────────────────────────────────────
const CATEGORIES = [
  { value: "buy",        label: "Residential — Buy"  },
  { value: "sell",       label: "Residential — Sell" },
  { value: "rent",       label: "Residential — Rent" },
  { value: "commercial", label: "Commercial"          },
  { value: "plot_land",  label: "Plot / Land"         },
  { value: "project",    label: "New Project"         },
  { value: "pg_coliving",label: "PG / Co-living"      },
];

const PROPERTY_TYPES: Record<string, { value: string; label: string }[]> = {
  buy:        [{ value:"apartment",label:"Apartment"},{ value:"independent_house",label:"Independent House"},{ value:"villa",label:"Villa"},{ value:"row_house",label:"Row House"},{ value:"penthouse",label:"Penthouse"},{ value:"studio",label:"Studio"},{ value:"builder_floor",label:"Builder Floor"}],
  sell:       [{ value:"apartment",label:"Apartment"},{ value:"independent_house",label:"Independent House"},{ value:"villa",label:"Villa"},{ value:"penthouse",label:"Penthouse"},{ value:"builder_floor",label:"Builder Floor"}],
  rent:       [{ value:"apartment",label:"Apartment"},{ value:"independent_house",label:"Independent House"},{ value:"studio",label:"Studio"},{ value:"service_apartment",label:"Service Apartment"}],
  commercial: [{ value:"office_space",label:"Office Space"},{ value:"shop",label:"Shop"},{ value:"showroom",label:"Showroom"},{ value:"warehouse",label:"Warehouse"},{ value:"coworking",label:"Co-working"}],
  plot_land:  [{ value:"plot",label:"Residential Plot"},{ value:"agricultural_land",label:"Agricultural Land"},{ value:"farmhouse",label:"Farmhouse"}],
  project:    [{ value:"apartment",label:"Apartment Project"},{ value:"villa",label:"Villa Project"},{ value:"townhouse",label:"Townhouse"}],
  pg_coliving:[{ value:"studio",label:"PG Room"}],
};

const PRICE_UNITS = [
  { value:"total",     label:"Total Price"    },
  { value:"per_month", label:"Per Month"      },
  { value:"per_sqft",  label:"Per Sq.ft"      },
  { value:"per_acre",  label:"Per Acre"       },
];

const AREA_UNITS = [
  { value:"sqft",  label:"sq.ft" },
  { value:"sqm",   label:"sq.m"  },
  { value:"sqyd",  label:"sq.yd" },
  { value:"acre",  label:"Acre"  },
  { value:"gunta", label:"Gunta" },
];

const FURNISHINGS = [
  { value:"", label:"Select..." },
  { value:"unfurnished",    label:"Unfurnished"     },
  { value:"semi_furnished", label:"Semi Furnished"  },
  { value:"fully_furnished",label:"Fully Furnished" },
];

const POSSESSION = [
  { value:"ready_to_move",     label:"Ready to Move"      },
  { value:"under_construction",label:"Under Construction" },
  { value:"new_launch",        label:"New Launch"         },
];

const PROPERTY_AGE = [
  { value:"",                   label:"Select..."         },
  { value:"new_construction",   label:"New Construction"  },
  { value:"less_than_5_years",  label:"Less than 5 years" },
  { value:"5_to_10_years",      label:"5–10 years"        },
  { value:"10_to_20_years",     label:"10–20 years"       },
  { value:"more_than_20_years", label:"20+ years"         },
];

const FACING = [
  { value:"", label:"Select..." },
  { value:"north",      label:"North"       },
  { value:"south",      label:"South"       },
  { value:"east",       label:"East"        },
  { value:"west",       label:"West"        },
  { value:"north_east", label:"North East"  },
  { value:"north_west", label:"North West"  },
  { value:"south_east", label:"South East"  },
  { value:"south_west", label:"South West"  },
];

const STEPS = [
  { id: 1, label: "Basic Info"  },
  { id: 2, label: "Location"    },
  { id: 3, label: "Details"     },
  { id: 4, label: "Amenities"   },
  { id: 5, label: "Photos"      },
  { id: 6, label: "Review"      },
];

// ── Input component ───────────────────────────────────────────
function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props}
      className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all cursor-pointer ${props.className ?? ""}`}
    >
      {children}
    </select>
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props}
      className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all resize-none ${props.className ?? ""}`}
    />
  );
}

// ── Image uploader component ──────────────────────────────────
function ImageUploader({
  propertyId, uploads, setUploads, existingMedia, onRemoveExisting,
}: {
  propertyId:        string;
  uploads:           UploadProgress[];
  setUploads:        React.Dispatch<React.SetStateAction<UploadProgress[]>>;
  existingMedia:     any[];
  onRemoveExisting:  (id: string) => void;
}) {
  const dropRef   = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const valid = Array.from(files).filter(f => {
      if (!f.type.startsWith("image/")) return false;
      if (f.size > 10 * 1024 * 1024) { alert(`${f.name} is too large. Max 10MB per image.`); return false; }
      return true;
    });

    const newUploads: UploadProgress[] = valid.map(f => ({
      file:     f,
      progress: 0,
      status:   "pending",
      localUrl: URL.createObjectURL(f),
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Start uploading each file
    newUploads.forEach((up, idx) => {
      const uploadIdx = uploads.length + idx;
      uploadFile(up, uploadIdx + uploads.length);
    });
  }

  async function uploadFile(up: UploadProgress, idx: number) {
    setUploads(prev => prev.map((u, i) => i === idx ? { ...u, status: "uploading" } : u));
    try {
      const result = await uploadToImageKit({
        file:   up.file,
        folder: `properties/${propertyId}`,
        onProgress: (pct) => {
          setUploads(prev => prev.map((u, i) => i === idx ? { ...u, progress: pct } : u));
        },
      });
      setUploads(prev => prev.map((u, i) => i === idx ? { ...u, status: "done", result, progress: 100 } : u));
    } catch (err: any) {
      setUploads(prev => prev.map((u, i) => i === idx ? { ...u, status: "error", error: err.message, progress: 0 } : u));
    }
  }

  function removeUpload(idx: number) {
    setUploads(prev => {
      const up = prev[idx];
      if (up?.localUrl) URL.revokeObjectURL(up.localUrl);
      return prev.filter((_, i) => i !== idx);
    });
  }

  function retryUpload(idx: number) {
    const up = uploads[idx];
    if (!up) return;
    setUploads(prev => prev.map((u, i) => i === idx ? { ...u, status: "pending", progress: 0, error: undefined } : u));
    uploadFile(up, idx);
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const totalDone    = uploads.filter(u => u.status === "done").length + existingMedia.length;
  const totalUploads = uploads.length + existingMedia.length;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        ref={dropRef}
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 hover:border-[#2EAE88] rounded-2xl p-8 text-center cursor-pointer transition-colors group"
      >
        <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#2EAE88]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-[#2EAE88] transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <p className="text-gray-600 font-semibold text-sm mb-1">
          Drop photos here or click to browse
        </p>
        <p className="text-gray-400 text-xs">JPG, PNG, WEBP · Max 10MB each · First photo = cover image</p>
        <p className="text-[#2EAE88] text-xs font-semibold mt-2">
          {totalDone > 0 ? `${totalDone} photo${totalDone > 1 ? "s" : ""} uploaded` : "Add up to 20 photos"}
        </p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* Existing media (edit mode) */}
      {existingMedia.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Existing Photos</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {existingMedia.map((m, i) => (
              <div key={m.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                <Image src={m.url} alt="" fill className="object-cover" sizes="120px" />
                {i === 0 && (
                  <div className="absolute top-1 left-1 bg-[#2EAE88] text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                    COVER
                  </div>
                )}
                <button onClick={() => onRemoveExisting(m.id)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New uploads grid */}
      {uploads.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">New Photos</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {uploads.map((up, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                {/* Preview */}
                <img src={up.localUrl} alt="" className="w-full h-full object-cover" />

                {/* Cover badge */}
                {i === 0 && existingMedia.length === 0 && (
                  <div className="absolute top-1 left-1 bg-[#2EAE88] text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                    COVER
                  </div>
                )}

                {/* Status overlay */}
                {up.status === "uploading" && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    <div className="w-12 h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2EAE88] rounded-full transition-all"
                        style={{ width: `${up.progress}%` }} />
                    </div>
                    <p className="text-white text-[9px] font-bold mt-1.5">{up.progress}%</p>
                  </div>
                )}

                {up.status === "done" && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-[#2EAE88] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                )}

                {up.status === "error" && (
                  <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center gap-1">
                    <p className="text-white text-[8px] text-center px-1">Upload failed</p>
                    <button onClick={() => retryUpload(i)}
                      className="text-[8px] text-white font-bold bg-white/20 px-2 py-0.5 rounded">
                      Retry
                    </button>
                  </div>
                )}

                {/* Remove on hover */}
                {(up.status === "done" || up.status === "pending") && (
                  <button onClick={() => removeUpload(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function AddEditListingPage({ propertyId }: { propertyId?: string }) {
  const supabase  = createClient();
  const router    = useRouter();
  const isEdit    = !!propertyId;

  const [step,          setStep]          = useState(1);
  const [form,          setForm]          = useState<FormData>(INITIAL_FORM);
  const [cities,        setCities]        = useState<City[]>([]);
  const [localities,    setLocalities]    = useState<Locality[]>([]);
  const [amenities,     setAmenities]     = useState<Amenity[]>([]);
  const [uploads,       setUploads]       = useState<UploadProgress[]>([]);
  const [existingMedia, setExistingMedia] = useState<any[]>([]);
  const [saving,        setSaving]        = useState(false);
  const [savedId,       setSavedId]       = useState(propertyId ?? "");
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [localitySearch,setLocalitySearch]= useState("");
  const [locLoading,    setLocLoading]    = useState(false);
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // ── Load reference data ───────────────────────────────────
  useEffect(() => {
    async function load() {
      const [citiesRes, amenitiesRes] = await Promise.all([
        supabase.from("cities").select("id,name,slug").eq("is_active", true).order("sort_order"),
        supabase.from("amenities").select("id,name,category,icon_key").order("category,name"),
      ]);
      setCities(citiesRes.data ?? []);
      setAmenities(amenitiesRes.data ?? []);

      // Load existing property if editing
      if (propertyId) {
        const { data: p } = await supabase
          .from("properties")
          .select("*, property_media(*), property_amenities(amenity_id)")
          .eq("id", propertyId)
          .single();

        if (p) {
          setForm({
            category:         p.category        ?? "buy",
            property_type:    p.property_type   ?? "apartment",
            title:            p.title           ?? "",
            description:      p.description     ?? "",
            highlights:       p.highlights      ?? ["","",""],
            price:            String(p.price    ?? ""),
            price_unit:       p.price_unit      ?? "total",
            is_price_negotiable: p.is_price_negotiable ?? false,
            maintenance_charge: String(p.maintenance_charge ?? ""),
            security_deposit:   String(p.security_deposit   ?? ""),
            carpet_area:      String(p.carpet_area    ?? ""),
            builtup_area:     String(p.builtup_area   ?? ""),
            area_unit:        p.area_unit        ?? "sqft",
            bedrooms:         String(p.bedrooms  ?? ""),
            bathrooms:        String(p.bathrooms ?? ""),
            balconies:        String(p.balconies ?? ""),
            floor_number:     String(p.floor_number  ?? ""),
            total_floors:     String(p.total_floors  ?? ""),
            facing:           p.facing           ?? "",
            furnishing:       p.furnishing       ?? "",
            property_age:     p.property_age     ?? "",
            possession_status:p.possession_status ?? "ready_to_move",
            possession_date:  p.possession_date  ?? "",
            available_from:   p.available_from   ?? "",
            society_name:     p.society_name     ?? "",
            tower_name:       p.tower_name       ?? "",
            city_id:          p.city_id          ?? "",
            locality_id:      p.locality_id      ?? "",
            address_line:     p.address_line     ?? "",
            landmark:         p.landmark         ?? "",
            pincode:          p.pincode          ?? "",
            lat:              String(p.lat       ?? ""),
            lng:              String(p.lng       ?? ""),
            rera_number:      p.rera_number      ?? "",
            is_rera_registered: p.is_rera_registered ?? false,
            amenity_ids:      (p.property_amenities ?? []).map((a: any) => a.amenity_id),
          });

          const media = (p.property_media ?? [])
            .sort((a: any, b: any) => a.sort_order - b.sort_order);
          setExistingMedia(media);

          if (p.city_id) loadLocalities(p.city_id);
        }
      }
    }
    load();
  }, [propertyId]);

  async function loadLocalities(cityId: string) {
    const { data } = await supabase
      .from("localities")
      .select("id,name,lat,lng")
      .eq("city_id", cityId)
      .eq("is_active", true)
      .order("name");
    setLocalities(data ?? []);
  }

  function set(key: keyof FormData, val: any) {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: "" }));
  }

  // ── Mapbox location search ────────────────────────────────
  const [mapboxSuggestions, setMapboxSuggestions] = useState<any[]>([]);
  const [mapboxOpen,        setMapboxOpen]        = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function searchMapbox(query: string) {
    if (!query.trim() || query.length < 3) { setMapboxSuggestions([]); return; }
    if (!MAPBOX_TOKEN) return;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=in&language=en&limit=5&types=address,neighborhood,locality,poi`;
    const res  = await fetch(url);
    const data = await res.json();
    setMapboxSuggestions(data.features ?? []);
    setMapboxOpen(true);
  }

  function handleLocationInput(val: string) {
    set("address_line", val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchMapbox(val), 350);
  }

  function selectMapboxPlace(feature: any) {
    const [lng, lat] = feature.center;
    const label = feature.place_name.replace(/, India$/, "");
    set("address_line", label);
    set("lat", String(lat));
    set("lng", String(lng));
    // Auto-fill pincode if present
    const postalCode = feature.context?.find((c: any) => c.id.startsWith("postcode"));
    if (postalCode) set("pincode", postalCode.text);
    setMapboxSuggestions([]);
    setMapboxOpen(false);
  }

  // ── GPS detect ────────────────────────────────────────────
  function detectGPS() {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      set("lat", String(lat));
      set("lng", String(lng));
      // Reverse geocode
      try {
        if (MAPBOX_TOKEN) {
          const res  = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,neighborhood&language=en`);
          const data = await res.json();
          const label = data.features?.[0]?.place_name?.replace(/, India$/, "") ?? "";
          if (label) set("address_line", label);
          const postalCode = data.features?.[0]?.context?.find((c: any) => c.id.startsWith("postcode"));
          if (postalCode) set("pincode", postalCode.text);
        } else {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
            headers: { "User-Agent": "PropertyLink/1.0" },
          });
          const data = await res.json();
          if (data?.display_name) set("address_line", data.display_name.split(",").slice(0,3).join(", "));
          if (data?.address?.postcode) set("pincode", data.address.postcode);
        }
      } catch {}
      setLocLoading(false);
    }, () => setLocLoading(false));
  }

  // ── Remove existing media ─────────────────────────────────
  async function removeExistingMedia(id: string) {
    await supabase.from("property_media").delete().eq("id", id);
    setExistingMedia(m => m.filter(x => x.id !== id));
  }

  // ── Validation ────────────────────────────────────────────
  function validate(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.title.trim())     e.title    = "Title is required";
      if (!form.category)         e.category = "Category is required";
      if (!form.price.trim())     e.price    = "Price is required";
      if (isNaN(Number(form.price))) e.price = "Price must be a number";
    }
    if (s === 2) {
      if (!form.city_id)          e.city_id  = "City is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Save draft / property to Supabase ────────────────────
  async function saveProperty(status: "draft" | "pending_review" = "draft"): Promise<string | null> {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return null; }

    // ── Credit gate: check listing limit before submitting for review ──
    if (status === "pending_review" && !isEdit) {
      const { data: creditData } = await supabase.rpc("can_agent_publish_listing", {
        p_agent_user_id: user.id,
      });
      const credit = creditData as {
        can_publish?: boolean;
        active?: number;
        max?: number;
        plan_name?: string;
      } | null;
      if (credit && !credit.can_publish) {
        // Force save as draft — inform user
        status = "draft";
        setSaving(false);
        alert(
          `You have reached your active listing limit (${credit.active}/${credit.max}) on the ${credit.plan_name} plan.\n\n` +
          `Your listing has been saved as a Draft. To publish it:\n` +
          `• Archive an existing listing to free up a slot, OR\n` +
          `• Upgrade your plan (coming soon)\n\n` +
          `You can find your draft in My Listings.`
        );
        // Continue saving as draft
        setSaving(true);
      }
    }

    // Generate slug
    const slugBase = form.title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 50);
    const slug = `${slugBase}-${Math.random().toString(36).slice(2,7)}`;

    // Typed as explicit object — cast individual enums to satisfy Supabase types.
    const payload = {
      owner_id:           user.id,
      category:           form.category            as any,
      property_type:      form.property_type       as any,
      title:              form.title.trim(),
      ...(isEdit ? {} : { slug }),
      description:        form.description.trim()  || null,
      highlights:         form.highlights.filter(h => h.trim()),
      price:              parseFloat(form.price)   || 0,
      price_unit:         form.price_unit          as any,
      is_price_negotiable:form.is_price_negotiable,
      maintenance_charge: parseFloat(form.maintenance_charge) || null,
      security_deposit:   parseFloat(form.security_deposit)   || null,
      carpet_area:        parseFloat(form.carpet_area)        || null,
      builtup_area:       parseFloat(form.builtup_area)       || null,
      area_unit:          form.area_unit            as any,
      bedrooms:           parseInt(form.bedrooms)  || null,
      bathrooms:          parseInt(form.bathrooms) || null,
      balconies:          parseInt(form.balconies) || null,
      floor_number:       parseInt(form.floor_number)  || null,
      total_floors:       parseInt(form.total_floors)  || null,
      facing:             (form.facing           || null) as any,
      furnishing:         (form.furnishing       || null) as any,
      property_age:       (form.property_age     || null) as any,
      possession_status:  form.possession_status  as any,
      possession_date:    form.possession_date    || null,
      available_from:     form.available_from     || null,
      society_name:       form.society_name.trim()|| null,
      tower_name:         form.tower_name.trim()  || null,
      city_id:            form.city_id            || null,
      locality_id:        form.locality_id        || null,
      address_line:       form.address_line.trim()|| null,
      landmark:           form.landmark.trim()    || null,
      pincode:            form.pincode.trim()     || null,
      lat:                parseFloat(form.lat)    || null,
      lng:                parseFloat(form.lng)    || null,
      rera_number:        form.rera_number.trim() || null,
      is_rera_registered: form.is_rera_registered,
      status:             status                  as any,
    };

    let propId = savedId;

    if (isEdit && propertyId) {
      const { error } = await supabase.from("properties").update(payload as any).eq("id", propertyId);
      if (error) { console.error(error); setSaving(false); return null; }
      propId = propertyId;
    } else if (!propId) {
      const { data, error } = await supabase.from("properties").insert(payload as any).select("id").single();
      if (error || !data) { console.error(error); setSaving(false); return null; }
      propId = data.id;
      setSavedId(propId);
    } else {
      await supabase.from("properties").update(payload as any).eq("id", propId);
    }

    // Save amenities
    if (propId && form.amenity_ids.length > 0) {
      await supabase.from("property_amenities").delete().eq("property_id", propId);
      const amenityRows = form.amenity_ids.map((amenity_id) => ({
        property_id: propId as string,
        amenity_id,
      }));
      await supabase.from("property_amenities").insert(amenityRows);
    }

    // Save uploaded images to property_media
    const doneUploads = uploads.filter(u => u.status === "done" && u.result);
    const existingCount = existingMedia.length;
    for (let i = 0; i < doneUploads.length; i++) {
      const up = doneUploads[i];
      if (!up.result) continue;
      await supabase.from("property_media").insert({
        property_id:       propId,
        url:               up.result.url,
        thumbnail_url:     `${up.result.url}?tr=w-400,h-300,c-maintain_ratio,q-80`,
        media_type:        "image",
        sort_order:        existingCount + i,
        moderation_status: "approved",
        caption:           null,
      });
    }

    setSaving(false);
    return propId;
  }

  async function handleNext() {
    if (!validate(step)) return;
    // Auto-save draft on each step
    if (step >= 2) {
      const id = await saveProperty("draft");
      if (!id) return;
    }
    setStep(s => Math.min(6, s + 1));
  }

  async function handleSubmit() {
    const id = await saveProperty("pending_review");
    if (id) {
      router.push("/agent/listings?submitted=1");
    }
  }

  async function handleSaveDraft() {
    const id = await saveProperty("draft");
    if (id) router.push("/agent/listings?saved=1");
  }

  // ── Amenity toggle ────────────────────────────────────────
  function toggleAmenity(id: string) {
    set("amenity_ids", form.amenity_ids.includes(id)
      ? form.amenity_ids.filter(a => a !== id)
      : [...form.amenity_ids, id]
    );
  }

  const amenityGroups = amenities.reduce<Record<string, Amenity[]>>((acc, a) => {
    if (!acc[a.category]) acc[a.category] = [];
    acc[a.category].push(a);
    return acc;
  }, {});

  const showResidentialFields = ["buy","sell","rent","pg_coliving"].includes(form.category);
  const showRentalFields      = ["rent","pg_coliving"].includes(form.category);

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "Poppins, sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-gray-900 font-bold text-xl">{isEdit ? "Edit Listing" : "Add New Listing"}</h2>
          <p className="text-gray-400 text-xs mt-0.5">
            {isEdit ? "Update your property details" : "Fill in the details to list your property on PropertyLink"}
          </p>
        </div>
        <button onClick={handleSaveDraft} disabled={saving}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
          Save as Draft
        </button>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-shrink-0">
            <button
              onClick={() => step > s.id && setStep(s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                step === s.id
                  ? "bg-[#2EAE88] text-white shadow-sm"
                  : step > s.id
                  ? "text-[#2EAE88] cursor-pointer hover:bg-[#2EAE88]/10"
                  : "text-gray-400 cursor-default"
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                step === s.id ? "bg-white text-[#2EAE88]" : step > s.id ? "bg-[#2EAE88] text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {step > s.id ? "✓" : s.id}
              </div>
              <span className="text-xs font-semibold whitespace-nowrap">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-px mx-1 ${step > s.id ? "bg-[#2EAE88]" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8"
        style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Basic Info ──────────────────────── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
              className="space-y-6">
              <h3 className="text-gray-900 font-bold text-base border-b border-gray-100 pb-4">Basic Information</h3>

              {/* Category + Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Listing Category" required>
                  <Select value={form.category} onChange={e => { set("category",""); set("property_type",""); set("category", e.target.value); }}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </Select>
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                </Field>
                <Field label="Property Type" required>
                  <Select value={form.property_type} onChange={e => set("property_type", e.target.value)}>
                    {(PROPERTY_TYPES[form.category] ?? PROPERTY_TYPES["buy"]).map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              {/* Title */}
              <Field label="Property Title" required hint="Be specific: e.g. '3BHK Apartment in Bandra West near Linking Road'">
                <Input type="text" value={form.title} onChange={e => set("title", e.target.value)}
                  placeholder="e.g. 3BHK Apartment in Kandivali West" maxLength={120} />
                <p className="text-[10px] text-gray-400 mt-1 text-right">{form.title.length}/120</p>
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </Field>

              {/* Description */}
              <Field label="Description" hint="Describe the property, its features, and why someone should buy/rent it.">
                <Textarea value={form.description} onChange={e => set("description", e.target.value)}
                  placeholder="Describe the property…" rows={5} maxLength={2000} />
                <p className="text-[10px] text-gray-400 mt-1 text-right">{form.description.length}/2000</p>
              </Field>

              {/* Highlights */}
              <Field label="Key Highlights" hint="Up to 3 bullet points shown on the listing card.">
                <div className="space-y-2">
                  {form.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[#2EAE88] text-sm flex-shrink-0">✓</span>
                      <Input type="text" value={h}
                        onChange={e => set("highlights", form.highlights.map((x,j) => j===i ? e.target.value : x))}
                        placeholder={`Highlight ${i+1} — e.g. "Spacious 1200 sqft with open terrace"`}
                        maxLength={100} />
                    </div>
                  ))}
                </div>
              </Field>

              {/* Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Price" required>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
                      <Input type="number" value={form.price} onChange={e => set("price", e.target.value)}
                        placeholder="e.g. 8500000" className="pl-8" />
                    </div>
                    {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                  </Field>
                </div>
                <Field label="Price Unit">
                  <Select value={form.price_unit} onChange={e => set("price_unit", e.target.value)}>
                    {PRICE_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </Select>
                </Field>
              </div>

              {/* Rental extras */}
              {showRentalFields && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Security Deposit (₹)">
                    <Input type="number" value={form.security_deposit}
                      onChange={e => set("security_deposit", e.target.value)} placeholder="e.g. 100000" />
                  </Field>
                  <Field label="Maintenance Charge (₹/mo)">
                    <Input type="number" value={form.maintenance_charge}
                      onChange={e => set("maintenance_charge", e.target.value)} placeholder="e.g. 3000" />
                  </Field>
                </div>
              )}

              {/* Negotiable toggle */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 cursor-pointer"
                onClick={() => set("is_price_negotiable", !form.is_price_negotiable)}>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${form.is_price_negotiable ? "bg-[#2EAE88]" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_price_negotiable ? "left-5" : "left-0.5"}`} />
                </div>
                <div>
                  <p className="text-gray-700 text-sm font-medium">Price is negotiable</p>
                  <p className="text-gray-400 text-[10px]">Shows "Negotiable" badge on listing</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Location ────────────────────────── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
              className="space-y-6">
              <h3 className="text-gray-900 font-bold text-base border-b border-gray-100 pb-4">Location Details</h3>

              {/* City + Locality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="City" required>
                  <Select value={form.city_id} onChange={e => { set("city_id", e.target.value); set("locality_id",""); loadLocalities(e.target.value); }}>
                    <option value="">Select city…</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                  {errors.city_id && <p className="text-xs text-red-500 mt-1">{errors.city_id}</p>}
                </Field>
                <Field label="Locality / Area">
                  <Select value={form.locality_id}
                    onChange={e => {
                      set("locality_id", e.target.value);
                      const loc = localities.find(l => l.id === e.target.value);
                      if (loc?.lat) set("lat", String(loc.lat));
                      if (loc?.lng) set("lng", String(loc.lng));
                    }}
                    disabled={!form.city_id}
                  >
                    <option value="">Select locality…</option>
                    {localities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </Select>
                </Field>
              </div>

              {/* Address with Mapbox */}
              <Field label="Street Address / Project Name"
                hint={MAPBOX_TOKEN ? "Start typing for smart address suggestions" : "Enter the full address"}>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input type="text" value={form.address_line}
                        onChange={e => handleLocationInput(e.target.value)}
                        placeholder="Search address or enter manually…"
                        className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all" />
                    </div>
                    {/* GPS */}
                    <button type="button" onClick={detectGPS} disabled={locLoading}
                      className="flex-shrink-0 w-12 h-12 bg-gray-100 hover:bg-[#2EAE88]/10 hover:text-[#2EAE88] text-gray-500 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Detect my location">
                      {locLoading ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Mapbox dropdown */}
                  <AnimatePresence>
                    {mapboxOpen && mapboxSuggestions.length > 0 && (
                      <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                        className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                        {mapboxSuggestions.map(feat => (
                          <button key={feat.id} type="button" onClick={() => selectMapboxPlace(feat)}
                            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{feat.place_name.split(",")[0]}</p>
                              <p className="text-xs text-gray-400">{feat.place_name.split(",").slice(1).join(",").trim()}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Field>

              {/* Landmark + Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Landmark" hint="e.g. Near XYZ Mall / School / Metro Station">
                  <Input type="text" value={form.landmark}
                    onChange={e => set("landmark", e.target.value)} placeholder="Near…" />
                </Field>
                <Field label="Pincode">
                  <Input type="text" value={form.pincode}
                    onChange={e => set("pincode", e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="6-digit pincode" />
                </Field>
              </div>

              {/* Coordinates display */}
              {(form.lat || form.lng) && (
                <div className="bg-[#2EAE88]/5 border border-[#2EAE88]/20 rounded-xl px-4 py-3 flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#2EAE88] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                  <div>
                    <p className="text-[#2EAE88] text-xs font-semibold">Location pinned</p>
                    <p className="text-gray-500 text-[10px]">
                      {parseFloat(form.lat).toFixed(6)}, {parseFloat(form.lng).toFixed(6)}
                    </p>
                  </div>
                  <button type="button" onClick={() => { set("lat",""); set("lng",""); }}
                    className="ml-auto text-xs text-gray-400 hover:text-red-500">Clear</button>
                </div>
              )}

              {/* Map preview */}
              {form.lat && form.lng && (
                <div className="rounded-xl overflow-hidden border border-gray-200 h-48">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(form.lng)-0.01},${parseFloat(form.lat)-0.01},${parseFloat(form.lng)+0.01},${parseFloat(form.lat)+0.01}&layer=mapnik&marker=${form.lat},${form.lng}`}
                    width="100%" height="192" style={{ border: 0 }} loading="lazy" />
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 3: Property Details ─────────────── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
              className="space-y-6">
              <h3 className="text-gray-900 font-bold text-base border-b border-gray-100 pb-4">Property Details</h3>

              {/* Area */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Carpet Area">
                  <Input type="number" value={form.carpet_area} onChange={e => set("carpet_area", e.target.value)} placeholder="e.g. 850" />
                </Field>
                <Field label="Built-up Area">
                  <Input type="number" value={form.builtup_area} onChange={e => set("builtup_area", e.target.value)} placeholder="e.g. 980" />
                </Field>
                <Field label="Area Unit">
                  <Select value={form.area_unit} onChange={e => set("area_unit", e.target.value)}>
                    {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </Select>
                </Field>
              </div>

              {/* Layout — residential only */}
              {showResidentialFields && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Field label="Bedrooms">
                    <Select value={form.bedrooms} onChange={e => set("bedrooms", e.target.value)}>
                      <option value="">–</option>
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} BHK</option>)}
                    </Select>
                  </Field>
                  <Field label="Bathrooms">
                    <Select value={form.bathrooms} onChange={e => set("bathrooms", e.target.value)}>
                      <option value="">–</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </Select>
                  </Field>
                  <Field label="Balconies">
                    <Select value={form.balconies} onChange={e => set("balconies", e.target.value)}>
                      <option value="">–</option>
                      {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                    </Select>
                  </Field>
                  <Field label="Furnishing">
                    <Select value={form.furnishing} onChange={e => set("furnishing", e.target.value)}>
                      {FURNISHINGS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </Select>
                  </Field>
                </div>
              )}

              {/* Floor details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Floor Number">
                  <Input type="number" value={form.floor_number} onChange={e => set("floor_number", e.target.value)} placeholder="e.g. 4" />
                </Field>
                <Field label="Total Floors">
                  <Input type="number" value={form.total_floors} onChange={e => set("total_floors", e.target.value)} placeholder="e.g. 12" />
                </Field>
                <Field label="Facing">
                  <Select value={form.facing} onChange={e => set("facing", e.target.value)}>
                    {FACING.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </Select>
                </Field>
                <Field label="Property Age">
                  <Select value={form.property_age} onChange={e => set("property_age", e.target.value)}>
                    {PROPERTY_AGE.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </Select>
                </Field>
              </div>

              {/* Possession */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Possession Status" required>
                  <Select value={form.possession_status} onChange={e => set("possession_status", e.target.value)}>
                    {POSSESSION.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </Select>
                </Field>
                {form.possession_status === "under_construction" && (
                  <Field label="Expected Possession Date">
                    <Input type="date" value={form.possession_date} onChange={e => set("possession_date", e.target.value)} />
                  </Field>
                )}
                {showRentalFields && (
                  <Field label="Available From">
                    <Input type="date" value={form.available_from} onChange={e => set("available_from", e.target.value)} />
                  </Field>
                )}
              </div>

              {/* Society */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Society / Project Name">
                  <Input type="text" value={form.society_name} onChange={e => set("society_name", e.target.value)} placeholder="e.g. Hiranandani Gardens" />
                </Field>
                <Field label="Tower / Wing Name">
                  <Input type="text" value={form.tower_name} onChange={e => set("tower_name", e.target.value)} placeholder="e.g. Tower A / Wing 3" />
                </Field>
              </div>

              {/* RERA */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 cursor-pointer"
                  onClick={() => set("is_rera_registered", !form.is_rera_registered)}>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${form.is_rera_registered ? "bg-[#2EAE88]" : "bg-gray-300"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_rera_registered ? "left-5" : "left-0.5"}`} />
                  </div>
                  <p className="text-gray-700 text-sm font-medium">RERA Registered</p>
                </div>
                {form.is_rera_registered && (
                  <Field label="RERA Number" hint="MahaRERA / relevant state RERA number">
                    <Input type="text" value={form.rera_number} onChange={e => set("rera_number", e.target.value)} placeholder="e.g. P51700012345" />
                  </Field>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Amenities ───────────────────────── */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
              className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-gray-900 font-bold text-base">Amenities & Features</h3>
                <span className="text-xs text-gray-400">{form.amenity_ids.length} selected</span>
              </div>

              {Object.entries(amenityGroups).map(([cat, items]) => (
                <div key={cat}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 capitalize">
                    {cat.replace(/_/g," ")}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {items.map(a => {
                      const selected = form.amenity_ids.includes(a.id);
                      return (
                        <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                            selected
                              ? "border-[#2EAE88] bg-[#2EAE88]/5 text-[#2EAE88]"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}>
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selected ? "bg-[#2EAE88] border-[#2EAE88]" : "border-gray-300"}`}>
                            {selected && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                          </div>
                          {a.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ── STEP 5: Photos ──────────────────────────── */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
              className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-gray-900 font-bold text-base">Property Photos</h3>
                <p className="text-gray-400 text-xs mt-1">
                  First photo = cover image. Add up to 20 high-quality photos. Photos are uploaded to ImageKit CDN for fast loading.
                </p>
              </div>

              {!savedId && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                  ℹ️ Saving basic info first before uploading photos…
                </div>
              )}

              <ImageUploader
                propertyId={savedId || "temp"}
                uploads={uploads}
                setUploads={setUploads}
                existingMedia={existingMedia}
                onRemoveExisting={removeExistingMedia}
              />

              {/* Upload summary */}
              {uploads.some(u => u.status === "uploading") && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-blue-700 text-sm font-semibold">Uploading photos…</p>
                    <p className="text-blue-500 text-xs">
                      {uploads.filter(u => u.status === "done").length}/{uploads.length} done
                    </p>
                  </div>
                  <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(uploads.filter(u => u.status === "done").length / uploads.length) * 100}%` }} />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 6: Review & Submit ──────────────── */}
          {step === 6 && (
            <motion.div key="step6" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
              className="space-y-6">
              <h3 className="text-gray-900 font-bold text-base border-b border-gray-100 pb-4">Review & Submit</h3>

              {/* Summary grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Category",    value: CATEGORIES.find(c => c.value === form.category)?.label ?? form.category },
                  { label: "Title",       value: form.title },
                  { label: "Price",       value: `₹${parseFloat(form.price).toLocaleString("en-IN")} ${PRICE_UNITS.find(u => u.value === form.price_unit)?.label ?? ""}` },
                  { label: "Location",    value: `${cities.find(c => c.id === form.city_id)?.name ?? "–"}, ${localities.find(l => l.id === form.locality_id)?.name ?? "–"}` },
                  { label: "Bedrooms",    value: form.bedrooms ? `${form.bedrooms} BHK` : "–" },
                  { label: "Carpet Area", value: form.carpet_area ? `${form.carpet_area} ${form.area_unit}` : "–" },
                  { label: "Possession",  value: POSSESSION.find(p => p.value === form.possession_status)?.label ?? "–" },
                  { label: "Photos",      value: `${uploads.filter(u => u.status === "done").length + existingMedia.length} uploaded` },
                  { label: "Amenities",   value: `${form.amenity_ids.length} selected` },
                ].map(r => (
                  <div key={r.label} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide mb-1">{r.label}</p>
                    <p className="text-gray-800 text-sm font-semibold truncate">{r.value || "–"}</p>
                  </div>
                ))}
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <div>
                  <p className="text-blue-800 font-semibold text-sm">What happens next?</p>
                  <p className="text-blue-600 text-xs mt-1 leading-relaxed">
                    Your listing will be submitted for admin review. Once approved (usually within 24 hours), it will go live on PropertyLink. You'll receive a notification when it's approved.
                  </p>
                </div>
              </div>

              {/* Submit button */}
              <button onClick={handleSubmit} disabled={saving || uploads.some(u => u.status === "uploading")}
                className="w-full bg-[#2EAE88] hover:bg-[#28996f] disabled:opacity-60 text-white font-bold text-base py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
                {saving ? (
                  <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Submitting…</>
                ) : uploads.some(u => u.status === "uploading") ? (
                  "Please wait for photos to finish uploading…"
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>Submit for Review</>
                )}
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Navigation buttons */}
        {step < 6 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back
            </button>
            <button onClick={handleNext} disabled={saving}
              className="flex items-center gap-2 bg-[#2EAE88] hover:bg-[#28996f] disabled:opacity-60 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors">
              {saving ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
              ) : (
                <>{step === 5 ? "Continue to Review" : "Next Step"}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}