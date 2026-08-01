// "use client";

// import { useState, Suspense } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import { createClient } from "@/lib/supabase/client";

// // ── Types ─────────────────────────────────────────────────────
// type Intent = "buyer" | "agent" | null;
// type AgentType = "individual_agent" | "builder_developer" | "individual_owner";

// // ── Google icon ───────────────────────────────────────────────
// function GoogleIcon() {
//   return (
//     <svg className="w-5 h-5" viewBox="0 0 24 24">
//       <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//       <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//       <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//       <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//     </svg>
//   );
// }

// // ── Shared Field ──────────────────────────────────────────────
// function Field({
//   label, type = "text", value, onChange, placeholder, disabled,
//   showToggle, onToggle, show,
// }: {
//   label: string; type?: string; value: string;
//   onChange: (v: string) => void; placeholder?: string;
//   disabled: boolean; showToggle?: boolean;
//   onToggle?: () => void; show?: boolean;
// }) {
//   const inputType = showToggle ? (show ? "text" : "password") : type;
//   return (
//     <div className="space-y-1.5">
//       <label className="block text-sm font-medium text-gray-700">{label}</label>
//       <div className="relative">
//         <input
//           type={inputType}
//           value={value}
//           onChange={e => onChange(e.target.value)}
//           placeholder={placeholder}
//           disabled={disabled}
//           className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F8FA] text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#1B4FD8] focus:bg-white focus:ring-2 focus:ring-[#1B4FD8]/10 transition-all duration-200 disabled:opacity-50"
//           style={{ paddingRight: showToggle ? "44px" : undefined }}
//         />
//         {showToggle && (
//           <button
//             type="button"
//             onClick={onToggle}
//             tabIndex={-1}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//           >
//             {show ? (
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//               </svg>
//             ) : (
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
//               </svg>
//             )}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── Intent card ───────────────────────────────────────────────
// function IntentCard({
//   title, description, icon, selected, onClick,
// }: {
//   title: string; description: string; icon: React.ReactNode;
//   selected: boolean; onClick: () => void;
// }) {
//   return (
//     <motion.button
//       type="button"
//       onClick={onClick}
//       whileHover={{ y: -2 }}
//       whileTap={{ scale: 0.98 }}
//       className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
//         selected
//           ? "border-[#1B4FD8] bg-[#EEF2FF]"
//           : "border-gray-200 bg-white hover:border-gray-300"
//       }`}
//     >
//       <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
//         selected ? "bg-[#1B4FD8] text-white" : "bg-gray-100 text-gray-500"
//       }`}>
//         {icon}
//       </div>
//       <p className={`font-semibold text-sm mb-1 ${selected ? "text-[#1B4FD8]" : "text-gray-800"}`}>
//         {title}
//       </p>
//       <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
//     </motion.button>
//   );
// }

// // ── Inner register component ──────────────────────────────────
// function RegisterInner() {
//   const router       = useRouter();
//   const searchParams = useSearchParams();
//   const redirectTo   = searchParams.get("redirect") || "/";
//   const supabase     = createClient();

//   const [intent,    setIntent]    = useState<Intent>(null);
//   const [name,      setName]      = useState("");
//   const [email,     setEmail]     = useState("");
//   const [phone,     setPhone]     = useState("");
//   const [password,  setPassword]  = useState("");
//   const [showPw,    setShowPw]    = useState(false);
//   const [agentType, setAgentType] = useState<AgentType>("individual_agent");
//   const [loading,   setLoading]   = useState(false);
//   const [error,     setError]     = useState("");

//   async function handleSignup(e: React.FormEvent) {
//     e.preventDefault();
//     if (!intent) { setError("Please select what you'd like to do."); return; }
//     if (!name.trim() || !email.trim() || !password) { setError("Please fill all fields."); return; }
//     if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

//     setLoading(true);
//     setError("");

//     const role = intent === "agent" ? "agent" : "user";

//     const { data, error: err } = await supabase.auth.signUp({
//       email: email.trim().toLowerCase(),
//       password,
//       options: {
//         data: {
//           full_name: name.trim(),
//           phone:     phone.trim() || null,
//           role,
//           // Pass agent_type for agent onboarding pre-fill
//           agent_type: intent === "agent" ? agentType : null,
//         },
//       },
//     });

//     if (err) {
//       setError(err.message.includes("already registered")
//         ? "An account with this email already exists. Log in instead."
//         : err.message
//       );
//       setLoading(false);
//       return;
//     }

