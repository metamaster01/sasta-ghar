"use client";

// app/agent/settings/page.tsx
// Agent settings — 4 tabs:
//   Profile       → edit agent_profiles + profiles
//   Account & Security → change password via OTP verification
//   Notifications → show notifications from DB, mark read
//   Billing       → current plan, usage, available plans

import { useState, useEffect, useRef } from "react";
import Image                            from "next/image";
import Link                             from "next/link";
import { motion, AnimatePresence }      from "framer-motion";
import { createClient }                 from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────
type Tab = "profile" | "security" | "notifications" | "billing";

interface AgentSettings {
  // profiles
  full_name:   string;
  email:       string;
  phone:       string;
  avatar_url:  string | null;
  // agent_profiles
  agent_id:    string;
  company_name:string;
  bio:         string;
  rera_number: string;
  office_address: string;
  website_url: string;
  years_of_experience: string;
  specializations: string[];
  verification_status: string;
  agent_type:  string;
  // plan
  plan_name:   string;
  plan_slug:   string;
  free_leads_remaining: number;
  plan_expires_at: string | null;
  total_leads_received: number;
  total_leads_converted: number;
  active_listings: number;
  total_listings: number;
}

interface Notification {
  id:          string;
  type:        string;
  title:       string;
  body:        string | null;
  action_url:  string | null;
  action_label:string | null;
  read_at:     string | null;
  created_at:  string;
}

interface Plan {
  id:                     string;
  name:                   string;
  slug:                   string;
  price:                  number;
  max_active_listings:    number;
  free_leads_per_cycle:   number;
  featured_credits_included: number;
  verified_badge_included:   boolean;
  priority_support:          boolean;
  analytics_access:          boolean;
  is_active:                 boolean;
}

