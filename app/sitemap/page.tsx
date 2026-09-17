// app/sitemap/page.tsx
// A human-readable sitemap (site directory), not the XML sitemap.xml —
// this is the page a visitor or search engine can browse for a full list
// of site sections. Grouped by category to stay scannable even with a
// large blog tag list.

import Link from "next/link";
import PageHero from "@/components/shared/PageHero";

interface SitemapLink {
  label: string;
  href: string;
}

interface SitemapSection {
  title: string;
  links: SitemapLink[];
}

const SITEMAP_SECTIONS: SitemapSection[] = [
  {
    title: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "FAQs & Guides", href: "/faqs" },
    ],
  },
  {
    title: "Properties",
    links: [
      { label: "All Listings", href: "/search" },
      { label: "Buy", href: "/search?category=buy" },
      { label: "Rent", href: "/search?category=rent" },
      { label: "Commercial", href: "/search?category=commercial" },
      { label: "Plots & Land", href: "/search?category=plot_land" },
      { label: "Featured Properties", href: "/search?featured=true" },
    ],
  },
  {
    title: "Blog",
    links: [
      { label: "Blog Home", href: "/blog" },
      { label: "Buying Guide", href: "/blog?category=buying_guide" },
      { label: "Renting Guide", href: "/blog?category=renting_guide" },
      { label: "Loan Guide", href: "/blog?category=loan_guide" },
      { label: "Market Report", href: "/blog?category=market_report" },
      { label: "Locality Spotlight", href: "/blog?category=locality_spotlight" },
      { label: "Legal Tips", href: "/blog?category=legal_tips" },
      { label: "Investment Tips", href: "/blog?category=investment_tips" },
      { label: "Property News", href: "/blog?category=property_news" },
    ],
  },
  {
    title: "Popular Blog Tags",
    links: [
      { label: "Home Loan", href: "/blog?tag=home%20loan" },
      { label: "Interest Rates", href: "/blog?tag=interest%20rates" },
      { label: "HDFC", href: "/blog?tag=hdfc" },
      { label: "SBI", href: "/blog?tag=sbi" },
      { label: "RERA", href: "/blog?tag=rera" },
      { label: "Legal", href: "/blog?tag=legal" },
      { label: "Checklist", href: "/blog?tag=checklist" },
      { label: "Buying Guide", href: "/blog?tag=buying%20guide" },
      { label: "Tips", href: "/blog?tag=tips" },
      { label: "Investment", href: "/blog?tag=investment" },
      { label: "Property Prices", href: "/blog?tag=property%20prices" },
      { label: "Mumbai", href: "/blog?tag=mumbai" },
      { label: "Kandivali West", href: "/blog?tag=kandivali%20west" },
      { label: "2025", href: "/blog?tag=2025" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Agent Dashboard Login", href: "/login?redirect=%2Fagent%2Fdashboard" },
      { label: "Agent Login", href: "/login?redirect=%2Fagents" },
    ],
  },
];

export const metadata = {
  title: "Sitemap | PropertyLink",
  description: "Browse every section of PropertyLink — properties, guides, blog, and more.",
};

export default function SitemapPage() {
  return (
    <>
      <PageHero
        eyebrow="Directory"
        title="Sitemap"
        subtitle="Every section of PropertyLink, in one place."
      />

      <section
        className="w-full bg-white pb-20 sm:pb-24 px-4 sm:px-6 lg:px-8"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {SITEMAP_SECTIONS.map((section) => (
              <div
                key={section.title}
                className="bg-white rounded-2xl p-6 sm:p-7"
                style={{ boxShadow: "0 2px 16px -4px rgba(0,0,0,0.07)" }}
              >
                <h2 className="text-gray-900 text-base font-bold mb-4">
                  {section.title}
                </h2>
                <ul className="flex flex-col gap-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-500 text-sm hover:text-[#2EAE88] transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}