"use client";

// components/property/PropertySpecs.tsx
// Area, configuration, bathrooms, status row — matches Image 3 design.

interface Property {
  carpet_area?:       number | null;
  builtup_area?:      number | null;
  super_builtup_area?:number | null;
  area_unit:          string;
  bedrooms?:          number | null;
  bathrooms?:         number | null;
  balconies?:         number | null;
  furnishing?:        string | null;
  possession_status:  string;
  floor_number?:      number | null;
  total_floors?:      number | null;
  property_age?:      string | null;
  facing?:            string | null;
  maintenance_charge?:number | null;
  security_deposit?:  number | null;
  available_from?:    string | null;
}

const FURNISHING_LABEL: Record<string, string> = {
  unfurnished:    "Unfurnished",
  semi_furnished: "Semi-Furnished",
  fully_furnished:"Fully Furnished",
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ready_to_move:     { label: "Ready",              color: "text-[#2EAE88]" },
  under_construction:{ label: "Under Construction", color: "text-amber-600" },
  new_launch:        { label: "New Launch",          color: "text-purple-600" },
};

function SpecItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[#2EAE88]">{icon}</span>
        <span className="font-bold text-gray-900 text-sm sm:text-base">{value}</span>
      </div>
    </div>
  );
}

export default function PropertySpecs({ property }: { property: Property }) {
  const status = STATUS_LABEL[property.possession_status] ?? { label: property.possession_status, color: "text-gray-700" };
  const area   = property.carpet_area ?? property.builtup_area ?? property.super_builtup_area;

  const specs = [
    area && {
      label: "Area",
      value: `${area.toLocaleString("en-IN")} ${property.area_unit}`,
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>,
    },
    property.bedrooms && {
      label: "Configuration",
      value: `${property.bedrooms} BHK`,
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" /></svg>,
    },
    property.bathrooms && {
      label: "Bathrooms",
      value: `${property.bathrooms} Baths`,
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" /></svg>,
    },
    {
      label: "Status",
      value: status.label,
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    property.furnishing && {
      label: "Furnishing",
      value: FURNISHING_LABEL[property.furnishing] ?? property.furnishing,
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0012 6.75z" /></svg>,
    },
    property.floor_number != null && property.total_floors && {
      label: "Floor",
      value: `${property.floor_number} of ${property.total_floors}`,
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
    },
  ].filter(Boolean) as { label: string; value: string; icon: React.ReactNode }[];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x-0 sm:divide-x divide-gray-100">
        {specs.map((s, i) => (
          <SpecItem key={i} label={s.label} value={s.value} icon={s.icon} />
        ))}
      </div>

      {/* Extra financial details for rentals */}
      {(property.security_deposit || property.maintenance_charge || property.available_from) && (
        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          {property.security_deposit && (
            <div>
              <span className="text-gray-400 text-xs font-medium">Security Deposit</span>
              <p className="font-semibold text-gray-800 mt-0.5">
                ₹{(property.security_deposit / 100000).toFixed(1)}L
              </p>
            </div>
          )}
          {property.maintenance_charge && (
            <div>
              <span className="text-gray-400 text-xs font-medium">Maintenance</span>
              <p className="font-semibold text-gray-800 mt-0.5">
                ₹{property.maintenance_charge.toLocaleString("en-IN")}/mo
              </p>
            </div>
          )}
          {property.available_from && (
            <div>
              <span className="text-gray-400 text-xs font-medium">Available From</span>
              <p className="font-semibold text-gray-800 mt-0.5">
                {new Date(property.available_from).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}