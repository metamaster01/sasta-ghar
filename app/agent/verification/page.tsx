// "use client";

// // app/agent/verification/page.tsx
// // Placeholder "coming soon" screen for agent verification while the
// // backend flow (agent_profiles.verification_status pipeline) is built.
// // Swap this file out for the real verification flow once it's ready —
// // nothing else links directly into its internals, so it's a safe drop-in.

// import Link from "next/link";
// import { motion } from "framer-motion";
// import { LottieAnimation } from "@/components/lottie-animation";

// export default function AgentVerificationPage() {
//   return (
//     <div
//       className="min-h-[70vh] flex items-center justify-center px-4 py-10"
//       style={{ fontFamily: "Poppins, sans-serif" }}
//     >
//       <motion.div
//         initial={{ opacity: 0, y: 16 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
//         className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 text-center"
//         style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.07)" }}
//       >
//         <div className="w-48 h-48 mx-auto mb-2">
//           <LottieAnimation path="/lottie/coming-soon.json" />
//         </div>

//         <span className="inline-block text-[10px] font-bold tracking-wide text-[#2EAE88] bg-[#2EAE88]/10 px-3 py-1 rounded-full mb-3">
//           IN PROGRESS
//         </span>

//         <h1 className="text-gray-900 text-xl font-bold mb-2">
//           Verification is coming soon
//         </h1>
//         <p className="text-gray-500 text-sm leading-relaxed mb-6">
//           We&apos;re building agent verification so you can earn a verified badge
//           and unlock full access to leads. It&apos;ll be ready shortly — we&apos;ll
//           notify you the moment it&apos;s live.
//         </p>

//         <div className="flex flex-col sm:flex-row gap-3">
//           <Link
//             href="/agent/dashboard"
//             className="flex-1 bg-[#2EAE88] hover:bg-[#259973] text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
//           >
//             Back to Dashboard
//           </Link>
//           <Link
//             href="/agent/help-center"
//             className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl transition-colors"
//           >
//             Contact Support
//           </Link>
//         </div>
//       </motion.div>
//     </div>
//   );
// }




"use client";

// app/agent/verification/page.tsx
// Verification Center — matches the design reference exactly.
// Three doc sections: Identity (Aadhaar/PAN), RERA, Office Proof (optional)
// Each section: upload drop zone, progress bar, uploaded file name shown,
//               delete button for pending/rejected docs, status badge.
// Document Repository: recent submissions table.
// Bottom: Submit for Review button (enabled when required docs uploaded).

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence }                   from "framer-motion";
import { createClient }                              from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────
type DocType = "aadhaar" | "pan" | "rera_certificate" | "office_proof";

interface AgentDoc {
  id:              string;
  doc_type:        DocType;
  file_url:        string;
  file_path:       string;
  file_name:       string;
  file_size:       number | null;
  status:          "pending" | "reviewing" | "approved" | "rejected";
  rejection_reason:string | null;
  reviewed_at:     string | null;
  created_at:      string;
}

interface UploadState {
  docType:   DocType;
  fileName:  string;
  progress:  number;        // 0-100
  status:    "uploading" | "done" | "error";
  error?:    string;
}

interface AgentVerifInfo {
  agent_profile_id: string;
  verification_status: string;
  verification_note:   string | null;
  rera_number:         string | null;
  full_name:           string;
}

// ── Constants ──────────────────────────────────────────────────
const DOC_CONFIG: Record<DocType, {
  label:       string;
  desc:        string;
  accept:      string;
  hints:       string[];
  required:    boolean;
  section:     "identity" | "rera" | "office";
}> = {
  aadhaar: {
    label:    "Aadhaar Card",
    desc:     "Upload both front and back of your Aadhaar card as a single file.",
    accept:   "image/jpeg,image/png,application/pdf",
    hints:    ["Front & back in one file", "Clear readable scan"],
    required: true,
    section:  "identity",
  },
  pan: {
    label:    "PAN Card",
    desc:     "Upload a clear photo or scan of your PAN card.",
    accept:   "image/jpeg,image/png,application/pdf",
    hints:    ["Front side only", "Name must match profile"],
    required: true,
    section:  "identity",
  },
  rera_certificate: {
    label:    "RERA Certificate",
    desc:     "Upload your RERA registration certificate PDF.",
    accept:   "image/jpeg,image/png,application/pdf",
    hints:    ["MahaRERA / state RERA", "Must match RERA number in profile"],
    required: true,
    section:  "rera",
  },
  office_proof: {
    label:    "Office Proof",
    desc:     "Electricity bill or rental agreement showing office address.",
    accept:   "image/jpeg,image/png,application/pdf",
    hints:    ["Electricity Bill", "Rental Agreement"],
    required: false,
    section:  "office",
  },
};