//     if (intent === "agent") {
//       // Agent → go through onboarding
//       router.push("/onboarding/step-1");
//     } else {
//       // Buyer → go back to where they came from
//       router.push(redirectTo);
//     }
//   }

//   async function handleGoogle() {
//     setLoading(true);
//     const role = intent === "agent" ? "agent" : "user";
//     await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: {
//         redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
//           intent === "agent" ? "/onboarding/step-1" : redirectTo
//         )}&role=${role}`,
//       },
//     });
//   }

//   const rightPanel = (
//     // Decorative right side — same cycling image as login
//     <div className="relative h-full rounded-3xl overflow-hidden shadow-2xl">
//       <Image
//         src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=85"
//         alt="Find your dream property"
//         fill className="object-cover"
//         priority
//       />
//       <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

//       {/* Stats overlay */}
//       <div className="absolute bottom-0 left-0 right-0 p-7">
//         <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-3">
//           Trusted by thousands
//         </p>
//         <div className="grid grid-cols-3 gap-3">
//           {[
//             { value: "2M+", label: "Listings" },
//             { value: "50K+", label: "Agents" },
//             { value: "100M+", label: "Happy users" },
//           ].map(s => (
//             <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
//               <p className="text-white font-bold text-lg">{s.value}</p>
//               <p className="text-white/65 text-[10px] mt-0.5">{s.label}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Top logo badge */}
//       <div className="absolute top-5 left-5">
//         <div className="flex items-baseline bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl">
//           <span className="text-base font-bold text-[#1B4FD8]">Sasta</span>
//           <span className="text-base font-bold text-[#2EAE88]">ghar</span>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center bg-white px-4 py-10"
//       style={{ fontFamily: "Poppins, sans-serif" }}
//     >
//       <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-10 lg:min-h-screen lg:items-center">

//         {/* ── Left: Form ────────────────────────────────────── */}
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
//           className="flex flex-col justify-center py-10 lg:py-20 lg:pr-10 order-2 lg:order-1"
//         >
//           {/* Logo */}
//           <Link href="/" className="flex items-baseline mb-8 w-fit">
//             <span className="text-2xl font-bold text-[#1B4FD8]">Sasta</span>
//             <span className="text-2xl font-bold text-[#2EAE88]">ghar</span>
//           </Link>

//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
//             Welcome to Sastaghar
//           </h1>
//           <p className="text-gray-500 text-sm mb-7">
//             Already have an account?{" "}
//             <Link
//               href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
//               className="text-[#1B4FD8] font-semibold hover:underline underline-offset-4"
//             >
//               Log in
//             </Link>
//           </p>

//           {/* ── Intent selector ───────────────────────────── */}
//           <div className="grid grid-cols-2 gap-3 mb-6">
//             <IntentCard
//               title="Find a Property"
//               description="Browse, save and contact agents for your next home."
//               selected={intent === "buyer"}
//               onClick={() => setIntent("buyer")}
//               icon={
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
//                 </svg>
//               }
//             />
//             <IntentCard
//               title="List / Sell Property"
//               description="Post listings, get leads and grow your business."
//               selected={intent === "agent"}
//               onClick={() => setIntent("agent")}
//               icon={
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
//                 </svg>
//               }
//             />
//           </div>

//           {/* ── Agent type selector (only when agent picked) ── */}
//           <AnimatePresence>
//             {intent === "agent" && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: "auto" }}
//                 exit={{ opacity: 0, height: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="overflow-hidden mb-5"
//               >
//                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
//                   I am a…
//                 </p>
//                 <div className="grid grid-cols-3 gap-2">
//                   {([
//                     { value: "individual_agent",  label: "Agent / Broker" },
//                     { value: "builder_developer", label: "Builder / Developer" },
//                     { value: "individual_owner",  label: "Property Owner" },
//                   ] as const).map(opt => (
//                     <button
//                       key={opt.value}
//                       type="button"
//                       onClick={() => setAgentType(opt.value)}
//                       className={`py-2.5 px-3 rounded-xl text-xs font-semibold border-2 transition-all duration-150 ${
//                         agentType === opt.value
//                           ? "border-[#1B4FD8] bg-[#EEF2FF] text-[#1B4FD8]"
//                           : "border-gray-200 text-gray-600 hover:border-gray-300"
//                       }`}
//                     >
//                       {opt.label}
//                     </button>
//                   ))}
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* ── Form fields ───────────────────────────────── */}
//           <form onSubmit={handleSignup} className="space-y-4">
//             <Field label="Name" value={name} onChange={setName} placeholder="Priya Mehta" disabled={loading} />
//             <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="Example@email.com" disabled={loading} />

