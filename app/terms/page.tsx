// app/terms/page.tsx

import PageHero from "@/components/shared/PageHero";
import LegalLayout from "@/components/shared/LegalLayout";

export const metadata = {
  title: "Terms & Conditions | PropertyLink",
  description: "Terms and conditions for using the PropertyLink real estate platform.",
};

export default function TermsPage() {
  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      content: (
        <p>
          By accessing or using PropertyLink (the &quot;Platform&quot;), you agree to be
          bound by these Terms &amp; Conditions. If you do not agree with any part of
          these terms, please do not use the Platform.
        </p>
      ),
    },
    {
      id: "service",
      title: "Description of Service",
      content: (
        <p>
          PropertyLink is an online marketplace that connects property owners,
          agents, tenants, and buyers. Users can list, search for, and inquire
          about residential and commercial properties. PropertyLink also
          facilitates introductions to third-party home loan partners, including
          Vindhya Enterprises LLP, for users seeking financing.
        </p>
      ),
    },
    {
      id: "eligibility",
      title: "Eligibility & Account Registration",
      content: (
        <>
          <p>
            You must be at least 18 years old and capable of entering into a
            legally binding agreement to use PropertyLink. You are responsible
            for maintaining the confidentiality of your account credentials and
            for all activity that occurs under your account.
          </p>
          <p>
            You agree to provide accurate, current, and complete information
            during registration and to keep it updated.
          </p>
        </>
      ),
    },
    {
      id: "listings",
      title: "User-Submitted Listings & Accuracy",
      content: (
        <>
          <p>
            Property listings are submitted by individual owners and agents.
            While PropertyLink runs listings through a verification process
            before they go live, we do not independently confirm every legal,
            structural, or ownership detail, and we cannot guarantee that a
            listing is fully accurate or up to date at all times.
          </p>
          <p>
            Buyers and tenants are encouraged to independently verify property
            documents, ownership title, and RERA registration details before
            entering into any transaction.
          </p>
        </>
      ),
    },
    {
      id: "fees",
      title: "Fees & Payments",
      content: (
        <p>
          Certain features — such as featured listings, premium agent
          subscriptions, or lead access — may involve a fee, which will be
          clearly displayed before you make a payment. All fees are quoted in
          Indian Rupees (INR) unless stated otherwise and are non-refundable
          except where required by law.
        </p>
      ),
    },
    {
      id: "prohibited",
      title: "Prohibited Uses",
      content: (
        <p>
          You agree not to post false or misleading listings, impersonate
          another person or business, scrape or resell Platform data, or use
          the Platform for any unlawful purpose. We reserve the right to
          remove content or suspend accounts that violate these terms.
        </p>
      ),
    },
    {
      id: "loan-partners",
      title: "Third-Party Services & Loan Partners",
      content: (
        <p>
          Where PropertyLink facilitates an introduction to a lending partner
          such as Vindhya Enterprises LLP, PropertyLink acts only as a
          referral point. Any loan agreement, its terms, interest rates, and
          approval decision are strictly between you and the lending partner;
          PropertyLink is not a party to that agreement and assumes no
          liability for it.
        </p>
      ),
    },
    {
      id: "ip",
      title: "Intellectual Property",
      content: (
        <p>
          All PropertyLink branding, design, and software are owned by
          PropertyLink or its licensors. You retain ownership of content you
          upload (such as listing photos), but grant PropertyLink a
          non-exclusive license to display it on the Platform for the purpose
          of operating the service.
        </p>
      ),
    },
    {
      id: "disclaimer",
      title: "Disclaimer of Warranties",
      content: (
        <p>
          The Platform is provided &quot;as is&quot; without warranties of any kind.
          PropertyLink does not warrant that listings are error-free, that the
          Platform will be uninterrupted, or that any property will be
          suitable for your purposes.
        </p>
      ),
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      content: (
        <p>
          To the maximum extent permitted by law, PropertyLink shall not be
          liable for any indirect, incidental, or consequential damages
          arising from your use of the Platform, including losses related to
          a property transaction entered into with another user or a
          third-party lender.
        </p>
      ),
    },
    {
      id: "termination",
      title: "Termination",
      content: (
        <p>
          We may suspend or terminate your access to the Platform at our
          discretion if you violate these terms. You may also close your
          account at any time from your account settings.
        </p>
      ),
    },
    {
      id: "governing-law",
      title: "Governing Law & Dispute Resolution",
      content: (
        <p>
          These terms are governed by the laws of India. Any disputes arising
          out of or in connection with these terms shall be subject to the
          exclusive jurisdiction of the courts located in [your city], India.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to These Terms",
      content: (
        <p>
          We may update these Terms &amp; Conditions from time to time. Material
          changes will be notified via the Platform or by email. Continued use
          of PropertyLink after changes take effect constitutes acceptance of
          the revised terms.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact Us",
      content: (
        <p>
          Questions about these terms can be sent to{" "}
          <a href="mailto:legal@propertylinkreality.com" className="text-[#2EAE88] font-medium">
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
        title="Terms & Conditions"
        subtitle="The rules for using PropertyLink, in plain language."
      />

      {/* Template disclaimer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8">
        <div
          className="rounded-2xl bg-amber-50 border border-amber-100 px-5 py-4 text-amber-800 text-xs sm:text-sm"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          This page is a general starting template, not legal advice. Have a
          qualified lawyer review it — especially the RERA, jurisdiction, and
          loan-partner clauses — before publishing.
        </div>
      </div>

      <LegalLayout lastUpdated="17 September 2026" sections={sections} />
    </>
  );
}