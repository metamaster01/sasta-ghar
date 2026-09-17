// components/shared/LegalLayout.tsx
// Shared structure for long-form legal pages: a sticky table-of-contents
// nav (horizontal chip scroller on mobile, vertical list on desktop) next
// to the actual sections. No client-side state needed — plain anchor
// links — so this stays a server component.

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function LegalLayout({
  lastUpdated,
  sections,
}: {
  lastUpdated: string;
  sections: Section[];
}) {
  return (
    <section
      className="w-full bg-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-14">
        {/* Table of contents */}
        <nav className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3 hidden lg:block">
            On this page
          </p>
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 lg:shrink text-sm text-gray-500 hover:text-[#2EAE88] px-3 py-1.5 rounded-full border border-gray-200 lg:border-0 lg:rounded-md lg:px-2 whitespace-nowrap lg:whitespace-normal transition-colors duration-200"
              >
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div>
          <p className="text-gray-400 text-xs font-medium mb-8">
            Last updated: {lastUpdated}
          </p>
          <div className="flex flex-col gap-10 sm:gap-12">
            {sections.map((s) => (
              <div key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-gray-900 text-xl sm:text-2xl font-bold mb-3">
                  {s.title}
                </h2>
                <div className="text-gray-600 text-sm sm:text-[0.95rem] leading-relaxed space-y-3">
                  {s.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}