//             <AnimatePresence>
//               {intent === "agent" && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   transition={{ duration: 0.25 }}
//                   className="overflow-hidden"
//                 >
//                   <Field
//                     label="Phone Number"
//                     type="tel"
//                     value={phone}
//                     onChange={setPhone}
//                     placeholder="+91 98765 43210"
//                     disabled={loading}
//                   />
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <Field
//               label="Password"
//               value={password}
//               onChange={setPassword}
//               placeholder="At least 8 characters"
//               disabled={loading}
//               showToggle onToggle={() => setShowPw(p => !p)} show={showPw}
//             />

//             {/* Error */}
//             <AnimatePresence>
//               {error && (
//                 <motion.p
//                   initial={{ opacity: 0, y: -4 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
//                 >
//                   {error}
//                 </motion.p>
//               )}
//             </AnimatePresence>

//             <motion.button
//               type="submit"
//               disabled={loading}
//               whileTap={{ scale: 0.98 }}
//               className="w-full bg-[#2EAE88] hover:bg-[#28996f] disabled:opacity-70 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
//                   </svg>
//                   Creating account…
//                 </>
//               ) : "Sign up"}
//             </motion.button>

//             <div className="relative flex items-center gap-3 py-1">
//               <div className="flex-1 h-px bg-gray-200" />
//               <span className="text-xs text-gray-400 font-medium">Or</span>
//               <div className="flex-1 h-px bg-gray-200" />
//             </div>

//             <button
//               type="button"
//               onClick={handleGoogle}
//               disabled={loading}
//               className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm py-3.5 rounded-xl transition-colors duration-200 disabled:opacity-60"
//             >
//               <GoogleIcon />
//               Sign in with Google
//             </button>
//           </form>

//           <p className="mt-6 text-center text-xs text-gray-400 leading-relaxed">
//             By signing up you agree to our{" "}
//             <Link href="/terms" className="text-[#1B4FD8] hover:underline underline-offset-4">Terms</Link>
//             {" "}and{" "}
//             <Link href="/privacy" className="text-[#1B4FD8] hover:underline underline-offset-4">Privacy Policy</Link>
//           </p>
//         </motion.div>

//         {/* ── Right: Image ───────────────────────────────────── */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.97 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
//           className="hidden lg:block order-1 lg:order-2 h-[85vh] max-h-[800px] self-center"
//         >
//           {rightPanel}
//         </motion.div>

//       </div>
//     </div>
//   );
// }

// export default function RegisterPage() {
//   return (
//     <Suspense fallback={
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="w-6 h-6 border-2 border-[#1B4FD8] border-t-transparent rounded-full animate-spin" />
//       </div>
//     }>
//       <RegisterInner />
//     </Suspense>
//   );
// }






"use client";

