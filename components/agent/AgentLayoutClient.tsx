"use client";

// components/agent/AgentLayoutClient.tsx
// Sidebar + Topbar as a proper separate layout.
// Sidebar is fixed on desktop, slide-in on mobile.
// Topbar is sticky at top of main content area.
// All agent pages live inside the main content area.

import { useState, useEffect }     from "react";
import { useRouter, usePathname }  from "next/navigation";
import Link                        from "next/link";
import Image                       from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient }            from "@/lib/supabase/client";

interface AgentUser {
  id:         string;
  full_name:  string;
  email:      string;
  avatar_url: string | null;
  plan_name:  string;
  role:       string;
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2)
    .map(n => n[0].toUpperCase()).join("");
}

const SIDEBAR_LINKS = [
  {
    label: "Dashboard",
    href:  "/agent/dashboard",
    icon:  (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: "My Listings",
    href:  "/agent/listings",
    icon:  (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18h13.5m-13.5 0V3a.75.75 0 01.75-.75h12a.75.75 0 01.75.75v18" />
      </svg>
    ),
  },
  {
    label: "Leads",
    href:  "/agent/leads",
    icon:  (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    label: "Verification Center",
    href:  "/agent/verification",
    icon:  (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href:  "/agent/settings",
    icon:  (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function AgentLayoutClient({ children }: { children: React.ReactNode }) {
  const supabase  = createClient();
  const router    = useRouter();
  const pathname  = usePathname();

  const [user,        setUser]        = useState<AgentUser | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search,      setSearch]      = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push("/login?redirect=" + pathname); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, role, agent_profiles(plans(name))")
        .eq("id", authUser.id)
        .single();

      if (!["agent","builder","admin"].includes(profile?.role ?? "")) {
        router.push("/");
        return;
      }

      const ap   = Array.isArray(profile?.agent_profiles)
        ? profile.agent_profiles[0] : profile?.agent_profiles;
      const plan = Array.isArray(ap?.plans) ? ap.plans[0] : ap?.plans;

      setUser({
        id:         authUser.id,
        full_name:  profile?.full_name ?? authUser.email?.split("@")[0] ?? "Agent",
        email:      authUser.email ?? "",
        avatar_url: profile?.avatar_url ?? null,
        plan_name:  plan?.name ?? "Free",
        role:       profile?.role ?? "agent",
      });
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2EAE88] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
            Loading portal…
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const pageTitle: Record<string, { title: string; sub: string }> = {
    "/agent/dashboard":    { title: "Dashboard",          sub: "Here's what's happening with your properties today." },
    "/agent/listings":     { title: "My Listings",        sub: "Manage and track your property inventory." },
    "/agent/leads":        { title: "Leads Management",   sub: "Manage and track your property enquiries across India's premier real estate." },
    "/agent/verification": { title: "Verification Center",sub: "Complete your verification to unlock all features." },
    "/agent/settings":     { title: "Settings",           sub: "Manage your agent profile and preferences." },
  };
  const page = pageTitle[pathname] ?? { title: "Agent Portal", sub: "" };

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "Poppins, sans-serif" }}>

      {/* ── Sidebar ────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-100 z-50 flex flex-col
          transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ boxShadow: "2px 0 20px -4px rgba(0,0,0,0.08)" }}
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <Link href="/">
            <Image src="/logo-new.png" alt="PropertyLink" width={120} height={36}
              className="h-9 w-auto object-contain" priority />
          </Link>
          <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1">
            Agent Portal
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {SIDEBAR_LINKS.map(link => {
            const active = pathname === link.href;
            return (
              <Link key={link.label} href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#2EAE88] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: help + logout + user */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3 space-y-0.5 flex-shrink-0">
          <Link href="/agent/help-center"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            Help Center
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>

          {/* Agent info */}
          <div className="flex items-center gap-2.5 px-3 py-3 mt-1 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-[#1B4FD8] flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.avatar_url
                ? <Image src={user.avatar_url} alt="" width={32} height={32} className="object-cover" />
                : <span className="text-white text-xs font-bold">{getInitials(user.full_name)}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="text-gray-900 text-xs font-semibold truncate">{user.full_name}</p>
              <p className="text-[10px] text-[#2EAE88] font-bold uppercase tracking-wide">
                {user.plan_name} Agent
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">

        {/* ── Topbar ──────────────────────────────────────── */}
        <header className="bg-white border-b border-gray-100 px-5 sm:px-8 py-4 flex items-center gap-4 sticky top-0 z-30 flex-shrink-0"
          style={{ boxShadow: "0 1px 8px -2px rgba(0,0,0,0.06)" }}>

          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-gray-900 font-bold text-lg sm:text-xl leading-tight">{page.title}</h1>
            {page.sub && <p className="text-gray-400 text-xs mt-0.5 hidden sm:block truncate">{page.sub}</p>}
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-52">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search leads or properties"
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full" />
          </div>

          {/* Bell */}
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </button>

          {/* New listing CTA */}
          <a href="https://wa.me/919999999999?text=Hi, I want to list my property on PropertyLink."
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#2EAE88] hover:bg-[#28996f] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">New Listing</span>
          </a>
        </header>

        {/* ── Page content ────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}