"use client";

// components/property/PropertyAgentCard.tsx
// Agent card — right sidebar. Matches Image 3 design:
// Avatar, name, badge, rating, contact/schedule/whatsapp/callback buttons.

import Image from "next/image";
import Link  from "next/link";

interface AgentProfile {
  company_name?:       string | null;
  agent_type?:         string | null;
  bio?:                string | null;
  rating_avg?:         number | null;
  rating_count?:       number | null;
  years_of_experience?:number | null;
  verification_status?:string | null;
  office_address?:     string | null;
  specializations?:    string[] | null;
}

interface Agent {
  id:          string;
  full_name:   string | null;
  avatar_url:  string | null;
  phone?:      string | null;
  email?:      string | null;
}

function getInitials(name: string | null) {
  if (!name) return "SG";
  return name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join("");
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: full  }).map((_, i) => <Star key={`f${i}`} type="full"  />)}
        {half &&                                        <Star type="half"  />}
        {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} type="empty" />)}
      </div>
      <span className="text-gray-700 font-bold text-xs">{rating.toFixed(1)}</span>
      <span className="text-gray-400 text-xs">({count} reviews)</span>
    </div>
  );
}

function Star({ type }: { type: "full" | "half" | "empty" }) {
  if (type === "full")  return <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
  if (type === "half")  return <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
  return <svg className="w-3.5 h-3.5 text-gray-300" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
}

const AGENT_TYPE_LABEL: Record<string, string> = {
  individual_agent:  "Agent",
  builder_developer: "Builder & Developer",
  individual_owner:  "Property Owner",
  agency:            "Agency",
};

export default function PropertyAgentCard({
  agent,
  agentProfile,
}: {
  agent:        Agent;
  agentProfile: AgentProfile | null;
}) {
  const name       = agent.full_name ?? "Property Owner";
  const phone      = agent.phone;
  const typeLabel  = AGENT_TYPE_LABEL[agentProfile?.agent_type ?? ""] ?? "Agent";
  const isVerified = agentProfile?.verification_status === "verified";
  const rating     = agentProfile?.rating_avg;
  const ratingCnt  = agentProfile?.rating_count ?? 0;
  const experience = agentProfile?.years_of_experience;
  const company    = agentProfile?.company_name;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{
        boxShadow: "0 2px 16px -4px rgba(0,0,0,0.08)",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-[#1B4FD8] flex items-center justify-center overflow-hidden">
              {agent.avatar_url ? (
                <Image
                  src={agent.avatar_url}
                  alt={name}
                  width={56}
                  height={56}
                  className="object-cover w-14 h-14"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {getInitials(name)}
                </span>
              )}
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#2EAE88] rounded-full border-2 border-white" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-bold text-gray-900 text-sm leading-tight truncate">
                {name}
              </p>
              {isVerified && (
                <svg className="w-4 h-4 text-[#2EAE88] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-0.5">
              {company ? company : typeLabel}
              {experience ? ` · ${experience} yrs exp.` : ""}
            </p>
            {rating && rating > 0 && ratingCnt > 0 && (
              <div className="mt-1">
                <StarRating rating={rating} count={ratingCnt} />
              </div>
            )}
          </div>
        </div>

        {/* Protection badge */}
        {isVerified && (
          <div className="flex items-start gap-2 bg-[#F0FDF9] border border-[#2EAE88]/20 rounded-xl p-3 mb-1">
            <svg className="w-4 h-4 text-[#2EAE88] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <div>
              <p className="text-[#2EAE88] font-semibold text-xs">Sastaghar Verified</p>
              <p className="text-gray-500 text-[10px] leading-relaxed mt-0.5">
                This agent is verified with a RERA certificate and ID proof.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-5 space-y-2.5">
        {/* Contact Agent (primary) */}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-2 w-full bg-[#2EAE88] hover:bg-[#28996f] text-white font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            Contact Agent
          </a>
        )}

        {/* Secondary row */}
        <div className="grid grid-cols-2 gap-2">
          {/* WhatsApp */}
          {phone && (
            <a
              href={`https://wa.me/${phone.replace(/\D/g, "")}?text=Hi, I'm interested in this property on Sastaghar.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 hover:border-[#25D366] hover:text-[#25D366] font-medium text-xs py-2.5 rounded-xl transition-colors"
            >
              {/* WhatsApp icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.1.547 4.073 1.497 5.786L0 24l6.327-1.657A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.663-.5-5.191-1.378L2.5 21.5l.914-3.985A9.97 9.97 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" fillRule="evenodd" clipRule="evenodd" />
              </svg>
              WhatsApp
            </a>
          )}

          {/* Email */}
          {agent.email && (
            <a
              href={`mailto:${agent.email}?subject=Property Enquiry from Sastaghar`}
              className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 hover:border-[#1B4FD8] hover:text-[#1B4FD8] font-medium text-xs py-2.5 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Email
            </a>
          )}
        </div>

        {/* View agent profile */}
        <Link
          href={`/agent/${agent.id}`}
          className="block text-center text-xs text-gray-400 hover:text-[#1B4FD8] transition-colors mt-1"
        >
          View full profile & listings →
        </Link>
      </div>
    </div>
  );
}