// app/register/page.tsx
// BUG FIX 2: Replaced email confirmation link with OTP flow.
// After signup, user is redirected to /verify-otp with their email
// stored in sessionStorage. OTP arrives in email, user enters it,
// session activates, then routed to correct destination.

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type Intent    = "buyer" | "agent" | null;
type AgentType = "individual_agent" | "builder_developer" | "individual_owner";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, disabled, showToggle, onToggle, show }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled: boolean; showToggle?: boolean; onToggle?: () => void; show?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={showToggle ? (show ? "text" : "password") : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#F7F8FA] text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#1B4FD8] focus:bg-white focus:ring-2 focus:ring-[#1B4FD8]/10 transition-all duration-200 disabled:opacity-50"
          style={{ paddingRight: showToggle ? "44px" : undefined }}
        />
        {showToggle && (
          <button type="button" onClick={onToggle} tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {show ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function IntentCard({ title, description, icon, selected, onClick }: {
  title: string; description: string; icon: React.ReactNode; selected: boolean; onClick: () => void;
}) {
  return (
    <motion.button type="button" onClick={onClick} whileTap={{ scale: 0.98 }}
      className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
        selected ? "border-[#1B4FD8] bg-[#EEF2FF]" : "border-gray-200 bg-white hover:border-gray-300"
      }`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${selected ? "bg-[#1B4FD8] text-white" : "bg-gray-100 text-gray-500"}`}>
        {icon}
      </div>
      <p className={`font-semibold text-sm mb-1 ${selected ? "text-[#1B4FD8]" : "text-gray-800"}`}>{title}</p>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </motion.button>
  );
}

function RegisterInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") || "/";
  const intentParam  = searchParams.get("intent") as Intent;
  const supabase     = createClient();

  const [intent,    setIntent]    = useState<Intent>(intentParam);
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [agentType, setAgentType] = useState<AgentType>("individual_agent");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  // ── Upgrade flow: already logged-in user becomes agent ───────
  // When role=user clicks "Post Property" → /register?intent=agent
  // middleware allows this. We detect active session and skip signup,
  // instead calling the upgrade API route directly.
  async function handleUpgradeToAgent() {
    if (!intent || intent !== "agent") return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/upgrade-to-agent", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ agent_type: agentType }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to upgrade account. Please try again.");
      setLoading(false);
      return;
    }

    // Redirect to correct onboarding step
    const nextStep = (data.onboarding_step ?? 0) + 1;
    router.push(nextStep > 3 ? "/agent/dashboard" : `/onboarding/step-${nextStep}`);
  }

  // Check on mount if user is already logged in + intent=agent
  // If so, show upgrade UI instead of full signup form
  const supabaseCheck = createClient();
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (intentParam === "agent") {
      supabaseCheck.auth.getUser().then(({ data: { user } }) => {
        if (user) setIsUpgrading(true);
      });
    }
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!intent)              { setError("Please select what you'd like to do."); return; }
    if (!name.trim())         { setError("Please enter your name."); return; }
    if (!email.trim())        { setError("Please enter your email."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");

    const role = intent === "agent" ? "agent" : "user";

    const { data, error: err } = await supabase.auth.signUp({
      email:    email.trim().toLowerCase(),
      password,
      options: {
        // BUG FIX 2: We use OTP email verification, not magic link.
        // emailRedirectTo is NOT set — we handle verification ourselves.
        data: {
          full_name:  name.trim(),
          phone:      phone.trim() || null,
          role,
          agent_type: intent === "agent" ? agentType : null,
        },
      },
    });

    if (err) {
      setError(
        err.message.includes("already registered")
          ? "An account with this email already exists. Log in instead."
          : err.message
      );
      setLoading(false);
      return;
    }

    // BUG FIX 2: Store pending session info for OTP page.
    // We store intent + destination so /verify-otp knows where to send them.
    sessionStorage.setItem("signup_email",   email.trim().toLowerCase());
    sessionStorage.setItem("signup_intent",  intent);
    sessionStorage.setItem("signup_redirect", intent === "agent" ? "/onboarding/step-1" : redirectTo);
    sessionStorage.setItem("signup_name",    name.trim());
    sessionStorage.setItem("signup_agent_type", intent === "agent" ? agentType : "");

    // Go to OTP verification page
    router.push("/verify-otp");
  }

  async function handleGoogle() {
    if (!intent) { setError("Please select what you'd like to do first."); return; }
    setLoading(true);
    const role = intent === "agent" ? "agent" : "user";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
          intent === "agent" ? "/onboarding/step-1" : redirectTo
        )}&role=${role}`,
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-10"
      style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-10 lg:min-h-screen lg:items-center">

        {/* ── Left: Form ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-center py-10 lg:py-20 lg:pr-10 order-2 lg:order-1"
        >
          <Link href="/" className="flex items-baseline mb-8 w-fit">
            <span className="text-2xl font-bold text-[#1B4FD8]">Sasta</span>
            <span className="text-2xl font-bold text-[#2EAE88]">ghar</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {isUpgrading ? "Become an Agent" : "Create your account"}
          </h1>
          <p className="text-gray-500 text-sm mb-7">
            {isUpgrading ? (
              "You're already logged in. Upgrade your account to start listing properties."
            ) : (
              <>Already have an account?{" "}
              <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                className="text-[#1B4FD8] font-semibold hover:underline underline-offset-4">
                Log in
              </Link></>
            )}
          </p>

          {/* ── Upgrade flow for already-logged-in users ──── */}
          {isUpgrading && (
            <div className="mb-6 p-5 bg-[#EEF2FF] border border-[#1B4FD8]/20 rounded-2xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#1B4FD8] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#1B4FD8] font-bold text-sm mb-0.5">Upgrade to Agent Account</p>
                  <p className="text-gray-600 text-xs leading-relaxed">Post listings, receive leads and manage your properties — all from one dashboard.</p>
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-widest">I am a…</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {([
                  { value: "individual_agent",  label: "Agent" },
                  { value: "builder_developer", label: "Builder" },
                  { value: "individual_owner",  label: "Owner" },
                ] as const).map(opt => (
                  <button key={opt.value} type="button" onClick={() => setAgentType(opt.value)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                      agentType === opt.value ? "border-[#1B4FD8] bg-white text-[#1B4FD8]" : "border-transparent bg-white/60 text-gray-600"
                    }`}>{opt.label}</button>
                ))}
              </div>
              <motion.button
                type="button"
                onClick={handleUpgradeToAgent}
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#1B4FD8] hover:bg-[#1640b8] disabled:opacity-70 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Upgrading…</>
                ) : "Upgrade & Start Listing →"}
              </motion.button>
              {error && <p className="text-sm text-red-500 mt-3 text-center">{error}</p>}
            </div>
          )}

          {/* Only show full signup form if NOT upgrading */}
          {!isUpgrading && (<>

          {/* Intent selector */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <IntentCard
              title="Find a Property"
              description="Browse, save and contact agents."
              selected={intent === "buyer"}
              onClick={() => setIntent("buyer")}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
                </svg>
              }
            />
            <IntentCard
              title="List / Sell Property"
              description="Post listings, get leads and grow."
              selected={intent === "agent"}
              onClick={() => setIntent("agent")}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              }
            />
          </div>

          {/* Agent type */}
          <AnimatePresence>
            {intent === "agent" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
                className="overflow-hidden mb-4"
              >
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">I am a…</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: "individual_agent",  label: "Agent / Broker"    },
                    { value: "builder_developer", label: "Builder"           },
                    { value: "individual_owner",  label: "Property Owner"    },
                  ] as const).map(opt => (
                    <button key={opt.value} type="button" onClick={() => setAgentType(opt.value)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                        agentType === opt.value ? "border-[#1B4FD8] bg-[#EEF2FF] text-[#1B4FD8]" : "border-gray-200 text-gray-600"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSignup} className="space-y-4">
            <Field label="Full Name"      value={name}     onChange={setName}     placeholder="Priya Mehta"         disabled={loading} />
            <Field label="Email Address"  type="email" value={email} onChange={setEmail} placeholder="you@email.com" disabled={loading} />
            <AnimatePresence>
              {intent === "agent" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <Field label="Phone Number" type="tel" value={phone} onChange={setPhone} placeholder="+91 98765 43210" disabled={loading} />
                </motion.div>
              )}
            </AnimatePresence>
            <Field label="Password" value={password} onChange={setPassword} placeholder="At least 8 characters" disabled={loading} showToggle onToggle={() => setShowPw(p => !p)} show={showPw} />

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
              className="w-full bg-[#2EAE88] hover:bg-[#28996f] disabled:opacity-70 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>Creating account…</>
              ) : "Create Account & Verify Email"}
            </motion.button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">Or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button type="button" onClick={handleGoogle} disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm py-3.5 rounded-xl transition-colors disabled:opacity-60">
              <GoogleIcon /> Sign up with Google
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-[#1B4FD8] hover:underline underline-offset-4">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-[#1B4FD8] hover:underline underline-offset-4">Privacy Policy</Link>
          </p>
          </>)}
        </motion.div>

        {/* ── Right: Image ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block order-1 lg:order-2 h-[85vh] max-h-[800px] self-center"
        >
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
            <Image src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=85"
              alt="Find your dream property" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-3">Trusted by thousands</p>
              <div className="grid grid-cols-3 gap-3">
                {[{ value: "2M+", label: "Listings" }, { value: "50K+", label: "Agents" }, { value: "100M+", label: "Happy users" }].map(s => (
                  <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <p className="text-white font-bold text-lg">{s.value}</p>
                    <p className="text-white/65 text-[10px] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-5 left-5">
              <div className="flex items-baseline bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl">
                <span className="text-base font-bold text-[#1B4FD8]">Sasta</span>
                <span className="text-base font-bold text-[#2EAE88]">ghar</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#1B4FD8] border-t-transparent rounded-full animate-spin" /></div>}>
      <RegisterInner />
    </Suspense>
  );
}