const STATUS_CFG = {
  pending:   { label: "Pending Review", cls: "bg-amber-100 text-amber-700",     dot: "bg-amber-500"    },
  reviewing: { label: "In Review",      cls: "bg-blue-100 text-blue-700",       dot: "bg-blue-500"     },
  approved:  { label: "Approved",       cls: "bg-[#2EAE88]/10 text-[#2EAE88]", dot: "bg-[#2EAE88]"   },
  rejected:  { label: "Rejected",       cls: "bg-red-100 text-red-600",         dot: "bg-red-500"      },
};

const VERIF_STATUS_CFG = {
  not_submitted: { label: "ACTION REQUIRED",  cls: "bg-amber-100 text-amber-700",     icon: "⚠️" },
  pending:       { label: "UNDER REVIEW",      cls: "bg-blue-100 text-blue-700",       icon: "🔍" },
  verified:      { label: "VERIFIED",          cls: "bg-[#2EAE88]/10 text-[#2EAE88]", icon: "✓"  },
  rejected:      { label: "ACTION REQUIRED",   cls: "bg-red-100 text-red-600",         icon: "✗"  },
};

function fmtSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1048576)    return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1048576).toFixed(1)} MB`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Upload Drop Zone ───────────────────────────────────────────
function UploadZone({
  docType, doc, uploading, onUpload, onDelete,
}: {
  docType:    DocType;
  doc:        AgentDoc | null;
  uploading:  UploadState | null;
  onUpload:   (docType: DocType, file: File) => void;
  onDelete:   (doc: AgentDoc) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cfg = DOC_CONFIG[docType];

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onUpload(docType, file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onUpload(docType, file);
    e.target.value = "";
  }

  const isUploading  = uploading?.status === "uploading";
  const hasDoc       = !!doc;
  const canDelete    = doc && (doc.status === "pending" || doc.status === "rejected");
  const isApproved   = doc?.status === "approved";

  return (
    <div className="space-y-3">
      {/* Uploaded file row — shown when doc exists */}
      {hasDoc && (
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${
          isApproved
            ? "bg-[#F0FDF9] border-[#2EAE88]/30"
            : doc!.status === "rejected"
            ? "bg-red-50 border-red-200"
            : "bg-gray-50 border-gray-200"
        }`}>
          {/* File icon */}
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isApproved ? "bg-[#2EAE88]/10" : "bg-gray-100"
          }`}>
            {doc!.file_name.match(/\.pdf$/i) ? (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            )}
          </div>

          {/* File details */}
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 text-xs font-semibold truncate">{doc!.file_name}</p>
            <p className="text-gray-400 text-[10px] mt-0.5">
              {fmtSize(doc!.file_size)} · Uploaded {fmtDate(doc!.created_at)}
            </p>
            {doc!.rejection_reason && (
              <p className="text-red-500 text-[10px] mt-1 leading-relaxed">
                ✗ {doc!.rejection_reason}
              </p>
            )}
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_CFG[doc!.status].cls}`}>
              {STATUS_CFG[doc!.status].label}
            </span>
            {/* View */}
            <a href={doc!.file_url} target="_blank" rel="noopener noreferrer"
              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#EEF2FF] hover:text-[#1B4FD8] text-gray-500 flex items-center justify-center transition-colors"
              title="View document">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </a>
            {/* Delete — only for pending/rejected */}
            {canDelete && (
              <button onClick={() => onDelete(doc!)}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 flex items-center justify-center transition-colors"
                title="Delete and re-upload">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-700 text-xs font-semibold truncate pr-2">{uploading!.fileName}</p>
            <p className="text-blue-500 text-xs font-bold flex-shrink-0">{uploading!.progress}%</p>
          </div>
          <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${uploading!.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Upload error */}
      {uploading?.status === "error" && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          ✗ {uploading.error}
        </p>
      )}

      {/* Drop zone — shown when no doc uploaded yet */}
      {!hasDoc && !isUploading && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 hover:border-[#2EAE88] rounded-xl p-5 text-center cursor-pointer transition-colors group"
        >
          <div className="w-10 h-10 bg-gray-100 group-hover:bg-[#2EAE88]/10 rounded-xl flex items-center justify-center mx-auto mb-2 transition-colors">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-[#2EAE88] transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-gray-600 text-xs font-semibold mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-gray-400 text-[10px]">
            PDF, JPG or PNG (max. 10MB)
          </p>
          {cfg.hints.length > 0 && (
            <div className="flex justify-center gap-3 mt-2 flex-wrap">
              {cfg.hints.map(h => (
                <span key={h} className="text-[9px] text-gray-400 flex items-center gap-1">
                  <svg className="w-2.5 h-2.5 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {h}
                </span>
              ))}
            </div>
          )}
          <input ref={inputRef} type="file" accept={cfg.accept} className="hidden" onChange={handleChange} />
        </div>
      )}

      {/* Replace button — shown when doc approved (can't delete approved, but can upload new version) */}
      {isApproved && (
        <p className="text-[10px] text-[#2EAE88] text-center font-medium">
          ✓ Document approved — no action needed
        </p>
      )}
    </div>
  );
}

