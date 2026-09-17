// app/privacy-policy/page.tsx

import PageHero from "@/components/shared/PageHero";
import LegalLayout from "@/components/shared/LegalLayout";

export const metadata = {
  title: "Privacy Policy | PropertyLink",
  description: "How PropertyLink collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: "intro",
      title: "Introduction & Scope",
      content: (
        <p>
          This Privacy Policy explains how PropertyLink collects, uses, shares,
          and protects information when you use our website and services to
          browse, list, buy, sell, or rent property.
        </p>
      ),
    },
    {
      id: "collect",
      title: "Information We Collect",
      content: (
        <>
          <p>We collect information in a few ways:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-gray-800">Account information</strong> —
              name, email, phone number, and password when you register.
            </li>
            <li>
              <strong className="text-gray-800">Listing &amp; property data</strong>{" "}
              — details, photos, and documents you upload when listing a
              property.
            </li>
            <li>
              <strong className="text-gray-800">Loan enquiry details</strong> —
              information you choose to share when requesting a home loan
              quote through our partner, Vindhya Enterprises LLP.
            </li>
            <li>
              <strong className="text-gray-800">Usage data</strong> — pages
              viewed, searches performed, and general device/browser
              information, collected via cookies.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "use",
      title: "How We Use Your Information",
      content: (
        <p>
          We use your information to operate and improve the Platform, verify
          listings, connect you with agents or lenders you choose to contact,
          personalize search results, send service updates or newsletter
          emails you&apos;ve opted into, and detect fraud or abuse.
        </p>
      ),
    },
    {
      id: "sharing",
      title: "Sharing With Third Parties",
      content: (
        <>
          <p>We share data only where necessary to provide the service:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>With agents or owners, when you inquire about their listing.</li>
            <li>
              With our lending partner, Vindhya Enterprises LLP, only when you
              submit a loan enquiry.
            </li>
            <li>
              With verification and KYC vendors, to confirm listing or
              identity authenticity.
            </li>
            <li>
              With analytics and email-delivery providers who help us run the
              Platform, under confidentiality obligations.
            </li>
          </ul>
          <p>We do not sell your personal data.</p>
        </>
      ),
    },
    {
      id: "cookies",
      title: "Cookies & Tracking Technologies",
      content: (
        <p>
          We use cookies and similar technologies to keep you signed in,
          remember your preferences, and understand how the Platform is used.
          You can control cookies through your browser settings, though some
          features may not work correctly if cookies are disabled.
        </p>
      ),
    },
    {
      id: "retention",
      title: "Data Retention",
      content: (
        <p>
          We retain account and listing data for as long as your account is
          active, and for a reasonable period afterward to comply with legal
          obligations, resolve disputes, and enforce our agreements.
        </p>
      ),
    },
    {
      id: "security",
      title: "Data Security",
      content: (
        <p>
          We use industry-standard safeguards — including encryption in
          transit and access controls — to protect your data. No system is
          completely secure, so we encourage you to use a strong, unique
          password for your account.
        </p>
      ),
    },
    {
      id: "rights",
      title: "Your Rights & Choices",
      content: (
        <p>
          Depending on applicable law — including India&apos;s Digital Personal
          Data Protection Act, 2023 — you may have the right to access,
          correct, or request deletion of your personal data, and to withdraw
          consent for marketing communications at any time. You can exercise
          these rights from your account settings or by contacting us below.
        </p>
      ),
    },
    {
      id: "children",
      title: "Children's Privacy",
      content: (
        <p>
          PropertyLink is not directed at individuals under 18, and we do not
          knowingly collect personal information from minors.
        </p>
      ),
    },
    {
      id: "grievance",
      title: "Grievance Officer",
      content: (
        <p>
          In accordance with applicable Indian regulations, you may direct
          privacy concerns or complaints to our Grievance Officer at{" "}
          <a href="mailto:grievance@propertylinkreality.com" className="text-[#2EAE88] font-medium">
            enquiry@propertylinkreality.com
          </a>
          . We aim to acknowledge complaints promptly and resolve them within
          the timeframe required by law.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      content: (
        <p>
          We may update this Privacy Policy periodically. We&apos;ll post the
          revised version here with an updated date, and notify you of any
          material changes.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact Us",
      content: (
        <p>
          For any other privacy questions, reach us at{" "}
          <a href="mailto:v.miracle2008@gmail.com" className="text-[#2EAE88] font-medium">
            v.miracle2008@gmail.com
          </a>
          .
        </p>
      ),
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="What we collect, why we collect it, and how you stay in control."
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8">
        <div
          className="rounded-2xl bg-amber-50 border border-amber-100 px-5 py-4 text-amber-800 text-xs sm:text-sm"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          This page is a general starting template, not legal advice. Have a
          qualified lawyer confirm it meets the DPDP Act, 2023 and IT Rules,
          2021 requirements for your business before publishing.
        </div>
      </div>

      <LegalLayout lastUpdated="17 September 2026" sections={sections} />
    </>
  );
}