// ── Helpers ───────────────────────────────────────────────────
function timeAgo(d: string) {
  const diff  = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const NOTIF_ICON: Record<string, { icon: string; cls: string }> = {
  new_lead:               { icon: "👤", cls: "bg-blue-50"   },
  lead_unlocked:          { icon: "🔓", cls: "bg-green-50"  },
  lead_reminder:          { icon: "⏰", cls: "bg-amber-50"  },
  listing_approved:       { icon: "✅", cls: "bg-green-50"  },
  listing_rejected:       { icon: "❌", cls: "bg-red-50"    },
  listing_expiring:       { icon: "⚠️", cls: "bg-amber-50"  },
  listing_expired:        { icon: "📭", cls: "bg-gray-50"   },
  plan_expiring:          { icon: "💳", cls: "bg-orange-50" },
  plan_expired:           { icon: "💳", cls: "bg-red-50"    },
  verification_approved:  { icon: "🏅", cls: "bg-green-50"  },
  verification_rejected:  { icon: "📄", cls: "bg-red-50"    },
  property_saved:         { icon: "❤️", cls: "bg-pink-50"   },
  payment_success:        { icon: "💰", cls: "bg-green-50"  },
  payment_failed:         { icon: "💸", cls: "bg-red-50"    },
  admin_message:          { icon: "📬", cls: "bg-indigo-50" },
};

// ── Password strength ─────────────────────────────────────────
function pwdStrength(pwd: string) {
  let s = 0;
  if (pwd.length >= 8)          s++;
  if (/[A-Z]/.test(pwd))        s++;
  if (/[0-9]/.test(pwd))        s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}

const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-[#2EAE88]"];
const STRENGTH_TEXT  = ["", "text-red-500", "text-amber-500", "text-blue-500", "text-[#2EAE88]"];

// ── Tab Button ────────────────────────────────────────────────
const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "profile", label: "Profile",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  },
  { key: "security", label: "Account & Security",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  },
  { key: "notifications", label: "Notifications",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
  },
  { key: "billing", label: "Billing",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>,
  },
];

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function AgentSettingsPage() {
  const supabase = createClient();

  const [tab,      setTab]      = useState<Tab>("profile");
  const [data,     setData]     = useState<AgentSettings | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [userId,   setUserId]   = useState("");
  const [unread,   setUnread]   = useState(0);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [{ data: profile }, { data: ap }] = await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url, phone, role").eq("id", user.id).single(),
        supabase.from("agent_profiles").select(`
          id, company_name, bio, rera_number, office_address,
          website_url, years_of_experience, specializations,
          verification_status, agent_type,
          free_leads_remaining, plan_expires_at,
          total_leads_received, total_leads_converted,
          active_listings, total_listings,
          plans ( name, slug )
        `).eq("profile_id", user.id).single(),
      ]);

      const plan = Array.isArray(ap?.plans) ? ap.plans[0] : ap?.plans;

      setData({
        full_name:            profile?.full_name ?? "",
        email:                user.email ?? "",
        phone:                profile?.phone ?? "",
        avatar_url:           profile?.avatar_url ?? null,
        agent_id:             ap?.id ?? "",
        company_name:         ap?.company_name ?? "",
        bio:                  ap?.bio ?? "",
        rera_number:          ap?.rera_number ?? "",
        office_address:       ap?.office_address ?? "",
        website_url:          ap?.website_url ?? "",
        years_of_experience:  String(ap?.years_of_experience ?? ""),
        specializations:      ap?.specializations ?? [],
        verification_status:  ap?.verification_status ?? "not_submitted",
        agent_type:           ap?.agent_type ?? "individual_agent",
        plan_name:            plan?.name ?? "Free",
        plan_slug:            plan?.slug ?? "free",
        free_leads_remaining: ap?.free_leads_remaining ?? 0,
        plan_expires_at:      ap?.plan_expires_at ?? null,
        total_leads_received: ap?.total_leads_received ?? 0,
        total_leads_converted:ap?.total_leads_converted ?? 0,
        active_listings:      ap?.active_listings ?? 0,
        total_listings:       ap?.total_listings ?? 0,
      });

      // Unread count
      const { count } = await supabase.from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null);
      setUnread(count ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-[#2EAE88] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ fontFamily: "Poppins, sans-serif" }}>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto mb-6 bg-white rounded-2xl p-1.5 border border-gray-100"
        style={{ boxShadow: "0 2px 8px -2px rgba(0,0,0,0.06)" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 relative ${
              tab === t.key
                ? "bg-[#2EAE88] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t.icon}
            {t.label}
            {t.key === "notifications" && unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ProfileTab data={data} userId={userId} setData={setData} />
          </motion.div>
        )}
        {tab === "security" && (
          <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <SecurityTab email={data.email} />
          </motion.div>
        )}
        {tab === "notifications" && (
          <motion.div key="notifications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <NotificationsTab userId={userId} onRead={() => setUnread(0)} />
          </motion.div>
        )}
        {tab === "billing" && (
          <motion.div key="billing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <BillingTab data={data} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 1: PROFILE
// ═══════════════════════════════════════════════════════════════
function ProfileTab({ data, userId, setData }: {
  data: AgentSettings;
  userId: string;
  setData: React.Dispatch<React.SetStateAction<AgentSettings | null>>;
}) {
  const supabase    = createClient();
  const fileRef     = useRef<HTMLInputElement>(null);

  const [name,       setName]       = useState(data.full_name);
  const [phone,      setPhone]      = useState(data.phone);
  const [company,    setCompany]    = useState(data.company_name);
  const [bio,        setBio]        = useState(data.bio);
  const [address,    setAddress]    = useState(data.office_address);
  const [website,    setWebsite]    = useState(data.website_url);
  const [yearsExp,   setYearsExp]   = useState(data.years_of_experience);
  const [saving,     setSaving]     = useState(false);
  const [saveMsg,    setSaveMsg]    = useState("");
  const [saveErr,    setSaveErr]    = useState("");
  const [avatarLoad, setAvatarLoad] = useState(false);
  const [avatar,     setAvatar]     = useState(data.avatar_url);

  async function handleSave() {
    setSaving(true); setSaveMsg(""); setSaveErr("");
    const [r1, r2] = await Promise.all([
      supabase.from("profiles").update({ full_name: name.trim(), phone: phone.trim() }).eq("id", userId),
      supabase.from("agent_profiles").update({
        company_name:        company.trim() || null,
        bio:                 bio.trim()     || null,
        office_address:      address.trim() || null,
        website_url:         website.trim() || null,
        years_of_experience: yearsExp ? parseInt(yearsExp) : null,
      }).eq("profile_id", userId),
    ]);
    setSaving(false);
    if (r1.error || r2.error) { setSaveErr("Failed to save. Please try again."); return; }
    setSaveMsg("Profile saved successfully!");
    setData(d => d ? { ...d, full_name: name, phone, company_name: company, bio, office_address: address, website_url: website, years_of_experience: yearsExp } : d);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setSaveErr("Max file size is 2MB."); return; }
    setAvatarLoad(true);
    const ext  = file.name.split(".").pop();
    const path = `avatars/${userId}.${ext}`;
    await supabase.storage.from("media").upload(path, file, { upsert: true });
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    const url = urlData.publicUrl;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
    setAvatar(url);
    setAvatarLoad(false);
    setSaveMsg("Profile picture updated!");
    setTimeout(() => setSaveMsg(""), 3000);
  }

  const isVerified = data.verification_status === "verified";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* Left — main form */}
      <div className="xl:col-span-2 space-y-5">

        {/* Professional info header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6"
          style={{ boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-gray-900 font-bold text-base">Professional Information</h3>
            {isVerified && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#2EAE88] bg-[#2EAE88]/10 px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Verified Agent
              </span>
            )}
          </div>

          {/* Avatar */}
          <div className="flex items-start gap-5 mb-6">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center">
                {avatar ? (
                  <Image src={avatar} alt="Avatar" width={80} height={80} className="object-cover w-20 h-20" />
                ) : (
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                )}
              </div>
              {avatarLoad && (
                <div className="absolute inset-0 rounded-2xl bg-black/30 flex items-center justify-center">
                  <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                </div>
              )}
            </div>
            <div>
              <p className="text-gray-900 font-semibold text-sm mb-1">Profile Picture</p>
              <p className="text-gray-400 text-xs mb-3">PNG, JPG or GIF. Max size of 2MB. 800×800px recommended.</p>
              <div className="flex gap-2">
                <button onClick={() => fileRef.current?.click()}
                  className="text-xs font-semibold px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Upload New
                </button>
                {avatar && (
                  <button onClick={async () => {
                    await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
                    setAvatar(null);
                  }}
                    className="text-xs font-semibold px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                    Delete
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl">
                <span className="text-sm text-gray-500 flex-1 truncate">{data.email}</span>
                <span className="text-[9px] font-bold bg-[#2EAE88]/10 text-[#2EAE88] px-2 py-0.5 rounded-full">Verified</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed here.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+91</span>
                <input type="tel" value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Agency / Company Name</label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Skyline Realty Group"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Years of Experience</label>
              <input type="number" value={yearsExp} onChange={e => setYearsExp(e.target.value)} min="0" max="50"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Website URL</label>
              <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all" />
            </div>
          </div>

          {/* RERA — read only */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">RERA License Number</label>
            <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500">
              {data.rera_number || "Not provided — contact admin to update"}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Contact admin to update RERA information.</p>
          </div>

          {/* Bio */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Bio / Professional Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
              placeholder="Tell clients about your expertise, areas, and approach…"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all resize-none" />
          </div>

          {/* Office address */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Office Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)}
              placeholder="Full office address"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all" />
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {saveMsg && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-2 text-sm text-[#2EAE88] bg-[#F0FDF9] border border-[#2EAE88]/20 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {saveMsg}
              </motion.div>
            )}
            {saveErr && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mt-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {saveErr}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right — actions + quick stats */}
      <div className="space-y-4">
        {/* Save / Discard */}
        <div className="bg-white rounded-2xl border-2 border-[#2EAE88] p-5 space-y-3"
          style={{ boxShadow: "0 4px 20px -4px rgba(46,174,136,0.2)" }}>
          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#2EAE88] hover:bg-[#28996f] disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition-colors">
            {saving ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Saving…</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg> Save All Changes</>
            )}
          </button>
          <button onClick={() => window.location.reload()}
            className="w-full text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl transition-colors">
            Discard Changes
          </button>
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5"
          style={{ boxShadow: "0 2px 8px -2px rgba(0,0,0,0.06)" }}>
          <p className="text-gray-900 font-bold text-sm mb-4">Account Overview</p>
          <div className="space-y-3">
            {[
              { label: "Active Listings", value: data.active_listings },
              { label: "Total Leads",     value: data.total_leads_received },
              { label: "Converted",       value: data.total_leads_converted },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">{s.label}</span>
                <span className="text-gray-900 font-bold text-sm">{s.value}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">Verification</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  data.verification_status === "verified"
                    ? "bg-[#2EAE88]/10 text-[#2EAE88]"
                    : data.verification_status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {data.verification_status.replace("_"," ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 2: ACCOUNT & SECURITY — OTP-based password change
// ═══════════════════════════════════════════════════════════════
type PwdStep = "idle" | "sending" | "otp_sent" | "verifying" | "changing" | "done" | "error";

function SecurityTab({ email }: { email: string }) {
  const supabase = createClient();

  // OTP flow state
  const [step,       setStep]       = useState<PwdStep>("idle");
  const [otp,        setOtp]        = useState(["","","","","",""]);
  const [newPwd,     setNewPwd]     = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd,    setShowPwd]    = useState(false);
  const [errMsg,     setErrMsg]     = useState("");
  const [countdown,  setCountdown]  = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([null,null,null,null,null,null]);

  const strength = pwdStrength(newPwd);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function sendOtp() {
    setStep("sending"); setErrMsg("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) {
      setErrMsg("Failed to send OTP. Please try again.");
      setStep("error");
      return;
    }
    setStep("otp_sent");
    setCountdown(60);
  }

  function handleOtpInput(i: number, val: string) {
    if (val.length > 1) {
      // Handle paste
      const digits = val.replace(/\D/g, "").slice(0, 6).split("");
      const next   = [...otp];
      digits.forEach((d, idx) => { if (i + idx < 6) next[i + idx] = d; });
      setOtp(next);
      otpRefs.current[Math.min(i + digits.length, 5)]?.focus();
      return;
    }
    const next = [...otp];
    next[i] = val.replace(/\D/g, "");
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function handleOtpKey(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  }

  async function verifyOtpAndChange() {
    const code = otp.join("");
    if (code.length < 6) { setErrMsg("Please enter the complete 6-digit OTP."); return; }
    if (!newPwd)          { setErrMsg("Please enter a new password.");           return; }
    if (newPwd.length < 8){ setErrMsg("Password must be at least 8 characters."); return; }
    if (newPwd !== confirmPwd) { setErrMsg("Passwords do not match."); return; }

    setStep("verifying"); setErrMsg("");

    // Verify OTP
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type:  "email",
    });

    if (verifyErr) {
      setErrMsg("Invalid or expired OTP. Please try again.");
      setStep("otp_sent");
      return;
    }

    setStep("changing");
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPwd });

    if (updateErr) {
      setErrMsg(updateErr.message);
      setStep("otp_sent");
      return;
    }

    setStep("done");
  }

  function reset() {
    setStep("idle"); setOtp(["","","","","",""]); setNewPwd(""); setConfirmPwd(""); setErrMsg("");
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

      {/* Change password card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6"
        style={{ boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#2EAE88]/10 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-base">Change Password</h3>
            <p className="text-gray-400 text-xs">Verified via OTP sent to your email</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Idle — start button */}
          {step === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <p className="text-gray-600 text-sm">
                  To change your password, we'll send a <strong>6-digit OTP</strong> to your registered email:
                </p>
                <p className="text-[#2EAE88] font-bold text-sm mt-1">{email}</p>
              </div>
              <button onClick={sendOtp}
                className="w-full bg-[#2EAE88] hover:bg-[#28996f] text-white font-semibold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Send OTP to Email
              </button>
            </motion.div>
          )}

          {/* Step: Sending */}
          {step === "sending" && (
            <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-8">
              <svg className="w-8 h-8 animate-spin text-[#2EAE88] mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-gray-500 text-sm">Sending OTP to {email}…</p>
            </motion.div>
          )}

          {/* Step: OTP sent — enter OTP + new password */}
          {(step === "otp_sent" || step === "verifying" || step === "changing") && (
            <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <p className="text-blue-700 text-xs">OTP sent to <strong>{email}</strong>. Check your inbox (and spam folder).</p>
              </div>

              {/* OTP boxes */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Enter 6-Digit OTP</label>
                <div className="flex gap-2">
                  {otp.map((digit, i) => (
                    <input key={i} ref={el => { otpRefs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={6}
                      value={digit}
                      onChange={e => handleOtpInput(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      className={`w-10 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all ${
                        digit
                          ? "border-[#2EAE88] bg-[#F0FDF9] text-[#2EAE88]"
                          : "border-gray-200 bg-gray-50 text-gray-700 focus:border-[#2EAE88]"
                      }`}
                    />
                  ))}
                </div>
                {/* Resend */}
                <div className="mt-2 flex items-center gap-2">
                  {countdown > 0 ? (
                    <p className="text-gray-400 text-xs">Resend OTP in {countdown}s</p>
                  ) : (
                    <button onClick={sendOtp}
                      className="text-xs text-[#2EAE88] font-semibold hover:underline underline-offset-4">
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">New Password</label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2EAE88] focus:bg-white focus:ring-2 focus:ring-[#2EAE88]/10 transition-all" />
                  <button type="button" onClick={() => setShowPwd(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      {showPwd
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                      }
                    </svg>
                  </button>
                </div>
                {newPwd && (
                  <div className="mt-2 flex items-center gap-1.5">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? STRENGTH_COLOR[strength] : "bg-gray-200"}`} />
                    ))}
                    <span className={`text-xs font-semibold ml-1 ${STRENGTH_TEXT[strength]}`}>{STRENGTH_LABEL[strength]}</span>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Confirm New Password</label>
                <input type={showPwd ? "text" : "password"} value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm outline-none focus:bg-white transition-all ${
                    confirmPwd && confirmPwd !== newPwd
                      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 focus:border-[#2EAE88] focus:ring-2 focus:ring-[#2EAE88]/10"
                  }`} />
                {confirmPwd && confirmPwd !== newPwd && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Error */}
              {errMsg && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errMsg}</p>
              )}

              {/* Submit */}
              <div className="flex gap-3">
                <button onClick={verifyOtpAndChange}
                  disabled={step === "verifying" || step === "changing"}
                  className="flex-1 bg-[#2EAE88] hover:bg-[#28996f] disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {step === "verifying" || step === "changing" ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    {step === "verifying" ? "Verifying OTP…" : "Changing Password…"}</>
                  ) : "Verify & Change Password"}
                </button>
                <button onClick={reset}
                  className="px-4 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-14 h-14 bg-[#2EAE88]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </motion.div>
              <h4 className="text-gray-900 font-bold text-lg mb-1">Password Changed!</h4>
              <p className="text-gray-400 text-sm mb-4">Your password has been updated successfully.</p>
              <button onClick={reset}
                className="text-sm text-[#2EAE88] font-semibold hover:underline underline-offset-4">
                Change again
              </button>
            </motion.div>
          )}

          {/* Step: Error */}
          {step === "error" && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-6">
              <p className="text-red-500 text-sm mb-3">{errMsg}</p>
              <button onClick={reset} className="text-sm text-[#2EAE88] font-semibold hover:underline underline-offset-4">
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Security info sidebar */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5"
          style={{ boxShadow: "0 2px 8px -2px rgba(0,0,0,0.06)" }}>
          <h4 className="text-gray-900 font-bold text-sm mb-4">Password Requirements</h4>
          <ul className="space-y-2">
            {[
              { text: "At least 8 characters",           met: newPwd.length >= 8              },
              { text: "One uppercase letter (A–Z)",       met: /[A-Z]/.test(newPwd)            },
              { text: "One number (0–9)",                 met: /[0-9]/.test(newPwd)            },
              { text: "One special character (!@#$…)",    met: /[^A-Za-z0-9]/.test(newPwd)    },
            ].map(r => (
              <li key={r.text} className={`flex items-center gap-2 text-xs ${r.met ? "text-[#2EAE88]" : "text-gray-400"}`}>
                <svg className={`w-3.5 h-3.5 flex-shrink-0 ${r.met ? "text-[#2EAE88]" : "text-gray-300"}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {r.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-amber-800 font-semibold text-xs mb-1">🔐 Why OTP?</p>
          <p className="text-amber-700 text-xs leading-relaxed">
            We verify your identity with a one-time code before allowing password changes. This protects your account even if someone else has access to your session.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 3: NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
function NotificationsTab({ userId, onRead }: { userId: string; onRead: () => void }) {
  const supabase = createClient();
  const [notifs,    setNotifs]    = useState<Notification[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [markingAll,setMarkingAll]= useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("notifications")
        .select("id, type, title, body, action_url, action_label, read_at, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      setNotifs(data ?? []);
      setLoading(false);
    }
    load();
  }, [userId]);

  async function markRead(id: string) {
    await supabase.from("notifications").update({ read_at: new Date().toISOString(), status: "read" }).eq("id", id);
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
  }

  async function markAllRead() {
    setMarkingAll(true);
    await supabase.from("notifications")
      .update({ read_at: new Date().toISOString(), status: "read" })
      .eq("user_id", userId)
      .is("read_at", null);
    setNotifs(ns => ns.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setMarkingAll(false);
    onRead();
  }

  const unreadCount = notifs.filter(n => !n.read_at).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-gray-900 font-bold text-base">Notifications</h3>
          <p className="text-gray-400 text-xs mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} disabled={markingAll}
            className="text-xs font-semibold text-[#2EAE88] hover:underline underline-offset-4 disabled:opacity-50">
            {markingAll ? "Marking…" : "Mark all as read"}
          </button>
        )}
      </div>

      {/* Notification list */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="w-6 h-6 border-2 border-[#2EAE88] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : notifs.length === 0 ? (
        <div className="p-14 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <p className="text-gray-500 font-semibold mb-1">No notifications yet</p>
          <p className="text-gray-400 text-sm">We'll notify you about leads, listing updates and more.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {notifs.map(n => {
            const cfg = NOTIF_ICON[n.type] ?? { icon: "📬", cls: "bg-gray-50" };
            const isUnread = !n.read_at;
            return (
              <div key={n.id}
                className={`flex items-start gap-4 px-6 py-4 transition-colors ${isUnread ? "bg-blue-50/30" : "hover:bg-gray-50"}`}
                onClick={() => !n.read_at && markRead(n.id)}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${cfg.cls}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${isUnread ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isUnread && <span className="w-2 h-2 bg-[#2EAE88] rounded-full flex-shrink-0" />}
                      <span className="text-gray-400 text-[10px] whitespace-nowrap">{timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                  {n.body && <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{n.body}</p>}
                  {n.action_url && n.action_label && (
                    <Link href={n.action_url}
                      className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#2EAE88] hover:underline underline-offset-4">
                      {n.action_label} →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB 4: BILLING
// ═══════════════════════════════════════════════════════════════
function BillingTab({ data }: { data: AgentSettings }) {
  const [plans,       setPlans]       = useState<Plan[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [upgradeMsg,  setUpgradeMsg]  = useState("");
  const supabase = createClient();

  useEffect(() => {
    supabase.from("plans").select("*").order("sort_order")
      .then(({ data }) => { setPlans(data ?? []); setLoading(false); });
  }, []);

  const usedLeads = 3 - data.free_leads_remaining;

  return (
    <div className="space-y-6">

      {/* Current plan card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6"
        style={{ boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>
        <h3 className="text-gray-900 font-bold text-base mb-4">Current Plan</h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-[#2EAE88]/10 to-transparent border border-[#2EAE88]/20 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#2EAE88] rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-900 font-bold text-base">{data.plan_name} Plan</p>
              <p className="text-gray-500 text-xs mt-0.5">
                {data.plan_slug === "free" ? "No expiry · Free forever" : `Expires: ${data.plan_expires_at ? new Date(data.plan_expires_at).toLocaleDateString("en-IN") : "–"}`}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[#2EAE88] text-white uppercase tracking-wide">
            Active
          </span>
        </div>

        {/* Usage stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          {[
            {
              label: "Free Leads",
              value: `${data.free_leads_remaining} remaining`,
              sub:   `${usedLeads} of 3 used this month`,
              pct:   (usedLeads / 3) * 100,
              color: "bg-[#2EAE88]",
            },
            {
              label: "Active Listings",
              value: `${data.active_listings} active`,
              sub:   `Limit: ${data.plan_slug === "free" ? "3" : "–"} listings`,
              pct:   Math.min(100, (data.active_listings / 3) * 100),
              color: "bg-[#1B4FD8]",
            },
            {
              label: "Leads Converted",
              value: `${data.total_leads_converted} converted`,
              sub:   `Out of ${data.total_leads_received} received`,
              pct:   data.total_leads_received > 0 ? (data.total_leads_converted / data.total_leads_received) * 100 : 0,
              color: "bg-purple-500",
            },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-500 text-xs font-medium mb-1">{s.label}</p>
              <p className="text-gray-900 font-bold text-sm mb-2">{s.value}</p>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
              </div>
              <p className="text-gray-400 text-[10px] mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Available plans */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6"
        style={{ boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-gray-900 font-bold text-base">Available Plans</h3>
            <p className="text-gray-400 text-xs mt-0.5">Upgrade to unlock more leads and listings.</p>
          </div>
          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            Coming Soon
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map(plan => {
              const isCurrent = plan.slug === data.plan_slug;
              const isPopular = plan.slug === "gold";
              return (
                <div key={plan.id}
                  className={`relative rounded-2xl p-5 border-2 transition-all ${
                    isCurrent
                      ? "border-[#2EAE88] bg-[#2EAE88]/5"
                      : isPopular
                      ? "border-[#1B4FD8] bg-[#1B4FD8]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}>
                  {isPopular && !isCurrent && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="text-[9px] font-black bg-[#1B4FD8] text-white px-2.5 py-1 rounded-full whitespace-nowrap">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="text-[9px] font-black bg-[#2EAE88] text-white px-2.5 py-1 rounded-full whitespace-nowrap">
                        CURRENT PLAN
                      </span>
                    </div>
                  )}

                  <p className="text-gray-900 font-bold text-base mb-0.5">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      {plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString("en-IN")}`}
                    </span>
                    {plan.price > 0 && <span className="text-gray-400 text-xs">/month</span>}
                  </div>

                  <ul className="space-y-2 mb-5">
                    {[
                      `${plan.max_active_listings} listings`,
                      `${plan.free_leads_per_cycle === 999 ? "Unlimited" : plan.free_leads_per_cycle} free leads/mo`,
                      plan.verified_badge_included && "Verified badge",
                      plan.analytics_access        && "Analytics access",
                      plan.priority_support        && "Priority support",
                      plan.featured_credits_included > 0 && `${plan.featured_credits_included} featured credits`,
                    ].filter(Boolean).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-[#2EAE88] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled
                    onClick={() => setUpgradeMsg(`${plan.name} plan will be available soon! We'll notify you.`)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors disabled:cursor-not-allowed ${
                      isCurrent
                        ? "bg-[#2EAE88]/20 text-[#2EAE88] cursor-default"
                        : "bg-gray-200 text-gray-400"
                    }`}>
                    {isCurrent ? "Current Plan" : "Coming Soon"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {upgradeMsg && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-[#1B4FD8] bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            {upgradeMsg}
          </motion.div>
        )}

        <p className="text-gray-400 text-xs text-center mt-4">
          Premium plans with Razorpay payments are coming soon. All current agents will be notified.
        </p>
      </div>
    </div>
  );
}