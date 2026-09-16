"use client";

// app/my-account/page.tsx
// User account page — profile editing, avatar upload, password change.
// Reads from: profiles table
// Writes to:  profiles table, Supabase auth (password)

import { useState, useEffect, useRef } from "react";
import { useRouter }                   from "next/navigation";
import Image                           from "next/image";
import { motion, AnimatePresence }     from "framer-motion";
import { createClient }                from "@/lib/supabase/client";

interface Profile {
  id:         string;
  full_name:  string | null;
  phone:      string | null;
  email:      string;
  avatar_url: string | null;
  role:       string;
  city_id?:   string | null;
}

function getInitials(name: string | null, email: string) {
  if (name?.trim()) {
    return name.trim().split(" ").filter(Boolean).slice(0, 2)
      .map(n => n[0].toUpperCase()).join("");
  }
  return email[0]?.toUpperCase() ?? "U";
}

type Tab = "profile" | "security";

export default function MyAccountPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [profile,     setProfile]     = useState<Profile | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState<Tab>("profile");

  // Profile form
  const [name,        setName]        = useState("");
  const [phone,       setPhone]       = useState("");
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState("");
  const [saveErr,     setSaveErr]     = useState("");

  // Avatar
  const fileRef               = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Password
  const [curPwd,      setCurPwd]      = useState("");
  const [newPwd,      setNewPwd]      = useState("");
  const [confirmPwd,  setConfirmPwd]  = useState("");
  const [pwdSaving,   setPwdSaving]   = useState(false);
  const [pwdMsg,      setPwdMsg]      = useState("");
  const [pwdErr,      setPwdErr]      = useState("");
  const [showCur,     setShowCur]     = useState(false);
  const [showNew,     setShowNew]     = useState(false);

  // ── Load profile ─────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?redirect=/my-account"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url, role, city_id")
        .eq("id", user.id)
        .single();

      const p: Profile = {
        id:         user.id,
        full_name:  data?.full_name ?? null,
        phone:      data?.phone ?? null,
        email:      user.email ?? "",
        avatar_url: data?.avatar_url ?? null,
        role:       data?.role ?? "user",
        city_id:    data?.city_id ?? null,
      };
      setProfile(p);
      setName(p.full_name ?? "");
      setPhone(p.phone ?? "");
      setLoading(false);
    }
    load();
  }, []);

  // ── Save profile ─────────────────────────────────────────
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true); setSaveErr(""); setSaveMsg("");
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim() || null, phone: phone.trim() || null })
      .eq("id", profile.id);
    setSaving(false);
    if (error) { setSaveErr("Failed to save. Please try again."); return; }
    setSaveMsg("Profile updated successfully!");
    setProfile(p => p ? { ...p, full_name: name.trim() || null, phone: phone.trim() || null } : p);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  // ── Avatar upload ─────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 2 * 1024 * 1024) { setSaveErr("Image must be under 2MB."); return; }

    setAvatarUploading(true);
    const ext   = file.name.split(".").pop();
    const path  = `avatars/${profile.id}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: true });

    if (upErr) { setSaveErr("Avatar upload failed."); setAvatarUploading(false); return; }

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    const url = urlData.publicUrl;

    await supabase.from("profiles").update({ avatar_url: url }).eq("id", profile.id);
    setProfile(p => p ? { ...p, avatar_url: url } : p);
    setAvatarUploading(false);
    setSaveMsg("Avatar updated!");
    setTimeout(() => setSaveMsg(""), 3000);
  }

  // ── Change password ───────────────────────────────────────
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdErr(""); setPwdMsg("");
    if (!newPwd) { setPwdErr("Enter a new password."); return; }
    if (newPwd.length < 8) { setPwdErr("Password must be at least 8 characters."); return; }
    if (newPwd !== confirmPwd) { setPwdErr("Passwords do not match."); return; }
    setPwdSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setPwdSaving(false);
    if (error) { setPwdErr(error.message); return; }
    setPwdMsg("Password updated successfully!");
    setCurPwd(""); setNewPwd(""); setConfirmPwd("");
    setTimeout(() => setPwdMsg(""), 4000);
  }

  // ── Password strength ─────────────────────────────────────
  function pwdStrength(pwd: string) {
    let score = 0;
    if (pwd.length >= 8)            score++;
    if (/[A-Z]/.test(pwd))          score++;
    if (/[0-9]/.test(pwd))          score++;
    if (/[^A-Za-z0-9]/.test(pwd))   score++;
    return score;
  }
  const strength = pwdStrength(newPwd);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-[#2EAE88]"][strength];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-7 h-7 border-2 border-[#1B4FD8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const TABS: { key: Tab; label: string }[] = [
    { key: "profile",  label: "Profile" },
    { key: "security", label: "Security" },
  ];

  const roleLabel: Record<string, string> = {
    user: "Buyer / Renter", agent: "Agent", builder: "Builder & Developer", admin: "Admin",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your profile and security settings.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 4px 24px -6px rgba(0,0,0,0.08)" }}>

          {/* Avatar + name hero */}
          <div className="bg-gradient-to-r from-[#1B4FD8] to-[#0f2d8a] px-6 pt-8 pb-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-white/20 overflow-hidden flex items-center justify-center ring-4 ring-white/30">
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt="Avatar" width={80} height={80}
                      className="object-cover w-20 h-20" />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {getInitials(profile.full_name, profile.email)}
                    </span>
                  )}
                </div>
                {/* Upload button */}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-[#2EAE88] hover:bg-[#28996f] rounded-full flex items-center justify-center shadow-lg transition-colors"
                  title="Change photo"
                >
                  {avatarUploading ? (
                    <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  )}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Name + role */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-lg leading-tight truncate">
                  {profile.full_name || "Your Name"}
                </p>
                <p className="text-blue-200 text-sm mt-0.5">{profile.email}</p>
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white">
                  {roleLabel[profile.role] ?? profile.role}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`py-3.5 px-1 mr-6 text-sm font-semibold border-b-2 transition-colors ${
                  tab === t.key
                    ? "border-[#1B4FD8] text-[#1B4FD8]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {tab === "profile" ? (
                <motion.form key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} onSubmit={handleSaveProfile} className="space-y-5">

                  {/* Full name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#1B4FD8] focus:bg-white focus:ring-2 focus:ring-[#1B4FD8]/10 transition-all" />
                  </div>

                  {/* Email — read only */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl">
                      <span className="text-sm text-gray-500 flex-1">{profile.email}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2EAE88]/10 text-[#2EAE88]">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+91</span>
                      <input type="tel" value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#1B4FD8] focus:bg-white focus:ring-2 focus:ring-[#1B4FD8]/10 transition-all" />
                    </div>
                  </div>

                  {/* Feedback */}
                  <AnimatePresence>
                    {saveMsg && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-sm text-[#2EAE88] bg-[#F0FDF9] border border-[#2EAE88]/20 rounded-xl px-4 py-3">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {saveMsg}
                      </motion.div>
                    )}
                    {saveErr && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        {saveErr}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button type="submit" disabled={saving}
                    className="w-full bg-[#1B4FD8] hover:bg-[#1640b8] disabled:opacity-60 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                    {saving ? (
                      <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg> Saving…</>
                    ) : "Save Changes"}
                  </button>
                </motion.form>

              ) : (
                <motion.form key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} onSubmit={handleChangePassword} className="space-y-5">

                  <p className="text-sm text-gray-500">Choose a strong password with at least 8 characters.</p>

                  {/* New password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input type={showNew ? "text" : "password"} value={newPwd}
                        onChange={e => setNewPwd(e.target.value)} placeholder="Enter new password"
                        className="w-full px-4 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#1B4FD8] focus:bg-white focus:ring-2 focus:ring-[#1B4FD8]/10 transition-all" />
                      <button type="button" onClick={() => setShowNew(s => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          {showNew
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                          }
                        </svg>
                      </button>
                    </div>
                    {/* Strength bar */}
                    {newPwd && (
                      <div className="mt-2 flex gap-1 items-center">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-200"}`} />
                        ))}
                        <span className={`text-xs font-semibold ml-2 ${["","text-red-400","text-amber-500","text-blue-500","text-[#2EAE88]"][strength]}`}>
                          {strengthLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <input type={showNew ? "text" : "password"} value={confirmPwd}
                      onChange={e => setConfirmPwd(e.target.value)} placeholder="Re-enter new password"
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm text-gray-800 outline-none focus:bg-white focus:ring-2 transition-all ${
                        confirmPwd && confirmPwd !== newPwd
                          ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                          : "border-gray-200 focus:border-[#1B4FD8] focus:ring-[#1B4FD8]/10"
                      }`} />
                    {confirmPwd && confirmPwd !== newPwd && (
                      <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  {/* Feedback */}
                  <AnimatePresence>
                    {pwdMsg && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-sm text-[#2EAE88] bg-[#F0FDF9] border border-[#2EAE88]/20 rounded-xl px-4 py-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {pwdMsg}
                      </motion.div>
                    )}
                    {pwdErr && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        {pwdErr}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button type="submit" disabled={pwdSaving}
                    className="w-full bg-[#1B4FD8] hover:bg-[#1640b8] disabled:opacity-60 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors">
                    {pwdSaving ? "Updating…" : "Update Password"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}