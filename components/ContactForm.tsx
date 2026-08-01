"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────
type FormState = "idle" | "loading" | "success" | "error";

interface FormFields {
  name:    string;
  email:   string;
  message: string;
}

const INITIAL: FormFields = { name: "", email: "", message: "" };

// ── Input component (reusable, avoids repetition) ─────────────
function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  error,
  disabled,
  multiline = false,
  rows = 5,
}: {
  label:      string;
  type?:      string;
  value:      string;
  onChange:   (v: string) => void;
  error?:     string;
  disabled:   boolean;
  multiline?: boolean;
  rows?:      number;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;

  const sharedProps = {
    value,
    disabled,
    onFocus:  () => setFocused(true),
    onBlur:   () => setFocused(false),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    className: `
      w-full px-4 pt-6 pb-2 text-sm text-gray-800 bg-transparent
      outline-none resize-none placeholder-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
  };

  const borderColor = error
    ? "border-red-400"
    : focused
    ? "border-[#1B4FD8]"
    : "border-gray-200";

  return (
    <div className="relative">
      <div
        className={`relative bg-white border rounded-xl transition-all duration-200 ${borderColor} ${
          focused ? "shadow-sm shadow-blue-100" : ""
        }`}
      >
        {/* Floating label */}
        <label
          className={`absolute left-4 pointer-events-none transition-all duration-200 font-medium ${
            focused || hasValue
              ? "top-2 text-[10px] tracking-wide uppercase text-[#1B4FD8]"
              : multiline
              ? "top-4 text-sm text-gray-400"
              : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
          }`}
        >
          {label}
        </label>

        {multiline ? (
          <textarea rows={rows} {...sharedProps} />
        ) : (
          <input type={type} {...sharedProps} />
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 ml-1 text-xs text-red-500 flex items-center gap-1"
          >
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main ContactForm ──────────────────────────────────────────
export default function ContactForm() {
  const [fields, setFields]     = useState<FormFields>(INITIAL);
  const [errors, setErrors]     = useState<Partial<FormFields>>({});
  const [state, setState]       = useState<FormState>("idle");
  const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const set = (key: keyof FormFields) => (v: string) => {
    setFields((f) => ({ ...f, [key]: v }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  // ── Client-side validation ───────────────────────────────
  function validate(): boolean {
    const e: Partial<FormFields> = {};
    if (!fields.name.trim())    e.name    = "Your name is required.";
    if (!fields.email.trim())   e.email   = "Your email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
                                 e.email   = "Enter a valid email address.";
    if (!fields.message.trim()) e.message = "Please tell us about your needs.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setState("loading");
    setServerError("");

    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(fields),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        setState("error");
        return;
      }

      setState("success");
      setFields(INITIAL);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setState("error");
    }
  }

  const isLoading = state === "loading";

  return (
    <section
      className="w-full py-16 sm:py-20 lg:py-24 bg-white"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section title ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 sm:mb-12"
        >
          <h1 className="text-gray-900 text-3xl sm:text-4xl font-bold tracking-tight">
            Contact Us
          </h1>
          <div className="mt-2 h-1 w-12 rounded-full bg-[#1B4FD8]" />
        </motion.div>

        {/* ── Two column layout ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">

          {/* ── Left: Image ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl overflow-hidden min-h-[320px] lg:min-h-0"
          >
            <Image
              src="/contact-image.png"
              alt="Sastaghar team discussing properties"
              fill
              className="object-cover"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B4FD8]/60 via-transparent to-transparent" />

            {/* Bottom text overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <p className="text-white text-lg sm:text-xl font-bold leading-snug">
                Let's find your perfect property together.
              </p>
              <p className="text-white/75 text-sm mt-1">
                Our team responds within 24 hours.
              </p>
            </div>
          </motion.div>

          {/* ── Right: Form card ──────────────────────────── */}
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white border border-gray-100 rounded-2xl p-7 sm:p-9"
            style={{ boxShadow: "0 4px 32px -8px rgba(0,0,0,0.1)" }}
          >
            {/* ── Success state ────────────────────────────── */}
            <AnimatePresence mode="wait">
              {state === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center justify-center text-center py-10 h-full"
                >
                  {/* Animated checkmark */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
                    className="w-20 h-20 rounded-full bg-[#2EAE88]/10 flex items-center justify-center mb-6"
                  >
                    <svg
                      className="w-10 h-10 text-[#2EAE88]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                      />
                    </svg>
                  </motion.div>

                  <h3 className="text-gray-900 text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>

                  <button
                    onClick={() => setState("idle")}
                    className="mt-8 text-[#1B4FD8] text-sm font-semibold hover:underline underline-offset-4"
                  >
                    Send another message
                  </button>
                </motion.div>

              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Form header */}
                  <div className="mb-7">
                    <h2 className="text-gray-900 text-xl sm:text-2xl font-bold mb-1.5">
                      Get In Touch
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Tell us about your property needs — we'll find the right fit.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <FloatingInput
                      label="Your Name"
                      value={fields.name}
                      onChange={set("name")}
                      error={errors.name}
                      disabled={isLoading}
                    />
                    <FloatingInput
                      label="Email Address"
                      type="email"
                      value={fields.email}
                      onChange={set("email")}
                      error={errors.email}
                      disabled={isLoading}
                    />
                    <FloatingInput
                      label="Tell us about your destination dream"
                      value={fields.message}
                      onChange={set("message")}
                      error={errors.message}
                      disabled={isLoading}
                      multiline
                      rows={5}
                    />

                    {/* Server error */}
                    <AnimatePresence>
                      {state === "error" && serverError && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl"
                        >
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          {serverError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: isLoading ? 1 : 1.015 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      className="relative w-full bg-[#2EAE88] hover:bg-[#28996f] disabled:bg-[#2EAE88]/70 text-white font-semibold text-sm py-4 rounded-xl transition-colors duration-200 overflow-hidden"
                    >
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.span
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-4 h-4 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Sending…
                          </motion.span>
                        ) : (
                          <motion.span
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            Submit Now
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    {/* Legal */}
                    <p className="text-center text-xs text-gray-400 leading-relaxed">
                      By contacting us, you agree to our{" "}
                      <a href="/terms" className="text-[#1B4FD8] hover:underline underline-offset-4">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-[#1B4FD8] hover:underline underline-offset-4">
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