// ── Section card ───────────────────────────────────────────────
function SectionCard({
  title, desc, status, icon, children,
}: {
  title:    string;
  desc:     string;
  status:   "not_uploaded" | "pending" | "reviewing" | "approved" | "rejected";
  icon:     React.ReactNode;
  children: React.ReactNode;
}) {
  const statusMap = {
    not_uploaded: { label: "ACTION REQUIRED", cls: "bg-amber-100 text-amber-700"     },
    pending:      { label: "IN PROGRESS",      cls: "bg-blue-100 text-blue-700"       },
    reviewing:    { label: "IN REVIEW",         cls: "bg-indigo-100 text-indigo-700"  },
    approved:     { label: "VERIFIED",          cls: "bg-[#2EAE88]/10 text-[#2EAE88]"},
    rejected:     { label: "ACTION REQUIRED",   cls: "bg-red-100 text-red-600"        },
  };
  const s = statusMap[status];

  return (
    <div className={`bg-white rounded-2xl border-2 p-5 flex flex-col gap-4 ${
      status === "approved" ? "border-[#2EAE88]/30" :
      status === "rejected" ? "border-red-200" :
      status === "pending" || status === "reviewing" ? "border-blue-200" :
      "border-gray-200"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            status === "approved" ? "bg-[#2EAE88]/10" :
            status === "rejected" ? "bg-red-50" :
            "bg-gray-100"
          }`}>
            {status === "approved" ? (
              <svg className="w-5 h-5 text-[#2EAE88]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : icon}
          </div>
          <div>
            <p className="text-gray-900 font-bold text-sm">{title}</p>
            <p className="text-gray-400 text-[11px] mt-0.5 leading-relaxed">{desc}</p>
          </div>
        </div>
        <span className={`text-[9px] font-black px-2 py-1 rounded-full flex-shrink-0 ${s.cls}`}>
          {s.label}
        </span>
      </div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function AgentVerificationPage() {
  const supabase = createClient();

  const [agentInfo,    setAgentInfo]    = useState<AgentVerifInfo | null>(null);
  const [docs,         setDocs]         = useState<Record<DocType, AgentDoc | null>>({
    aadhaar: null, pan: null, rera_certificate: null, office_proof: null,
  });
  const [uploads,      setUploads]      = useState<Record<DocType, UploadState | null>>({
    aadhaar: null, pan: null, rera_certificate: null, office_proof: null,
  });
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitMsg,    setSubmitMsg]    = useState("");
  const [deleting,     setDeleting]     = useState<DocType | null>(null);

  // ── Load agent info + existing docs ──────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { data: ap }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).single(),
        supabase.from("agent_profiles")
          .select("id, verification_status, verification_note, rera_number")
          .eq("profile_id", user.id)
          .single(),
      ]);

      if (!ap) { setLoading(false); return; }

      setAgentInfo({
        agent_profile_id:    ap.id,
        verification_status: ap.verification_status,
        verification_note:   ap.verification_note,
        rera_number:         ap.rera_number,
        full_name:           profile?.full_name ?? "",
      });

      // Load existing documents
      const { data: existingDocs } = await supabase
        .from("agent_documents")
        .select("*")
        .eq("agent_profile_id", ap.id);

      if (existingDocs) {
        const docMap: Record<DocType, AgentDoc | null> = {
          aadhaar: null, pan: null, rera_certificate: null, office_proof: null,
        };
        existingDocs.forEach((d) => {
          const docType = d.doc_type as DocType;
          if (docType in docMap) {
            docMap[docType] = d as unknown as AgentDoc;
          }
        });
        setDocs(docMap);
      }

      setLoading(false);
    }
    load();
  }, []);

  // ── Upload a document ─────────────────────────────────────────
  async function handleUpload(docType: DocType, file: File) {
    if (!agentInfo) return;
    if (file.size > 10 * 1024 * 1024) {
      setUploads(u => ({ ...u, [docType]: { docType, fileName: file.name, progress: 0, status: "error", error: "File too large. Max 10MB." } }));
      return;
    }

    setUploads(u => ({ ...u, [docType]: { docType, fileName: file.name, progress: 0, status: "uploading" } }));

    const ext      = file.name.split(".").pop() ?? "pdf";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path     = `verifications/${agentInfo.agent_profile_id}/${docType}/${Date.now()}_${safeName}`;

    // XHR upload with progress
    const { data: signedData, error: signErr } = await supabase.storage
      .from("media")
      .createSignedUploadUrl(path);

    if (signErr || !signedData) {
      setUploads(u => ({ ...u, [docType]: { docType, fileName: file.name, progress: 0, status: "error", error: "Failed to get upload URL." } }));
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploads(u => ({ ...u, [docType]: { docType, fileName: file.name, progress: pct, status: "uploading" } }));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed: ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.open("PUT", signedData.signedUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.send(file);
    }).catch(err => {
      setUploads(u => ({ ...u, [docType]: { docType, fileName: file.name, progress: 0, status: "error", error: err.message } }));
      return;
    });

    // Get public URL
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    // Save metadata to agent_documents
    const { data: docRow, error: dbErr } = await supabase
      .from("agent_documents")
      .upsert({
        agent_profile_id: agentInfo.agent_profile_id,
        doc_type:         docType,
        file_url:         publicUrl,
        file_path:        path,
        file_name:        file.name,
        file_size:        file.size,
        file_type:        file.type,
        status:           "pending",
        rejection_reason: null,
      }, { onConflict: "agent_profile_id,doc_type" })
      .select()
      .single();

    if (dbErr) {
      setUploads(u => ({ ...u, [docType]: { docType, fileName: file.name, progress: 0, status: "error", error: "Saved to storage but failed to record metadata." } }));
      return;
    }

    setDocs(d => ({ ...d, [docType]: docRow as AgentDoc }));
    setUploads(u => ({ ...u, [docType]: { docType, fileName: file.name, progress: 100, status: "done" } }));

    // Clear done state after 2s
    setTimeout(() => {
      setUploads(u => ({ ...u, [docType]: null }));
    }, 2000);
  }

  // ── Delete a document ─────────────────────────────────────────
  async function handleDelete(doc: AgentDoc) {
    if (!confirm(`Delete "${doc.file_name}"? You can upload a new document after.`)) return;
    setDeleting(doc.doc_type);

    // Delete from storage
    await supabase.storage.from("media").remove([doc.file_path]);

    // Delete from DB
    await supabase.from("agent_documents").delete().eq("id", doc.id);

    setDocs(d => ({ ...d, [doc.doc_type]: null }));
    setDeleting(null);
  }

  // ── Submit for review ─────────────────────────────────────────
  async function handleSubmit() {
    if (!agentInfo) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("agent_profiles")
      .update({ verification_status: "pending" })
      .eq("id", agentInfo.agent_profile_id);

    setSubmitting(false);
    if (error) { setSubmitMsg("Failed to submit. Please try again."); return; }
    setAgentInfo(a => a ? { ...a, verification_status: "pending" } : a);
    setSubmitMsg("Submitted for review! We'll notify you within 2–3 business days.");
  }

  // ── Derived state ─────────────────────────────────────────────
  function docStatus(dt: DocType): "not_uploaded"|"pending"|"reviewing"|"approved"|"rejected" {
    const d = docs[dt];
    if (!d) return "not_uploaded";
    return d.status as any;
  }

  // Identity section: approved if either aadhaar or pan approved, pending if any pending
  function identityStatus(): "not_uploaded"|"pending"|"reviewing"|"approved"|"rejected" {
    if (docs.aadhaar?.status === "approved" || docs.pan?.status === "approved") return "approved";
    if (docs.aadhaar?.status === "reviewing" || docs.pan?.status === "reviewing") return "reviewing";
    if (docs.aadhaar || docs.pan) return "pending";
    return "not_uploaded";
  }

  const canSubmit = (docs.rera_certificate && docs.rera_certificate.status !== "rejected") &&
    (docs.aadhaar || docs.pan) &&
    agentInfo?.verification_status === "not_submitted";

  const allSubmissions = Object.values(docs).filter(Boolean) as AgentDoc[];
  const verifCfg = VERIF_STATUS_CFG[agentInfo?.verification_status as keyof typeof VERIF_STATUS_CFG] ?? VERIF_STATUS_CFG.not_submitted;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-[#2EAE88] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!agentInfo) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
        <p className="text-amber-800 font-semibold">Agent profile not found.</p>
        <p className="text-amber-600 text-sm mt-1">Please complete onboarding first.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Poppins, sans-serif" }}>

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-gray-500 text-sm mt-1">
            Complete these steps to become a Sastaghar Verified Partner and unlock premium benefits.
          </p>
        </div>
        <span className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border ${verifCfg.cls}`}>
          {verifCfg.icon} STATUS: {verifCfg.label}
        </span>
      </div>

      {/* Rejection note */}
      {agentInfo.verification_status === "rejected" && agentInfo.verification_note && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700 font-semibold text-sm">Verification Rejected</p>
          <p className="text-red-600 text-xs mt-1 leading-relaxed">{agentInfo.verification_note}</p>
          <p className="text-red-500 text-xs mt-2">Please re-upload the flagged documents and submit again.</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left: Document upload sections ──────────────────── */}
        <div className="xl:col-span-2 space-y-5">

          {/* 1. Identity Verification */}
          <SectionCard
            title="Identity Verification"
            desc="Upload Aadhaar card (front & back) and/or PAN card."
            status={identityStatus()}
            icon={<svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
          >
            {/* Aadhaar */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                Aadhaar Card
                {docs.aadhaar?.status === "approved" && (
                  <svg className="w-3.5 h-3.5 text-[#2EAE88]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" />
                  </svg>
                )}
              </p>
              <UploadZone
                docType="aadhaar"
                doc={docs.aadhaar}
                uploading={uploads.aadhaar}
                onUpload={handleUpload}
                onDelete={handleDelete}
              />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                PAN Card
                {docs.pan?.status === "approved" && (
                  <svg className="w-3.5 h-3.5 text-[#2EAE88]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" />
                  </svg>
                )}
              </p>
              <UploadZone
                docType="pan"
                doc={docs.pan}
                uploading={uploads.pan}
                onUpload={handleUpload}
                onDelete={handleDelete}
              />
            </div>
          </SectionCard>

          {/* 2. RERA Registration */}
          <SectionCard
            title="RERA Registration"
            desc="Upload your RERA registration certificate. Must match the RERA number in your profile."
            status={docStatus("rera_certificate")}
            icon={<svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
          >
            {agentInfo.rera_number && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <span className="text-gray-400 text-[10px] font-semibold">RERA No.</span>
                <span className="text-gray-700 text-xs font-bold">{agentInfo.rera_number}</span>
              </div>
            )}
            <UploadZone
              docType="rera_certificate"
              doc={docs.rera_certificate}
              uploading={uploads.rera_certificate}
              onUpload={handleUpload}
              onDelete={handleDelete}
            />
          </SectionCard>

          {/* 3. Office Address (Optional) */}
          <SectionCard
            title="Office Address Verification"
            desc="Proof of physical office presence. Upload Electricity Bill or Rental Agreement."
            status={docStatus("office_proof")}
            icon={<svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m2.25-18h13.5m-13.5 0V3a.75.75 0 01.75-.75h12a.75.75 0 01.75.75v18" /></svg>}
          >
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Optional</span>
              <span className="text-[10px] text-gray-400">Adds extra trust to your profile</span>
            </div>
            <UploadZone
              docType="office_proof"
              doc={docs.office_proof}
              uploading={uploads.office_proof}
              onUpload={handleUpload}
              onDelete={handleDelete}
            />
          </SectionCard>
        </div>

        {/* ── Right sidebar ───────────────────────────────────── */}
        <div className="space-y-5">

          {/* Why get verified */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5"
            style={{ boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>
            <h3 className="text-[#2EAE88] font-bold text-base mb-4">Why get Verified?</h3>
            {[
              { icon: "📈", title: "2.5x Higher Visibility",     desc: "Verified listings rank higher in search results and discovery pages." },
              { icon: "🏅", title: "Trust Badge",                desc: "A blue tick badge next to your profile increases lead quality by 60%." },
              { icon: "📊", title: "Premium Dashboards",         desc: "Access advanced market analytics and competitor pricing data." },
            ].map(b => (
              <div key={b.title} className="flex items-start gap-3 mb-4 last:mb-0">
                <div className="w-8 h-8 bg-[#2EAE88]/10 rounded-xl flex items-center justify-center flex-shrink-0 text-base">
                  {b.icon}
                </div>
                <div>
                  <p className="text-gray-800 font-semibold text-xs">{b.title}</p>
                  <p className="text-gray-400 text-[10px] mt-0.5 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Document Repository */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{ boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-gray-900 font-bold text-sm">Document Repository</h3>
              <div className="flex gap-1">
                {[docs.aadhaar, docs.pan, docs.rera_certificate, docs.office_proof].map((d, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${d?.status === "approved" ? "bg-[#2EAE88]" : d ? "bg-amber-400" : "bg-gray-200"}`} />
                ))}
              </div>
            </div>

            {allSubmissions.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-gray-400 text-sm">No documents uploaded yet.</p>
                <p className="text-gray-300 text-xs mt-1">Upload your first document to get started.</p>
              </div>
            ) : (
              <>
                {/* Table header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-5 py-2 bg-gray-50/50 border-b border-gray-100">
                  {["Document Type","Date","Status","Action"].map(h => (
                    <p key={h} className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{h}</p>
                  ))}
                </div>

                {/* Rows */}
                {allSubmissions.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(doc => (
                  <div key={doc.id}
                    className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-center px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    {/* Doc type + filename */}
                    <div className="min-w-0">
                      <p className="text-gray-700 text-xs font-semibold truncate">
                        {DOC_CONFIG[doc.doc_type].label}
                      </p>
                      <p className="text-gray-400 text-[10px] truncate" title={doc.file_name}>
                        {doc.file_name}
                      </p>
                    </div>
                    {/* Date */}
                    <p className="text-gray-400 text-[10px]">{fmtDate(doc.created_at)}</p>
                    {/* Status */}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_CFG[doc.status].cls}`}>
                      {STATUS_CFG[doc.status].label}
                    </span>
                    {/* Action */}
                    <div className="flex items-center gap-1">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                        className="text-[9px] font-bold text-[#1B4FD8] hover:underline underline-offset-2">
                        View
                      </a>
                      {(doc.status === "pending" || doc.status === "rejected") && (
                        <button
                          onClick={() => handleDelete(doc)}
                          disabled={deleting === doc.doc_type}
                          className="text-[9px] font-bold text-red-400 hover:text-red-600 disabled:opacity-50 ml-1">
                          {deleting === doc.doc_type ? "…" : "Del"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom action bar ─────────────────────────────────── */}
      <div className="mt-6 flex items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 px-6 py-4 flex-wrap"
        style={{ boxShadow: "0 2px 10px -4px rgba(0,0,0,0.07)" }}>

        <div>
          {submitMsg ? (
            <p className={`text-sm font-semibold ${submitMsg.includes("Failed") ? "text-red-500" : "text-[#2EAE88]"}`}>
              {submitMsg}
            </p>
          ) : (
            <p className="text-gray-500 text-sm">
              {canSubmit
                ? "All required documents uploaded. Ready to submit for review."
                : agentInfo.verification_status === "pending"
                ? "Your application is under review. We'll notify you within 2–3 business days."
                : agentInfo.verification_status === "verified"
                ? "🏅 You are a Sastaghar Verified Agent!"
                : "Upload RERA certificate + at least one identity document to proceed."
              }
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl transition-all ${
              canSubmit
                ? "bg-[#2EAE88] hover:bg-[#28996f] text-white shadow-sm"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}>
            {submitting ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Submitting…</>
            ) : agentInfo.verification_status === "verified" ? "✓ Verified" :
               agentInfo.verification_status === "pending"   ? "Under Review" :
               "Submit for Review"}
          </button>
        </div>
      </div>
    </div>
  );
}